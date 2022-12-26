import { XORShift } from 'random-seedable'

import { getNodesAtRadius, getTextureNodesByIndex, MapClass } from './MapClass'
import { BlockType, ConstructionSite, Texture, TextureFeatureFlag, TextureFlag, Textures } from './types'

interface SeedMapOptions {
	random: XORShift
	width: number
	height: number
}

/**
 * 1) Determine player number, positions, and size of protective play area zone.
 * 2) Generate a height map while keeping player start positions playable / untouched.
 * 3) Determine guaranteed paths to players, obstacle areas between players, at center, and at egde of the map.
 * 4) Determine resources and how competitive you have to be to get them.
 * 5) Ensure all players can reach each other.
 */
const thing = 0

function generateNoiseArray({ height, random, width }: SeedMapOptions) {
	return new Float64Array(random.floatArray(width * height))
}

const TerrainBrush = {
	greenlandSnow: 'Snow', // Snow

	wastelandStones: 'Stones to lava',

	winterIce: 'Ice to water',

	greenlandDry: 'Dry', // Steppe + Desert (savannah post processing mix)
	wastelandDry: 'Dry', // Light steppe + Desert (pasture #3 post processing mix)

	greenlandSavannah: 'Savannah', // Steppe
	wastelandSteppe: 'Steppe', // Dark steppe
	winterTaiga: 'Taiga to snow', // Taiga/tundra + Taiga + Snow ("mountain meadow")

	greenlandMeadow: 'Meadow',
	wastelandPasture: 'Pasture',
	winterTundra: 'Tundra',

	greenlandRocky: 'Rocky',
	wastelandRocky: 'Rocky',
	winterRocky: 'Rocky',

	greenlandSwamp: 'Swamp', // Snow + Impassable water

	greenlandLava: 'Lava',
	wastelandLava: 'Lava',
	winterLava: 'Lava',
} as const

type TerrainBrush = typeof TerrainBrush[keyof typeof TerrainBrush]

export interface Position {
	x: number
	y: number
}

export function generateEmptyMap({ width, height, random }: SeedMapOptions) {
	const map = new MapClass({ height, width })
	const noiseArray = generateNoiseArray({ height, width, random })
	return { noiseArray, map }
}

export const PlayerAssignment = {
	// one player
	center: 'center',
	topLeft: 'topLeft',
	topRight: 'topRight',
	left: 'left',
	right: 'right',
	bottomLeft: 'bottomLeft',
	bottomRight: 'bottomRight',
	// two players
	hex2Pos1: 'hex2Pos1',
	hex2Pos2: 'hex2Pos2',
	hex2Pos3: 'hex2Pos3',
	// three players
	hex3Pos1: 'hex3Pos1',
	hex3Pos2: 'hex3Pos2',
	// four players
	hex4Pos1: 'hex4Pos1',
	hex4Pos2: 'hex4Pos2',
	hex4Pos3: 'hex4Pos3',
	// five players
	hexCenter5: 'hexCenter5',
	// six players
	hex6: 'hex6',
	// seven players
	hexCenter7: 'hexCenter7',
} as const

export type PlayerAssignment = typeof PlayerAssignment[keyof typeof PlayerAssignment]

interface PlayerAssignmentOptions {
	assignment: PlayerAssignment
	distance?: number
	map: MapClass
}

