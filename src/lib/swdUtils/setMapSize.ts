import { MapClass } from '../MapClass'
import { BlockType, Texture } from '../types'

interface Options {
	width: number
	height: number
	texture?: Texture
}

export function setMapSize(world: MapClass, { width, height, texture = Texture.InaccessibleWater }: Options): MapClass {
	const worldSize = world.width * world.height
	const newWorld = new MapClass({ width, height })
	const newBlocks = newWorld.blocks
	const oldBlocks = world.blocks

	const borderHeights = new Uint8Array(world.width + world.height - 1)
	borderHeights.set(oldBlocks[BlockType.HeightMap].slice(0, world.width))
	for (let i = world.width, j = world.width; i < worldSize; i += world.width, j++) {
		borderHeights[j] = oldBlocks[BlockType.HeightMap][i]
	}

	const averageLevel = Math.round(borderHeights.reduce((total, value) => total + value, 0) / borderHeights.byteLength)
	newBlocks[BlockType.HeightMap].fill(averageLevel)
	newBlocks[BlockType.Texture1].fill(texture)
	newBlocks[BlockType.Texture2].fill(texture)
	newBlocks[BlockType.FogOfWar].fill(7)

	const xDiff = (width - world.width) / 2
	const yDiff = (height - world.height) / 2

	const sourceXOffset = xDiff < 0 ? -xDiff : 0
	const targetXOffset = xDiff < 0 ? 0 : xDiff
	const sourceYOffset = yDiff < 0 ? -yDiff : 0
	const targetYOffset = yDiff < 0 ? 0 : yDiff
	const sourceWidth = world.width - sourceXOffset * 2

	for (
		let sY = sourceYOffset, sIndex = sY * world.width, tY = targetYOffset, tIndex = tY * width;
		sY < world.height - sourceYOffset;
		sY++, sIndex += world.width, tY++, tIndex += width
	) {
		const start = sIndex + sourceXOffset
		const end = start + sourceWidth
		newBlocks[BlockType.Animal].set(oldBlocks[BlockType.Animal].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.FogOfWar].set(oldBlocks[BlockType.FogOfWar].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.HeightMap].set(oldBlocks[BlockType.HeightMap].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.Icon].set(oldBlocks[BlockType.Icon].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.Object1].set(oldBlocks[BlockType.Object1].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.Object2].set(oldBlocks[BlockType.Object2].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.Resource].set(oldBlocks[BlockType.Resource].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.Roads].set(oldBlocks[BlockType.Roads].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.Unknown].set(oldBlocks[BlockType.Unknown].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.Texture1].set(oldBlocks[BlockType.Texture1].slice(start, end), tIndex + targetXOffset)
		newBlocks[BlockType.Texture2].set(oldBlocks[BlockType.Texture2].slice(start, end), tIndex + targetXOffset)
	}

	newWorld.title = world.title
	newWorld.author = world.author
	newWorld.animals = world.animals.reduce((animals, [type, x, y]) => {
		const newX = x + xDiff
		const newY = y + yDiff
		if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
			animals.push([type, newX, newY])
		}
		return animals
	}, [] as [number, number, number][])
	newWorld.hqX = world.hqX.map((x, index) => {
		const y = world.hqY[index]
		if (x === 0xffff || y === 0xffff) return x
		const newX = x + xDiff
		const newY = y + yDiff
		if (newX < 0 || newX >= width || newY < 0 || newY >= height) return 0xffff
		return newX
	})
	newWorld.hqY = world.hqY.map((y, index) => {
		const x = world.hqX[index]
		if (x === 0xffff || y === 0xffff) return y
		const newX = x + xDiff
		const newY = y + yDiff
		if (newX < 0 || newX >= width || newY < 0 || newY >= height) return 0xffff
		return newY
	})
	newWorld.leader = world.leader.slice(0)
	newWorld.playerCount = world.playerCount
	newWorld.terrain = world.terrain

	newWorld.updateBuildSiteMap()
	newWorld.updateLightMap()
	newWorld.updateRegions()

	return newWorld
}
