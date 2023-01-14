import { getNodesAtRadius, getNodesByIndex, MapClass } from './MapClass'
import { BlockType, ConstructionSite, Texture, TextureFeatureFlag } from './types'

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
