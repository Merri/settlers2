import { MapClass } from '../MapClass'
import { BlockType } from '../types'

export function flipX(world: MapClass): MapClass {
	const newWorld = new MapClass({ width: world.width, height: world.height })
	const newBlocks = newWorld.blocks

	for (let index = 0, rowIndex = 0, y = 0; y < world.height; y++, rowIndex += world.width) {
		for (let x = 0; x < world.width; x++, index++) {
			const reverseIndex = rowIndex + ((world.width * 2 - x - (y & 1) - 1) % world.width)
			newBlocks[BlockType.Animal][index] = world.blocks[BlockType.Animal][reverseIndex]
			newBlocks[BlockType.FogOfWar][index] = world.blocks[BlockType.FogOfWar][reverseIndex]
			newBlocks[BlockType.HeightMap][index] = world.blocks[BlockType.HeightMap][reverseIndex]
			newBlocks[BlockType.Icon][index] = world.blocks[BlockType.Icon][reverseIndex]
			newBlocks[BlockType.Object1][index] = world.blocks[BlockType.Object1][reverseIndex]
			newBlocks[BlockType.Object2][index] = world.blocks[BlockType.Object2][reverseIndex]
			newBlocks[BlockType.Resource][index] = world.blocks[BlockType.Resource][reverseIndex]
			newBlocks[BlockType.Roads][index] = world.blocks[BlockType.Roads][reverseIndex]
			newBlocks[BlockType.Unknown][index] = world.blocks[BlockType.Unknown][reverseIndex]
			if ((y & 1) === 0) {
				const altReverseIndex = rowIndex + ((world.width * 2 - x - 1) % world.width)
				newBlocks[BlockType.Texture1][index] = world.blocks[BlockType.Texture1][altReverseIndex]
				const reverseIndex2 = rowIndex + ((world.width * 2 - x - 2) % world.width)
				newBlocks[BlockType.Texture2][index] = world.blocks[BlockType.Texture2][reverseIndex2]
			} else {
				const altReverseIndex = rowIndex + ((world.width * 2 - x - 2) % world.width)
				newBlocks[BlockType.Texture1][index] = world.blocks[BlockType.Texture1][altReverseIndex]
				const reverseIndex2 = rowIndex + ((world.width * 2 - x - 3) % world.width)
				newBlocks[BlockType.Texture2][index] = world.blocks[BlockType.Texture2][reverseIndex2]
			}
		}
	}

	newWorld.title = world.title
	newWorld.author = world.author
	newWorld.animals = world.animals.map(([type, x, y]) => {
		return [type, (world.width * 2 - x - (y & 1) - 1) % world.width, y]
	})
	newWorld.hqX = world.hqX.map((x, index) => {
		const y = world.hqY[index]
		if (x === 0xffff || y === 0xffff) return x
		return (world.width * 2 - x - (y & 1) - 1) % world.width
	})
	newWorld.hqY = world.hqY.slice(0)
	newWorld.leader = world.leader.slice(0)
	newWorld.playerCount = world.playerCount
	newWorld.terrain = world.terrain

	newWorld.updateBuildSiteMap()
	newWorld.updateLightMap()
	newWorld.updateRegions()

	return newWorld
}
