import {
	addSubterrainResources,
	adjustPlayerLocations,
	assignPlayerPositions,
	blockadeMapEdges,
	calculateResources,
	ElevationBrush,
	generateEmptyMap,
	PlayerAssignment,
	elevationBasedTexturization,
	updateHeightMapFromNoiseArray,
	setHeight,
} from '$/lib/PlayerBasedGenerator'
import { BlockType, ConstructionSite, RegionType, Texture, TextureSet } from '$/lib/types'
import { ChangeEventHandler } from 'preact/compat'
import { useCallback, useEffect, useReducer, useState } from 'preact/hooks'
import { XORShift } from 'random-seedable'

import { IncDec } from '../MapGenerator/IncDec'
import { MapCanvas } from './Map'

import styles from './Generator.module.css'
//import { calculateHeightElevations } from '.'
import { validateMapClass } from '$/lib/MapValidation'
import { NumberInput } from '../MapGenerator/NumberInput'
import Button from '../Button'
import { SupportedTexture, TerrainSets, TextureGroup } from '$/lib/textures'
import { sanitizeAsCp437 } from '$/lib/cp437'
import { locateCoastalCastles } from '$/lib/mapRegions'

const terrainMap = new Map<TextureSet, TextureGroup[]>([
	[0, []],
	[1, []],
	[2, []],
])

Object.entries(TerrainSets).forEach(([_key, terrain]) => void terrainMap.get(terrain.type)!.push(terrain))

const terrainType = ['Greenland', 'Wasteland', 'Winter World']

const defaultGreenland: ElevationBrush = {
	default: Texture.Fertile1,
	sea: [Texture.UnbuildableWater, Texture.UnbuildableLand, Texture.InaccessibleLava],
	coast: [Texture.Houseless, Texture.Fertile5],
	meadow: [Texture.Fertile2, Texture.Fertile3, Texture.Fertile4, Texture.Fertile6],
	mining: [Texture.Mining1, Texture.Mining2, Texture.Mining3, Texture.Mining4],
	peak: [Texture.Inaccessible, Texture.Buildable, Texture.FertileMining, Texture.Houseless],
	lavaEdge: [Texture.FertileMining],
	lowLandEdge: [],
	mountainRoot: Texture.Buildable,
	mountain1Meadow: [Texture.Buildable, Texture.FertileMining],
	mountain2Meadow: [Texture.Buildable, Texture.FertileMining],
	mountain3Meadow: [Texture.Buildable, Texture.FertileMining],
	mountain4Meadow: [Texture.Buildable, Texture.FertileMining],
}

const defaultWasteland: ElevationBrush = {
	default: Texture.Buildable,
	sea: [Texture.UnbuildableWater, Texture.Houseless, Texture.InaccessibleLava],
	coast: [Texture.Fertile4, Texture.Fertile5],
	meadow: [Texture.Fertile3, Texture.Fertile6],
	mining: [Texture.Mining1, Texture.Mining2, Texture.Mining1, Texture.Mining2, Texture.Mining3, Texture.Mining4],
	peak: [Texture.Fertile1, Texture.Fertile2, Texture.Buildable, Texture.FertileMining, Texture.Houseless],
	lavaEdge: [Texture.Inaccessible, Texture.UnbuildableLand, Texture.Buildable],
	lowLandEdge: [Texture.Fertile4, Texture.Fertile5],
	mountainRoot: Texture.Fertile1,
	mountain1Meadow: [Texture.Fertile1],
	mountain2Meadow: [Texture.FertileMining],
	mountain3Meadow: [Texture.FertileMining],
	mountain4Meadow: [Texture.Buildable],
}

const defaultWinterWorld: ElevationBrush = {
	default: Texture.Fertile1,
	sea: [Texture.UnbuildableWater, Texture.Houseless, Texture.InaccessibleLava],
	coast: [
		Texture.Houseless,
		Texture.Houseless,
		Texture.Houseless,
		Texture.Inaccessible,
		Texture.Houseless,
		Texture.UnbuildableLand,
		Texture.Houseless,
	],
	meadow: [Texture.Fertile2, Texture.Fertile3, Texture.Fertile4, Texture.Fertile5],
	mining: [Texture.Mining1, Texture.Mining2, Texture.Mining3, Texture.Mining4],
	peak: [Texture.Buildable, Texture.FertileMining],
	lavaEdge: [Texture.Mining3],
	lowLandEdge: [Texture.Fertile1],
	mountainRoot: Texture.Fertile6,
	mountain1Meadow: [Texture.FertileMining],
	mountain2Meadow: [Texture.FertileMining],
	mountain3Meadow: [Texture.FertileMining],
	mountain4Meadow: [Texture.FertileMining],
}