export function assignPlayerPositions({ assignment, distance = 0.5, map }: PlayerAssignmentOptions) {
	if (distance < 0 || distance > 1) {
		map.log.push(`Distance must be a value from range 0 <= 1 but got ${distance}`)
		return map
	}

	if (map.width < 32 || map.height < 32) {
		map.log.push(`Map size too small, 32x32 required but got ${map.width}x${map.height}`)
		return map
	}

	const posWidth = (map.width - 16) >>> 1
	const posHeight = (map.height - 16) >>> 2

	const midX = posWidth + 8
	const midY = posHeight * 2 + 8

	const left = Math.round(posWidth * (1 - distance)) + 4
	const right = Math.round(posWidth * distance) + posWidth + 12

	const leftMid = Math.round((posWidth + posWidth * (1 - distance)) / 2) + 6
	const rightMid = Math.round((posWidth * distance) / 2) + posWidth + 10

	const top = Math.round(posHeight * (1 - distance)) * 2 + 4
	const bottom = (Math.round(posHeight * distance) + posHeight) * 2 + 12

	const positions: Record<
		'center' | 'topLeft' | 'topRight' | 'left' | 'right' | 'bottomLeft' | 'bottomRight',
		Position
	> = {
		center: { x: midX, y: midY },
		topLeft: { x: leftMid, y: top },
		topRight: { x: rightMid, y: top },
		left: { x: left, y: midY },
		right: { x: right, y: midY },
		bottomLeft: { x: leftMid, y: bottom },
		bottomRight: { x: rightMid, y: bottom },
	}

	if (assignment in positions) {
		const key = assignment as keyof typeof positions
		map.playerCount = 1
		map.hqX = [positions[key].x]
		map.hqY = [positions[key].y]
		return map
	}

	const hexPos = [
		positions.topLeft,
		positions.topRight,
		positions.right,
		positions.bottomRight,
		positions.bottomLeft,
		positions.left,
	]

	switch (assignment) {
		case 'hex2Pos1':
		case 'hex2Pos2':
		case 'hex2Pos3': {
			map.playerCount = 2
			const index = ~~assignment.at(-1)! - 1
			map.hqX = [hexPos[0 + index].x, hexPos[3 + index].x]
			map.hqY = [hexPos[0 + index].y, hexPos[3 + index].y]
			return map
		}

		case 'hex3Pos1':
		case 'hex3Pos2': {
			map.playerCount = 3
			const index = ~~assignment.at(-1)! - 1
			map.hqX = [hexPos[0 + index].x, hexPos[2 + index].x, hexPos[4 + index].x]
			map.hqY = [hexPos[0 + index].y, hexPos[2 + index].y, hexPos[4 + index].y]
			return map
		}

		case 'hex4Pos1': {
			map.playerCount = 4
			map.hqX = [hexPos[0].x, hexPos[1].x, hexPos[3].x, hexPos[4].x]
			map.hqY = [hexPos[0].y, hexPos[1].y, hexPos[3].y, hexPos[4].y]
			return map
		}

		case 'hex4Pos2': {
			map.playerCount = 4
			map.hqX = [hexPos[0].x, hexPos[2].x, hexPos[3].x, hexPos[5].x]
			map.hqY = [hexPos[0].y, hexPos[2].y, hexPos[3].y, hexPos[5].y]
			return map
		}

		case 'hex4Pos3': {
			map.playerCount = 4
			map.hqX = [hexPos[5].x, hexPos[1].x, hexPos[2].x, hexPos[4].x]
			map.hqY = [hexPos[5].y, hexPos[1].y, hexPos[2].y, hexPos[4].y]
			return map
		}

		case 'hexCenter5': {
			map.playerCount = 5
			map.hqX = [positions.center.x, hexPos[0].x, hexPos[1].x, hexPos[3].x, hexPos[4].x]
			map.hqY = [positions.center.y, hexPos[0].y, hexPos[1].y, hexPos[3].y, hexPos[4].y]
			return map
		}

		case 'hex6': {
			map.playerCount = 6
			map.hqX = hexPos.map((pos) => pos.x)
			map.hqY = hexPos.map((pos) => pos.y)
			return map
		}

		case 'hexCenter7': {
			map.playerCount = 7
			map.hqX = [positions.center.x].concat(hexPos.map((pos) => pos.x))
			map.hqY = [positions.center.y].concat(hexPos.map((pos) => pos.y))
			return map
		}

		default: {
			map.log.push(`Unsupported player assignment type: ${assignment}`)
			return map
		}
	}
}

interface ElevationBasedOptions {
	baseLevel?: number
	noiseArray: Float64Array
	map: MapClass
	offsetX?: number
	offsetY?: number
	mountLevel?: number
	peakBoost?: number
	peakRadius?: number
	seaLevel?: number
	snowPeakLevel?: number
}

const decreaseMode = 1 / 3
const flatteningMode = 2 / 3

