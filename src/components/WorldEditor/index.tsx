import { useCallback, useState } from 'preact/compat'
import { MapClass } from '$/lib/MapClass'
import { AnimalType, BlockType } from '$/lib/types'
import { sanitizeAsCp437 } from '$/lib/cp437'

import styles from './index.module.css'
import { MapCanvas } from './Map'

interface WorldFile {
	filename: string
	world: MapClass
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

function calculateHeightElevations(heightMap: Uint8Array) {
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

export function WorldEditor() {
	const [errors, setErrors] = useState<string[]>([])
	const [worlds, setWorlds] = useState<WorldFile[]>([])
	const [selected, setSelected] = useState(0)

	async function onChange(event: Event) {
		if (!(event.target instanceof HTMLInputElement)) return

		const regions = new Map<string, ArrayBuffer>()
		const errors: string[] = []
		const worldFiles: WorldFile[] = []

		for (const file of Array.from(event.target.files)) {
			const arrayBuffer = await file.arrayBuffer()
			const region = /^CONTI(\d\d\d)\.DAT$/i.exec(file.name)
			if (region) {
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

		worldFiles.forEach(({ filename, world }) => {
			const region = /^WORLD(\d\d\d)\.DAT$/i.exec(filename)
			if (region && regions.has(region[1])) {
				world.setRegions(new DataView(regions.get(region[1])))
			}
		})

		setErrors(errors)
		setWorlds((worlds) => worldFiles.concat(worlds))
	}

	const downloadWld = useCallback(
		function downloadSwd(event: Event) {
			if (!(event.target instanceof HTMLButtonElement)) return
			const { filename, world } = worlds[~~event.target.value]
			const buffer = world.getFileBuffer({ format: 'WLD' })
			const name = filename.replace(/\.(SWD|DAT)$/i, '.WLD')
			download(name, buffer)
		},
		[worlds]
	)

	const downloadSwd = useCallback(
		function downloadSwd(event: Event) {
			if (!(event.target instanceof HTMLButtonElement)) return
			const { filename, world } = worlds[~~event.target.value]
			const buffer = world.getFileBuffer({ format: 'SWD' })
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
		function handleTextInput(event: Event) {
			if (!(event.target instanceof HTMLInputElement)) return
			const { world } = worlds[~~event.target.dataset.index]
			world[event.target.name] = sanitizeAsCp437(event.target.value)
			setWorlds((worlds) => worlds.slice(0))
		},
		[worlds]
	)

	const handleNumberInput = useCallback(
		function handleNumberInput(event: Event) {
			if (!(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLSelectElement)) return
			const indices = event.target.dataset.index
			if (indices.includes('-')) {
				const [index, itemIndex] = indices.split('-').map((x) => ~~x)
				const { world } = worlds[index]
				world[event.target.name][itemIndex] = ~~event.target.value
			} else {
				const { world } = worlds[~~indices]
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

	const { filename, world } = worlds[selected] ?? {}
	const index = selected

	return (
		<div>
			<h1>World Editor</h1>
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
			<div className={styles.horizontallyScrollable}>
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
								<MapCanvas {...world} color1={isSelected ? 0 : 255} color2={isSelected ? 255 : 0} />
								{filename}
							</button>
						)
					})}
				</div>
			</div>
			{world != null && (
				<>
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
								<td>{filename}</td>
							</tr>
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
								<td>Block: object</td>
								<td>
									{new Uint8Array(
										world.blocks[BlockType.Object2].buffer,
										world.blocks[BlockType.Object2].byteOffset,
										world.blocks[BlockType.Object2].byteLength
									)
										.reduce((obj, objectType, index) => {
											let meta = ''
											if (objectType === 0x80) {
												meta = `Player ${
													world.blocks[BlockType.Object1][index] + 1
												} headquarters`
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
										}, [] as { meta: string; x: number; y: number }[])
										.map(({ meta, x, y }, idx) => (
											<span key={idx}>
												{meta}: {x} &times; {y}
												<br />
											</span>
										))}
								</td>
							</tr>
							<tr>
								<td>Block: animals</td>
								<td>
									{Object.entries(
										new Uint8Array(
											world.blocks[BlockType.Animal].buffer,
											world.blocks[BlockType.Animal].byteOffset,
											world.blocks[BlockType.Animal].byteLength
										).reduce((record, animalType) => {
											if (animalType > 0 && animalType < 255) {
												const name = getAnimalName(animalType)
												if (record[name] == null) record[name] = 0
												record[name]++
											}
											return record
										}, {} as Record<string, number>)
									).map(([name, count]) => (
										<span key={name}>
											{name}: {count}
											<br />
										</span>
									))}
								</td>
							</tr>
							<tr>
								<td>Footer: animals</td>
								<td>
									{Object.entries(
										world.animals.reduce((record, [animalType, animalX, animalY]) => {
											const name = getAnimalName(animalType)
											if (record[name] == null) record[name] = 0
											record[name]++
											return record
										}, {} as Record<string, number>)
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
					<button type="button" onClick={downloadSwd} value={index}>
						Download SWD
					</button>
					{', '}
					<button type="button" onClick={downloadWld} value={index}>
						Download WLD
					</button>{' '}
					or{' '}
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
