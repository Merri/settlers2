import './index.css'

import { Component, createRef } from 'preact/compat'

import Generator from '$/lib/generator'

import { IncDec } from './IncDec'
import { TextureOptions } from './TextureOptions'
import { Unsupported } from './Unsupported'

const generator = Generator()

function generateAndGetResources() {
	return generator.applyResources({})
}

interface State {
	hasLocalStorage: boolean
	meetsRequirements: boolean
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
}

export class MapGenerator extends Component<{}, State> {
	canvasRef = createRef()
	seedRef = createRef()

	constructor(props: {}) {
		super(props)

		this.state = {
			hasLocalStorage: false,
			meetsRequirements: !!window.ArrayBuffer && !!window.Uint8Array && !!window.Uint32Array,
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
				width: 160,
				height: 160,
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
			height: 160,
			width: 160,
			title: 'Untitled',
		}
	}

	componentWillMount() {
		var hasLocalStorage = false

		if (this.state.meetsRequirements) {
			// if localStorage / cookies are disabled then accessing localStorage will throw an error
			try {
				hasLocalStorage = !!localStorage
			} catch (err) {}

			if (hasLocalStorage) {
				if (localStorage.width) this.state.seedOptions.width = ~~localStorage.width
				if (localStorage.height) this.state.seedOptions.height = ~~localStorage.height
			}

			this.setState({
				hasLocalStorage: hasLocalStorage,
				// make initial render of the page to have canvas elements in the right size
				width: this.state.seedOptions.width,
				height: this.state.seedOptions.height,
			})

			generator.setColorMap('alternative').then(() => {
				this.setState({
					viewType: 'pretty',
				})

				this.handleSeed()
			}, this.handleSeed)
		}
	}

	generateHeightMap = () => {
		generator.createHeight(this.state.heightOptions)
	}