export function randomizeElevation({
	baseLevel = 15,
	noiseArray,
	map,
	offsetX = 0,
	offsetY = 0,
	peakBoost = 0,
	peakRadius = 3,
	mountLevel = 0.5,
	seaLevel = 0.35,
	snowPeakLevel = 1,
}: ElevationBasedOptions) {
	const heightMap = map.blocks[BlockType.HeightMap]
	heightMap.fill(baseLevel)

	heightMap.forEach((height, index) => {
		if (noiseArray[index] < decreaseMode) {
			const strength = noiseArray[index] * 3
			const radius = Math.floor(strength * 3)
			if (radius === 0) {
				heightMap[index] = Math.max(0, height - 1)
			} else {
				const nodes = getNodesAtRadius(index, radius, map.width, map.height)

				nodes.forEach((index) => {
					heightMap[index] = Math.max(0, heightMap[index] - 1)
				})
			}
		} else if (noiseArray[index] < flatteningMode) {
			const strength = (noiseArray[index] - decreaseMode) * 3
			const radius = Math.floor(strength * 8) + 1
			const nodes = getNodesAtRadius(index, radius, map.width, map.height)

			nodes.forEach((index) => {
				if (heightMap[index] < height) {
					heightMap[index]++
				} else if (heightMap[index] > height) {
					heightMap[index]--
				}
			})
		} else {
			const strength = (noiseArray[index] - flatteningMode) * 3
			const increase = Math.floor(strength * 2) + 1
			const radius = (strength < 0.5 ? Math.floor(strength * 2 * 3) : Math.floor((strength - 0.5) * 2 * 3)) + 1

			const nodes = getNodesAtRadius(index, radius, map.width, map.height)

			nodes.forEach((index) => {
				heightMap[index] = Math.min(50, heightMap[index] + increase)
			})
		}
	})

	if (peakBoost > 0) {
		const maxRawHeight = heightMap.reduce((max, current) => Math.max(max, current), Number.NEGATIVE_INFINITY)

		const raw = heightMap.slice()

		raw.forEach((value, index) => {
			if (value < maxRawHeight - peakBoost) return
			const maxIncrement = Math.floor(noiseArray[index] * peakRadius) + 1
			let radius = maxIncrement + 1

			while (radius) {
				const nodes = getNodesAtRadius(index, radius, map.width, map.height)
				nodes.forEach((index) => {
					heightMap[index] = Math.min(50, heightMap[index] + (maxIncrement - radius) / 3)
				})
				radius--
			}

			heightMap[index] = Math.min(50, value + maxIncrement)
		})
	}

	const rough = heightMap.slice()

	rough.forEach((value, index) => {
		const nodes = getNodesAtRadius(index, 1, map.width, map.height)
		nodes.forEach((index) => {
			value += rough[index]
		})
		heightMap[index] = Math.round(value / (nodes.length + 1))
	})

	offsetY &= 0xfffe

	if (offsetX || offsetY) {
		const source = heightMap.slice()

		for (let y = 0; y < map.height; y++) {
			const sourceIndex = y * map.width
			const targetIndex = ((y + offsetY) % map.height) * map.width

			for (let x = 0; x < map.width; x++) {
				const targetX = (x + offsetX) % map.width
				heightMap[targetIndex + targetX] = source[sourceIndex + x]
			}
		}
	}

	let minHeight = Number.POSITIVE_INFINITY
	let maxHeight = Number.NEGATIVE_INFINITY

	heightMap.forEach((value) => {
		if (value > maxHeight) maxHeight = value
		if (value < minHeight) minHeight = value
	})

	const adjustedMountLevel = (snowPeakLevel - seaLevel) * mountLevel + seaLevel
	const adjustedMeadowLevel = (adjustedMountLevel - seaLevel) * 0.25 + seaLevel
	const seaBelow = Math.round((maxHeight - minHeight) * seaLevel) + minHeight
	const meadowAbove = Math.round((maxHeight - minHeight) * adjustedMeadowLevel) + minHeight
	const mountAbove = Math.round((maxHeight - minHeight) * adjustedMountLevel) + minHeight
	const snowAbove = Math.round((maxHeight - minHeight) * snowPeakLevel) + minHeight

	const tex1 = map.blocks[BlockType.Texture1]
	const tex2 = map.blocks[BlockType.Texture2]

	const miningTex = [Texture.Mining1, Texture.Mining2, Texture.Mining3, Texture.Mining4]
	const meadowTex = [Texture.Farmland2, Texture.Farmland3, Texture.Farmland4, Texture.Farmland6]

	function draw(index: number, tex: Texture, flag?: TextureFeatureFlag) {
		const nodes = getTextureNodesByIndex(index, map.width, map.height)
		if (flag == null) {
			tex1[nodes.top1Left] = tex
			tex1[nodes.top1Right] = tex
			tex1[nodes.bottom1] = tex
			tex2[nodes.top2] = tex
			tex2[nodes.bottom2Left] = tex
			tex2[nodes.bottom2Right] = tex
		} else {
			if ((Textures.get(tex1[nodes.top1Left] & TextureFlag.ToIdValue)?.featureFlags ?? 0) & flag) {
				tex1[nodes.top1Left] = tex
			}
			if ((Textures.get(tex1[nodes.top1Right] & TextureFlag.ToIdValue)?.featureFlags ?? 0) & flag) {
				tex1[nodes.top1Right] = tex
			}
			if ((Textures.get(tex1[nodes.bottom1] & TextureFlag.ToIdValue)?.featureFlags ?? 0) & flag) {
				tex1[nodes.bottom1] = tex
			}
			if ((Textures.get(tex2[nodes.top2] & TextureFlag.ToIdValue)?.featureFlags ?? 0) & flag) {
				tex2[nodes.top2] = tex
			}
			if ((Textures.get(tex2[nodes.bottom2Left] & TextureFlag.ToIdValue)?.featureFlags ?? 0) & flag) {
				tex2[nodes.bottom2Left] = tex
			}
			if ((Textures.get(tex2[nodes.bottom2Right] & TextureFlag.ToIdValue)?.featureFlags ?? 0) & flag) {
				tex2[nodes.bottom2Right] = tex
			}
		}
	}

	const flagRegularGround = TextureFeatureFlag.IsMeadow | TextureFeatureFlag.IsSavannah | TextureFeatureFlag.IsSteppe

	heightMap.forEach((value, index) => {
		if (value < seaBelow) {
			heightMap[index] = seaBelow - 1
			draw(index, Texture.UnbuildableWater, TextureFeatureFlag.IsSavannah)
			const nodes = getNodesAtRadius(index, 1, map.width, map.height)
			nodes.forEach((index) => {
				if (heightMap[index] >= seaBelow) {
					if (noiseArray[index] >= 0.5) {
						draw(index, Texture.Roadland)
					} else {
						draw(index, Texture.Farmland5)
					}
				}
			})
		} else if (value > snowAbove) {
			draw(index, Texture.Inaccessible)
		} else if (value > mountAbove) {
			if (noiseArray[index] >= 0.15) {
				draw(index, miningTex[value % miningTex.length], flagRegularGround)
			} else if (noiseArray[index] >= 0.1) {
				draw(index, Texture.Buildable, flagRegularGround | TextureFeatureFlag.Rock)
			} else {
				draw(index, Texture.MiningFarmland, flagRegularGround | TextureFeatureFlag.Rock)
			}
		} else if (value === mountAbove) {
			draw(index, Texture.Buildable, TextureFeatureFlag.Arable)
		} else if (value > meadowAbove) {
			draw(index, meadowTex[value % meadowTex.length], TextureFeatureFlag.IsSavannah)
		}
	})
}

