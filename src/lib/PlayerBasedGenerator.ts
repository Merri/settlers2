import { XORShift } from 'random-seedable'

import { getNodesAtRadius, getNodesByIndex, getTextureNodesByIndex, MapClass } from './MapClass'
import { allRegularDecoration } from './objects'
import { isLavaTexture, looksLikeWaterTexture, TextureBuildFeature } from './textures'
import { BlockType, ConstructionSite, ResourceFlag, Texture, TextureFeatureFlag, TextureFlag, Textures } from './types'

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

const MAX_HEIGHT = 57

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

export function blockadeMapEdges(map: MapClass) {
	for (let i = 0; i < map.width; i++) {
		map.draw(i, Texture.UnbuildableWater, TextureFeatureFlag.IsWater)
		map.draw(
			i,
			Texture.UnbuildableLand,
			TextureFeatureFlag.IsMeadow | TextureFeatureFlag.IsSavannah | TextureFeatureFlag.IsSteppe
		)
		map.draw(
			i,
			Texture.Inaccessible,
			TextureFeatureFlag.Arid | TextureFeatureFlag.IsMountMeadow | TextureFeatureFlag.Rock
		)
	}
	for (let y = 0; y < map.height - 1; y++) {
		const i = y * map.width
		map.draw(i, Texture.UnbuildableWater, TextureFeatureFlag.IsWater)
		map.draw(
			i,
			Texture.UnbuildableLand,
			TextureFeatureFlag.IsMeadow | TextureFeatureFlag.IsSavannah | TextureFeatureFlag.IsSteppe
		)
		map.draw(
			i,
			Texture.Inaccessible,
			TextureFeatureFlag.Arid | TextureFeatureFlag.IsMountMeadow | TextureFeatureFlag.Rock
		)
	}
}

interface ElevationBrush {
	sea: Texture[]
	coast: Texture[]
	meadow: Texture[]
	mining: Texture[]
	miningMeadow: Texture
	peak: Texture[]
	lavaEdge: Texture[]
}

interface ElevationBasedOptions {
	baseLevel?: number
	noiseArray: Float64Array
	map: MapClass
	offsetX?: number
	offsetY?: number
	border?: number
	mountLevel?: number
	peakBoost?: number
	peakRadius?: number
	seaLevel?: number
	snowPeakLevel?: number
	brush?: ElevationBrush
}

const decreaseMode = 1 / 3
const flatteningMode = 2 / 3