const TerrainBrush: Record<SupportedTexture, ElevationBrush> = {
	Greenland: defaultGreenland,
	GreenlandPatch152: defaultGreenland,
	NewGreenland: defaultGreenland,
	Jungle: defaultGreenland,
	Wetlands: defaultGreenland,
	Wasteland: defaultWasteland,
	RustyValley: defaultWasteland,
	WinterWorld: defaultWinterWorld,
	PolarNight: defaultWinterWorld,
}

function download(filename: string, contents: BlobPart, mimeType = 'application/octet-stream') {
	const link = document.createElement('a')
	const url = URL.createObjectURL(new Blob([contents], { type: mimeType }))
	link.download = filename
	link.href = url
	link.dispatchEvent(new MouseEvent('click'))
	//requestAnimationFrame(() => URL.revokeObjectURL(url))
}

interface MapOptions {
	width: number
	height: number
	assignment: PlayerAssignment
	brush: SupportedTexture
	continuous: boolean
	distance: number
	invertHeight: boolean
	mirror: string
	noise: number
	offsetX: number
	offsetY: number
	elevationOptions: {
		border: number
		heightLimit: number
		peakBoost: number
		peakRadius: number
		mountLevel: number
		seaLevel: number
		snowPeakLevel: number
		soften: boolean
	}
	minerals: {
		coal: number
		gold: number
		granite: number
		ironOre: number
		quantity: number
		replicate: number
	}
}

interface MapOptionsPayload {
	type: 'options'
	payload: Partial<Exclude<MapOptions, 'elevationOptions' | 'minerals'>>
}

interface MapElevationOptionsPayload {
	type: 'elevationOptions'
	payload: Partial<MapOptions['elevationOptions']>
}

interface MapMineralsOptionsPayload {
	type: 'minerals'
	payload: Partial<MapOptions['minerals']>
}

type MapOptionsAction = MapOptionsPayload | MapElevationOptionsPayload | MapMineralsOptionsPayload

const emptyOptions: MapOptions = {
	assignment: PlayerAssignment.hexCenter7,
	brush: 'Greenland',
	continuous: false,
	distance: 60,
	invertHeight: false,
	elevationOptions: {
		border: 10,
		heightLimit: 5,
		peakBoost: 7,
		peakRadius: 24,
		seaLevel: 20,
		mountLevel: 43,
		soften: true,
		snowPeakLevel: 80,
	},
	minerals: {
		coal: 100,
		gold: 20,
		granite: 50,
		ironOre: 55,
		quantity: 100,
		replicate: 100,
	},
	height: 192,
	mirror: '',
	noise: 0.55,
	offsetX: 0,
	offsetY: 0,
	width: 192,
}

