import { getNodesAtRadius, getNodesByIndex, MapClass } from './MapClass'
import { BlockType, ConstructionSite, Texture, TextureFeatureFlag } from './types'

const NodeDir = {
	left: 0x01,
	topLeft: 0x02,
	topRight: 0x04,
	right: 0x08,
	bottomRight: 0x10,
	bottomLeft: 0x20,
} as const

type NodeDir = typeof NodeDir[keyof typeof NodeDir]

/**
 * When filling region these are the next directions that can be checked based on from the direction that this node was expanded to.
 * In other words: the filling has been optimized to do as little work as possible.
 */
const NextFillFlags = {
	left: NodeDir.left | NodeDir.topLeft | NodeDir.bottomLeft,
	topLeft: NodeDir.left | NodeDir.topLeft | NodeDir.topRight,
	topRight: NodeDir.topLeft | NodeDir.topRight | NodeDir.right,
	right: NodeDir.topRight | NodeDir.right | NodeDir.bottomRight,
	bottomRight: NodeDir.right | NodeDir.bottomRight | NodeDir.bottomLeft,
	bottomLeft: NodeDir.bottomRight | NodeDir.bottomLeft | NodeDir.left,
} as const

type NextFillFlags = typeof NextFillFlags[keyof typeof NextFillFlags]

interface HeightRegion {
	borders: number[][]
	isBelow: boolean
	positions: Set<number>
	heightRegionId: number
	posIndex: number
}

interface GetMapHeightRegionsOptions {
	seaLevel: number
	map: MapClass
}

export function getMapHeightRegions({ map, seaLevel }: GetMapHeightRegionsOptions) {
	const heightMap = map.blocks[BlockType.HeightMap]

	let minHeight = Number.POSITIVE_INFINITY
	let maxHeight = Number.NEGATIVE_INFINITY

	heightMap.forEach((value) => {
		if (value > maxHeight) maxHeight = value
		if (value < minHeight) minHeight = value
	})

	const seaBelow = Math.round((maxHeight - minHeight) * seaLevel) + minHeight

	const size = map.width * map.height
	const indexToRegionId = new Map<number, number>()

	const regions: HeightRegion[] = []
	let heightRegionId = 0

	for (let i = 0; i < size; i++) {
		if (indexToRegionId.has(i)) continue

		const isBelow = heightMap[i] < seaBelow

		indexToRegionId.set(i, heightRegionId)
		regions.unshift({ borders: [], isBelow, positions: new Set([i]), heightRegionId, posIndex: i })

		// nodeFlags tells which of six directions is possible to check
		const stack = [{ index: i, nodeFlags: 0x3f }]
		const edges = new Set<number>()

		while (stack.length) {
			const item = stack.shift()!
			const nodes = getNodesByIndex(item.index, map.width, map.height)

			Object.entries(nodes).forEach(([key, index]) => {
				const direction = key as keyof typeof nodes
				const nodeFlag = NodeDir[direction]

				if (heightMap[index] < seaBelow === isBelow) {
					if ((item.nodeFlags & nodeFlag) === nodeFlag && !indexToRegionId.has(index)) {
						indexToRegionId.set(index, heightRegionId)
						regions[0].positions.add(index)
						stack.push({ index, nodeFlags: NextFillFlags[direction] })
					}
				} else {
					edges.add(index)
				}
			})
		}

		for (
			let edgeStack = Array.from(edges);
			edgeStack.length;
			edgeStack = edgeStack.filter((index) => edges.has(index))
		) {
			const startIndex = edgeStack.shift()!
			edges.delete(startIndex)
			const border = [startIndex]
			const nodes = getNodesAtRadius(startIndex, 1, map.width, map.height).filter((index) => edges.has(index))

			if (nodes.length) {
				let [index, ...delayed] = nodes
				edges.delete(index)

				while (true) {
					const nodes = getNodesAtRadius(index, 1, map.width, map.height).filter((index) => edges.has(index))
					if (nodes.length) {
						if (nodes.length > 1) delayed.push(...nodes.slice(1))
						index = nodes[0]
						edges.delete(index)
						border.push(index)
					} else if (delayed.length) {
						delayed = delayed.filter((index) => edges.has(index))
						if (delayed.length === 0) break
						index = delayed.shift()!
						edges.delete(index)
						border.push(index)
					} else {
						break
					}
				}
			}

			regions[0].borders.push(border)
		}

		regions[0].borders.sort((a, b) => b.length - a.length)

		heightRegionId++
	}

	return regions.sort(
		(a, b) => b.positions.size - a.positions.size || b.borders.length - a.borders.length || a.posIndex - b.posIndex
	)
}