export function randomizeElevation({
	baseLevel = 2,
	noiseArray,
	map,
	offsetX = 0,
	offsetY = 0,
	border = 0,
	peakBoost = 0,
	peakRadius = 3,
	mountLevel = 0.5,
	seaLevel = 0.35,
	snowPeakLevel = 1,
	brush = {
		sea: [Texture.UnbuildableWater, Texture.UnbuildableLand, Texture.InaccessibleLava],
		coast: [Texture.Houseless, Texture.Fertile5],
		meadow: [Texture.Fertile2, Texture.Fertile3, Texture.Fertile4, Texture.Fertile6],
		mining: [Texture.Mining1, Texture.Mining2, Texture.Mining3, Texture.Mining4],
		miningMeadow: Texture.Buildable,
		peak: [Texture.Inaccessible, Texture.Buildable],
		lavaEdge: [Texture.FertileMining],
	},
}: ElevationBasedOptions) {
	const heightMap = map.blocks[BlockType.HeightMap]
	const tex1 = map.blocks[BlockType.Texture1]
	const tex2 = map.blocks[BlockType.Texture2]
	heightMap.fill(baseLevel)

	// The least useful texture: 0x07 is a clone of 0x04
	tex1.fill(Texture.HouselessAlt)
	tex2.fill(Texture.HouselessAlt)

	const borderSize = Math.round(Math.min(map.width, map.height) * border)
	const minY = borderSize * map.width
	const maxY = (map.height - borderSize) * map.width
	const minX = borderSize
	const maxX = map.width - borderSize

	heightMap.forEach((height, index) => {
		if (borderSize) {
			if (index < minY || index >= maxY) return
			const x = index % map.width
			if (x < minX || x >= maxX) return
		}

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
				heightMap[index] = Math.min(MAX_HEIGHT - 3 * noiseArray[index], heightMap[index] + increase)
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
			const isCrater = noiseArray[index] < 0.625

			while (radius) {
				if (
					(radius > maxIncrement && noiseArray[index] < 0.75) ||
					(radius === maxIncrement && noiseArray[index] < 0.5)
				) {
					radius--
					continue
				}
				const nodes = getNodesAtRadius(index, radius, map.width, map.height)
				const power = (maxIncrement - radius) / 3
				nodes.forEach((index) => {
					heightMap[index] = Math.max(
						0,
						Math.min(
							MAX_HEIGHT - 3 * noiseArray[index],
							heightMap[index] + power - 0.55 * noiseArray[index]
						)
					)
				})
				radius--
			}

			heightMap[index] = Math.min(MAX_HEIGHT - 3 * noiseArray[index], value + maxIncrement)
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
	const peakAbove = Math.round((maxHeight - minHeight) * snowPeakLevel) + minHeight
	const painted = new Set<number>()

	const objectIndex = map.blocks[BlockType.Object1]
	const objectType = map.blocks[BlockType.Object2]

	heightMap.forEach((value, index) => {
		if (value < seaBelow && brush.sea.length) {
			if (painted.has(index)) return
			const queue: number[] = []
			queue.push(index)
			painted.add(index)

			let texture = brush.sea[0]

			if (brush.sea.length > 1) {
				const nodes = getTextureNodesByIndex(index, map.width, map.height)
				texture =
					(brush.sea.includes(tex1[nodes.top1Left]) && tex1[nodes.top1Left]) ||
					(brush.sea.includes(tex1[nodes.top1Right]) && tex1[nodes.top1Right]) ||
					(brush.sea.includes(tex2[nodes.top2]) && tex2[nodes.top2]) ||
					(brush.sea.includes(tex2[nodes.bottom2Left]) && tex2[nodes.bottom2Left]) ||
					(brush.sea.includes(tex2[nodes.bottom2Right]) && tex2[nodes.bottom2Right]) ||
					(brush.sea.includes(tex1[nodes.bottom1]) && tex1[nodes.bottom1]) ||
					brush.sea[Math.floor(noiseArray[index] * brush.sea.length)]
			}

			const isWater = looksLikeWaterTexture(texture)
			const isLava = isLavaTexture(texture)
			const isLavaOrWater = isWater || isLava
			const useLavaBrush = brush.lavaEdge.length > 0 && isLava

			while (queue.length) {
				const index = queue.shift()!
				if (isWater) heightMap[index] = seaBelow - 1
				map.draw(index, texture, TextureFeatureFlag.Useless)

				if (!isLavaOrWater && noiseArray[index] < 0.25) {
					// TODO: do objects "a bit better"
					objectIndex[index] = allRegularDecoration[heightMap[index] % allRegularDecoration.length]
					objectType[index] = 0xc8
				}

				const around = getNodesAtRadius(index, 1, map.width, map.height)

				around.forEach((index) => {
					if (painted.has(index)) return
					painted.add(index)
					if (heightMap[index] < seaBelow) {
						queue.push(index)
					} else {
						if (isWater) {
							map.draw(index, brush.coast[Math.floor(noiseArray[index] * brush.coast.length)])
						} else if (useLavaBrush) {
							map.draw(index, brush.lavaEdge[Math.floor(noiseArray[index] * brush.lavaEdge.length)])
						} else if (noiseArray[index] < 0.25) {
							// TODO: do objects "a bit better"
							objectIndex[index] = allRegularDecoration[heightMap[index] % allRegularDecoration.length]
							objectType[index] = 0xc8
						}
					}
				})
			}
		} else if (value > peakAbove && brush.peak.length) {
			if (brush.peak.length === 1) {
				map.draw(index, brush.peak[0])
			} else {
				const nodes = getTextureNodesByIndex(index, map.width, map.height)

				const texture =
					(brush.peak.includes(tex1[nodes.top1Left]) && tex1[nodes.top1Left]) ||
					(brush.peak.includes(tex1[nodes.top1Right]) && tex1[nodes.top1Right]) ||
					(brush.peak.includes(tex2[nodes.top2]) && tex2[nodes.top2]) ||
					(brush.peak.includes(tex2[nodes.bottom2Left]) && tex2[nodes.bottom2Left]) ||
					(brush.peak.includes(tex2[nodes.bottom2Right]) && tex2[nodes.bottom2Right]) ||
					(brush.peak.includes(tex1[nodes.bottom1]) && tex1[nodes.bottom1]) ||
					brush.peak[Math.floor(noiseArray[index] * brush.peak.length)]

				map.draw(index, texture)
			}
		} else if (value > mountAbove) {
			if (noiseArray[index] >= 0.15) {
				const nodes = getTextureNodesByIndex(index, map.width, map.height)

				const texture =
					(TextureBuildFeature[tex1[nodes.top1Left] as Texture] === 'mine' && tex1[nodes.top1Left]) ||
					(TextureBuildFeature[tex1[nodes.top1Right] as Texture] === 'mine' && tex1[nodes.top1Right]) ||
					(TextureBuildFeature[tex2[nodes.top2] as Texture] === 'mine' && tex2[nodes.top2]) ||
					(TextureBuildFeature[tex2[nodes.bottom2Left] as Texture] === 'mine' && tex2[nodes.bottom2Left]) ||
					(TextureBuildFeature[tex2[nodes.bottom2Right] as Texture] === 'mine' && tex2[nodes.bottom2Right]) ||
					(TextureBuildFeature[tex1[nodes.bottom1] as Texture] === 'mine' && tex1[nodes.bottom1]) ||
					brush.mining[Math.floor(noiseArray[index] * brush.mining.length)]

				map.draw(index, texture, TextureFeatureFlag.Useless)
			} else if (noiseArray[index] >= 0.1) {
				map.draw(index, brush.miningMeadow, TextureFeatureFlag.Useless | TextureFeatureFlag.Rock)
			} else {
				map.draw(index, Texture.FertileMining, TextureFeatureFlag.Useless | TextureFeatureFlag.Rock)
			}
		} else if (value === mountAbove) {
			map.draw(index, brush.miningMeadow, TextureFeatureFlag.Arable | TextureFeatureFlag.Useless)
		} else if (value > meadowAbove) {
			map.draw(index, brush.meadow[value % brush.meadow.length], TextureFeatureFlag.Useless)
		}
	})

	// Now we can get rid of the least useful texture
	tex1.forEach((value, index) => {
		if (value === Texture.HouselessAlt) tex1[index] = Texture.Fertile1
		if (tex2[index] === Texture.HouselessAlt) {
			tex2[index] = Texture.Fertile1
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

	const objectIndex = map.blocks[BlockType.Object1]
	const objectType = map.blocks[BlockType.Object2]
	const buildSite = map.blocks[BlockType.BuildSite]
	const hq = map.hqX
		.map((x, index) => ({ player: index + 1, x, y: map.hqY[index] }))
		.filter((item) => item.x !== 0xffff && item.y !== 0xffff)
		.map((item) => ({ ...item, index: item.y * map.width + item.x }))

	objectType.forEach((value, index) => {
		if (value === 0x80) {
			objectType[index] = 0
			objectIndex[index] = 0
		}
	})

	hq.forEach((item) => {
		const playerIndex = item.player - 1

		if (isCastleSite(buildSite[item.index])) {
			objectType[item.index] = 0x80
			objectIndex[item.index] = playerIndex
			return
		}

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

		const x = newIndex != null ? newIndex % map.width : 0xffff
		const y = newIndex != null ? Math.round((newIndex - x) / map.width) : 0xffff
		map.hqX[playerIndex] = x
		map.hqY[playerIndex] = y

		if (newIndex != null) {
			objectType[newIndex] = 0x80
			objectIndex[newIndex] = playerIndex
		}
	})
}

interface AddSubterrainResourcesOptions {
	coalRatio?: number
	goldRatio?: number
	graniteRatio?: number
	ironOreRatio?: number
	mineralQuantity?: number
	replicateMineral?: number
	map: MapClass
	noiseArray: Float64Array
}

export function addSubterrainResources({
	coalRatio = 1,
	goldRatio = 0.25,
	graniteRatio = 0.5,
	ironOreRatio = 0.75,
	mineralQuantity = 0,
	replicateMineral = 1,
	map,
	noiseArray,
}: AddSubterrainResourcesOptions) {
	const buildSite = map.blocks[BlockType.BuildSite]
	const resource = map.blocks[BlockType.Resource]

	resource.fill(0)

	resource.forEach((_, index) => {
		if (map.isEachTextureWithAnyOfFlags(index, TextureFeatureFlag.IsWater)) {
			const nodes = getNodesAtRadius(index, 1, map.width, map.height)
			if (nodes.every((index) => buildSite[index] !== ConstructionSite.Impassable)) {
				resource[index] = ResourceFlag.Fish
			}
		} else if (map.isEachTextureWithAnyOfFlags(index, TextureFeatureFlag.Arable)) {
			resource[index] = ResourceFlag.FreshWater
		} else if (map.isEachTextureWithAnyOfFlags(index, TextureFeatureFlag.Rock)) {
			if (noiseArray[index] < replicateMineral) {
				const nodes = getNodesAtRadius(index, 1, map.width, map.height)
				const mineral: ResourceFlag =
					(nodes
						.map((index) => resource[index])
						.find(
							(value) => value !== 0 && value !== ResourceFlag.FreshWater && value !== ResourceFlag.Fish
						) ?? 0) & 0xf8

				switch (mineral) {
					case ResourceFlag.Coal:
					case ResourceFlag.Gold:
					case ResourceFlag.Granite:
					case ResourceFlag.IronOre: {
						const random = noiseArray[Math.floor(nodes.length * noiseArray[index])]
						resource[index] =
							mineral |
							(mineralQuantity === 1
								? 7
								: Math.floor(8 * (mineralQuantity + random * (1 - mineralQuantity))))
						return
					}
				}
			}

			let coalBelow = 0
			let goldBelow = 0
			let graniteBelow = 0

			if (coalRatio === goldRatio && goldRatio === graniteRatio && graniteRatio === ironOreRatio) {
				graniteBelow = 0.25
				coalBelow = 0.5
				goldBelow = 0.75
			} else {
				const total = coalRatio + goldRatio + graniteRatio + ironOreRatio
				graniteBelow = graniteRatio / total
				coalBelow = coalRatio / total + graniteBelow
				goldBelow = goldRatio / total + coalBelow
			}

			const mineral =
				(noiseArray[index] < graniteBelow && ResourceFlag.Granite) ||
				(noiseArray[index] < coalBelow && ResourceFlag.Coal) ||
				(noiseArray[index] < goldBelow && ResourceFlag.Gold) ||
				ResourceFlag.IronOre

			const random = noiseArray[noiseArray.length - index - 1]
			resource[index] =
				mineral |
				(mineralQuantity === 1 ? 7 : Math.floor(8 * (mineralQuantity + random * (1 - mineralQuantity))))
		}
	})
}

interface CalculateResourceOptions {
	map: MapClass
}

interface ResourceResult {
	mineralCoal: number
	mineralGold: number
	mineralGranite: number
	mineralIronOre: number
	fish: number
	granite: number
	tree: number
}

export function calculateResources({ map }: CalculateResourceOptions) {
	const resource = map.blocks[BlockType.Resource]

	const result: ResourceResult = {
		mineralCoal: 0,
		mineralGold: 0,
		mineralGranite: 0,
		mineralIronOre: 0,
		fish: 0,
		granite: 0,
		tree: 0,
	}

	resource.forEach((value) => {
		if (value === ResourceFlag.Fish) {
			result.fish++
			return
		}

		const withoutQuantity: ResourceFlag = value & 0xf8

		switch (withoutQuantity) {
			case ResourceFlag.Coal: {
				result.mineralCoal += value & 7
				return
			}
			case ResourceFlag.Gold: {
				result.mineralGold += value & 7
				return
			}
			case ResourceFlag.Granite: {
				result.mineralGranite += value & 7
				return
			}
			case ResourceFlag.IronOre: {
				result.mineralIronOre += value & 7
				return
			}
		}
	})

	return result
}
