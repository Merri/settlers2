import { getNodesByIndex, getTextureNodesByIndex, MapClass } from '../MapClass'
import { BlockType } from '../types'

export function hexRotate(world: MapClass): MapClass {
	const newWorld = new MapClass({ width: world.width, height: world.height })
	const newBlocks = newWorld.blocks

	let source = 0
	let target = world.width / 2 + (world.height / 2) * world.width

	const indexMap = new Map<number, number>()

	for (let y = 0; y < world.height; y++) {
		for (let x = world.width; x > 0; x--) {
			indexMap.set(source, target)

			newBlocks[BlockType.Animal][target] = world.blocks[BlockType.Animal][source]
			newBlocks[BlockType.FogOfWar][target] = world.blocks[BlockType.FogOfWar][source]
			newBlocks[BlockType.HeightMap][target] = world.blocks[BlockType.HeightMap][source]
			newBlocks[BlockType.Icon][target] = world.blocks[BlockType.Icon][source]
			newBlocks[BlockType.Object1][target] = world.blocks[BlockType.Object1][source]
			newBlocks[BlockType.Object2][target] = world.blocks[BlockType.Object2][source]
			newBlocks[BlockType.Resource][target] = world.blocks[BlockType.Resource][source]
			newBlocks[BlockType.Roads][target] = world.blocks[BlockType.Roads][source]
			newBlocks[BlockType.Unknown][target] = world.blocks[BlockType.Unknown][source]

			const sourceNodes = getNodesByIndex(source, world.width, world.height)
			const sourceTexNodes = getTextureNodesByIndex(source, world.width, world.height)
			const targetNodes = getNodesByIndex(target, world.width, world.height)
			const targetTexNodes = getTextureNodesByIndex(target, world.width, world.height)

			newBlocks[BlockType.Texture2][targetTexNodes.bottom2Left] =
				world.blocks[BlockType.Texture1][sourceTexNodes.bottom1]
			newBlocks[BlockType.Texture1][targetTexNodes.bottom1] =
				world.blocks[BlockType.Texture2][sourceTexNodes.bottom2Right]

			if (x > 1) {
				source = sourceNodes.right
				target = targetNodes.bottomRight
			} else {
				source = sourceNodes.bottomRight
				target = targetNodes.bottomLeft
			}
			if (target < world.width) target = (target + world.width / 2) % world.width
			//if (target % world.width === 0) target = (target + halfHeight) % size
		}
	}

	function getTargetXY(x: number, y: number) {
		const sourceIndex = x + y * world.width
		const targetIndex = indexMap.get(sourceIndex)
		const targetX = targetIndex % world.width
		const targetY = Math.floor((targetIndex - targetX) / world.width)
		return { targetX, targetY }
	}

	newWorld.title = world.title
	newWorld.author = world.author
	newWorld.animals = world.animals.map(([type, x, y]) => {
		const { targetX, targetY } = getTargetXY(x, y)
		return [type, targetX, targetY]
	})
	newWorld.hqX = world.hqX.map((x, index) => {
		const y = world.hqY[index]
		if (x === 0xffff || y === 0xffff) return x
		return getTargetXY(x, y).targetX
	})
	newWorld.hqY = world.hqY.map((y, index) => {
		const x = world.hqX[index]
		if (x === 0xffff || y === 0xffff) return y
		return getTargetXY(x, y).targetY
	})
	newWorld.leader = world.leader.slice(0)
	newWorld.playerCount = world.playerCount
	newWorld.terrain = world.terrain

	newWorld.updateBuildSiteMap()
	newWorld.updateLightMap()
	newWorld.updateRegions()

	return newWorld
}
