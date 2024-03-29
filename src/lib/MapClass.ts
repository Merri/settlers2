import { cp437ToString, stringToCp437 } from './cp437'
import { getAllMapRegions, locateCoastalCastles } from './mapRegions'
import { C8ObjectType } from './objects'
import { TextureBuildFeature } from './textures'
import {
	BlockType,
	RegionType,
	TextureFlag,
	Texture,
	TextureFeatureFlag,
	Textures,
	ObjectType,
	ConstructionSite,
	AnimalType,
	SupportedTree,
} from './types'

type MapClassBlocks = Record<BlockType, Uint8Array>

function sanitizeSwdBlocks({ world }: { world: MapClass }): MapClassBlocks {
	const size = world.width * world.height
	const heightMap = new Uint8Array(size)
	const texture1 = new Uint8Array(size)
	const texture2 = new Uint8Array(size)
	const object1 = new Uint8Array(size)
	const object2 = new Uint8Array(size)
	const animal = new Uint8Array(size)
	const buildSite = new Uint8Array(size)
	const resource = new Uint8Array(size)
	const lightMap = new Uint8Array(size)
	const regionMap = new Uint8Array(size)

	heightMap.set(world.blocks[BlockType.HeightMap])

	world.blocks[BlockType.Texture1].forEach((value, index) => {
		// textures
		texture1[index] = value & 0x7f
		texture2[index] = world.blocks[BlockType.Texture2][index] & 0x3f
		// objects
		let o1 = world.blocks[BlockType.Object1][index]
		const o2 = world.blocks[BlockType.Object2][index]

		if (o2 === 0x80) return

		const variant = o2 & 0x03
		const type = (o2 >> 2) & 0x03
		const flags = o2 >> 4

		if (flags & 0x01) return
		if (flags & 0x02) return
		if (type === 0x00) {
			if (flags & 0x07) return
			if (variant) return
		} else if (type === 0x01) {
			if (variant > 2) return
			const id = (variant << 2) | (o1 >> 6)
			const isCut = (o1 >> 3) & 0x01
			const size = (o1 >> 4) & 0x03
			const step = o1 & 0x07

			if (isCut) return
			if (id > 8) return
			// make it a fully grown tree
			if (size < 3) o1 |= 0x30
		} else if (type === 0x02) {
			if (variant > 0) return
			if (value > 0x2b) return
		} else if (type === 0x03) {
			if (variant > 1) return
			if (value > 7) return
		}

		object1[index] = o1
		object2[index] = o2
	})

	world.hqX.forEach((x, player) => {
		const y = world.hqY[player]
		const index = x + y * world.width
		world.blocks[BlockType.Object1][index] = player
		world.blocks[BlockType.Object2][index] = 0x80
	})

	const hasAnimals = world.blocks[BlockType.Animal].every((value) => value !== 0xff)

	if (hasAnimals) {
		animal.set(world.blocks[BlockType.Animal])
	}

	world.animals.forEach(([type, x, y]) => {
		animal[x + y * world.width] = type
	})

	// calculating buildSite requires heightMap, texture1, texture2, object2
	for (let i = 0; i < size; i++) {
		const nodes = getNodesByIndex(i, world.width, world.height)
		const tn1 = getTextureNodesByIndex(i, world.width, world.height)
		const tn2 = getTextureNodesByIndex(nodes.bottomRight, world.width, world.height)

		const tex1 = texture1[tn1.top1Left] & TextureFlag.ToIdValue
		const tex2 = texture2[tn1.top2] & TextureFlag.ToIdValue
		const tex3 = texture1[tn1.top1Right] & TextureFlag.ToIdValue
		const tex4 = texture2[tn1.bottom2Left] & TextureFlag.ToIdValue
		const tex5 = texture1[tn1.bottom1] & TextureFlag.ToIdValue
		const tex6 = texture2[tn1.bottom2Right] & TextureFlag.ToIdValue
		const tex7 = texture1[tn2.top1Right] & TextureFlag.ToIdValue
		const tex8 = texture2[tn2.bottom2Left] & TextureFlag.ToIdValue
		const tex9 = texture1[tn2.bottom1] & TextureFlag.ToIdValue
		const texA = texture2[tn2.bottom2Right] & TextureFlag.ToIdValue

		const tex1Flags = Textures.get(tex1)!.featureFlags
		const tex2Flags = Textures.get(tex2)!.featureFlags
		const tex3Flags = Textures.get(tex3)!.featureFlags
		const tex4Flags = Textures.get(tex4)!.featureFlags
		const tex5Flags = Textures.get(tex5)!.featureFlags
		const tex6Flags = Textures.get(tex6)!.featureFlags
		const tex7Flags = Textures.get(tex7)!.featureFlags
		const tex8Flags = Textures.get(tex8)!.featureFlags
		const tex9Flags = Textures.get(tex9)!.featureFlags
		const texAFlags = Textures.get(texA)!.featureFlags

		// water or swamp texture count
		const wets =
			((tex1Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
			((tex2Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
			((tex3Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
			((tex4Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
			((tex5Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
			((tex6Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0)

		const objectType = object2[i] & ObjectType.Match

		if (
			wets === 6 ||
			objectType === ObjectType.Granite ||
			// snow or lava
			(tex1Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
			(tex2Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
			(tex3Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
			(tex4Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
			(tex5Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
			(tex6Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme
		) {
			buildSite[i] = ConstructionSite.Impassable
			continue
		}

		if (objectType === ObjectType.Tree) {
			buildSite[i] = ConstructionSite.Tree
			continue
		}

		if (
			wets > 0 ||
			// see if node bordered by granite
			(object2[nodes.left] & ObjectType.Match) === ObjectType.Granite ||
			(object2[nodes.right] & ObjectType.Match) === ObjectType.Granite ||
			(object2[nodes.topLeft] & ObjectType.Match) === ObjectType.Granite ||
			(object2[nodes.topRight] & ObjectType.Match) === ObjectType.Granite ||
			(object2[nodes.bottomLeft] & ObjectType.Match) === ObjectType.Granite ||
			(object2[nodes.bottomRight] & ObjectType.Match) === ObjectType.Granite ||
			// arid textures only allow building flag poles
			(tex1Flags & TextureFeatureFlag.Arid) === TextureFeatureFlag.Arid ||
			(tex2Flags & TextureFeatureFlag.Arid) === TextureFeatureFlag.Arid ||
			(tex3Flags & TextureFeatureFlag.Arid) === TextureFeatureFlag.Arid ||
			(tex4Flags & TextureFeatureFlag.Arid) === TextureFeatureFlag.Arid ||
			(tex5Flags & TextureFeatureFlag.Arid) === TextureFeatureFlag.Arid ||
			(tex6Flags & TextureFeatureFlag.Arid) === TextureFeatureFlag.Arid
		) {
			buildSite[i] = ConstructionSite.OccupiedFlag
			continue
		}

		const mountains =
			((tex1Flags & TextureFeatureFlag.Rock) === TextureFeatureFlag.Rock ? 1 : 0) +
			((tex2Flags & TextureFeatureFlag.Rock) === TextureFeatureFlag.Rock ? 1 : 0) +
			((tex3Flags & TextureFeatureFlag.Rock) === TextureFeatureFlag.Rock ? 1 : 0) +
			((tex4Flags & TextureFeatureFlag.Rock) === TextureFeatureFlag.Rock ? 1 : 0) +
			((tex5Flags & TextureFeatureFlag.Rock) === TextureFeatureFlag.Rock ? 1 : 0) +
			((tex6Flags & TextureFeatureFlag.Rock) === TextureFeatureFlag.Rock ? 1 : 0)

		const nodeHeight = heightMap[i]

		if (mountains) {
			if (
				mountains < 6 ||
				// too big height difference
				nodeHeight - heightMap[nodes.bottomRight] < -3 ||
				// snow or lava
				(tex7Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
				(tex8Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
				(tex9Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
				(texAFlags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
				// tree
				(object2[nodes.bottomRight] & ObjectType.Match) === ObjectType.Tree
			) {
				buildSite[i] = ConstructionSite.OccupiedFlag
			} else {
				buildSite[i] = ConstructionSite.OccupiedMine
			}

			continue
		}

		const isMountainMeadow =
			tex1 === 0x12 || tex2 === 0x12 || tex3 === 0x12 || tex4 === 0x12 || tex5 === 0x12 || tex6 === 0x12

		if (
			(object2[nodes.bottomRight] & ObjectType.Match) === ObjectType.Tree ||
			// height differences
			nodeHeight - heightMap[nodes.bottomRight] > 3 ||
			heightMap[nodes.bottomRight] - nodeHeight > 1 ||
			Math.abs(nodeHeight - heightMap[nodes.topLeft]) > 3 ||
			Math.abs(nodeHeight - heightMap[nodes.topRight]) > 3 ||
			Math.abs(nodeHeight - heightMap[nodes.left]) > 3 ||
			Math.abs(nodeHeight - heightMap[nodes.right]) > 3 ||
			Math.abs(nodeHeight - heightMap[nodes.bottomLeft]) > 3
		) {
			buildSite[i] = isMountainMeadow ? ConstructionSite.OccupiedFlag : ConstructionSite.Flag
			continue
		}

		if (
			// snow or lava
			(tex7Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
			(tex8Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
			(tex9Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
			(texAFlags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme
		) {
			buildSite[i] = ConstructionSite.OccupiedFlag
			continue
		}

		if (
			(object2[nodes.topLeft] & ObjectType.Match) === ObjectType.Tree ||
			(object2[nodes.topRight] & ObjectType.Match) === ObjectType.Tree ||
			(object2[nodes.left] & ObjectType.Match) === ObjectType.Tree ||
			(object2[nodes.right] & ObjectType.Match) === ObjectType.Tree ||
			(object2[nodes.bottomLeft] & ObjectType.Match) === ObjectType.Tree
		) {
			buildSite[i] = isMountainMeadow ? ConstructionSite.OccupiedFlag : ConstructionSite.Flag
			continue
		}

		const radiusNodes = getNodesAtRadius(i, 2, world.width, world.height)
		// check height difference on nodes a step further away
		if (radiusNodes.some((nodeIndex) => Math.abs(nodeHeight - heightMap[nodeIndex]) > 2)) {
			buildSite[i] = isMountainMeadow ? ConstructionSite.OccupiedHut : ConstructionSite.Hut
			continue
		}

		// nothing prevents building a castle size building!
		buildSite[i] = isMountainMeadow ? ConstructionSite.OccupiedCastle : ConstructionSite.Castle
	}

	world.blocks[BlockType.Resource].forEach((value, index) => {
		// water
		if (value >= 0x20 && value <= 0x27) resource[index] = value
		// minerals
		else if (value >= 0x40 && value <= 0x5f) resource[index] = value
		// fish
		else if (value >= 0x80 && value <= 0x87) resource[index] = value
		// anything else
		else resource[index] = 0
	})

	heightMap.forEach((height, index) => {
		let shade = 0x40
		const around = getNodesByIndex(index, world.width, world.height)
		const aroundLeft = getNodesByIndex(around.left, world.width, world.height)
		shade += 9 * (heightMap[around.topRight] - height)
		shade -= 6 * (heightMap[around.left] - height)
		shade -= 3 * (heightMap[aroundLeft.left] - height)
		shade -= 9 * (heightMap[aroundLeft.bottomLeft] - height)
		lightMap[index] = Math.max(0, Math.min(shade, 0x80))
	})

	world.blocks[BlockType.RegionMap].forEach((value, index) => {
		regionMap[index] = value === 0xff ? 0xfe : value
	})

	return {
		[BlockType.HeightMap]: heightMap,
		[BlockType.Texture1]: texture1,
		[BlockType.Texture2]: texture2,
		[BlockType.Roads]: new Uint8Array(size),
		[BlockType.Object1]: object1,
		[BlockType.Object2]: object2,
		[BlockType.Animal]: animal,
		[BlockType.Unknown]: new Uint8Array(size),
		[BlockType.BuildSite]: buildSite,
		[BlockType.FogOfWar]: new Uint8Array(size).fill(7),
		[BlockType.Icon]: new Uint8Array(size),
		[BlockType.Resource]: resource,
		[BlockType.LightMap]: lightMap,
		[BlockType.RegionMap]: regionMap,
	}
}

const BLOCKS = 14

export function getNodesByIndex(index: number, width: number, height: number) {
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
		  } as const
		: {
				left: y + xL,
				right: y + xR,
				topLeft: yT + xL,
				topRight: yT + x,
				bottomLeft: yB + xL,
				bottomRight: yB + x,
		  } as const
}

export function getNodesAtRadius(index: number, radius: number, width: number, height: number) {
	if (radius < 1) throw new Error('Radius must be 1 or more')
	//const maxRadius = Math.floor((Math.min(width, height) - 2) / 2)
	//if (radius > maxRadius) throw new Error('Maximum radius is ' + maxRadius)
	const size = width * height
	const x = index % width
	const y = (index - x) / width
	const yIndex = index - x
	let even = (y & 1) === 0
	let xMin = (width + x - radius) % width
	let xMax = (x + radius) % width

	const nodes = new Uint32Array(6 * radius)
	let nodeIndex = 0,
		topY = yIndex,
		bottomY = yIndex

	// current line first and last
	nodes[nodeIndex++] = yIndex + xMin
	nodes[nodeIndex++] = yIndex + xMax

	// first and last on all lines except the topmost and bottommost row
	for (let i = 1; i < radius; i++) {
		if (even) {
			if (xMax > 0) {
				xMax--
			} else {
				xMax = width - 1
			}
		} else {
			xMin = ++xMin % width
		}
		even = !even
		topY = (size + topY - width) % size
		bottomY = (bottomY + width) % size
		nodes[nodeIndex++] = topY + xMin
		nodes[nodeIndex++] = topY + xMax
		nodes[nodeIndex++] = bottomY + xMin
		nodes[nodeIndex++] = bottomY + xMax
	}

	// all nodes in topmost and bottommost row
	if (even) {
		if (xMax > 0) {
			xMax--
		} else {
			xMax = width - 1
		}
	} else {
		xMin = ++xMin % width
	}

	// remaining top and bottom row
	topY = (size + topY - width) % size
	bottomY = (bottomY + width) % size

	if (xMin < xMax) {
		for (let i = xMin; i <= xMax; i++) {
			nodes[nodeIndex++] = topY + i
			nodes[nodeIndex++] = bottomY + i
		}
	} else {
		for (let i = xMin; i < width; i++) {
			nodes[nodeIndex++] = topY + i
			nodes[nodeIndex++] = bottomY + i
		}
		for (let i = 0; i <= xMax; i++) {
			nodes[nodeIndex++] = topY + i
			nodes[nodeIndex++] = bottomY + i
		}
	}

	return nodes
}

interface TextureNodes {
	/** Texture2 */
	bottom2Left: number
	bottom2Right: number
	top2: number
	bottom1: number
	top1Left: number
	top1Right: number
}

export function getTextureNodesByIndex(index: number, width: number, height: number): TextureNodes {
	let x = index % width,
		y = (index - x) / width,
		xL = (x > 0 ? x : width) - 1,
		yT = ((y > 0 ? y : height) - 1) * width,
		odd = (y & 1) === 1

	y *= width

	if (odd) {
		// only needed here
		let xR = (x + 1) % width

		return {
			bottom2Left: y + xL,
			bottom1: index,
			bottom2Right: index,
			top1Left: yT + x,
			top2: yT + x,
			top1Right: yT + xR,
		}
	} else {
		return {
			bottom2Left: y + xL,
			bottom1: index,
			bottom2Right: index,
			top1Left: yT + xL,
			top2: yT + xL,
			top1Right: yT + x,
		}
	}
}

interface WidthHeight {
	width: number
	height: number
}

type Options = WidthHeight | { fileContents: DataView }
type Regions = [type: RegionType, x: number, y: number, size: number][]
type Animals = [type: number, x: number, y: number][]

export class NotMapError extends Error {}

const emptyMapBlock = new Uint8Array(0)

export class MapClass {
	blocks: MapClassBlocks = {
		[BlockType.HeightMap]: emptyMapBlock,
		[BlockType.Texture1]: emptyMapBlock,
		[BlockType.Texture2]: emptyMapBlock,
		[BlockType.Roads]: emptyMapBlock,
		[BlockType.Object1]: emptyMapBlock,
		[BlockType.Object2]: emptyMapBlock,
		[BlockType.Animal]: emptyMapBlock,
		[BlockType.Unknown]: emptyMapBlock,
		[BlockType.BuildSite]: emptyMapBlock,
		[BlockType.FogOfWar]: emptyMapBlock,
		[BlockType.Icon]: emptyMapBlock,
		[BlockType.Resource]: emptyMapBlock,
		[BlockType.LightMap]: emptyMapBlock,
		[BlockType.RegionMap]: emptyMapBlock,
	}
	fileBuffer: ArrayBuffer = new ArrayBuffer(0)
	height = 0
	width = 0
	/** Title in file */
	title = ''
	/** Author in file */
	author = ''
	/** Terrain in file */
	terrain = 0
	/** Player count in file */
	playerCount = 0
	/** Player start X position in file */
	hqX: number[] = []
	/** Player start Y position in file */
	hqY: number[] = []
	/** Validation flag */
	validationFlag: number = 0
	/** Player leader in file */
	leader: number[] = []

	/** type, x, y, size */
	regions: Regions = []
	/** type, x, y */
	animals: Animals = []

	log: string[] = []

	constructor(options: Options = { width: 256, height: 256 }) {
		if ('fileContents' in options) {
			const decoder = new TextDecoder()
			const signature = decoder.decode(options.fileContents.buffer.slice(0, 10))
			const headerSize = signature === 'WORLD_V1.0' ? 2342 : 0

			const view = new DataView(options.fileContents.buffer)
			const longHeaders = view.getUint16(headerSize, false) === 0x1127 && view.getUint32(headerSize + 2) === 0
			const shortHeaders =
				view.getUint16(headerSize, false) === 0x1127 &&
				view.getUint32(headerSize + 2) === 0xffffffff &&
				view.getUint32(headerSize + 6) === 0

			if (!longHeaders && !shortHeaders) {
				throw new NotMapError('Given data did not look like The Settlers II map file (SWD/WLD/DAT/savegame)')
			}

			const blockHeaderSize = longHeaders ? 16 : 4
			this.initFromFile(view, headerSize, blockHeaderSize)
		} else {
			const { width, height } = options
			this.width = width
			this.height = height
			this.initBlocks(width * height)
		}
	}

	private initBlocks = (size: number) => {
		this.fileBuffer = new ArrayBuffer(size * BLOCKS)
		Object.keys(this.blocks).forEach((index) => {
			this.blocks[index as unknown as keyof typeof this.blocks] = new Uint8Array(
				this.fileBuffer,
				~~index * size,
				size
			)
		})
		this.blocks[BlockType.FogOfWar].fill(7)
	}

	private initFromFile = (view: DataView, headerSize: 0 | 2342, blockHeaderSize: 4 | 16) => {
		const mapSizeIndex = headerSize + 6 + (blockHeaderSize === 4 ? 4 : 0)
		const width = view.getUint16(mapSizeIndex, true)
		const height = view.getUint16(mapSizeIndex + 2, true)

		if (width < 32 || height < 32 || width > 1024 || height > 1024 || width & 3 || height & 3) {
			throw new NotMapError(`Unsupported map size: ${width} x ${height}`)
		}

		this.width = width
		this.height = height
		this.title = ''
		this.author = ''
		this.terrain = 0
		this.playerCount = 0
		this.hqX = []
		this.hqY = []
		this.validationFlag = 0
		this.leader = []
		this.animals = []
		this.log = []

		const size = width * height
		this.initBlocks(size)

		if (headerSize === 2342) {
			const isLongTitle =
				view.getUint8(29) !== 0 && (view.getUint16(30, true) !== width || view.getUint16(32, true) !== height)
			this.terrain = Math.min(2, view.getUint8(34))
			this.playerCount = view.getUint8(35)
			const isGreenland = this.terrain === 0
			// RttR allows for 20 chars
			// For S2 normal title maximum length is 19, but the game reads bytes until it finds a null character so you can abuse it
			const maxTitleLength = 20 + (isLongTitle ? (isGreenland ? 4 : 3) : 0)
			this.title = cp437ToString(new Uint8Array(view.buffer, 10, maxTitleLength))
			this.author = cp437ToString(new Uint8Array(view.buffer, 36, 20))
			this.hqX = Array.from(new Uint16Array(view.buffer, 56, 7))
			this.hqY = Array.from(new Uint16Array(view.buffer, 70, 7))
			this.validationFlag = view.getUint8(84)
			this.leader = Array.from(new Uint8Array(view.buffer, 85, 7))

			const regions: Regions = []
			for (let i = 0; i < 2250; i += 9) {
				const regionType = view.getUint8(92 + i)
				const regionX = view.getUint16(93 + i, true)
				const regionY = view.getUint16(95 + i, true)
				const regionSize = view.getUint32(97 + i, true)
				// end of valid data?
				if (regionType === 0 && regionX === 0 && regionY === 0 && regionSize === 0) {
					break
				}
				// garbage?
				if (regionType > 2 || regionX >= width || regionY >= height || regionSize >= size) {
					break
				}
				regions.push([regionType, regionX, regionY, regionSize])
			}
			this.regions = regions
		}

		let readIndex = headerSize + 10 + (blockHeaderSize === 4 ? 4 : 0)

		for (let blockIndex: BlockType = 0; blockIndex < 14; blockIndex++) {
			if (blockHeaderSize === 16) {
				// validate header
				if (
					view.getUint16(readIndex, false) !== 0x1027 ||
					view.getUint32(readIndex + 2) !== 0 ||
					view.getUint16(readIndex + 6, true) !== width ||
					view.getUint16(readIndex + 8, true) !== height ||
					view.getUint16(readIndex + 10, false) !== 0x0100
				) {
					throw new NotMapError(`Block index ${blockIndex} header is not valid`)
				}
				readIndex += 12
			}

			const blockSize = view.getUint32(readIndex, true)
			readIndex += 4

			if (blockSize + readIndex > view.byteLength) {
				throw new NotMapError(
					`Block index ${blockIndex} header asks to read ${blockSize} bytes which is more than available (${
						view.byteLength - readIndex
					} bytes)`
				)
			}

			const target = this.blocks[blockIndex]
			const source = new Uint8Array(view.buffer, readIndex, blockSize)
			readIndex += blockSize

			if (blockSize === size) {
				// uncompressed is so convenient
				target.set(source)
			} else {
				// compressed
				const key = source[0]
				let writePos = 0
				for (let i = 1; i < blockSize; i++) {
					const currentByte = source[i]
					if (currentByte === key) {
						const count = source[++i]
						if (count === 0) {
							target[writePos] = key
							writePos++
						} else {
							const byteToCopy = source[++i]
							target.fill(byteToCopy, writePos, writePos + count)
							writePos += count
						}
					} else {
						target[writePos++] = currentByte
					}
				}
				// Patch: only one byte missing? replicate last written byte
				if (writePos + 1 === size) {
					this.log.push(
						`Decompression error in block index ${blockIndex}: last byte missing, replicating previous byte`
					)
					target[writePos] = target[writePos - 1]
					writePos++
				}
				// should never see these messages!
				if (writePos < size) {
					this.log.push(
						`Critical decompression error in block index ${blockIndex}: ${size - writePos} bytes too short!`
					)
				} else if (writePos > size) {
					this.log.push(
						`Critical decompression error in block index ${blockIndex}: ${writePos - size} bytes too long!`
					)
				}
			}
		}

		const footerSize = view.byteLength - readIndex

		if (footerSize >= size) {
			this.log.push('File footer is very large!')
		}

		const animalOverflow = footerSize % 5
		if (animalOverflow > 1) {
			this.log.push(`File footer (animals) contains more bytes than expected`)
		}

		const animalCount = Math.round((footerSize - animalOverflow) / 5)

		for (let i = 0; i < animalCount; i++) {
			const animalType = view.getUint8(readIndex)
			if (animalType === 0 || animalType === 0xff) {
				this.log.push(`Invalid animal data encountered in footer at file index ${readIndex}`)
				return
			}
			const animalX = view.getUint16(readIndex + 1, true)
			const animalY = view.getUint16(readIndex + 3, true)
			if (animalX >= width || animalY >= height) {
				this.log.push(
					`Invalid animal location encountered in footer at file index ${
						readIndex + 1
					}: ${animalX}x${animalY}`
				)
			}
			this.animals.push([animalType, animalX, animalY])
			readIndex += 5
		}

		if (readIndex === view.byteLength) return

		if (readIndex + 1 === view.byteLength) {
			const eof = view.getUint8(readIndex)
			if (eof !== 0xff) {
				this.log.push(`Expected end of file indicator (0xFF) but got 0x${('0' + eof.toString(16)).slice(-2)}`)
			}
		}
	}

	isEachTextureSame = (index: number, texture: Texture) => {
		const t1 = this.blocks[BlockType.Texture1]
		const t2 = this.blocks[BlockType.Texture2]
		const nodes = getTextureNodesByIndex(index, this.width, this.height)

		const bottomLeft = t2[nodes.bottom2Left] & TextureFlag.ToIdValue
		if (bottomLeft !== texture) return false

		const bottomRight = t2[nodes.bottom2Right] & TextureFlag.ToIdValue
		if (bottomRight !== texture) return false

		const top = t2[nodes.top2] & TextureFlag.ToIdValue
		if (top !== texture) return false

		const topLeft = t1[nodes.top1Left] & TextureFlag.ToIdValue
		if (topLeft !== texture) return false

		const topRight = t1[nodes.top1Right] & TextureFlag.ToIdValue
		if (topRight !== texture) return false

		const bottom = t1[nodes.bottom1] & TextureFlag.ToIdValue
		if (bottom !== texture) return false

		return true
	}

	isEachTextureWithAnyOfFlags = (index: number, flags: TextureFeatureFlag) => {
		const t1 = this.blocks[BlockType.Texture1]
		const t2 = this.blocks[BlockType.Texture2]
		const nodes = getTextureNodesByIndex(index, this.width, this.height)

		const bottomLeft = Textures.get(t2[nodes.bottom2Left] & TextureFlag.ToIdValue)!.featureFlags & flags
		if (bottomLeft === 0) return false

		const bottomRight = Textures.get(t2[nodes.bottom2Right] & TextureFlag.ToIdValue)!.featureFlags & flags
		if (bottomRight === 0) return false

		const top = Textures.get(t2[nodes.top2] & TextureFlag.ToIdValue)!.featureFlags & flags
		if (top === 0) return false

		const topLeft = Textures.get(t1[nodes.top1Left] & TextureFlag.ToIdValue)!.featureFlags & flags
		if (topLeft === 0) return false

		const topRight = Textures.get(t1[nodes.top1Right] & TextureFlag.ToIdValue)!.featureFlags & flags
		if (topRight === 0) return false

		const bottom = Textures.get(t1[nodes.bottom1] & TextureFlag.ToIdValue)!.featureFlags & flags
		if (bottom === 0) return false

		return true
	}

	/**
	 * Pre-calculated construction site map stored in a map file. Required by the original game.
	 *
	 * Calculated based on texture blocks, objects, and height map.
	 *
	 * The output is nearly 100% compatible with the original game for non-savegame maps.
	 */
	updateBuildSiteMap = () => {
		const size = this.width * this.height
		// input from
		const heightMap = this.blocks[BlockType.HeightMap]
		const t1 = this.blocks[BlockType.Texture1]
		const t2 = this.blocks[BlockType.Texture2]
		const o2 = this.blocks[BlockType.Object2]
		// output to
		const buildSite = this.blocks[BlockType.BuildSite]

		for (let i = 0; i < size; i++) {
			const nodes = getNodesByIndex(i, this.width, this.height)
			const tn1 = getTextureNodesByIndex(i, this.width, this.height)
			const tn2 = getTextureNodesByIndex(nodes.bottomRight, this.width, this.height)

			const tex1: Texture = t1[tn1.top1Left] & TextureFlag.ToIdValue
			const tex2: Texture = t2[tn1.top2] & TextureFlag.ToIdValue
			const tex3: Texture = t1[tn1.top1Right] & TextureFlag.ToIdValue
			const tex4: Texture = t2[tn1.bottom2Left] & TextureFlag.ToIdValue
			const tex5: Texture = t1[tn1.bottom1] & TextureFlag.ToIdValue
			const tex6: Texture = t2[tn1.bottom2Right] & TextureFlag.ToIdValue
			const tex7: Texture = t1[tn2.top1Right] & TextureFlag.ToIdValue
			const tex8: Texture = t2[tn2.bottom2Left] & TextureFlag.ToIdValue
			const tex9: Texture = t1[tn2.bottom1] & TextureFlag.ToIdValue
			const texA: Texture = t2[tn2.bottom2Right] & TextureFlag.ToIdValue

			// water or swamp texture count
			const wets =
				(TextureBuildFeature[tex1] === 'edgeRoad' ? 1 : 0) +
				(TextureBuildFeature[tex2] === 'edgeRoad' ? 1 : 0) +
				(TextureBuildFeature[tex3] === 'edgeRoad' ? 1 : 0) +
				(TextureBuildFeature[tex4] === 'edgeRoad' ? 1 : 0) +
				(TextureBuildFeature[tex5] === 'edgeRoad' ? 1 : 0) +
				(TextureBuildFeature[tex6] === 'edgeRoad' ? 1 : 0)

			const objectType = o2[i] & ObjectType.Match

			if (
				wets === 6 ||
				objectType === ObjectType.Granite ||
				// snow or lava
				TextureBuildFeature[tex1] === 'noRoad' ||
				TextureBuildFeature[tex2] === 'noRoad' ||
				TextureBuildFeature[tex3] === 'noRoad' ||
				TextureBuildFeature[tex4] === 'noRoad' ||
				TextureBuildFeature[tex5] === 'noRoad' ||
				TextureBuildFeature[tex6] === 'noRoad'
			) {
				buildSite[i] = ConstructionSite.Impassable
				continue
			}

			if (objectType === ObjectType.Tree) {
				buildSite[i] = ConstructionSite.Tree
				continue
			}

			if (
				wets > 0 ||
				// see if node bordered by granite
				(o2[nodes.left] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.right] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.topLeft] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.topRight] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.bottomLeft] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.bottomRight] & ObjectType.Match) === ObjectType.Granite ||
				// arid textures only allow building flag poles
				TextureBuildFeature[tex1] === 'road' ||
				TextureBuildFeature[tex2] === 'road' ||
				TextureBuildFeature[tex3] === 'road' ||
				TextureBuildFeature[tex4] === 'road' ||
				TextureBuildFeature[tex5] === 'road' ||
				TextureBuildFeature[tex6] === 'road'
			) {
				buildSite[i] = ConstructionSite.OccupiedFlag
				continue
			}

			const mountains =
				(TextureBuildFeature[tex1] === 'mine' ? 1 : 0) +
				(TextureBuildFeature[tex2] === 'mine' ? 1 : 0) +
				(TextureBuildFeature[tex3] === 'mine' ? 1 : 0) +
				(TextureBuildFeature[tex4] === 'mine' ? 1 : 0) +
				(TextureBuildFeature[tex5] === 'mine' ? 1 : 0) +
				(TextureBuildFeature[tex6] === 'mine' ? 1 : 0)

			const nodeHeight = heightMap[i]

			if (mountains) {
				if (
					mountains < 6 ||
					// too big height difference
					nodeHeight - heightMap[nodes.bottomRight] < -3 ||
					// snow or lava
					TextureBuildFeature[tex7] === 'noRoad' ||
					TextureBuildFeature[tex8] === 'noRoad' ||
					TextureBuildFeature[tex9] === 'noRoad' ||
					TextureBuildFeature[texA] === 'noRoad' ||
					// tree
					(o2[nodes.bottomRight] & ObjectType.Match) === ObjectType.Tree
				) {
					buildSite[i] = ConstructionSite.OccupiedFlag
				} else {
					buildSite[i] = ConstructionSite.OccupiedMine
				}

				continue
			}

			const isMountainMeadow =
				tex1 === 0x12 || tex2 === 0x12 || tex3 === 0x12 || tex4 === 0x12 || tex5 === 0x12 || tex6 === 0x12

			if (
				(o2[nodes.bottomRight] & ObjectType.Match) === ObjectType.Tree ||
				// height differences
				nodeHeight - heightMap[nodes.bottomRight] > 3 ||
				heightMap[nodes.bottomRight] - nodeHeight > 1 ||
				Math.abs(nodeHeight - heightMap[nodes.topLeft]) > 3 ||
				Math.abs(nodeHeight - heightMap[nodes.topRight]) > 3 ||
				Math.abs(nodeHeight - heightMap[nodes.left]) > 3 ||
				Math.abs(nodeHeight - heightMap[nodes.right]) > 3 ||
				Math.abs(nodeHeight - heightMap[nodes.bottomLeft]) > 3
			) {
				buildSite[i] = isMountainMeadow ? ConstructionSite.OccupiedFlag : ConstructionSite.Flag
				continue
			}

			if (
				// snow or lava
				TextureBuildFeature[tex7] === 'noRoad' ||
				TextureBuildFeature[tex8] === 'noRoad' ||
				TextureBuildFeature[tex9] === 'noRoad' ||
				TextureBuildFeature[texA] === 'noRoad'
			) {
				buildSite[i] = ConstructionSite.OccupiedFlag
				continue
			}

			if (
				(o2[nodes.topLeft] & ObjectType.Match) === ObjectType.Tree ||
				(o2[nodes.topRight] & ObjectType.Match) === ObjectType.Tree ||
				(o2[nodes.left] & ObjectType.Match) === ObjectType.Tree ||
				(o2[nodes.right] & ObjectType.Match) === ObjectType.Tree ||
				(o2[nodes.bottomLeft] & ObjectType.Match) === ObjectType.Tree
			) {
				buildSite[i] = isMountainMeadow ? ConstructionSite.OccupiedFlag : ConstructionSite.Flag
				continue
			}

			const radiusNodes = getNodesAtRadius(i, 2, this.width, this.height)
			// check height difference on nodes a step further away
			if (radiusNodes.some((nodeIndex) => Math.abs(nodeHeight - heightMap[nodeIndex]) > 2)) {
				buildSite[i] = isMountainMeadow ? ConstructionSite.OccupiedHut : ConstructionSite.Hut
				continue
			}

			// nothing prevents building a castle size building!
			buildSite[i] = isMountainMeadow ? ConstructionSite.OccupiedCastle : ConstructionSite.Castle
		}
	}

	/**
	 * Pre-calculated region map stored in a map file. Required by the original game.
	 *
	 * The file format limits us to 250 regions max.
	 */
	updateRegions = () => {
		const allRegions = getAllMapRegions(this)
		const seaRoutes = locateCoastalCastles(this, allRegions)
		const size = this.width * this.height
		const t1 = this.blocks[BlockType.Texture1]

		for (let i = 0; i < size; i++) {
			t1[i] = t1[i] & 0xbf
		}

		const playerLandRegionIds = new Set<number>()

		seaRoutes.forEach((sea) => {
			sea.connections.forEach((castle) => {
				playerLandRegionIds.add(castle.regionId)
				t1[castle.index] = t1[castle.index] | 0x40
			})
		})

		if (playerLandRegionIds.size === 0) {
			const biggestLandRegion = allRegions.reduce<typeof allRegions[number] | null>((current, region) => {
				if (region.type === 'water') return current
				if (current == null) return region
				return current.positions.size >= region.positions.size ? current : region
			}, null)

			if (biggestLandRegion) playerLandRegionIds.add(biggestLandRegion.regionId)
		}

		const regionMap = this.blocks[BlockType.RegionMap]
		regionMap.fill(254)
		this.regions = []

		const regions: Regions = []
		const regionIdToRegionIndex = new Map<number, number>()
		const regionIndexToRegionId = new Map<number, number>()

		let regionIndex = 0

		playerLandRegionIds.forEach((regionId) => {
			// might be a troublesome map for the original game if this condition happens...
			if (regionIndex >= 247) return

			const region = allRegions.find((region) => region.regionId === regionId)!
			regionIdToRegionIndex.set(regionId, regionIndex)
			regionIndexToRegionId.set(regionIndex, regionId)
			const x = region.posIndex % this.width
			const y = Math.round((region.posIndex - x) / this.width)
			regions.push([RegionType.Land, x, y, region.positions.size])
			regionIndex++
		})

		seaRoutes.forEach((region) => {
			// might be a troublesome map for the original game if this condition happens...
			if (regionIndex >= 248) return

			regionIdToRegionIndex.set(region.regionId, regionIndex)
			regionIndexToRegionId.set(regionIndex, region.regionId)
			const x = region.posIndex % this.width
			const y = Math.round((region.posIndex - x) / this.width)
			regions.push([RegionType.Water, x, y, region.size])
			regionIndex++
		})

		const INACCESSIBLE_LAND_INDEX = regionIndex++
		const UNIMPORTANT_WATER_INDEX = regionIndex++

		const inaccessibleLand: Regions[number] = [RegionType.Land, -1, -1, 0]
		const unimportantWater: Regions[number] = [RegionType.Water, -1, -1, 0]

		allRegions.forEach((region) => {
			let regionIndex = regionIdToRegionIndex.get(region.regionId)

			if (regionIndex == null) {
				if (region.type === 'water') {
					if (unimportantWater[1] === -1) {
						const x = region.posIndex % this.width
						const y = Math.round((region.posIndex - x) / this.width)
						unimportantWater[1] = x
						unimportantWater[2] = y
					}
					unimportantWater[3] += region.positions.size
					regionIndex = UNIMPORTANT_WATER_INDEX
				} else if (region.type === 'ground') {
					if (inaccessibleLand[1] === -1) {
						const x = region.posIndex % this.width
						const y = Math.round((region.posIndex - x) / this.width)
						inaccessibleLand[1] = x
						inaccessibleLand[2] = y
					}
					inaccessibleLand[3] += region.positions.size
					regionIndex = INACCESSIBLE_LAND_INDEX
				}
			}

			if (regionIndex == null) {
				return
			}

			const rIndex = regionIndex

			region.positions.forEach((index) => {
				regionMap[index] = rIndex
			})
		})

		if (
			inaccessibleLand[1] >= 0 &&
			inaccessibleLand[1] < this.width &&
			inaccessibleLand[2] >= 0 &&
			inaccessibleLand[2] < this.height
		) {
			regions.push(inaccessibleLand)
		} else {
			regions.push([RegionType.Unused, 0, 0, 0])
		}

		if (
			unimportantWater[1] >= 0 &&
			unimportantWater[1] < this.width &&
			unimportantWater[2] >= 0 &&
			unimportantWater[2] < this.height
		) {
			regions.push(unimportantWater)
		}

		this.regions = regions
	}

	/**
	 * Pre-calculated light map stored in a map file. Required by the original game.
	 *
	 * Calculated based on height map block.
	 */
	updateLightMap = () => {
		const size = this.width * this.height
		const heightMap = this.blocks[BlockType.HeightMap]
		const lightMap = this.blocks[BlockType.LightMap]
		heightMap.forEach((height, index) => {
			let shade = 0x40
			const around = getNodesByIndex(index, this.width, this.height)
			const aroundLeft = getNodesByIndex(around.left, this.width, this.height)
			shade += 9 * (heightMap[around.topRight] - height)
			shade -= 6 * (heightMap[around.left] - height)
			shade -= 3 * (heightMap[aroundLeft.left] - height)
			shade -= 9 * (heightMap[aroundLeft.bottomLeft] - height)
			lightMap[index] = Math.max(0, Math.min(shade, 128))
		})
	}

	/** Use to import regions from `CONTI###.DAT` files for `WORLD###.DAT` files. */
	setRegions = (view: DataView) => {
		if (view.byteLength !== 2250) {
			throw new NotMapError(`Filesize does not match CONTI###.DAT format (2250 bytes)`)
		}

		const width = this.width
		const height = this.height
		const size = width * height

		const regions: Regions = []
		for (let i = 0; i < 2250; i += 9) {
			const regionType = view.getUint8(i)
			const regionX = view.getUint16(1 + i, true)
			const regionY = view.getUint16(3 + i, true)
			const regionSize = view.getUint32(5 + i, true)
			// end of valid data?
			if (regionType === 0 && regionX === 0 && regionY === 0 && regionSize === 0) {
				break
			}
			// garbage?
			if (regionType > 2 || regionX >= width || regionY >= height || regionSize >= size) {
				throw new NotMapError(`Given region data is invalid for current map`)
			}
			regions.push([regionType, regionX, regionY, regionSize])
		}
		this.regions = regions
	}

	getFileBuffer = ({
		cleanup = false,
		format = 'SWD',
	}: {
		cleanup?: boolean
		format: 'WLD' | 'SWD' | 'CONTI.DAT' | 'WORLD.DAT'
	}): ArrayBuffer => {
		const size = this.width * this.height

		if (format === 'CONTI.DAT') {
			const buffer = new ArrayBuffer(2250)
			const view = new DataView(buffer)

			this.regions.slice(0, 250).forEach(([regionType, regionX, regionY, regionSize], index) => {
				const offset = index * 9
				view.setUint8(offset, regionType)
				view.setUint16(1 + offset, regionX, true)
				view.setUint16(3 + offset, regionY, true)
				view.setUint32(5 + offset, regionSize, true)
			})

			return buffer
		}

		if (format === 'WORLD.DAT') {
			// short header is 14 bytes, each block is 4 bytes block header + block data
			const filesize = 14 + (size + 4) * 14
			const buffer = new ArrayBuffer(filesize)
			const view = new DataView(buffer)
			view.setUint16(0, 0x1127, false)
			view.setUint32(2, 0xffffffff)
			view.setUint32(6, 0)
			view.setUint16(10, this.width, true)
			view.setUint16(12, this.height, true)

			for (let blockIndex: BlockType = 0; blockIndex < 14; blockIndex++) {
				const startIndex = 14 + blockIndex * (size + 4)
				view.setUint32(startIndex, size, true)
				const target = new Uint8Array(buffer, startIndex + 4, size)
				const source = this.blocks[blockIndex]
				target.set(source)
			}

			return buffer
		}

		const sourceBlocks = cleanup ? sanitizeSwdBlocks({ world: this }) : this.blocks

		const animalSet = this.animals.reduce((animals, [_type, x, y]) => {
			const index = x + y * this.width
			animals.add(index)
			return animals
		}, new Set())

		const animals: Animals = sourceBlocks[BlockType.Animal]
			.reduce(
				(animals, type, index) => {
					if (type > 0 && type < 10) {
						if (!animalSet.has(index)) {
							const x = index % this.width
							const y = (index - x) / this.width
							animals.push([type, x, y])
						}
					}
					return animals
				},
				[...this.animals]
			)
			.sort((a, b) => a[2] - b[2] || a[1] - b[1] || a[0] - b[0])

		const footerSize = animals.length * 5
		const filesize = 0x930 + (size + 16) * 14 + footerSize + 1
		const buffer = new ArrayBuffer(filesize)
		const view = new DataView(buffer)

		// width and height might get overwritten by title so write them first
		view.setUint16(30, this.width, true)
		view.setUint16(32, this.height, true)
		view.setUint8(34, this.terrain)
		view.setUint8(35, this.playerCount)

		// allow title to be 20, 23, or 24 bytes long depending on conditions
		const maxTitleLength = format === 'WLD' ? 23 + (this.terrain === 0 ? 1 : 0) : 20
		const titleBuffer = new Uint8Array(buffer, 0, 10 + maxTitleLength)
		titleBuffer.set(stringToCp437(`WORLD_V1.0${this.title || 'Untitled'}`))
		// ensure NULL character to indicate end of string for the original game
		// view.setUint8(10 + maxTitleLength, 0)

		const authorBuffer = new Uint8Array(buffer, 36, 20)
		authorBuffer.set(stringToCp437(this.author || `MapGen@Settlers2Net`))
		// view.setUint8(55, 0)

		const hqX = new Uint16Array(buffer, 56, 7)
		hqX.set(this.hqX)
		const hqY = new Uint16Array(buffer, 70, 7)
		hqY.set(this.hqY)
		view.setUint8(84, this.validationFlag)
		const leader = new Uint8Array(buffer, 85, 7)
		leader.set(this.leader)

		this.regions.slice(0, 250).forEach(([regionType, regionX, regionY, regionSize], index) => {
			const offset = index * 9
			view.setUint8(92 + offset, regionType)
			view.setUint16(93 + offset, regionX, true)
			view.setUint16(95 + offset, regionY, true)
			view.setUint32(97 + offset, regionSize, true)
		})

		view.setUint16(0x926, 0x1127, false)
		view.setUint32(0x928, 0)
		view.setUint16(0x92c, this.width, true)
		view.setUint16(0x92e, this.height, true)

		const blocksSize = (16 + size) * 14
		const blocks = new Uint8Array(buffer, 0x930, blocksSize)

		for (let blockIndex: BlockType = 0; blockIndex < 14; blockIndex++) {
			const offset = blockIndex * (16 + size)
			// block header
			view.setUint16(0x930 + offset, 0x1027, false)
			view.setUint32(0x932 + offset, 0)
			view.setUint16(0x936 + offset, this.width, true)
			view.setUint16(0x938 + offset, this.height, true)
			view.setUint16(0x93a + offset, 1, true)
			view.setUint32(0x93c + offset, size, true)
			// block data
			const source = sourceBlocks[blockIndex]
			blocks.set(source, offset + 16)
		}

		const footerIndex = 0x930 + blocksSize

		animals.forEach(([animalType, animalX, animalY], index) => {
			const offset = footerIndex + 5 * index
			view.setUint8(offset, animalType)
			view.setUint16(offset + 1, animalX, true)
			view.setUint16(offset + 3, animalY, true)
		})

		// mark end of file
		view.setUint8(footerIndex + footerSize, 0xff)
		return buffer
	}

	getHarbourMap = () => {
		return this.blocks[BlockType.Texture1].reduce<Map<number, number>>((map, value, index) => {
			if (value & 0x40) {
				const regionId = this.blocks[BlockType.RegionMap][index]
				const total = map.get(regionId) || 0
				map.set(regionId, total + 1)
			}
			return map
		}, new Map())
	}

	draw = (index: number, tex: Texture, flag?: TextureFeatureFlag) => {
		const tex1 = this.blocks[BlockType.Texture1]
		const tex2 = this.blocks[BlockType.Texture2]
		const nodes = getTextureNodesByIndex(index, this.width, this.height)
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

	setTree = (index: number, tree: SupportedTree, frame: number = 0) => {
		const buildSite = this.blocks[BlockType.BuildSite]
		if (buildSite[index] === ConstructionSite.Impassable) return

		const objIndex = ((tree & 3) << 6) | 0x30 | (frame & 7)
		const objType = ObjectType.Tree | (tree >> 2)
		this.blocks[BlockType.Object1][index] = objIndex
		this.blocks[BlockType.Object2][index] = objType

		buildSite[index] = ConstructionSite.Tree
		const nodes = getNodesByIndex(index, this.width, this.height)
		const site = buildSite[nodes.topLeft] | ConstructionSite.Occupied
		if (site >= ConstructionSite.OccupiedHut && site <= ConstructionSite.OccupiedCastle) {
			buildSite[nodes.topLeft] = ConstructionSite.Flag | (buildSite[nodes.topLeft] & ConstructionSite.Occupied)
		}
		[nodes.topRight, nodes.right, nodes.bottomRight, nodes.bottomLeft, nodes.left].forEach(index => {
			const site = buildSite[index] | ConstructionSite.Occupied
			if (site > ConstructionSite.OccupiedHut && site <= ConstructionSite.OccupiedCastle) {
				buildSite[index] = ConstructionSite.Hut | (buildSite[index] & ConstructionSite.Occupied)
			}
		})
	}

	setGranite = (index: number, type: 0 | 1, quantity: number = 7) => {
		if (quantity === 0) return

		const buildSite = this.blocks[BlockType.BuildSite]
		if (buildSite[index] === ConstructionSite.Impassable) return

		const objIndex = quantity & 7
		const objType = ObjectType.Granite | (type & 1)
		this.blocks[BlockType.Object1][index] = objIndex
		this.blocks[BlockType.Object2][index] = objType

		buildSite[index] = ConstructionSite.Impassable

		const nodes = getNodesAtRadius(index, 1, this.width, this.height)
		nodes.forEach((index) => {
			const site = buildSite[index] | ConstructionSite.Occupied
			if (site >= ConstructionSite.OccupiedHut && site <= ConstructionSite.OccupiedMine) {
				buildSite[index] = ConstructionSite.OccupiedFlag
			}
		})
	}

	/** Warning: incomplete method. You should re-calculate building sites */
	setDecorativeObject = (index: number, objectType: C8ObjectType) => {
		const buildSite = this.blocks[BlockType.BuildSite]

		switch (objectType) {
			case C8ObjectType.BigStone:
			case C8ObjectType.ClosedGateway:
			case C8ObjectType.OpenGateway:
			case C8ObjectType.Snowman:
			case C8ObjectType.GFX1:
			case C8ObjectType.GFX1_clone:
			case C8ObjectType.GFX1_extra:
			case C8ObjectType.GFX2:
			case C8ObjectType.GFX2_extra:
			case C8ObjectType.GFX3:
			case C8ObjectType.GFX3_extra:
			case C8ObjectType.GFX4:
			case C8ObjectType.GFX4_extra:
			case C8ObjectType.GFX5:
			case C8ObjectType.GFX5_extra:
			case C8ObjectType.GFX6:
			case C8ObjectType.GFX7:
			case C8ObjectType.GFX8:
			case C8ObjectType.GFX9:
			case C8ObjectType.GFX10: {
				buildSite[index] = ConstructionSite.Impassable

				const nodes = getNodesByIndex(index, this.width, this.height)
				const site = buildSite[nodes.topLeft] | ConstructionSite.Occupied
				if (site >= ConstructionSite.OccupiedHut && site <= ConstructionSite.OccupiedCastle) {
					buildSite[nodes.topLeft] =
						ConstructionSite.Flag | (buildSite[nodes.topLeft] & ConstructionSite.Occupied)
				}
				break
			}

			// TODO: write a proper construction site logic that works on a per node basis
			default: {
			}
		}

		this.blocks[BlockType.Object1][index] = objectType
		this.blocks[BlockType.Object2][index] = 0xc8
	}

	getNewMap = (blocks: BlockType[]) => {
		const cloneMap = new MapClass({ width: this.width, height: this.height })
		blocks.forEach((blockType) => {
			cloneMap.blocks[blockType].set(this.blocks[blockType])
		})

		if (blocks.includes(BlockType.RegionMap)) {
			cloneMap.regions = this.regions.slice()
		}

		cloneMap.hqX = this.hqX.slice()
		cloneMap.hqY = this.hqY.slice()
		cloneMap.leader = this.leader.slice()
		cloneMap.playerCount = this.playerCount
		cloneMap.terrain = this.terrain
		cloneMap.title = this.title
		cloneMap.author = this.author

		return cloneMap
	}

	getPlayerData = () => {
		return this.hqX
			.map((x, index) => ({ player: index + 1, x, y: this.hqY[index] }))
			.filter((item) => item.x !== 0xffff && item.y !== 0xffff)
			.map((item) => {
				const index = item.y * this.width + item.x
				return { ...item, index, region: this.blocks[BlockType.RegionMap][index] }
			})
	}
}