export function Generator() {
	const [title, setTitle] = useState('Generated map')
	const [author, setAuthor] = useState(`║${new Date().getUTCFullYear()}║settlers2.net`)

	const [seed, setSeed] = useState(() => {
		if (typeof window === 'undefined') return BigInt(1337)
		const seed = new URLSearchParams(window.location.search).get('seed')
		return BigInt(seed?.replace(/\D/g, '') || 1337)
	})

	const [initialOptions] = useState(() => {
		const options = { ...emptyOptions }
		if (typeof window === 'undefined') return options
		const params = new URLSearchParams(window.location.search)

		const assignment = params.get('assignment') as PlayerAssignment | null
		const brush = params.get('brush') ?? SupportedTexture.Greenland
		options.continuous = params.has('continuous')
		options.invertHeight = params.has('invertHeight')
		const mirror = params.get('mirror')
		const opts = params.get('options')
		if (assignment) options.assignment = assignment
		if (brush && brush in TerrainBrush) options.brush = brush as SupportedTexture
		if (mirror) options.mirror = mirror

		if (opts) {
			try {
				const { elevationOptions = {}, minerals = {}, ...rest } = JSON.parse(opts)
				Object.assign(options, rest)
				options.elevationOptions = { ...options.elevationOptions, ...elevationOptions }
				options.minerals = { ...options.minerals, ...minerals }
			} catch (e) {}
		}

		return options
	})

	const [options, dispatchOptions] = useReducer<MapOptions, MapOptionsAction>((options, action) => {
		switch (action.type) {
			case 'options': {
				return { ...options, ...action.payload }
			}

			case 'minerals': {
				return { ...options, minerals: { ...options.minerals, ...action.payload } }
			}

			case 'elevationOptions': {
				return { ...options, elevationOptions: { ...options.elevationOptions, ...action.payload } }
			}
		}
	}, initialOptions)

	const [world, setWorld] = useState(() => {
		const random = new XORShift(seed)
		const { width, height, assignment, distance } = options
		const world = generateEmptyMap({ width, height, random })
		assignPlayerPositions({ assignment, distance: distance / 100, map: world.map })
		return world
	})
	const [resources, setResources] = useState(() => calculateResources({ map: world.map }))

	const handleAssignment: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
		if (event.target instanceof HTMLSelectElement) {
			dispatchOptions({ type: 'options', payload: { assignment: event.target.value as PlayerAssignment } })
		}
	}, [])

	const handleBrush: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
		if (event.target instanceof HTMLSelectElement && event.target.value in TerrainBrush) {
			dispatchOptions({ type: 'options', payload: { brush: event.target.value as SupportedTexture } })
		}
	}, [])

	const handleMirror: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
		if (event.target instanceof HTMLSelectElement) {
			dispatchOptions({ type: 'options', payload: { mirror: event.target.value } })
		}
	}, [])

	const handleNoise: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
		if (event.target instanceof HTMLSelectElement) {
			dispatchOptions({ type: 'options', payload: { noise: Number(event.target.value) || 0 } })
		}
	}, [])

	const handleTitle: ChangeEventHandler<HTMLInputElement> = (event) => {
		if (event.target instanceof HTMLInputElement) {
			setTitle(sanitizeAsCp437(event.target.value))
		}
	}

	const handleAuthor: ChangeEventHandler<HTMLInputElement> = (event) => {
		if (event.target instanceof HTMLInputElement) {
			setAuthor(sanitizeAsCp437(event.target.value))
		}
	}

	useEffect(() => {
		const params = new URLSearchParams()
		params.set('seed', `${seed}`)
		const { assignment, brush, continuous, invertHeight, minerals, mirror, ...limitedOptions } = options
		params.set('assignment', assignment)
		if (brush !== SupportedTexture.Greenland) params.set('brush', brush)
		if (continuous) params.set('continuous', '')
		if (invertHeight) params.set('invertHeight', '')
		mirror && params.set('mirror', mirror)
		params.set('minerals', JSON.stringify(minerals))
		params.set('options', JSON.stringify(limitedOptions))
		history.replaceState(null, '', `?${params}`)
	}, [options, seed])

	useEffect(() => {
		const random = new XORShift(seed)
		const {
			width,
			height,
			assignment,
			brush,
			continuous,
			distance,
			invertHeight,
			mirror,
			noise,
			offsetX,
			offsetY,
		} = options
		const { border, heightLimit, mountLevel, peakBoost, peakRadius, seaLevel, soften, snowPeakLevel } =
			options.elevationOptions
		const { coal, gold, granite, ironOre, quantity, replicate } = options.minerals
		const world = generateEmptyMap({ width, height, random })
		world.map.terrain = TerrainSets[brush].type

		switch (mirror) {
			case 'imperfect-horizontal': {
				const half = world.map.width >>> 1
				for (let startX = 0; startX < world.noiseArray.length; startX += world.map.width) {
					for (let x = 0; x < half; x++) {
						world.noiseArray[startX + world.map.width - 1 - x] = world.noiseArray[startX + x]
					}
				}
				break
			}
			case 'imperfect-vertical': {
				const half = world.noiseArray.length >>> 1

				for (let x = 0; x < half; x += world.map.width) {
					world.noiseArray.copyWithin(-x - world.map.width, x, x + world.map.width)
				}
				break
			}
		}

		assignPlayerPositions({ assignment, distance: distance / 100, map: world.map })
		updateHeightMapFromNoiseArray({
			...world,
			offsetX: (offsetX + world.map.width) % world.map.width,
			offsetY: (offsetY + world.map.height) % world.map.height,
			border: border / 100,
			heightLimit,
			peakBoost,
			peakRadius,
			soften,
		})

		if (noise) {
			const heightMap = world.map.blocks[BlockType.HeightMap]
			heightMap.forEach((_, index) => {
				setHeight(world.map, index, heightMap[index] + Math.round(world.noiseArray[index] * noise))
			})
		}

		if (invertHeight) {
			const heightMap = world.map.blocks[BlockType.HeightMap]
			const min = heightMap.reduce((smallest, current) => Math.min(smallest, current), 255)
			const maxDelta = heightMap.reduce((biggest, current) => Math.max(biggest, current), 0) - min
			heightMap.forEach((value, index) => {
				heightMap[index] = maxDelta - (value - min) + min
			})
		}

		elevationBasedTexturization({
			...world,
			brush: TerrainBrush[brush],
			mountLevel: mountLevel / 100,
			seaLevel: seaLevel / 100,
			snowPeakLevel: snowPeakLevel / 100,
		})

		if (!continuous) {
			blockadeMapEdges(world.map)
		}

		world.map.updateBuildSiteMap()
		world.map.updateRegions()

		adjustPlayerLocations({ map: world.map })
		addSubterrainResources({
			...world,
			coalRatio: coal / 100,
			goldRatio: gold / 100,
			graniteRatio: granite / 100,
			ironOreRatio: ironOre / 100,
			mineralQuantity: quantity / 100,
			replicateMineral: replicate / 100,
		})

		setResources(calculateResources({ map: world.map }))

		setWorld(world)
	}, [options, seed])

	const downloadSwd = useCallback(
		function downloadSwd(event: Event) {
			if (!(event.target instanceof HTMLButtonElement)) return
			world.map.title = title
			world.map.author = author
			world.map.updateLightMap()
			const filename = 'UNTITLED'
			const buffer = world.map.getFileBuffer({ format: 'SWD' })
			const name = filename.replace(/(\.WLD|\.DAT|\b)$/i, '.SWD')
			download(name, buffer)
		},
		[world.map, title, author]
	)

	const rawRegions = world.map.regions
		.map(([type, _x, _y, size], index) => ({ index, size, type }))
		.filter(({ size, type }) => type === RegionType.Land && size)
		.sort((a, b) => b.size - a.size)

	const totalSize = rawRegions.reduce((total, { size }) => total + size, 0)

	const harbours = world.map.getHarbourMap()

	const regions = rawRegions
		.map((region) => ({ ...region, pct: (region.size / totalSize) * 100 }))
		.filter((region) => region.pct >= 1 || (harbours.get(region.index) ?? 0 > 0))

	const validation = validateMapClass(world.map)

	return (
		<div>
			<div className={styles.mapView}>
				<dl className={styles.resourcesList}>
					<div>
						<dt>
							<img alt="Coal" src="/assets/res/coal.png" height="24" width="24" />
						</dt>
						<dd>{resources.mineralCoal}</dd>
					</div>
					<div>
						<dt>
							<img alt="Iron ore" src="/assets/res/iron-ore.png" height="24" width="24" />
						</dt>
						<dd>{resources.mineralIronOre}</dd>
					</div>
					<div>
						<dt>
							<img alt="Gold" src="/assets/res/gold.png" height="24" width="24" />
						</dt>
						<dd>{resources.mineralGold}</dd>
					</div>
					<div>
						<dt>
							<img alt="Granite" src="/assets/res/granite.png" height="24" width="24" />
						</dt>
						<dd>{resources.mineralGranite}</dd>
					</div>
					<div>
						<dt>
							<img alt="Fish" src="/assets/res/fish.png" height="24" width="24" />
						</dt>
						<dd>{resources.fish}</dd>
					</div>
					<div>
						<dt>
							<img alt="Iron" src="/assets/res/iron.png" height="24" width="24" />
						</dt>
						<dd>
							Estimate:
							<br />
							{Math.min(Math.floor(resources.mineralCoal / 4), resources.mineralIronOre)}
						</dd>
					</div>
					<div>
						<dt>
							<img alt="Gold coin" src="/assets/res/gold-coin.png" height="24" width="24" />
						</dt>
						<dd>
							Estimate:
							<br />
							{Math.min(Math.floor(resources.mineralCoal / 4), resources.mineralGold)}
						</dd>
					</div>
					<div>
						<dt>
							<img alt="Sword" src="/assets/res/sword.png" height="24" width="24" />
							+
							<img alt="Shield" src="/assets/res/shield.png" height="24" width="24" />
						</dt>
						<dd>
							Estimate:
							<br />
							{Math.min(
								Math.floor(resources.mineralCoal / 8),
								Math.floor(Math.min(resources.mineralIronOre / 3))
							)}
						</dd>
					</div>
				</dl>
				<MapCanvas showPlayers world={world.map} color1={0} color2={255} texture={options.brush} />
				<table>
					<thead>
						<tr>
							<th>Land #</th>
							<th>Size</th>
							<th>Harbours</th>
						</tr>
					</thead>
					<tbody>
						{regions.map((region) => (
							<tr key={region.index}>
								<td>{region.index}</td>
								<td>{region.pct.toFixed(2)} %</td>
								<td>{harbours.get(region.index) || '-'}</td>
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr>
							<td colSpan={3}>
								<small>And {rawRegions.length - regions.length} inaccessible land regions</small>
							</td>
						</tr>
					</tfoot>
				</table>
				<div>
					<label>
						Map title:{' '}
						<input onChange={handleTitle} type="text" name="title" value={title} maxLength={19} />
					</label>
					<br />
					<label>
						Map author:{' '}
						<input onChange={handleAuthor} type="text" name="author" value={author} maxLength={19} />
					</label>
					<br />
					<small>
						Valid characters, see{' '}
						<a href="https://en.wikipedia.org/wiki/Code_page_437#Character_set" target="_blank">
							Wikipedia: CP437 (new window)
						</a>
					</small>
				</div>
				<Button primary onClick={downloadSwd}>
					Download!
				</Button>
			</div>

			<table>
				<thead>
					<tr>
						<th>Input</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Seed</td>
						<td>
							<NumberInput onChange={setSeed} value={seed} />
						</td>
					</tr>
					<tr>
						<td>Mirror</td>
						<td>
							<select onChange={handleMirror} name="mirror" value={options.mirror}>
								<option value="">Off</option>
								<option value="imperfect-horizontal">Imperfect horizontal</option>
								<option value="imperfect-vertical">Imperfect vertical</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>Terrain set</td>
						<td>
							<select onChange={handleBrush} name="terrainSet" value={options.brush}>
								{Array.from(terrainMap.entries()).map(([textureSet, textureGroup]) => (
									<optgroup label={terrainType[textureSet]} key={textureSet}>
										{textureGroup.map((group) => (
											<option key={group.id} value={group.id}>
												{group.name}
											</option>
										))}
									</optgroup>
								))}
							</select>
						</td>
					</tr>
					<tr>
						<td>Map width</td>
						<td>
							<IncDec
								delay={25}
								onChange={(width) => dispatchOptions({ type: 'options', payload: { width } })}
								minimumValue={32}
								step={2}
								maximumValue={512}
								value={options.width}
							/>
						</td>
					</tr>
					<tr>
						<td>Map height</td>
						<td>
							<IncDec
								delay={25}
								onChange={(height) => dispatchOptions({ type: 'options', payload: { height } })}
								minimumValue={32}
								step={2}
								maximumValue={512}
								value={options.height}
							/>
						</td>
					</tr>
					<tr>
						<td>Booleans</td>
						<td>
							<label>
								<input
									type="checkbox"
									onChange={(event: Event) => {
										if (event.target instanceof HTMLInputElement) {
											dispatchOptions({
												type: 'options',
												payload: { continuous: event.target.checked },
											})
										}
									}}
									checked={options.continuous}
								/>{' '}
								Continuous?
							</label>
							<br />
							<label>
								<input
									type="checkbox"
									onChange={(event: Event) => {
										if (event.target instanceof HTMLInputElement) {
											dispatchOptions({
												type: 'options',
												payload: { invertHeight: event.target.checked },
											})
										}
									}}
									checked={options.invertHeight}
								/>{' '}
								Invert height map?
							</label>
							<br />
							<label>
								<input
									type="checkbox"
									onChange={(event: Event) => {
										if (event.target instanceof HTMLInputElement) {
											dispatchOptions({
												type: 'elevationOptions',
												payload: { soften: event.target.checked },
											})
										}
									}}
									checked={options.elevationOptions.soften}
								/>{' '}
								Soften?
							</label>
						</td>
					</tr>
					{/*
					<tr>
						<td>Texturing</td>
						<td>
							<label className={styles.radio}>
								<input type="radio" name="texturing" value="elevation" checked />
								Elevation based
							</label>
							<p className={styles.description}>
								Randomizes elevation level on each node. Final elevation level determines textures.
								Players will always be guaranteed to be linked to nearest land mass and to be above sea
								level. Players may be on various islands or continents.
							</p>
							<label className={styles.radio}>
								<input type="radio" name="texturing" value="player" />
								Player based (to be implemented)
							</label>
							<p className={styles.description}>
								Player based texturing allows determining rules of ease of approach between players. You
								may control the terrain type of each player. Players are guaranteed to be connected via
								land route.
							</p>
						</td>
					</tr>*/}
					<tr>
						<td>Elevation free border</td>
						<td>
							<IncDec
								delay={25}
								onChange={(border) =>
									dispatchOptions({ type: 'elevationOptions', payload: { border } })
								}
								minimumValue={0}
								step={1}
								maximumValue={25}
								value={options.elevationOptions.border}
							/>
						</td>
					</tr>
					<tr>
						<td>Peak boost</td>
						<td>
							<IncDec
								delay={25}
								onChange={(peakBoost) =>
									dispatchOptions({ type: 'elevationOptions', payload: { peakBoost } })
								}
								minimumValue={0}
								step={1}
								maximumValue={25}
								value={options.elevationOptions.peakBoost}
							/>
						</td>
					</tr>
					<tr>
						<td>Peak radius</td>
						<td>
							<IncDec
								delay={25}
								onChange={(peakRadius) =>
									dispatchOptions({ type: 'elevationOptions', payload: { peakRadius } })
								}
								minimumValue={3}
								step={1}
								maximumValue={100}
								value={options.elevationOptions.peakRadius}
							/>
						</td>
					</tr>
					<tr>
						<td>Height diff limit</td>
						<td>
							<IncDec
								delay={25}
								onChange={(heightLimit) =>
									dispatchOptions({ type: 'elevationOptions', payload: { heightLimit } })
								}
								minimumValue={0}
								step={1}
								maximumValue={5}
								value={options.elevationOptions.heightLimit}
							/>
						</td>
					</tr>
					<tr>
						<td>Sea level</td>
						<td>
							<IncDec
								delay={25}
								onChange={(seaLevel) =>
									dispatchOptions({ type: 'elevationOptions', payload: { seaLevel } })
								}
								minimumValue={0}
								step={1}
								maximumValue={75}
								value={options.elevationOptions.seaLevel}
							/>
						</td>
					</tr>
					<tr>
						<td>Mount level</td>
						<td>
							<IncDec
								delay={25}
								onChange={(mountLevel) =>
									dispatchOptions({ type: 'elevationOptions', payload: { mountLevel } })
								}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.elevationOptions.mountLevel}
							/>
						</td>
					</tr>
					<tr>
						<td>Mount peak level</td>
						<td>
							<IncDec
								delay={25}
								onChange={(snowPeakLevel) =>
									dispatchOptions({ type: 'elevationOptions', payload: { snowPeakLevel } })
								}
								minimumValue={options.elevationOptions.seaLevel + 1}
								step={1}
								maximumValue={100}
								value={options.elevationOptions.snowPeakLevel}
							/>
						</td>
					</tr>
					<tr>
						<td>Post-processing</td>
						<td>
							<select onChange={handleNoise} value={options.noise}>
								<option value="0">No post-processing</option>
								<option value="0.55">Weak noise</option>
								<option value="1">Light noise</option>
								<option value="1.75">Medium noise</option>
								<option value="2.25">Strong noise</option>
							</select>
							<br />
							<label>
								Offset X:
								<br />
								<IncDec
									delay={25}
									onChange={(offsetX) => dispatchOptions({ type: 'options', payload: { offsetX } })}
									minimumValue={-world.map.width}
									maximumValue={world.map.width}
									step={1}
									value={options.offsetX}
								/>
							</label>
							<br />
							<label>
								Offset Y:
								<br />
								<IncDec
									delay={25}
									onChange={(offsetY) => dispatchOptions({ type: 'options', payload: { offsetY } })}
									minimumValue={-world.map.height}
									maximumValue={world.map.height}
									step={2}
									value={options.offsetY}
								/>
							</label>
						</td>
					</tr>
					<tr>
						<td>Player assignment</td>
						<td>
							<select onChange={handleAssignment} value={options.assignment}>
								<optgroup label="One player">
									<option value={PlayerAssignment.center}>Center</option>
									<option value={PlayerAssignment.topLeft}>Top left</option>
									<option value={PlayerAssignment.topRight}>Top right</option>
									<option value={PlayerAssignment.left}>Left</option>
									<option value={PlayerAssignment.right}>Right</option>
									<option value={PlayerAssignment.bottomLeft}>Bottom left</option>
									<option value={PlayerAssignment.bottomRight}>Bottom right</option>
								</optgroup>
								<optgroup label="Two players">
									<option value={PlayerAssignment.hex2Pos1}>Two, type 1</option>
									<option value={PlayerAssignment.hex2Pos2}>Two, type 2</option>
									<option value={PlayerAssignment.hex2Pos3}>Two, type 3</option>
								</optgroup>
								<optgroup label="Three players">
									<option value={PlayerAssignment.hex3Pos1}>Three, type 1</option>
									<option value={PlayerAssignment.hex3Pos2}>Three, type 2</option>
								</optgroup>
								<optgroup label="Four players">
									<option value={PlayerAssignment.hex4Pos1}>Four, type 1</option>
									<option value={PlayerAssignment.hex4Pos2}>Four, type 2</option>
									<option value={PlayerAssignment.hex4Pos3}>Four, type 3</option>
								</optgroup>
								<optgroup label="More than four players">
									<option value={PlayerAssignment.hexCenter5}>Five players</option>
									<option value={PlayerAssignment.hex6}>Six players</option>
									<option value={PlayerAssignment.hexCenter7}>Seven players</option>
								</optgroup>
							</select>
						</td>
					</tr>
					<tr>
						<td>Player distance</td>
						<td>
							<IncDec
								delay={25}
								onChange={(distance) => dispatchOptions({ type: 'options', payload: { distance } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.distance}
							/>
						</td>
					</tr>
				</tbody>
			</table>

			<table>
				<thead>
					<tr>
						<th>Mineral</th>
						<th>Ratio</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Coal</td>
						<td>
							<IncDec
								delay={25}
								onChange={(coal) => dispatchOptions({ type: 'minerals', payload: { coal } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.coal}
							/>
						</td>
					</tr>
					<tr>
						<td>Iron ore</td>
						<td>
							<IncDec
								delay={25}
								onChange={(ironOre) => dispatchOptions({ type: 'minerals', payload: { ironOre } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.ironOre}
							/>
						</td>
					</tr>
					<tr>
						<td>Gold</td>
						<td>
							<IncDec
								delay={25}
								onChange={(gold) => dispatchOptions({ type: 'minerals', payload: { gold } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.gold}
							/>
						</td>
					</tr>
					<tr>
						<td>Granite</td>
						<td>
							<IncDec
								delay={25}
								onChange={(granite) => dispatchOptions({ type: 'minerals', payload: { granite } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.granite}
							/>
						</td>
					</tr>
					<tr>
						<td>
							Replication likelyhood
							<br />
							<small>of same mineral nearby</small>
						</td>
						<td>
							<IncDec
								delay={25}
								onChange={(replicate) => dispatchOptions({ type: 'minerals', payload: { replicate } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.replicate}
							/>
						</td>
					</tr>
					<tr>
						<td>
							Mineral quantity
							<br />
							<small>smaller value = less likely max quantity</small>
						</td>
						<td>
							<IncDec
								delay={25}
								onChange={(quantity) => dispatchOptions({ type: 'minerals', payload: { quantity } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.quantity}
							/>
						</td>
					</tr>
				</tbody>
			</table>

			{/*
			<small className={styles.bars}>
				{calculateHeightElevations(world.map.blocks[BlockType.HeightMap]).elevations.map((value, elevation) => (
					<span key={elevation} title={`Elevation ${elevation} total: ${value}`}>
						{value}
					</span>
				))}
			</small>
			*/}

			{validation.length > 0 && (
				<div>
					<h4>Validation log</h4>
					<pre>{validation.join('\n')}</pre>
				</div>
			)}

			{/*
			<div>
				<h4>Regions</h4>
				<pre>{JSON.stringify(regions, null, '\t')}</pre>
			</div>*/}
		</div>
	)
}
