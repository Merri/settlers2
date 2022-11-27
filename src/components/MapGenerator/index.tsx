import './index.css'

import { XORShift } from 'random-seedable'

const random = new XORShift()

import { ChangeEventHandler, Component, createRef } from 'preact/compat'

import Generator from '$/lib/generator'

import { IncDec } from './IncDec'
import { StatisticsTable } from './StatisticsTable'
import { TextureOptions } from './TextureOptions'
import { NumberInput } from './NumberInput'

const generator = Generator(random)

const hasLocalStorage = (function (key) {
	try {
		localStorage[key] = key
		localStorage.removeItem(key)
		return true
	} catch (error) {
		return false
	}
})('_')

function generateAndGetResources(seed: number) {
	random.seed = seed
	return generator.applyResources({})
}

interface State {
	compatibility: string
	maxPlayers: number
	playerMinDistance: number
	players: any[]
	resources: Record<string, any>
	viewType: number | 'fast' | 'pretty' | 'seed'
	heightOptions: {
		baseLevel: number
		flatten: number
		groundLevel: number
		randomize: number
		noiseOnWater: boolean
	}
	seedOptions: {
		width: number
		height: number
		borderProtection: number
		likelyhood: number[]
		massRatio: number
		startingPoints: number
	}
	textureOptions: {
		mountainGenerate: number
		seamless: boolean
		terrain: number
		texture: number
		waterTexture: number
	}
	height: number
	width: number
	title: string
	seed: number
}

export class MapGenerator extends Component<{}, State> {
	canvasRef = createRef()
	seedRef = createRef()

	constructor(props: {}) {
		super(props)

		const width = (hasLocalStorage && ~~localStorage.width) || 160
		const height = (hasLocalStorage && ~~localStorage.height) || 160

		this.state = {
			compatibility: 'return-to-the-roots',
			maxPlayers: 7,
			playerMinDistance: 50,
			players: [],
			resources: {},
			viewType: 11,
			heightOptions: {
				baseLevel: 5,
				flatten: 25,
				groundLevel: 3,
				randomize: 0.3,
				noiseOnWater: false,
			},
			seedOptions: {
				width,
				height,
				borderProtection: 8,
				likelyhood: [0, 0.004, 0.024, 0.64, 0.48, 0.48, 0.48],
				massRatio: 50,
				startingPoints: 60,
			},
			textureOptions: {
				mountainGenerate: 6,
				seamless: false,
				terrain: 0,
				texture: 8,
				waterTexture: 5,
			},
			height,
			width,
			title: 'Untitled',
			seed: 1,
		}
	}

	componentDidMount() {
		generator.setColorMap('alternative').then(() => {
			this.setState({ viewType: 'pretty' })
			this.handleSeed()
		}, this.handleSeed)
	}

	generateHeightMap = () => {
		random.seed = this.state.seed
		generator.createHeight(this.state.heightOptions)
	}

	generateTextures = () => {
		random.seed = this.state.seed
		generator.createBaseTextures(this.state.textureOptions)
	}

	handleDraw = () => {
		console.time('Draw')
		generator.draw({
			canvas: this.canvasRef.current,
			terrain: this.state.textureOptions.terrain,
			viewType: this.state.viewType,
		})
		generator.draw({
			canvas: this.seedRef.current,
			viewType: 'seed',
		})
		console.timeEnd('Draw')
	}

	handleSeed = (event: MouseEvent | 'random' | 'given' | undefined = undefined) => {
		const mode = event instanceof Event ? (event.target as HTMLButtonElement).value : event || 'random'
		const randomSeed = mode === 'random'
		console.time('New Seed, Height Map, Textures and Resources')

		const seed = randomSeed ? (Date.now() & 0xfffffffe) + 1 : this.state.seed
		const seedOptions = { ...this.state.seedOptions }
		const startingPoints = (1 + (seedOptions.width * seedOptions.height * seedOptions.massRatio) / 40960) | 0

		seedOptions.startingPoints = startingPoints
		seedOptions.likelyhood = [
			0,
			((seedOptions.width + seedOptions.height) & seed) * 0.000005 + 0.001,
			((seedOptions.width & seed) + seedOptions.height) * (0.00025 / startingPoints) + 0.01,
			(seedOptions.width + (seedOptions.height & seed)) * 0.0005 + 0.5,
			((seedOptions.width + seedOptions.height) & seed) * 0.0003 + 0.25,
			((seedOptions.width & seed) + seedOptions.height) * 0.0002 + 0.125,
			(seedOptions.width + (seedOptions.height & seed)) * 0.0001 + 0.0625,
		]

		if (hasLocalStorage) {
			localStorage.width = seedOptions.width
			localStorage.height = seedOptions.height
		}

		console.log('seedOptions', seedOptions)

		this.setState(
			{
				seed,
				width: this.state.seedOptions.width,
				height: this.state.seedOptions.height,
				seedOptions,
			},
			() => {
				random.seed = seed
				generator.seed(seedOptions)
				this.generateHeightMap()
				this.generateTextures()
				this.setState({
					players: [],
					resources: generateAndGetResources(seed),
				})
				console.timeEnd('New Seed, Height Map, Textures and Resources')
				this.handleDraw()
			}
		)
	}

