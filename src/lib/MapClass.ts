const BLOCKS = 14

enum BlockType {
	HeightMap = 0,
	Texture1 = 1,
	Texture2 = 2,
	Roads = 3,
	Object1 = 4,
	Object2 = 5,
	Animal = 6,
	Unknown = 7,
	BuildSite = 8,
	UnknownFill7 = 9,
	Icon = 10,
	Resource = 11,
	LightMap = 12,
	Area = 13,
}

function getNodesByIndex(index: number, width: number, height: number) {
	let x = index % width,
		y = (index - x) / width,
		xL = (x > 0 ? x : width) - 1,
		xR = (x + 1) % width,
		yT = ((y > 0 ? y : height) - 1) * width,
		yB = ((y + 1) % height) * width,
		odd = (y & 1) === 1

	y *= width

	return odd
		? {
				left: y + xL,
				right: y + xR,
				topLeft: yT + x,
				topRight: yT + xR,
				bottomLeft: yB + x,
				bottomRight: yB + xR,
		  }
		: {
				left: y + xL,
				right: y + xR,
				topLeft: yT + xL,
				topRight: yT + x,
				bottomLeft: yB + xL,
				bottomRight: yB + x,
		  }
}

export class MapClass {
	blocks: Record<BlockType, DataView | null> = {
		[BlockType.HeightMap]: null,
		[BlockType.Texture1]: null,
		[BlockType.Texture2]: null,
		[BlockType.Roads]: null,
		[BlockType.Object1]: null,
		[BlockType.Object2]: null,
		[BlockType.Animal]: null,
		[BlockType.Unknown]: null,
		[BlockType.BuildSite]: null,
		[BlockType.UnknownFill7]: null,
		[BlockType.Icon]: null,
		[BlockType.Resource]: null,
		[BlockType.LightMap]: null,
		[BlockType.Area]: null,
	}
	fileBuffer: ArrayBuffer | null = null
	height = 0
	width = 0

	constructor(width: number, height: number) {
		this.width = width
		this.height = height
		this.init(width * height)
	}

	private init = (size: number) => {
		this.fileBuffer = new ArrayBuffer(size * BLOCKS)
		Object.keys(this.blocks).forEach((index) => {
			this.blocks[index] = new DataView(this.fileBuffer, ~~index * size, size)
		})
		new Uint8Array(this.blocks[BlockType.UnknownFill7].buffer).fill(7)
	}

	setHeight = (x: number, y: number, radius = 0, elevation = 0) => {
		radius = Math.abs(radius)

	}

	/** Pre-calculated light map stored in a map file. Required by the original game. */
	updateLightMap = () => {
		const heightMap = new Uint8Array(this.blocks[BlockType.HeightMap].buffer)
		const lightMap = new Uint8Array(this.blocks[BlockType.LightMap].buffer)
		heightMap.forEach((height, index) => {
			let shade = 0
			const around = getNodesByIndex(index, this.width, this.height)
			const aroundLeft = getNodesByIndex(around.left, this.width, this.height)
			shade += 9 * (heightMap[around.topRight] - height)
			shade -= 6 * (heightMap[around.left] - height)
			shade -= 3 * (heightMap[aroundLeft.left] - height)
			shade -= 9 * (heightMap[aroundLeft.bottomLeft] - height)
			lightMap[index] = Math.max(0, Math.min(shade, 128))
		})
	}
}
