import { ChangeEvent, useCallback, useState } from 'preact/compat'
import { MapClass } from '$/lib/MapClass'
import { AnimalType, BlockType, Texture, Textures } from '$/lib/types'
import { cp437ToString, sanitizeAsCp437 } from '$/lib/cp437'

import styles from './index.module.css'
import { MapCanvas } from './Map'
import { asHex } from '$/lib/hex'
import { validateMapClass } from '$/lib/MapValidation'
import { flipX } from '$/lib/swdUtils/flipX'
import { hexRotate } from '$/lib/swdUtils/hexRotate'
import { setMapSize } from '$/lib/swdUtils/setMapSize'

interface WorldFile {
	filename: string
	world: MapClass
	originalFilepath?: string
	ticks?: number
}

const leaderNames = [
	'Octavianus',
	'Julius',
	'Brutus',
	'Erik',
	'Knut',
	'Olof',
	'Yamauchi',
	'Tsunami',
	'Hakirawashi',
	'Shaka',
	'Todo',
	'Mnga Tscha',
]

function getAnimalName(animalType: AnimalType) {
	switch (animalType) {
		case AnimalType.Deer:
		case AnimalType.DeerAlt:
			return 'Deer'
		case AnimalType.Duck:
		case AnimalType.DuckAlt:
			return 'Duck'
		case AnimalType.Fox:
			return 'Fox'
		case AnimalType.PackDonkey:
			return 'Pack Donkey'
		case AnimalType.Rabbit:
			return 'Rabbit'
		case AnimalType.Sheep:
			return 'Sheep'
		case AnimalType.Stag:
			return 'Stag'
		default:
			return `Unknown type (${animalType})`
	}
}

export function calculateHeightElevations(heightMap: Uint8Array) {
	const elevations = new Array(61).fill(0)

	const log: string[] = []

	heightMap.forEach((value, index) => {
		if (value > 60) {
			log.push(`Invalid value ${value} at index ${index}`)
		} else {
			elevations[value]++
		}
	})

	return { elevations, log }
}

function download(filename: string, contents: BlobPart, mimeType = 'application/octet-stream') {
	const link = document.createElement('a')
	const url = URL.createObjectURL(new Blob([contents], { type: mimeType }))
	link.download = filename
	link.href = url
	link.dispatchEvent(new MouseEvent('click'))
	//requestAnimationFrame(() => URL.revokeObjectURL(url))
}

const textureArray: { id: number; names: string[] }[] = []

Textures.forEach((value, id) => {
	textureArray.push({ id, names: value.name })
})

