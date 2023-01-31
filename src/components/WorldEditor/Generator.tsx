import {
	addSubterrainResources,
	adjustPlayerLocations,
	assignPlayerPositions,
	blockadeMapEdges,
	ElevationBrush,
	generateEmptyMap,
	PlayerAssignment,
	elevationBasedTexturization,
	updateHeightMapFromNoiseArray,
	setHeight,
	isCastleSite,
	isHarbourSite,
	isMiningSite,
} from '$/lib/PlayerBasedGenerator'
import { BlockType, RegionType, Texture, TextureSet } from '$/lib/types'
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
import { calculateResources } from '$/lib/resources'
import { ResourceStats } from './ResourceStats'
import { TextureBrushConfig } from './TextureBrushConfig'

const terrainMap = new Map<TextureSet, TextureGroup[]>([
	[0, []],
	[1, []],
	[2, []],
])

Object.entries(TerrainSets).forEach(([_key, terrain]) => void terrainMap.get(terrain.type)!.push(terrain))

const terrainType = ['Greenland', 'Wasteland', 'Winter World']

const defaultGreenland: ElevationBrush = {
	default: Texture.Fertile1,
	sea: Texture.UnbuildableWater,
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
	sea: Texture.UnbuildableWater,
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
	sea: Texture.UnbuildableWater,
	coast: [
		Texture.Buildable,
		Texture.Buildable,
		Texture.Buildable,
		Texture.Buildable,
		Texture.Buildable,
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

const compatibilitySettings = {
	balanced: {
		maxTitle: 19,
		maxAuthor: 19,
		maxWidth: 256,
		maxHeight: 256,
		showCampaignMode: true,
		continuous: false,
	},
	rttr: {
		maxTitle: 20,
		maxAuthor: 20,
		maxWidth: 512,
		maxHeight: 512,
		showCampaignMode: false,
		continuous: true,
	},
	s2: {
		/** Max campaign title length: 24 (greenland), 23 (waste/winter), otherwise 19 */
		maxTitle: null,
		maxAuthor: 19,
		maxWidth: 256,
		maxHeight: 256,
		showCampaignMode: true,
		continuous: false,
	},
}

interface MapOptions {
	width: number
	height: number
	assignment: PlayerAssignment
	limitToOneLand: boolean
	brush: SupportedTexture
	compatibility: 'balanced' | 'rttr' | 's2'
	distance: number
	invertHeight: boolean
	mirror: string
	multiverse: number
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
	WLD: boolean
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
	limitToOneLand: false,
	brush: 'Greenland',
	compatibility: 'balanced',
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
	multiverse: 0,
	noise: 0.55,
	offsetX: 0,
	offsetY: 0,
	width: 192,
	WLD: false,
}

function getCompatibility(value: string | null) {
	if (value === 'rttr') return 'rttr'
	if (value === 's2') return 's2'
	return 'balanced'
}

export function Generator() {
	const [title, setTitle] = useState('')
	const [author, setAuthor] = useState('')

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
		options.compatibility = getCompatibility(params.get('compatibility'))
		options.invertHeight = params.has('invertHeight')
		options.WLD = params.has('WLD') && options.compatibility === 's2'
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
		const { assignment, brush, compatibility, invertHeight, minerals, mirror, WLD, ...limitedOptions } = options
		params.set('assignment', assignment)
		if (brush !== SupportedTexture.Greenland) params.set('brush', brush)
		if (compatibility !== 'balanced') params.set('compatibility', compatibility)
		if (invertHeight) params.set('invertHeight', '')
		if (WLD && compatibility === 's2') params.set('WLD', '')
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
			compatibility,
			distance,
			invertHeight,
			limitToOneLand,
			mirror,
			multiverse,
			noise,
			offsetX,
			offsetY,
		} = options
		const { border, heightLimit, mountLevel, peakBoost, peakRadius, seaLevel, soften, snowPeakLevel } =
			options.elevationOptions
		const { coal, gold, granite, ironOre, quantity, replicate } = options.minerals
		const world = generateEmptyMap({ width, height, random })

		if (multiverse > 0) {
			const rotate = multiverse / 100000
			world.noiseArray.forEach((value, index) => {
				world.noiseArray[index] = (value + rotate) % 1
			})
		}

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

		world.rawHeightMap = new Uint8Array(world.map.blocks[BlockType.HeightMap])

		elevationBasedTexturization({
			...world,
			brush: TerrainBrush[brush],
			mountLevel: mountLevel / 100,
			seaLevel: seaLevel / 100,
			snowPeakLevel: snowPeakLevel / 100,
		})

		const settings = compatibilitySettings[compatibility]

		if (!settings.continuous) {
			blockadeMapEdges(world.map)
		}

		world.map.updateBuildSiteMap()
		world.map.updateRegions()

		adjustPlayerLocations({ limitToOneLand, map: world.map })
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
			const format = options.WLD && options.compatibility === 's2' ? 'WLD' : 'SWD'
			world.map.title = title || `Generated map`
			world.map.author = author || (options.compatibility === 'rttr' ? 'MapGen@settlers2.net' : '')
			world.map.updateLightMap()
			const filename = 'UNTITLED'
			const buffer = world.map.getFileBuffer({ format })
			const name = filename.replace(/(\.WLD|\.DAT|\b)$/i, `.${format}`)
			download(name, buffer)
		},
		[world.map, options.compatibility, options.WLD, title, author]
	)

	const setCompatibility = useCallback((event: Event) => {
		if (event.target instanceof HTMLInputElement) {
			dispatchOptions({
				type: 'options',
				payload: { compatibility: event.target.value as MapOptions['compatibility'] },
			})
		}
	}, [])

	const rawRegions = world.map.regions
		.map(([type, _x, _y, size], index) => ({ index, size, type }))
		.filter(({ size, type }) => type === RegionType.Land && size)
		.sort((a, b) => b.size - a.size)

	const totalSize = rawRegions.reduce((total, { size }) => total + size, 0)

	/** This lets us know the true number of possible construction sites */
	const objectlessMap = world.map.getNewMap([
		BlockType.HeightMap,
		BlockType.RegionMap,
		BlockType.Texture1,
		BlockType.Texture2,
	])
	objectlessMap.updateBuildSiteMap()
	/** This shows what the true depths of the ocean is */
	const fullElevationMap = objectlessMap.getNewMap([
		BlockType.HeightMap,
		BlockType.RegionMap,
		BlockType.Texture1,
		BlockType.Texture2,
		BlockType.BuildSite,
	])
	fullElevationMap.blocks[BlockType.HeightMap].set(world.rawHeightMap)

	const { castleCount, harbourCount, mineCount } = objectlessMap.blocks[BlockType.BuildSite].reduce(
		(total, value, index) => {
			const isCastle = isCastleSite(value)
			const isHarbour = isHarbourSite(objectlessMap.blocks[BlockType.Texture1][index])
			if (isCastle) {
				if (isHarbour) total.harbourCount++
				else total.castleCount++
			} else if (isMiningSite(value)) {
				total.mineCount++
			}
			return total
		},
		{ castleCount: 0, harbourCount: 0, mineCount: 0 }
	)

	const harbours = world.map.getHarbourMap()

	const regions = rawRegions
		.map((region) => ({ ...region, pct: (region.size / totalSize) * 100 }))
		.filter((region) => region.pct >= 1 || (harbours.get(region.index) ?? 0 > 0))

	world.map.title = title || 'Generated map'
	const validation = validateMapClass(world.map)

	const playersOnMultipleContinents = new Set(world.map.getPlayerData().map(({ region }) => region)).size > 1
	const settings = compatibilitySettings[options.compatibility]
	const maxTitleLength =
		settings.maxTitle ?? (options.WLD && options.compatibility === 's2' ? (world.map.terrain === 0 ? 24 : 23) : 19)

	return (
		<div>
			<div style="max-width: 50rem;margin:1rem 0">
				<strong>Game compatibility target</strong>
				<p style="margin:0.5rem 0">
					<label>
						<input
							type="radio"
							name="compatibility"
							value="balanced"
							onChange={setCompatibility}
							checked={options.compatibility !== 'rttr' && options.compatibility !== 's2'}
						/>{' '}
						Balanced
					</label>
					&emsp;
					<label>
						<input
							type="radio"
							name="compatibility"
							value="rttr"
							onChange={setCompatibility}
							checked={options.compatibility === 'rttr'}
						/>{' '}
						Return to the Roots
					</label>
					&emsp;
					<label>
						<input
							type="radio"
							name="compatibility"
							value="s2"
							onChange={setCompatibility}
							checked={options.compatibility === 's2'}
						/>{' '}
						The Settlers II
					</label>
				</p>
				<small style="display:inline-block;line-height:1.5">
					Balanced limits options so that resulting maps will work with both games. RttR allows large maps,
					you can build through map edges, and supports more decorative objects by default. S2 can support
					longer map titles than RttR when creating maps optimized for campaigns.
				</small>
			</div>
			<p>
				<label>
					Seed: <NumberInput onChange={setSeed} value={seed} />
				</label>
				&emsp;
				<label>
					Multiverse:{' '}
					<IncDec
						delay={25}
						onChange={(multiverse) => dispatchOptions({ type: 'options', payload: { multiverse } })}
						minimumValue={0}
						step={1}
						maximumValue={99999}
						value={options.multiverse}
					/>
				</label>
				&emsp;
				<select onChange={handleMirror} name="mirror" value={options.mirror}>
					<option value="">Mirror: off</option>
					<option value="imperfect-horizontal">Mirror: imperfect horizontal</option>
					<option value="imperfect-vertical">Mirror: Imperfect vertical</option>
				</select>
				<br />
				<small>
					Seed controls all randomness to generate the world. Switching multiverse will adjust to another
					variation of that same world.
				</small>
			</p>
			<div style="background:white;padding:1rem;display:flex;align-items:center;justify-content:space-between">
				<div style="max-width: 52rem">
					<strong style="font-size:1.5rem">Step 1: Choose a height map</strong>
					<p>
						A random height map is generated based on the given seed and it's multiverse. Controls below
						allow you to adjust the shape of the world. Note that water areas are decided in the next step
						by the sea level control!
					</p>
					<p>
						<label>
							Width:{' '}
							<IncDec
								delay={25}
								onChange={(width) => dispatchOptions({ type: 'options', payload: { width } })}
								minimumValue={32}
								step={2}
								maximumValue={settings.maxWidth}
								value={options.width}
							/>
						</label>
						&emsp;
						<label>
							Height:{' '}
							<IncDec
								delay={25}
								onChange={(height) => dispatchOptions({ type: 'options', payload: { height } })}
								minimumValue={32}
								step={2}
								maximumValue={settings.maxHeight}
								value={options.height}
							/>
						</label>
						<br />
						<label title="Protected region from hill generation around the map edges">
							Border:{' '}
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
						</label>
					</p>
					<p>
						<label title="The bigger the value the more extreme the hills become">
							Hills:{' '}
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
						</label>
						&emsp;
						<label title="The biggest the value, the larger a generated hill can effect">
							Hill size:{' '}
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
						</label>
						<br />
						<label title="Higher values brings mountains down">
							Erosion strength:{' '}
							<IncDec
								delay={25}
								onChange={(heightLimit) =>
									dispatchOptions({
										type: 'elevationOptions',
										payload: { heightLimit: 5 - heightLimit },
									})
								}
								minimumValue={0}
								step={1}
								maximumValue={5}
								value={5 - options.elevationOptions.heightLimit}
							/>
						</label>
					</p>
					<p>
						<label title="Random is very random, so smooth it out more before applying erosion">
							Soften before erosion:{' '}
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
							/>
						</label>
						<br />
						<label title="Bottom of the sea becomes top of the mountain and vice versa">
							Invert height map:{' '}
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
							/>
						</label>
						<br />
						<label title="Removing flatness makes castle building sites less likely">
							Remove flatness:{' '}
							<select onChange={handleNoise} value={options.noise}>
								<option value="0">Keep as-is</option>
								<option value="0.55">Weak noise</option>
								<option value="1">Light noise</option>
								<option value="1.75">Medium noise</option>
								<option value="2.25">Strong noise</option>
							</select>
						</label>
					</p>
					<p>
						<label>
							Offset X:{' '}
							<IncDec
								delay={25}
								onChange={(offsetX) => dispatchOptions({ type: 'options', payload: { offsetX } })}
								minimumValue={-world.map.width}
								maximumValue={world.map.width}
								step={1}
								value={options.offsetX}
							/>
						</label>
						&emsp;
						<label>
							Offset Y:{' '}
							<IncDec
								delay={25}
								onChange={(offsetY) => dispatchOptions({ type: 'options', payload: { offsetY } })}
								minimumValue={-world.map.height}
								maximumValue={world.map.height}
								step={2}
								value={options.offsetY}
							/>
						</label>
					</p>
				</div>
				<div style="margin-left:1rem">
					<MapCanvas
						world={fullElevationMap}
						color1={0}
						color2={255}
						blockType={BlockType.HeightMap}
						texture={options.brush}
					/>
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Mining spots" src="/design/mine.png" width="24" height="29" />
						</span>
						&nbsp;
						{mineCount} mines
					</div>
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Castle spots" src="/design/castle.png" width="31" height="31" />
						</span>
						&nbsp;
						{castleCount} castles
					</div>
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Harbour spots" src="/design/coastal_castle.png" width="32" height="28" />
						</span>
						&nbsp;
						{harbourCount} harbours
					</div>
				</div>
			</div>
			<p>
				<small>
					<em>
						Future features: import height map from images and other maps. Generate mirrored maps for
						multiplayer.
					</em>
				</small>
			</p>
			<div style="background:white;padding:1rem;display:flex;align-items:center;justify-content:space-between">
				<div>
					<strong style="font-size:1.5rem">Step 2: Choose textures</strong>
					<p>
						Textures are generated based on height map elevation. You can choose the level of elevation that
						decides when a particular set of textures are used.
					</p>
					<p>
						<label>
							Terrain set:{' '}
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
						</label>
					</p>
					<label>
						Lowlands level:{' '}
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
					</label>
					<br />
					<label>
						Hill level:{' '}
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
					</label>
					<br />
					<label>
						Highlands level:{' '}
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
					</label>
					<TextureBrushConfig brush={options.brush} elevationBrush={TerrainBrush[options.brush]} />
				</div>
				<div style="margin-left:1rem">
					<MapCanvas world={fullElevationMap} color1={0} color2={255} texture={options.brush} />
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Fish" src="/assets/res/fish.png" height="24" width="24" />
						</span>
						&nbsp;
						{resources.fish} fishes
					</div>
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Fresh water" src="/assets/res/fresh-water.png" height="24" width="24" />
						</span>
						&nbsp;
						{resources.freshWater} well sites
					</div>
				</div>
			</div>
			<p>
				<small>
					<em>
						Future features: allow visual selection of textures to use per elevation level rule. Add option
						for river generation.
					</em>
				</small>
			</p>
			<div style="background:white;padding:1rem;display:flex;align-items:center;justify-content:space-between">
				<div>
					<strong style="font-size:1.5rem">Step 3: Set player placement</strong>
					<p>
						<label>
							Force everyone to same land area:{' '}
							<input
								type="checkbox"
								onChange={(event: Event) => {
									if (event.target instanceof HTMLInputElement) {
										dispatchOptions({
											type: 'options',
											payload: { limitToOneLand: event.target.checked },
										})
									}
								}}
								checked={options.limitToOneLand}
							/>
						</label>
					</p>
					<p>
						<label>
							Auto-assignment:{' '}
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
						</label>
						<br />
						<small>
							Assigns player position to a hexagon corners. Locations are adjusted to closest available
							castle size building spot.
						</small>
					</p>
					<p>
						<label>
							Distance from map center:{' '}
							<IncDec
								delay={25}
								onChange={(distance) => dispatchOptions({ type: 'options', payload: { distance } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.distance}
							/>
						</label>
						<br />
						<small>However middle player is always placed to near the middle of the map.</small>
					</p>
				</div>
				<div style="margin-left:1rem">
					<MapCanvas showPlayers world={objectlessMap} color1={0} color2={255} texture={options.brush} />
					<small>
						{regions.map((region) => (
							<div key={region.index}>
								Land #{region.index} ({region.pct.toFixed(2)} %)
								{harbours.get(region.index) && ` has harbours`}
							</div>
						))}
					</small>
				</div>
			</div>
			<p>
				<small>
					<em>
						Future features: allow custom placement of players. Allow adding up to 10 players. Report on
						player balance level. Check if each player can truly reach other players.
					</em>
				</small>
			</p>
			<div style="background:white;padding:1rem;display:flex;align-items:center;justify-content:space-between">
				<div>
					<strong style="font-size:1.5rem">Step 4: Choose resource levels</strong>
					<p>
						Forests and granite deposits are generated so that they do not disturb player starting locations
						or harbours.
					</p>
					<p>
						<strong>Mining resources</strong>
					</p>
					<p>
						<label>
							Coal:{' '}
							<IncDec
								delay={25}
								onChange={(coal) => dispatchOptions({ type: 'minerals', payload: { coal } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.coal}
							/>
						</label>
						&emsp;
						<label>
							Iron ore:{' '}
							<IncDec
								delay={25}
								onChange={(ironOre) => dispatchOptions({ type: 'minerals', payload: { ironOre } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.ironOre}
							/>
						</label>
						<br />
						<label>
							Granite:{' '}
							<IncDec
								delay={25}
								onChange={(granite) => dispatchOptions({ type: 'minerals', payload: { granite } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.granite}
							/>
						</label>
						&emsp;
						<label>
							Gold:{' '}
							<IncDec
								delay={25}
								onChange={(gold) => dispatchOptions({ type: 'minerals', payload: { gold } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.gold}
							/>
						</label>
					</p>
					<p>
						<label>
							Mining resource uniformity:{' '}
							<IncDec
								delay={25}
								onChange={(replicate) => dispatchOptions({ type: 'minerals', payload: { replicate } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.replicate}
							/>
						</label>
						<br />
						<small>Higher value = more likely a mineral repeats continuously</small>
					</p>
					<p>
						<label>
							Mining resource quantity:{' '}
							<IncDec
								delay={25}
								onChange={(quantity) => dispatchOptions({ type: 'minerals', payload: { quantity } })}
								minimumValue={0}
								step={1}
								maximumValue={100}
								value={options.minerals.quantity}
							/>
						</label>
						<br />
						<small>Smaller value = less full mineral deposits in mountains</small>
					</p>
				</div>
				<div style="margin-left:1rem">
					<MapCanvas world={world.map} color1={0} color2={255} texture={options.brush} />
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Coal" src="/assets/res/coal.png" height="24" width="24" />
						</span>
						&nbsp;
						{resources.mineralCoal} coal
					</div>
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Iron ore" src="/assets/res/iron-ore.png" height="24" width="24" />
						</span>
						&nbsp;
						{resources.mineralIronOre} iron ore
					</div>
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Gold" src="/assets/res/gold.png" height="24" width="24" />
						</span>
						&nbsp;
						{resources.mineralGold} gold
					</div>
					<div>
						<span style="vertical-align:middle;display:inline-flex;align-items:center;justify-content:center;height:36px;width:36px">
							<img alt="Granite" src="/assets/res/granite.png" height="24" width="24" />
						</span>
						&nbsp;
						{resources.mineralGranite} granite
					</div>
				</div>
			</div>
			<p>
				<small>
					<em>
						Future features: allow controlling forests and granite deposits. Allow generating player
						balanced resources (current is random).
					</em>
				</small>
			</p>
			<div style="background:white;padding:1rem;display:flex;align-items:center;justify-content:space-between">
				<div>
					<strong style="font-size:1.5rem">Step 5: Complete the map</strong>
					{settings.showCampaignMode && playersOnMultipleContinents && (
						<p>
							Ships are required for players to be able to reach each other as they are located on
							multiple continents. In Return to the Roots this is fine, but in The Settlers II this map
							only works as a replacement mission for the Roman Campaign.
						</p>
					)}
					{settings.maxTitle == null && (
						<p>
							<label>
								Save as Campaign map:{' '}
								<input
									type="checkbox"
									onChange={(event: Event) => {
										if (event.target instanceof HTMLInputElement) {
											dispatchOptions({
												type: 'options',
												payload: { WLD: event.target.checked },
											})
										}
									}}
									checked={options.WLD}
								/>
							</label>
							<br />
							<small>
								Allows longer map title in The Settlers II, but the map will not work in free play mode.
								Map works in RttR but the title will cut down to a max of 20 characters.
							</small>
						</p>
					)}
					<p>
						<label>
							Map title:
							<br />
							<input
								onChange={handleTitle}
								placeholder="Generated map"
								type="text"
								name="title"
								value={title}
								maxLength={maxTitleLength}
								style="font-family:var(--font-mono);font-size:1.25rem"
							/>{' '}
							({title.length} / {maxTitleLength})
						</label>
					</p>
					<p>
						<label>
							Map author:
							<br />
							<input
								onChange={handleAuthor}
								placeholder="MapGen@Settlers2Net"
								type="text"
								name="author"
								value={author}
								maxLength={settings.maxAuthor}
								style="font-family:var(--font-mono);font-size:1.25rem"
							/>{' '}
							({author.length} / {settings.maxAuthor})
						</label>
					</p>
					<p>
						<small>
							For complete list of valid characters, see{' '}
							<a href="https://en.wikipedia.org/wiki/Code_page_437#Character_set" target="_blank">
								Wikipedia: CP437 (opens a new window)
							</a>
							<br />
							However The Settlers II font supports only a sub-set of these.
						</small>
					</p>
				</div>
				<div style="margin-left:1rem">
					<MapCanvas world={world.map} color1={0} color2={255} texture={options.brush} showPlayers />
				</div>
			</div>

			<div style="display: flex; justify-content: center; padding: 1rem">
				<Button primary onClick={downloadSwd}>
					Download!
				</Button>
			</div>

			{validation.length > 0 && (
				<div>
					<h4>Validation log</h4>
					<pre>{validation.join('\n')}</pre>
				</div>
			)}

			<ResourceStats map={world.map} resources={resources} />
		</div>
	)
}