interface Region {
	type: 'water' | 'ground'
	positions: Set<number>
	regionId: number
	posIndex: number
}

export function getAllMapRegions(map: MapClass) {
	const size = map.width * map.height
	const done = new Set<number>()

	const regions: Region[] = []
	let regionId = 0

	for (let i = 0; i < size; i++) {
		if (done.has(i)) continue

		if (map.isEachTextureSame(i, Texture.UnbuildableWater)) {
			done.add(i)
			regions.unshift({ type: 'water', positions: new Set([i]), regionId, posIndex: i })
			regionId++

			// nodeFlags tells which of six directions is possible to check
			const stack = [{ index: i, nodeFlags: 0x3f }]

			while (stack.length) {
				const item = stack.shift()!
				const nodes = getNodesByIndex(item.index, map.width, map.height)

				if (
					(item.nodeFlags & 0x01) === 0x01 &&
					!done.has(nodes.left) &&
					map.isEachTextureSame(nodes.left, Texture.UnbuildableWater)
				) {
					done.add(nodes.left)
					regions[0].positions.add(nodes.left)
					// topLeft, left, bottomLeft
					stack.push({ index: nodes.left, nodeFlags: 0x23 })
				}

				if (
					(item.nodeFlags & 0x02) === 0x02 &&
					!done.has(nodes.topLeft) &&
					map.isEachTextureSame(nodes.topLeft, Texture.UnbuildableWater)
				) {
					done.add(nodes.topLeft)
					regions[0].positions.add(nodes.topLeft)
					// left, topLeft, topRight
					stack.push({ index: nodes.topLeft, nodeFlags: 0x07 })
				}

				if (
					(item.nodeFlags & 0x04) === 0x04 &&
					!done.has(nodes.topRight) &&
					map.isEachTextureSame(nodes.topRight, Texture.UnbuildableWater)
				) {
					done.add(nodes.topRight)
					regions[0].positions.add(nodes.topRight)
					// topLeft, topRight, right
					stack.push({ index: nodes.topRight, nodeFlags: 0x0e })
				}

				if (
					(item.nodeFlags & 0x08) === 0x08 &&
					!done.has(nodes.right) &&
					map.isEachTextureSame(nodes.right, Texture.UnbuildableWater)
				) {
					done.add(nodes.right)
					regions[0].positions.add(nodes.right)
					// topRight, right, bottomRight
					stack.push({ index: nodes.right, nodeFlags: 0x1c })
				}

				if (
					(item.nodeFlags & 0x10) === 0x10 &&
					!done.has(nodes.bottomRight) &&
					map.isEachTextureSame(nodes.bottomRight, Texture.UnbuildableWater)
				) {
					done.add(nodes.bottomRight)
					regions[0].positions.add(nodes.bottomRight)
					// right, bottomRight, bottomLeft
					stack.push({ index: nodes.bottomRight, nodeFlags: 0x38 })
				}

				if (
					(item.nodeFlags & 0x20) === 0x20 &&
					!done.has(nodes.bottomLeft) &&
					map.isEachTextureSame(nodes.bottomLeft, Texture.UnbuildableWater)
				) {
					done.add(nodes.bottomLeft)
					regions[0].positions.add(nodes.bottomLeft)
					// bottomRight, bottomLeft, left
					stack.push({ index: nodes.bottomLeft, nodeFlags: 0x31 })
				}
			}
		} else if (map.isEachTextureWithAnyOfFlags(i, TextureFeatureFlag.Impassable)) {
			done.add(i)
		} else {
			done.add(i)
			regions.unshift({ type: 'ground', positions: new Set([i]), regionId, posIndex: i })
			regionId++
			// nodeFlags tells which of six directions is possible to check
			const stack = [{ index: i, nodeFlags: 0x3f }]

			while (stack.length) {
				const item = stack.shift()!
				const nodes = getNodesByIndex(item.index, map.width, map.height)

				if (
					(item.nodeFlags & 0x01) === 0x01 &&
					!done.has(nodes.left) &&
					!map.isEachTextureWithAnyOfFlags(nodes.left, TextureFeatureFlag.Impassable)
				) {
					done.add(nodes.left)
					regions[0].positions.add(nodes.left)
					// topLeft, left, bottomLeft
					stack.push({ index: nodes.left, nodeFlags: 0x23 })
				}

				if (
					(item.nodeFlags & 0x02) === 0x02 &&
					!done.has(nodes.topLeft) &&
					!map.isEachTextureWithAnyOfFlags(nodes.topLeft, TextureFeatureFlag.Impassable)
				) {
					done.add(nodes.topLeft)
					regions[0].positions.add(nodes.topLeft)
					// left, topLeft, topRight
					stack.push({ index: nodes.topLeft, nodeFlags: 0x07 })
				}

				if (
					(item.nodeFlags & 0x04) === 0x04 &&
					!done.has(nodes.topRight) &&
					!map.isEachTextureWithAnyOfFlags(nodes.topRight, TextureFeatureFlag.Impassable)
				) {
					done.add(nodes.topRight)
					regions[0].positions.add(nodes.topRight)
					// topLeft, topRight, right
					stack.push({ index: nodes.topRight, nodeFlags: 0x0e })
				}

				if (
					(item.nodeFlags & 0x08) === 0x08 &&
					!done.has(nodes.right) &&
					!map.isEachTextureWithAnyOfFlags(nodes.right, TextureFeatureFlag.Impassable)
				) {
					done.add(nodes.right)
					regions[0].positions.add(nodes.right)
					// topRight, right, bottomRight
					stack.push({ index: nodes.right, nodeFlags: 0x1c })
				}

				if (
					(item.nodeFlags & 0x10) === 0x10 &&
					!done.has(nodes.bottomRight) &&
					!map.isEachTextureWithAnyOfFlags(nodes.bottomRight, TextureFeatureFlag.Impassable)
				) {
					done.add(nodes.bottomRight)
					regions[0].positions.add(nodes.bottomRight)
					// right, bottomRight, bottomLeft
					stack.push({ index: nodes.bottomRight, nodeFlags: 0x38 })
				}

				if (
					(item.nodeFlags & 0x20) === 0x20 &&
					!done.has(nodes.bottomLeft) &&
					!map.isEachTextureWithAnyOfFlags(nodes.bottomLeft, TextureFeatureFlag.Impassable)
				) {
					done.add(nodes.bottomLeft)
					regions[0].positions.add(nodes.bottomLeft)
					// bottomRight, bottomLeft, left
					stack.push({ index: nodes.bottomLeft, nodeFlags: 0x31 })
				}
			}
		}
	}

	return regions.sort((a, b) => b.positions.size - a.positions.size)
}