export function WorldEditor() {
	const [errors, setErrors] = useState<string[]>([])
	const [worlds, setWorlds] = useState<WorldFile[]>([])
	const [selected, setSelected] = useState(0)

	async function onChange(event: ChangeEvent<HTMLInputElement>) {
		if (!(event.target instanceof HTMLInputElement)) return

		const saveGameMeta = new Map<
			string,
			{
				ticks: number
				terrain: number
				playerCount: number
				hqX: [number, number, number, number, number, number, number]
				hqY: [number, number, number, number, number, number, number]
				originalFilepath: string
				title: string
				width: number
				height: number
			}
		>()
		const regions = new Map<string, ArrayBuffer>()
		const errors: string[] = []
		const worldFiles: WorldFile[] = []

		for (const file of Array.from(event.target.files || [])) {
			const arrayBuffer = await file.arrayBuffer()
			const control = /^CNTRL(\d\d\d)\.DAT$/i.exec(file.name)
			const region = /^CONTI(\d\d\d)\.DAT$/i.exec(file.name)
			if (control) {
				if (arrayBuffer.byteLength === 0x242) {
					const view = new DataView(arrayBuffer)

					saveGameMeta.set(control[1], {
						ticks: view.getUint32(0, true),
						terrain: view.getUint8(0x20),
						originalFilepath: cp437ToString(new Uint8Array(arrayBuffer, 0x161, 0xc7)),
						title: cp437ToString(new Uint8Array(arrayBuffer, 0x22d)),
						width: view.getUint16(0x229, true),
						height: view.getUint16(0x22b, true),
						playerCount: view.getUint16(0xe9, true),
						hqX: [
							view.getUint16(0xeb, true),
							view.getUint16(0xef, true),
							view.getUint16(0xf3, true),
							view.getUint16(0xf7, true),
							view.getUint16(0xfb, true),
							view.getUint16(0xff, true),
							view.getUint16(0x103, true),
						],
						hqY: [
							view.getUint16(0xed, true),
							view.getUint16(0xf1, true),
							view.getUint16(0xf5, true),
							view.getUint16(0xf9, true),
							view.getUint16(0xfd, true),
							view.getUint16(0x101, true),
							view.getUint16(0x105, true),
						],
					})
				}
			} else if (region) {
				regions.set(region[1], arrayBuffer)
			} else {
				try {
					const world = new MapClass({ fileContents: new DataView(arrayBuffer) })
					worldFiles.push({ filename: file.name, world })
				} catch (error) {
					errors.push(`[${file.name}] ${error}`)
				}
			}
		}

		worldFiles.forEach((worldFile) => {
			const { world } = worldFile
			const worldNumber = /^WORLD(\d\d\d)\.DAT$/i.exec(worldFile.filename)
			if (worldNumber) {
				if (regions.has(worldNumber[1])) {
					world.setRegions(new DataView(regions.get(worldNumber[1])!))
				}
				if (saveGameMeta.has(worldNumber[1])) {
					const save = saveGameMeta.get(worldNumber[1])!
					// loose check that at least the world size matches!
					if (world.width === save.width && world.height === save.height) {
						world.terrain = save.terrain
						world.playerCount = save.playerCount
						world.hqX = save.hqX
						world.hqY = save.hqY
						world.title = save.title
						world.author = 'Savegame'
						worldFile.originalFilepath = save.originalFilepath
						worldFile.ticks = save.ticks
					} else {
						console.warn(`CNTRL${worldNumber[1]}.DAT did not match ${worldFile.filename} dimensions!`)
					}
				}
			}
		})

		setErrors(errors)
		setWorlds((worlds) => worldFiles.concat(worlds))
	}

	const downloadWld = useCallback(
		function downloadSwd(event: Event) {
			if (!(event.target instanceof HTMLButtonElement)) return
			const { filename, world } = worlds[~~event.target.value]
			const cleanup = document.querySelector<HTMLInputElement>('input[name="cleanup"]')?.checked
			const buffer = world.getFileBuffer({ cleanup, format: 'WLD' })
			const name = filename.replace(/\.(SWD|DAT)$/i, '.WLD')
			download(name, buffer)
		},
		[worlds]
	)

	const downloadSwd = useCallback(
		function downloadSwd(event: Event) {
			if (!(event.target instanceof HTMLButtonElement)) return
			const { filename, world } = worlds[~~event.target.value]
			const cleanup = document.querySelector<HTMLInputElement>('input[name="cleanup"]')?.checked
			const buffer = world.getFileBuffer({ cleanup, format: 'SWD' })
			const name = filename.replace(/\.(WLD|DAT)$/i, '.SWD')
			download(name, buffer)
		},
		[worlds]
	)

	const downloadWorldDat = useCallback(
		function downloadWorldDat(event: Event) {
			if (!(event.target instanceof HTMLButtonElement)) return
			const { filename, world } = worlds[~~event.target.value]
			const buffer = world.getFileBuffer({ format: 'WORLD.DAT' })
			const name = filename.replace(/\.(SWD|WLD)$/i, '.DAT')
			download(name, buffer)
		},
		[worlds]
	)

	const downloadContiDat = useCallback(
		function downloadContiDat(event: Event) {
			if (!(event.target instanceof HTMLButtonElement)) return
			const { filename, world } = worlds[~~event.target.value]
			const buffer = world.getFileBuffer({ format: 'CONTI.DAT' })
			const name = filename.replace(/\.(SWD|WLD)$/i, '.DAT').replace(/^WORLD/i, 'CONTI')
			download(name.toUpperCase().includes('CONTI') ? name : `CONTI${name}`, buffer)
		},
		[worlds]
	)

	const handleTextInput = useCallback(
		function handleTextInput(event: ChangeEvent<HTMLInputElement>) {
			if (!(event.target instanceof HTMLInputElement)) return
			const { world } = worlds[~~event.target.dataset.index!]!
			world[event.target.name] = sanitizeAsCp437(event.target.value)
			setWorlds((worlds) => worlds.slice(0))
		},
		[worlds]
	)

	const handleNumberInput = useCallback(
		function handleNumberInput(event: Event) {
			if (!(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLSelectElement)) return
			const indices = event.target.dataset.index
			if (indices?.includes('-')) {
				const [index, itemIndex] = indices.split('-').map((x) => ~~x)
				const { world } = worlds[index]
				world[event.target.name][itemIndex] = ~~event.target.value
			} else {
				const { world } = worlds[~~(indices || 0)]
				world[event.target.name] = ~~event.target.value
			}
			setWorlds((worlds) => worlds.slice(0))
		},
		[worlds]
	)

	const onClickWorld = useCallback(function onClickWorld(event: Event) {
		if (!(event.target instanceof HTMLButtonElement)) return
		setSelected(~~event.target.value)
	}, [])

	const flipHorizontally = useCallback(function flipHorizontally(event: Event) {
		if (!(event.target instanceof HTMLButtonElement)) return
		const targetIndex = ~~event.target.value
		setWorlds((worlds) => {
			return worlds.map((worldFile, index) => {
				return index === targetIndex ? { ...worldFile, world: flipX(worldFile.world) } : worldFile
			})
		})
	}, [])

	const hexRotation = useCallback(function hexRotation(event: Event) {
		if (!(event.target instanceof HTMLButtonElement)) return
		const targetIndex = ~~event.target.value
		setWorlds((worlds) => {
			return worlds.map((worldFile, index) => {
				return index === targetIndex ? { ...worldFile, world: hexRotate(worldFile.world) } : worldFile
			})
		})
	}, [])

	const handleMapSize = useCallback(function handleMapSize(event: SubmitEvent) {
		const form = event.target
		if (!(form instanceof HTMLFormElement)) return
		event.preventDefault()
		const button: HTMLButtonElement = form.elements['mapSize']
		const targetIndex = ~~button.value
		const widthElement: HTMLInputElement = form.elements['width']
		const heightElement: HTMLInputElement = form.elements['height']
		const textureElement: HTMLInputElement = form.elements['texture']
		const alignElement: HTMLInputElement = form.elements['align']
		const [yAlign, xAlign] = alignElement.value.split('-', 2)
		setWorlds((worlds) => {
			return worlds.map((worldFile, index) => {
				const options = {
					width: ~~widthElement.value,
					height: ~~heightElement.value,
					texture: ~~textureElement.value,
					xAlign: xAlign as 'left' | 'center' | 'right',
					yAlign: yAlign as 'top' | 'center' | 'bottom',
				}
				return index === targetIndex ? { ...worldFile, world: setMapSize(worldFile.world, options) } : worldFile
			})
		})
	}, [])

	const { filename, originalFilepath, ticks = 0, world } = worlds[selected] ?? {}
	const index = selected

	const ms = (ticks % 7) * 125
	const secs = Math.floor(ticks / 8) % 60
	const mins = Math.floor(ticks / 8 / 60) % 60
	const hours = Math.floor(ticks / 8 / 3600)
	const time = `${('0' + hours).slice(-2)}:${('0' + mins).slice(-2)}:${('0' + secs).slice(-2)}.${('00' + ms).slice(
		-3
	)}`

	const validation = world ? validateMapClass(world) : []

	return (
		<div>
			<h1>World Editor</h1>
			<p>
				Currently accepts SWD, WLD, or <code>CNTRL###.DAT</code>+<code>CONTI###.DAT</code>+
				<code>WORLD###.DAT</code>
			</p>
			<input type="file" multiple onChange={onChange} />
			{errors.length > 0 && (
				<div>
					<h2>Errors</h2>
					<ul>
						{errors.map((error, index) => (
							<li key={index}>{error}</li>
						))}
					</ul>
				</div>
			)}
			<h2>Maps</h2>
			<div data-scrolling="inline">
				<div className={styles.buttonRow}>
					{worlds.map(({ filename, world }, index) => {
						const isSelected = index === selected
						return (
							<button
								className={isSelected ? styles.buttonSelected : styles.button}
								aria-selected={isSelected}
								onClick={onClickWorld}
								type="button"
								value={index}
								key={index}
								title={world.title}
							>
								<MapCanvas world={world} color1={isSelected ? 0 : 255} color2={isSelected ? 255 : 0} />
								{filename}
							</button>
						)
					})}
				</div>
			</div>
			{world != null && (
				<>
					<div>
						<p>
							<button type="button" onClick={flipHorizontally} value={index}>
								Flip horizontally
							</button>{' '}
							<button
								type="button"
								onClick={hexRotation}
								value={index}
								disabled={world.width !== world.height}
							>
								Square map rotate
							</button>
							<form onSubmit={handleMapSize}>
								<input type="number" name="width" min={32} max={768} step={2} value={world.width} />{' '}
								&times;{' '}
								<input type="number" name="height" min={32} max={768} step={2} value={world.height} />{' '}
								<label>
									Align:{' '}
									<select name="align">
										<option value="center-center">Center</option>
										<option value="top-left">Top left</option>
										<option value="top-center">Top center</option>
										<option value="top-right">Top right</option>
										<option value="center-left">Center left</option>
										<option value="center-right">Center right</option>
										<option value="bottom-left">Bottom left</option>
										<option value="bottom-center">Bottom center</option>
										<option value="bottom-right">Bottom right</option>
									</select>
								</label>
								<label>
									Default texture:{' '}
									<select name="texture">
										{textureArray.map(({ id, names }) => (
											<option key={id} value={id}>
												0x{asHex(id)}: {names[world.terrain]}
											</option>
										))}
									</select>
								</label>{' '}
								<button type="submit" name="mapSize" value={index}>
									Set map size
								</button>
							</form>
						</p>
					</div>
					<table>
						<thead>
							<tr>
								<th>Info</th>
								<th>Details</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Filename</td>
								<td>
									<code>{filename}</code>
								</td>
							</tr>
							{ticks != null && (
								<tr>
									<td>Game time</td>
									<td>
										<code>{time}</code>
									</td>
								</tr>
							)}
							{originalFilepath != null && (
								<tr>
									<td>Original path &amp; filename</td>
									<td>
										<code>{originalFilepath}</code>
									</td>
								</tr>
							)}
							<tr>
								<td>Title</td>
								<td>
									<input
										type="text"
										data-index={index}
										maxLength={24 - (world.terrain !== 0 ? 1 : 0)}
										name="title"
										onInput={handleTextInput}
										value={world.title}
									/>
									<br />
									{world.title.length > 19 ? (
										<small>
											WLD allows 19+ chars ({world.title.length} /{' '}
											{24 - (world.terrain !== 0 ? 1 : 0)})
										</small>
									) : (
										<br />
									)}
								</td>
							</tr>
							<tr>
								<td>Author</td>
								<td>
									{' '}
									<input
										type="text"
										data-index={index}
										maxLength={19}
										name="author"
										onInput={handleTextInput}
										value={world.author}
									/>
								</td>
							</tr>
							<tr>
								<td>Size</td>
								<td>
									{world.width} &times; {world.height}
								</td>
							</tr>
							<tr>
								<td>Terrain</td>
								<td>
									<select
										data-index={index}
										name="terrain"
										onInput={handleNumberInput}
										value={world.terrain}
									>
										<option value={0}>Greenland</option>
										<option value={1}>Wasteland</option>
										<option value={2}>Winter World</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Meta: player count</td>
								<td>
									<input
										type="number"
										min={0}
										max={255}
										data-index={index}
										name="playerCount"
										onInput={handleNumberInput}
										value={world.playerCount}
									/>
								</td>
							</tr>
							<tr>
								<td>
									Meta: headquarters
									<br />
									<small>Leader effective in World Campaign mode</small>
								</td>
								<td>
									{world.hqX.map((x, idx) => (
										<span key={idx}>
											Player {idx + 1}:{' '}
											<select
												data-index={`${index}-${idx}`}
												name="leader"
												onInput={handleNumberInput}
												value={world.leader[idx]}
											>
												{leaderNames.map((name, value) => (
													<option key={name} value={value}>
														{name}
													</option>
												))}
											</select>{' '}
											{x !== 0xffff ? (
												<span>
													{x} &times; {world.hqY[idx]}
												</span>
											) : (
												'-'
											)}
											<br />
										</span>
									))}
								</td>
							</tr>
							<tr>
								<td>Meta: validation flag</td>
								<td>
									<select
										data-index={index}
										name="validationFlag"
										onClick={handleNumberInput}
										value={world.validationFlag}
									>
										<option value={0}>Allow in all game modes</option>
										<option value={1}>Allow in campaign only</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Block: height</td>
								<td>
									<small className={styles.bars}>
										{calculateHeightElevations(world.blocks[BlockType.HeightMap]).elevations.map(
											(value, elevation) => (
												<span key={elevation} title={`Elevation ${elevation} total: ${value}`}>
													{value}
												</span>
											)
										)}
									</small>
								</td>
							</tr>
							<tr>
								<td>Block 4 &amp; 5: object</td>
								<td>
									{world.blocks[BlockType.Object2]
										.reduce(
											(obj, objectType, index) => {
												let meta = ''
												if (objectType === 0x80) {
													meta = `Building ${asHex(
														world.blocks[BlockType.Object1][index] + 1
													)}`
												} else if (objectType === 0xc8) {
													if (world.blocks[BlockType.Object1][index] === 0x16) {
														meta = `Gate`
													}
												}
												if (meta) {
													const x = index % world.width
													const y = Math.round((index - x) / world.width)
													obj.push({ meta, x, y })
												}
												return obj
											},
											[] as { meta: string; x: number; y: number }[]
										)
										.sort((a, b) => a.meta.localeCompare(b.meta))
										.map(({ meta, x, y }, idx) => (
											<span key={idx}>
												{meta}: {asHex(x)} &times; {asHex(y)}{' '}
												<small>
													({x} &times; {y})
												</small>
												<br />
											</span>
										))}
								</td>
							</tr>
							{world.blocks[BlockType.Animal].every((val) => val !== 0xff) ? (
								<tr>
									<td>Block 6: animals</td>
									<td>
										{Object.entries(
											world.blocks[BlockType.Animal].reduce(
												(record, animalType) => {
													if (animalType > 0 && animalType < 255) {
														const name = getAnimalName(animalType)
														if (record[name] == null) record[name] = 0
														record[name]++
													}
													return record
												},
												{} as Record<string, number>
											)
										).map(([name, count]) => (
											<span key={name}>
												{name}: {count}
												<br />
											</span>
										))}
									</td>
								</tr>
							) : (
								<tr>
									<td>Block 6 &amp; 7: unique index</td>
									<td>
										<select>
											{world.blocks[BlockType.Animal]
												.reduce(
													(record, loByte, i) => {
														const hiByte = world.blocks[BlockType.Unknown][i]
														if (loByte !== 255 && hiByte !== 255) {
															const index = loByte | (hiByte << 8)
															const x = i % world.width
															const y = Math.ceil((i - x) / world.width)
															record.push({ x, y, index })
														}
														return record
													},
													[] as { x: number; y: number; index: number }[]
												)
												.sort((a, b) => a.index - b.index)
												.map(({ x, y, index }) => (
													<option key={index}>
														{index} @ {x}&times;{y}
													</option>
												))}
										</select>
									</td>
								</tr>
							)}
							<tr>
								<td>Footer: animals</td>
								<td>
									{Object.entries(
										world.animals.reduce(
											(record, [animalType, animalX, animalY]) => {
												const name = getAnimalName(animalType)
												if (record[name] == null) record[name] = 0
												record[name]++
												return record
											},
											{} as Record<string, number>
										)
									).map(([name, count]) => (
										<span key={name}>
											{name}: {count}
											<br />
										</span>
									))}
								</td>
							</tr>
						</tbody>
					</table>
					{world.log.length > 0 && (
						<div>
							<h4>File processing log</h4>
							<pre>{world.log.join('\n')}</pre>
						</div>
					)}
					{validation.length > 0 && (
						<div>
							<h4>Validation log</h4>
							<pre>{validation.join('\n')}</pre>
						</div>
					)}
					<div className={styles.downloadSwdWld}>
						<p>
							<label>
								<input type="checkbox" name="cleanup" value={index} /> Keep only SWD/WLD compatible data
							</label>
							<br />
							<small>
								When enabled the map data is cleaned up of any invalid / unknown data. Buildings and
								roads are removed.
							</small>
						</p>
						<p>Choose a map format:</p>
						<button type="button" onClick={downloadSwd} value={index}>
							SWD
						</button>
						{' or '}
						<button type="button" onClick={downloadWld} value={index}>
							Campaign WLD
						</button>
					</div>
					<button type="button" onClick={downloadWorldDat} value={index}>
						Download WORLD.DAT
					</button>{' '}
					<button type="button" onClick={downloadContiDat} value={index}>
						Download CONTI.DAT
					</button>
				</>
			)}
		</div>
	)
}