	handleLandscape = () => {
		console.time('Height Map, Textures and Resources')
		this.generateHeightMap()
		this.generateTextures()
		this.setState({
			players: [],
			resources: [],
		})
		console.timeEnd('Height Map, Textures and Resources')
		this.handleDraw()
	}

	handleResources = () => {
		console.time('Resources')
		this.setState({
			players: [],
			resources: generateAndGetResources(this.state.seed),
		})
		console.timeEnd('Resources')
		this.handleDraw()
	}

	handlePlayers = () => {
		console.time('Players')
		random.seed = Date.now()
		this.setState({
			players: generator.getRandomPlayerPositions(this.state.maxPlayers, this.state.playerMinDistance),
		})
		console.timeEnd('Players')
		this.handleDraw()
	}

	handleDownload = () => {
		const link = document.createElement('a')
		const blobUrl = URL.createObjectURL(
			generator.getFileBlob({
				terrain: this.state.textureOptions.terrain,
				title: this.state.title,
			})
		)
		link.href = blobUrl
		link.download = this.state.title.replace(/[\|&;\$%@"<>\(\)\+,]/g, '_') + '.swd'
		link.click()
		URL.revokeObjectURL(blobUrl)
	}

	handleCompatibility = (compatibility: string) => {
		this.setState({ compatibility })
	}

	handleSetWidth: ChangeEventHandler<HTMLSelectElement> = (event) => {
		const seedOptions = { ...this.state.seedOptions, width: ~~event.currentTarget.value }
		this.setState({ seedOptions })
	}

	handleSetHeight: ChangeEventHandler<HTMLSelectElement> = (event) => {
		const seedOptions = { ...this.state.seedOptions, height: ~~event.currentTarget.value }
		this.setState({ seedOptions })
	}

	handleTerrain: ChangeEventHandler<HTMLSelectElement> = (event) => {
		this.state.textureOptions.terrain = ~~event.currentTarget.value
		this.generateTextures()
		this.setState({
			players: [],
			resources: [],
		})
		this.handleDraw()
	}

	handleMassRatio = (massRatio: number) => {
		const seedOptions = { ...this.state.seedOptions, massRatio }
		this.setState({ seedOptions }, () => this.handleSeed('given'))
	}

	handleBaseLevel = (value: string | number) => {
		value = ~~value
		if (this.state.heightOptions.baseLevel !== value) {
			this.state.heightOptions.baseLevel = value
			this.handleLandscape()
		}
	}

	handleGroundLevel = (value: string | number) => {
		value = ~~value
		if (this.state.heightOptions.groundLevel !== value) {
			this.state.heightOptions.groundLevel = value
			this.handleLandscape()
		}
	}

	handleFlatten = (value: string | number) => {
		value = ~~value
		if (this.state.heightOptions.flatten !== value) {
			this.state.heightOptions.flatten = value
			this.handleLandscape()
		}
	}

	handleNoise = (value: string | number) => {
		value = ~~value ? ~~value / 10 : 0
		if (this.state.heightOptions.randomize !== value) {
			this.state.heightOptions.randomize = value
			this.handleLandscape()
		}
	}

	handlePlayerMinDistance = (value: string | number) => {
		this.setState({
			playerMinDistance: ~~value,
		})
	}

	handleNoiseOnWater: ChangeEventHandler<HTMLInputElement> = (event) => {
		this.state.heightOptions.noiseOnWater = event.currentTarget.checked
		this.handleLandscape()
	}

	handleViewTypeChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
		var value: string | number = event.currentTarget.value

		if (value === '' + ~~value) value = ~~value

		this.setState(
			{
				viewType: value as number | 'seed' | 'fast' | 'pretty',
			},
			this.handleDraw
		)
	}

	handleTitleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		this.setState({
			title: generator.sanitizeStringAsCP437(event.currentTarget.value),
		})
	}

	isRttROnly = (areas: any[]) => {
		return this.state.width > 256 || this.state.height > 256 || areas.length > 250
	}

	handleMaxPlayerChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		this.setState({
			maxPlayers: ~~event.currentTarget.value,
		})
	}

	handlePlayableTexture = (value: number) => {
		this.state.textureOptions.texture = value
		this.handleLandscape()
	}

	handleUnPlayableTexture = (value: number) => {
		this.state.textureOptions.waterTexture = value
		this.handleLandscape()
	}

	render() {
		const gold = this.state.resources.mineGold || 0
		const coal = this.state.resources.mineCoal || 0
		const ironOre = this.state.resources.mineIronOre || 0
		const granite = this.state.resources.mineGranite || 0
		const mineTotal = gold + coal + ironOre + granite || 0
		const players = this.state.players.map((player, index) => {
			let className = 'player-position'

			const style = {
				left: player.x + 'px',
				top: player.y + 'px',
			}

			if (index > 6) {
				className += ' ' + className + '--rttr'
			}

			return <i className={className} id={'player' + index} style={style}></i>
		})

		const totalAreas: { mass: number; type: number }[] = generator.getAreas() || []

		const areas = totalAreas.reduce<{ land: number; landTotalMass: number; water: number; waterTotalMass: number }>(
			(prevValue, curValue) => {
				if (curValue.type === 1) {
					prevValue.land++
					prevValue.landTotalMass += curValue.mass
				} else if (curValue.type === 2) {
					prevValue.water++
					prevValue.waterTotalMass += curValue.mass
				}
				return prevValue
			},
			{ land: 0, landTotalMass: 0, water: 0, waterTotalMass: 0 }
		)

		let mapClass = 'settlers2-map'
		mapClass += ' ' + mapClass + '--'

		switch (this.state.textureOptions.terrain) {
			case 1:
				mapClass += 'wasteland'
				break
			case 2:
				mapClass += 'winter-world'
				break
			default:
				mapClass += 'greenland'
		}

		return (
			<div>
				{/*<Compatibility onChange={this.handleCompatibility} value={this.state.compatibility} />*/}
				<ul className="seed-options">
					<li>
						<label>
							Width:{' '}
							<select value={this.state.seedOptions.width} onChange={this.handleSetWidth}>
								<optgroup label="The Settlers II &amp; RttR">
									{[64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256].map(function (
										value
									) {
										return <option value={value}>{value}</option>
									})}
								</optgroup>
								<optgroup label="Return to the Roots only">
									{[320, 384, 448, 512, 640, 768, 1024].map(function (value) {
										return <option value={value}>{value}</option>
									})}
								</optgroup>
							</select>
						</label>
					</li>
					<li>
						<label>
							Height:{' '}
							<select value={this.state.seedOptions.height} onChange={this.handleSetHeight}>
								<optgroup label="The Settlers II &amp; RttR">
									{[64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256].map(function (
										value
									) {
										return <option value={value}>{value}</option>
									})}
								</optgroup>
								<optgroup label="Return to the Roots only">
									{[320, 384, 448, 512, 640, 768, 1024].map(function (value) {
										return <option value={value}>{value}</option>
									})}
								</optgroup>
							</select>
						</label>
					</li>
					<li>
						Target playable landmass%:{' '}
						<IncDec
							delay={500}
							minimumValue={1}
							maximumValue={99}
							value={'' + this.state.seedOptions.massRatio}
							onChange={this.handleMassRatio}
						/>
					</li>
				</ul>
				<p>
					<label>
						Seed: <NumberInput value={this.state.seed} onChange={(seed) => this.setState({ seed })} />
					</label>{' '}
					<button name="seed" value="given" onClick={this.handleSeed} type="button">
						Use seed
					</button>{' '}
					<button name="seed" value="random" onClick={this.handleSeed} type="button">
						Use seed from time
					</button>
				</p>
				<canvas
					width={this.state.width}
					height={this.state.height}
					ref={this.canvasRef}
					className={mapClass}
				></canvas>
				<p>
					<label>
						Display:
						<select value={this.state.viewType} onChange={this.handleViewTypeChange}>
							<optgroup label="World">
								<option value="fast">Settlers II (fast)</option>
								<option value="pretty">Detailed (slow)</option>
							</optgroup>
							<optgroup label="Raw Data">
								<option value="0">#0: Height Map</option>
								<option value="4">#4: Object Index</option>
								<option value="5">#5: Object Type</option>
								<option value="8">#8: Building Sites</option>
								<option value="11">#11: Resources</option>
								<option value="12">#12: Light Map</option>
								<option value="13">#13: Areas</option>
							</optgroup>
						</select>
					</label>
				</p>
				<section>
					<header>
						<h3>Landscape Options</h3>
					</header>
					<p>These settings allow you to control the base landscape, the main look and feel of the world.</p>
					<dl>
						<dt>Environment:</dt>
						<dd>
							<select value={this.state.textureOptions.terrain} onChange={this.handleTerrain}>
								<option value="0">Greenland</option>
								<option value="1">Wasteland</option>
								<option value="2">Winter World</option>
							</select>
						</dd>
						<dt>Base Level:</dt>
						<dd>
							<IncDec
								minimumValue={0}
								maximumValue={60}
								value={'' + this.state.heightOptions.baseLevel}
								onChange={this.handleBaseLevel}
							/>
						</dd>
						<dt>Ground Level:</dt>
						<dd>
							<IncDec
								minimumValue={0}
								maximumValue={5}
								value={'' + this.state.heightOptions.groundLevel}
								onChange={this.handleGroundLevel}
							/>
						</dd>
						<dt>Flatten:</dt>
						<dd>
							<IncDec
								minimumValue={1}
								maximumValue={40}
								value={'' + this.state.heightOptions.flatten}
								onChange={this.handleFlatten}
							/>
						</dd>
						<dt>Noise:</dt>
						<dd>
							<IncDec
								minimumValue={0}
								maximumValue={50}
								value={'' + ~~(this.state.heightOptions.randomize * 10)}
								onChange={this.handleNoise}
							/>
							<br />
							<label>
								<input
									type="checkbox"
									checked={this.state.heightOptions.noiseOnWater}
									onChange={this.handleNoiseOnWater}
								/>{' '}
								Use also on unplayable areas? (water, lava, etc.)
							</label>
						</dd>
						<dt>Default playable area terrain:</dt>
						<dd>
							<TextureOptions
								name="playable-terrain"
								terrain={this.state.textureOptions.terrain}
								texture={this.state.textureOptions.texture}
								textures={[14, 0, 8, 9, 10, 15, 18, 34, 6]}
								onChange={this.handlePlayableTexture}
							/>
						</dd>
						<dt>Default unplayable area terrain:</dt>
						<dd>
							<TextureOptions
								name="unplayable-terrain"
								terrain={this.state.textureOptions.terrain}
								texture={this.state.textureOptions.waterTexture}
								textures={[5, 2, 3, 4, 16, 7, 17, 19, 20, 21, 22]}
								onChange={this.handleUnPlayableTexture}
							/>
						</dd>
					</dl>
					<p>
						<button onClick={this.handleResources}>Randomize Resources</button>
					</p>
				</section>
				<div className="player-positions">
					<canvas
						width={this.state.width}
						height={this.state.height}
						ref={this.seedRef}
						className="settlers2-map"
					></canvas>
					{players}
				</div>
				<section>
					<header>
						<h3>Player Options</h3>
					</header>
					<dl>
						<dt>Maximum number of players:</dt>
						<dd>
							{[
								'None',
								'One',
								'Two',
								'Three',
								'Four',
								'Five',
								'Six',
								'Seven',
								'Eight',
								'Nine',
								'Ten',
							].map((text, index) => (
								<label key={index}>
									<input
										name="max-players"
										type="radio"
										value={index}
										checked={this.state.maxPlayers === index}
										onChange={this.handleMaxPlayerChange}
									/>{' '}
									{text}
								</label>
							))}
						</dd>
						<dt>Minimum player distance:</dt>
						<dd>
							<IncDec
								minimumValue={15}
								maximumValue={150}
								value={'' + this.state.playerMinDistance}
								onChange={this.handlePlayerMinDistance}
							/>
						</dd>
					</dl>
					<p>
						<button onClick={this.handlePlayers}>Randomize Players</button>
					</p>
				</section>
				<section>
					<header>
						<h3>Statistics</h3>
					</header>
					<StatisticsTable
						coal={coal}
						gold={gold}
						granite={granite}
						ironOre={ironOre}
						landTotalMass={areas.landTotalMass}
						mineTotal={mineTotal}
						players={players.length}
						resources={this.state.resources}
					/>
				</section>
				<p>
					<label className="input-container" data-chars-remaining={19 - this.state.title.length}>
						Title:{' '}
						<input
							className="settlers2-map-title"
							type="text"
							maxLength={19}
							value={this.state.title}
							onChange={this.handleTitleChange}
							placeholder="Title"
						/>
					</label>
					<br />
					<button onClick={this.handleDownload}>Download</button>{' '}
					<small className="settlers2-playable-on">
						Map is playable on{' '}
						{this.isRttROnly(totalAreas) ? (
							<b>Return to the Roots only</b>
						) : (
							<span>The Settlers II &amp; Return to the Roots</span>
						)}
					</small>
				</p>
			</div>
		)
	}
}