	generateTextures = () => {
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

	handleSeed = () => {
		console.time('New Seed, Height Map, Textures and Resources')
		this.state.seedOptions.startingPoints = (this.state.seedOptions.width + this.state.seedOptions.height) * 0.2
		this.state.seedOptions.likelyhood = [
			0,
			(this.state.seedOptions.width + this.state.seedOptions.height) * 0.000005 + 0.001,
			(this.state.seedOptions.width + this.state.seedOptions.height) * 0.000015 + 0.01,
			(this.state.seedOptions.width + this.state.seedOptions.height) * 0.0005 + 0.5,
			(this.state.seedOptions.width + this.state.seedOptions.height) * 0.0002 + 0.4,
			(this.state.seedOptions.width + this.state.seedOptions.height) * 0.0002 + 0.4,
			(this.state.seedOptions.width + this.state.seedOptions.height) * 0.0002 + 0.4,
		]

		if (this.state.hasLocalStorage) {
			localStorage.width = this.state.seedOptions.width
			localStorage.height = this.state.seedOptions.height
		}

		this.setState(
			{
				width: this.state.seedOptions.width,
				height: this.state.seedOptions.height,
			},
			function () {
				generator.seed(this.state.seedOptions)
				this.generateHeightMap()
				this.generateTextures()
				this.setState({
					players: [],
					resources: generateAndGetResources(),
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
			resources: generateAndGetResources(),
		})
		console.timeEnd('Resources')
		this.handleDraw()
	}

	handlePlayers = () => {
		console.time('Players')
		this.setState({
			players: generator.getRandomPlayerPositions(this.state.maxPlayers, this.state.playerMinDistance),
		})
		console.timeEnd('Players')
		this.handleDraw()
	}

	handleDownload = () => {
		// @ts-ignore
		saveAs(
			generator.getFileBlob({
				terrain: this.state.textureOptions.terrain,
				title: this.state.title,
			}),
			this.state.title.replace(/[\|&;\$%@"<>\(\)\+,]/g, '_') + '.swd'
		)
	}

	handleCompatibility = (value) => {
		this.setState({
			compatibility: value,
		})
	}

	handleSetWidth = (event) => {
		this.state.seedOptions.width = ~~event.target.value
		this.setState({
			seedOptions: this.state.seedOptions,
		})
	}

	handleSetHeight = (event) => {
		this.state.seedOptions.height = ~~event.target.value
		this.setState({
			seedOptions: this.state.seedOptions,
		})
	}

	handleTerrain = (event) => {
		this.state.textureOptions.terrain = ~~event.target.value
		this.generateTextures()
		this.setState({
			players: [],
			resources: [],
		})
		this.handleDraw()
	}

	handleMassRatio = (value) => {
		this.state.seedOptions.massRatio = ~~value
	}

	handleBaseLevel = (value) => {
		value = ~~value
		if (this.state.heightOptions.baseLevel !== value) {
			this.state.heightOptions.baseLevel = value
			this.handleLandscape()
		}
	}

	handleGroundLevel = (value) => {
		value = ~~value
		if (this.state.heightOptions.groundLevel !== value) {
			this.state.heightOptions.groundLevel = value
			this.handleLandscape()
		}
	}

	handleFlatten = (value) => {
		value = ~~value
		if (this.state.heightOptions.flatten !== value) {
			this.state.heightOptions.flatten = value
			this.handleLandscape()
		}
	}

	handleNoise = (value) => {
		value = ~~value ? ~~value / 10 : 0
		if (this.state.heightOptions.randomize !== value) {
			this.state.heightOptions.randomize = value
			this.handleLandscape()
		}
	}

	handlePlayerMinDistance = (value) => {
		this.setState({
			playerMinDistance: ~~value,
		})
	}

	handleNoiseOnWater = (event) => {
		this.state.heightOptions.noiseOnWater = event.target.checked
		this.handleLandscape()
	}

	handleViewTypeChange = (event) => {
		var value = event.target.value

		if (value === '' + ~~value) value = ~~value

		this.setState(
			{
				viewType: value,
			},
			this.handleDraw
		)
	}

	handleTitleChange = (event) => {
		this.setState({
			title: generator.sanitizeStringAsCP437(event.target.value),
		})
	}

	isRttROnly = (areas) => {
		return this.state.width > 256 || this.state.height > 256 || areas.length > 250
	}

	// This hack works around Firefox's issue with not triggering onChange when value changes.
	// The bug was reported in 2002 and it's still not fixed by 2014.
	// Quite religious take on W3C's brain fart! https://bugzilla.mozilla.org/show_bug.cgi?id=126379
	handleFirefoxOnChangeInKeyDown = (event) => {
		var el = event.target
		// we have to delay because onKeyDown triggers before the value has changed
		setTimeout(function () {
			// onChange event triggers when blur is called...
			el.blur()
			// and then get right back in
			el.focus()
		})
	}

	handleMaxPlayerChange = (event) => {
		this.setState({
			maxPlayers: ~~event.target.value,
		})
	}

	handlePlayableTexture = (value) => {
		this.state.textureOptions.texture = value
		this.handleLandscape()
	}

	handleUnPlayableTexture = (value) => {
		this.state.textureOptions.waterTexture = value
		this.handleLandscape()
	}

	render() {
		if (!this.state.meetsRequirements) {
			return <Unsupported />
		}

		var gold = this.state.resources.mineGold || 0,
			coal = this.state.resources.mineCoal || 0,
			ironOre = this.state.resources.mineIronOre || 0,
			granite = this.state.resources.mineGranite || 0,
			mineTotal = gold + coal + ironOre + granite + 0.0001,
			players = this.state.players.map((player, index) => {
				var className = 'player-position',
					style = {
						left: player.x + 'px',
						top: player.y + 'px',
					}

				if (index > 6) {
					className += ' ' + className + '--rttr'
				}

				return <i className={className} id={'player' + index} style={style}></i>
			}),
			totalAreas = generator.getAreas() || [],
			areas = totalAreas.reduce(
				function (prevValue, curValue, index, array) {
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
			),
			mapClass = 'settlers2-map'

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

		const totalMass = areas.landTotalMass + areas.waterTotalMass

		return (
			<div>
				{/*<Compatibility onChange={this.handleCompatibility} value={this.state.compatibility} />*/}
				<p>
					<span className="input-container" data-chars-remaining={19 - this.state.title.length}>
						<input
							className="settlers2-map-title"
							type="text"
							maxLength={19}
							value={this.state.title}
							onChange={this.handleTitleChange}
							placeholder="Title"
						/>
					</span>
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
				<div className="player-positions">
					<canvas
						width={this.state.width}
						height={this.state.height}
						ref={this.seedRef}
						className="settlers2-map"
					></canvas>
					<canvas
						width={this.state.width}
						height={this.state.height}
						ref={this.canvasRef}
						className={mapClass}
					></canvas>
					{players}
				</div>
				<ul className="seed-options">
					<li>
						<label>
							Width:{' '}
							<select
								value={this.state.seedOptions.width}
								onChange={this.handleSetWidth}
								onKeyDown={this.handleFirefoxOnChangeInKeyDown}
							>
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
							<select
								value={this.state.seedOptions.height}
								onChange={this.handleSetHeight}
								onKeyDown={this.handleFirefoxOnChangeInKeyDown}
							>
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
							minimumValue={1}
							maximumValue={99}
							value={'' + this.state.seedOptions.massRatio}
							onChange={this.handleMassRatio}
						/>
					</li>
					<li>
						<button onClick={this.handleSeed}>New World</button>
					</li>
				</ul>
				<br style={{ clear: 'both' }} />
				<p>
					<label>
						Display:
						<select
							value={this.state.viewType}
							onChange={this.handleViewTypeChange}
							onKeyDown={this.handleFirefoxOnChangeInKeyDown}
						>
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
					<header>Landscape Options</header>
					<p>These settings allow you to control the base landscape, the main look and feel of the world.</p>
					<dl>
						<dt>Environment:</dt>
						<dd>
							<select
								value={this.state.textureOptions.terrain}
								onChange={this.handleTerrain}
								onKeyDown={this.handleFirefoxOnChangeInKeyDown}
							>
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
								terrain={this.state.textureOptions.terrain}
								texture={this.state.textureOptions.texture}
								textures={[14, 0, 8, 9, 10, 15, 18, 34, 6]}
								onChange={this.handlePlayableTexture}
							/>
						</dd>
						<dt>Default unplayable area terrain:</dt>
						<dd>
							<TextureOptions
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
				<section>
					<header>Player Options</header>
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
				<h3>Statistics</h3>
				<table>
					<thead>
						<tr>
							<th>Resource</th>
							<th>Value</th>
							<th>% of max</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Players</td>
							<td>{this.state.players.length}</td>
							<td>-</td>
						</tr>
						<tr>
							<td>Trees</td>
							<td>{this.state.resources.tree || 0}</td>
							<td>{Math.round(((this.state.resources.tree || 0) / areas.landTotalMass) * 100)} %</td>
						</tr>
						<tr>
							<td>Granite</td>
							<td>{this.state.resources.granite || 0}</td>
							<td>
								{Math.round(((this.state.resources.granite || 0) / (areas.landTotalMass * 7)) * 100)} %
							</td>
						</tr>
						<tr>
							<td>Mountain coal</td>
							<td>{coal}</td>
							<td>{Math.round((coal / mineTotal) * 100)} %</td>
						</tr>
						<tr>
							<td>Mountain iron ore</td>
							<td>{ironOre}</td>
							<td>{Math.round((ironOre / mineTotal) * 100)} %</td>
						</tr>
						<tr>
							<td>Mountain gold</td>
							<td>{gold}</td>
							<td>{Math.round((gold / mineTotal) * 100)} %</td>
						</tr>
						<tr>
							<td>Mountain granite</td>
							<td>{granite}</td>
							<td>{Math.round((granite / mineTotal) * 100)} %</td>
						</tr>
					</tbody>
				</table>
			</div>
		)
	}
}
