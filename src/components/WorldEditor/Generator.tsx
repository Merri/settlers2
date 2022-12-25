import {
	adjustPlayerLocations,
	assignPlayerPositions,
	generateEmptyMap,
	PlayerAssignment,
	randomizeElevation,
} from '$/lib/PlayerBasedGenerator'
import { BlockType } from '$/lib/types'
import { ChangeEventHandler } from 'preact/compat'
import { useCallback, useEffect, useReducer, useState } from 'preact/hooks'
import { XORShift } from 'random-seedable'

import { IncDec } from '../MapGenerator/IncDec'
import { MapCanvas } from './Map'

import styles from './Generator.module.css'
import { calculateHeightElevations } from '.'
import { validateMapClass } from '$/lib/MapValidation'
import { NumberInput } from '../MapGenerator/NumberInput'
import Button from '../Button'

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
	distance: number
	mirror: string
	noise: number
	elevationOptions: {
		peakBoost: number
		peakRadius: number
		seaLevel: number
		snowPeakLevel: number
	}
}

interface MapOptionsPayload {
	type: 'options'
	payload: Partial<Exclude<MapOptions, 'elevationOptions'>>
}

interface MapElevationOptionsPayload {
	type: 'elevationOptions'
	payload: Partial<MapOptions['elevationOptions']>
}

type MapOptionsAction = MapOptionsPayload | MapElevationOptionsPayload

const emptyOptions: MapOptions = {
	assignment: PlayerAssignment.hexCenter7,
	distance: 50,
	elevationOptions: {
		peakBoost: 0,
		peakRadius: 7,
		seaLevel: 33,
		snowPeakLevel: 100,
	},
	height: 160,
	mirror: '',
	noise: 0.55,
	width: 160,
}

export function Generator() {
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
		const mirror = params.get('mirror')
		const opts = params.get('options')
		if (assignment) options.assignment = assignment
		if (mirror) options.mirror = mirror

		if (opts) {
			try {
				const { elevationOptions, ...rest } = JSON.parse(opts)
				Object.assign(options, rest)
				options.elevationOptions = { ...options.elevationOptions, ...elevationOptions }
			} catch (e) {}
		}

		return options
	})

	const [options, dispatchOptions] = useReducer<MapOptions, MapOptionsAction>((options, action) => {
		switch (action.type) {
			case 'options': {
				return { ...options, ...action.payload }
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

	const handleAssignment: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
		if (event.target instanceof HTMLSelectElement) {
			dispatchOptions({ type: 'options', payload: { assignment: event.target.value as PlayerAssignment } })
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

	useEffect(() => {
		const params = new URLSearchParams()
		params.set('seed', `${seed}`)
		const { assignment, mirror, ...limitedOptions } = options
		params.set('assignment', assignment)
		mirror && params.set('mirror', mirror)
		params.set('options', JSON.stringify(limitedOptions))
		history.replaceState(null, '', `?${params}`)
	}, [options, seed])

	useEffect(() => {
		const random = new XORShift(seed)
		const { width, height, assignment, distance, mirror, noise } = options
		const { peakBoost, peakRadius, seaLevel, snowPeakLevel } = options.elevationOptions
		const world = generateEmptyMap({ width, height, random })

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
		randomizeElevation({
			...world,
			peakBoost,
			peakRadius,
			seaLevel: seaLevel / 100,
			snowPeakLevel: snowPeakLevel / 100,
		})

		if (noise) {
			const heightMap = world.map.blocks[BlockType.HeightMap]
			heightMap.forEach((_, index) => {
				heightMap[index] += Math.round(world.noiseArray[index] * noise)
			})
		}

		world.map.updateBuildSiteMap()
		world.map.updateRegions()

		adjustPlayerLocations({ map: world.map })

		setWorld(world)
	}, [options, seed])

	const downloadSwd = useCallback(
		function downloadSwd(event: Event) {
			if (!(event.target instanceof HTMLButtonElement)) return
			const filename = 'UNTITLED'
			const buffer = world.map.getFileBuffer({ format: 'SWD' })
			const name = filename.replace(/(\.WLD|\.DAT|\b)$/i, '.SWD')
			download(name, buffer)
		},
		[world.map]
	)

	const validation = validateMapClass(world.map)

	return (
		<div>
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
								maximumValue={15}
								value={options.elevationOptions.peakRadius}
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
						<td>Snow peak level</td>
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
						</td>
					</tr>
				</tbody>
			</table>

			<MapCanvas showPlayers world={world.map} color1={0} color2={255} />

			<small className={styles.bars}>
				{calculateHeightElevations(world.map.blocks[BlockType.HeightMap]).elevations.map((value, elevation) => (
					<span key={elevation} title={`Elevation ${elevation} total: ${value}`}>
						{value}
					</span>
				))}
			</small>

			{validation.length > 0 && (
				<div>
					<h4>Validation log</h4>
					<pre>{validation.join('\n')}</pre>
				</div>
			)}

			<Button primary onClick={downloadSwd}>Download!</Button>
		</div>
	)
}