function isBuildingSite(value: number) {
	return (
		value === ConstructionSite.Castle ||
		value === ConstructionSite.OccupiedCastle ||
		value === ConstructionSite.House ||
		value === ConstructionSite.OccupiedHouse ||
		value === ConstructionSite.Hut ||
		value === ConstructionSite.OccupiedHut
	)
}

function isCastleSite(value: number) {
	return value === ConstructionSite.Castle || value === ConstructionSite.OccupiedCastle
}

interface AdjustPlayerLocationOptions {
	map: MapClass
}

export function adjustPlayerLocations({ map }: AdjustPlayerLocationOptions) {
	const maxRadius = (Math.min(map.width, map.height) - 4) >>> 1

	const buildSite = map.blocks[BlockType.BuildSite]
	const hq = map.hqX
		.map((x, index) => ({ player: index + 1, x, y: map.hqY[index] }))
		.filter((item) => item.x !== 0xffff && item.y !== 0xffff)
		.map((item) => ({ ...item, index: item.y * map.width + item.x }))

	hq.forEach((item) => {
		if (isCastleSite(buildSite[item.index])) return

		let newIndex: number | undefined

		for (let radius = 1; newIndex == null && radius < maxRadius; radius++) {
			const nodes = getNodesAtRadius(item.index, radius, map.width, map.height)

			for (let nodeIndex of nodes) {
				if (isCastleSite(buildSite[nodeIndex])) {
					newIndex = nodeIndex
					break
				}
			}
		}

		const playerIndex = item.player - 1
		const x = newIndex != null ? newIndex % map.width : 0xffff
		const y = newIndex != null ? Math.round((newIndex - x) / map.width) : 0xffff
		map.hqX[playerIndex] = x
		map.hqY[playerIndex] = y
	})
}