interface CoastalCastle {
	index: number
	regionId: number
	seaRegionId: Set<number>
}

export function locateCoastalCastles(map: MapClass, regions: Region[] = getAllMapRegions(map)) {
	const regionSize = new Map(regions.map((region) => [region.regionId, region.positions.size]))

	const groundMap = regions
		.filter((region) => region.type === 'ground')
		.reduce<Map<number, number>>((map, region) => {
			region.positions.forEach((node) => {
				map.set(node, region.regionId)
			})
			return map
		}, new Map())

	const seaRegions = regions.filter((region) => region.type === 'water' && region.positions.size >= 128)

	const waters = new Set(
		seaRegions.reduce<number[]>((waters, region) => {
			waters.push(...region.positions)
			return waters
		}, [])
	)

	const coastalCastles = map.blocks[BlockType.BuildSite].reduce<CoastalCastle[]>((castles, buildSite, index) => {
		if ((buildSite | ConstructionSite.Occupied) === ConstructionSite.OccupiedCastle) {
			const regionId = groundMap.get(index)!
			if (regionSize.get(regionId)! < 32) return castles

			const nodes = getNodesAtRadius(index, 2, map.width, map.height)
			const waterNodes = Array.from(nodes.filter((node) => waters.has(node)))

			if (waterNodes.length) {
				const seaRegionId = new Set(
					waterNodes.map((node) => seaRegions.find(({ positions }) => positions.has(node))!.regionId)
				)
				castles.push({ index, regionId, seaRegionId })
			}
		}
		return castles
	}, [])

	const tradeRoutes = seaRegions.map((region) => {
		const harbours = coastalCastles.filter((castle) => castle.seaRegionId.has(region.regionId))

		const bannedIndex = new Set(
			harbours.flatMap((harbour) => [
				...getNodesAtRadius(harbour.index, 2, map.width, map.height),
				...getNodesAtRadius(harbour.index, 3, map.width, map.height),
				...getNodesAtRadius(harbour.index, 4, map.width, map.height),
				...getNodesAtRadius(harbour.index, 5, map.width, map.height),
			])
		)

		const connections = harbours.filter((harbour) => !bannedIndex.has(harbour.index))
		// one = nothing else to connect to
		if (connections.length === 1) connections.length = 0

		return { regionId: region.regionId, connections, size: region.positions.size, posIndex: region.posIndex }
	})

	return tradeRoutes.sort((a, b) => b.connections.length - a.connections.length || b.size - a.size)
}
