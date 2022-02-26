import { cp437ToString, stringToCp437 } from './cp437'
import {
	BlockType,
	RegionType,
	TextureFlag,
	Texture,
	TextureFeatureFlag,
	Textures,
	ObjectType,
	ConstructionSite,
} from './types'

const BLOCKS = 14

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

function getNodesAtRadius(index: number, radius: number, width: number, height: number) {
	if (radius < 1) throw new Error('Radius must be 1 or more')
	const maxRadius = Math.floor((Math.min(width, height) - 2) / 2)
	if (radius > maxRadius) throw new Error('Maximum radius is ' + maxRadius)
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
	bottomLeft: number
	/** Texture2 */
	bottomRight: number
	/** Texture2 */
	top: number
	/* Texture1 */
	bottom: number
	/* Texture1 */
	topLeft: number
	/* Texture1 */
	topRight: number
}

function getTextureNodesByIndex(index: number, width: number, height: number): TextureNodes {
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
			bottomLeft: y + xL,
			bottom: index,
			bottomRight: index,
			topLeft: yT + x,
			top: yT + x,
			topRight: yT + xR,
		}
	} else {
		return {
			bottomLeft: y + xL,
			bottom: index,
			bottomRight: index,
			topLeft: yT + xL,
			top: yT + xL,
			topRight: yT + x,
		}
	}
}

interface WidthHeight {
	width: number
	height: number
}

type Options = WidthHeight | { fileContents: DataView }
type Regions = [RegionType, number, number, number][]
type Animals = [number, number, number][]

export class NotMapError extends Error {}

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
		[BlockType.RegionMap]: null,
	}
	fileBuffer: ArrayBuffer | null = null
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
			this.blocks[index] = new DataView(this.fileBuffer, ~~index * size, size)
		})
		new Uint8Array(this.blocks[BlockType.UnknownFill7].buffer).fill(7)
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
			this.terrain = view.getUint8(34)
			this.playerCount = view.getUint8(35)
			const isGreenland = this.terrain === 0
			// normal title maximum length is 19, but the game reads bytes until it finds a null character
			const maxTitleLength = 19 + (isLongTitle ? (isGreenland ? 5 : 4) : 0)
			this.title = cp437ToString(new Uint8Array(view.buffer, 10, maxTitleLength))
			this.author = cp437ToString(new Uint8Array(view.buffer, 36, 19))
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
				if (regionType === 0 || regionType > 2 || regionX >= width || regionY >= height || regionSize >= size) {
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

			const target = new Uint8Array(
				this.blocks[blockIndex].buffer,
				this.blocks[blockIndex].byteOffset,
				this.blocks[blockIndex].byteLength
			)
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
							this.log.push(
								`Uncompression error in block index ${blockIndex}: invalid to copy zero bytes`
							)
						}
						const byteToCopy = source[++i]
						target.fill(byteToCopy, writePos, writePos + count)
						writePos += count
					} else {
						target[writePos++] = currentByte
					}
				}
			}
		}

		const footerSize = view.byteLength - readIndex

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
			const animalY = view.getUint16(readIndex + 1, true)
			const animalX = view.getUint16(readIndex + 3, true)
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

	private isEachTextureSame(index: number, texture: Texture) {
		const t1 = this.blocks[BlockType.Texture1]
		const t2 = this.blocks[BlockType.Texture2]
		const nodes = getTextureNodesByIndex(index, this.width, this.height)

		const bottomLeft = t2.getUint8(nodes.bottomLeft) & TextureFlag.ToIdValue
		if (bottomLeft !== texture) return false

		const bottomRight = t2.getUint8(nodes.bottomRight) & TextureFlag.ToIdValue
		if (bottomRight !== texture) return false

		const top = t2.getUint8(nodes.top) & TextureFlag.ToIdValue
		if (top !== texture) return false

		const topLeft = t1.getUint8(nodes.topLeft) & TextureFlag.ToIdValue
		if (topLeft !== texture) return false

		const topRight = t1.getUint8(nodes.topRight) & TextureFlag.ToIdValue
		if (topRight !== texture) return false

		const bottom = t1.getUint8(nodes.bottom) & TextureFlag.ToIdValue
		if (bottom !== texture) return false

		return true
	}

	private isEachTextureWithAnyOfFlags(index: number, flags: TextureFeatureFlag) {
		const t1 = this.blocks[BlockType.Texture1]
		const t2 = this.blocks[BlockType.Texture2]
		const nodes = getTextureNodesByIndex(index, this.width, this.height)

		const bottomLeft = Textures.get(t2.getUint8(nodes.bottomLeft) & TextureFlag.ToIdValue).featureFlags & flags
		if (bottomLeft === 0) return false

		const bottomRight = Textures.get(t2.getUint8(nodes.bottomRight) & TextureFlag.ToIdValue).featureFlags & flags
		if (bottomRight === 0) return false

		const top = Textures.get(t2.getUint8(nodes.top) & TextureFlag.ToIdValue).featureFlags & flags
		if (top === 0) return false

		const topLeft = Textures.get(t1.getUint8(nodes.topLeft) & TextureFlag.ToIdValue).featureFlags & flags
		if (topLeft === 0) return false

		const topRight = Textures.get(t1.getUint8(nodes.topRight) & TextureFlag.ToIdValue).featureFlags & flags
		if (topRight === 0) return false

		const bottom = Textures.get(t1.getUint8(nodes.bottom) & TextureFlag.ToIdValue).featureFlags & flags
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
		const heightMap = new Uint8Array(
			this.blocks[BlockType.HeightMap].buffer,
			this.blocks[BlockType.HeightMap].byteOffset,
			size
		)
		const t1 = new Uint8Array(
			this.blocks[BlockType.Texture1].buffer,
			this.blocks[BlockType.Texture1].byteOffset,
			size
		)
		const t2 = new Uint8Array(
			this.blocks[BlockType.Texture2].buffer,
			this.blocks[BlockType.Texture2].byteOffset,
			size
		)
		const o2 = new Uint8Array(
			this.blocks[BlockType.Object2].buffer,
			this.blocks[BlockType.Object2].byteOffset,
			size
		)
		// output to
		const buildSite = new Uint8Array(
			this.blocks[BlockType.BuildSite].buffer,
			this.blocks[BlockType.BuildSite].byteOffset,
			size
		)

		for (let i = 0; i < size; i++) {
			const nodes = getNodesByIndex(i, this.width, this.height)
			const tn1 = getTextureNodesByIndex(i, this.width, this.height)
			const tn2 = getTextureNodesByIndex(nodes.bottomRight, this.width, this.height)

			const tex1 = t1[tn1.topLeft] & TextureFlag.ToIdValue
			const tex2 = t2[tn1.top] & TextureFlag.ToIdValue
			const tex3 = t1[tn1.topRight] & TextureFlag.ToIdValue
			const tex4 = t2[tn1.bottomLeft] & TextureFlag.ToIdValue
			const tex5 = t1[tn1.bottom] & TextureFlag.ToIdValue
			const tex6 = t2[tn1.bottomRight] & TextureFlag.ToIdValue
			const tex7 = t1[tn2.topRight] & TextureFlag.ToIdValue
			const tex8 = t2[tn2.bottomLeft] & TextureFlag.ToIdValue
			const tex9 = t1[tn2.bottom] & TextureFlag.ToIdValue
			const texA = t2[tn2.bottomRight] & TextureFlag.ToIdValue

			const tex1Flags = Textures.get(tex1).featureFlags
			const tex2Flags = Textures.get(tex2).featureFlags
			const tex3Flags = Textures.get(tex3).featureFlags
			const tex4Flags = Textures.get(tex4).featureFlags
			const tex5Flags = Textures.get(tex5).featureFlags
			const tex6Flags = Textures.get(tex6).featureFlags
			const tex7Flags = Textures.get(tex7).featureFlags
			const tex8Flags = Textures.get(tex8).featureFlags
			const tex9Flags = Textures.get(tex9).featureFlags
			const texAFlags = Textures.get(texA).featureFlags

			// water or swamp texture count
			const wets =
				((tex1Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
				((tex2Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
				((tex3Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
				((tex4Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
				((tex5Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0) +
				((tex6Flags & TextureFeatureFlag.Wet) === TextureFeatureFlag.Wet ? 1 : 0)

			const objectType = o2[i] & ObjectType.Match

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
				(o2[nodes.left] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.right] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.topLeft] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.topRight] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.bottomLeft] & ObjectType.Match) === ObjectType.Granite ||
				(o2[nodes.bottomRight] & ObjectType.Match) === ObjectType.Granite ||
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
					nodeHeight - heightMap[nodes.bottomRight] >= -3 ||
					// snow or lava
					(tex7Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
					(tex8Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
					(tex9Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
					(texAFlags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
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
				(tex7Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
				(tex8Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
				(tex9Flags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme ||
				(texAFlags & TextureFeatureFlag.Extreme) === TextureFeatureFlag.Extreme
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
	 * Calculated based on texture blocks.
	 *
	 * Could be made smarter by accounting for actual harbors (water regions),
	 * and by detecting inaccessible land areas (lack of harbors, no players).
	 *
	 * Smartness is mostly required on maps that may have lots of small inaccessible islands.
	 * The file format limits us to 250 regions max.
	 */
	updateRegions = () => {
		const size = this.width * this.height
		const regionMap = new Uint8Array(
			this.blocks[BlockType.RegionMap].buffer,
			this.blocks[BlockType.RegionMap].byteOffset,
			size
		)
		const indexProcessed = new Set<number>()
		regionMap.fill(0)
		this.regions = []

		// for simplicity use only a single water region
		const waterIndex = 0
		let waterSize = 0
		let waterX: number | undefined
		let waterY: number | undefined
		// remaining are all land regions up to index 249
		let regionIndex = 1
		const regions: Regions = []

		for (let i = 0; i < size; i++) {
			if (indexProcessed.has(i)) continue

			if (this.isEachTextureSame(i, Texture.Water)) {
				if (waterX == null) {
					waterX = i % this.width
					waterY = Math.round((i - waterX) / this.width) || 0
				}
				indexProcessed.add(i)
				regionMap[i] = waterIndex
				waterSize++
				// nodeFlags tells which of six directions is possible to check
				const stack = [{ index: i, nodeFlags: 0x3f }]

				while (stack.length) {
					const item = stack.shift()
					const nodes = getNodesByIndex(item.index, this.width, this.height)

					if (
						(item.nodeFlags & 0x01) === 0x01 &&
						!indexProcessed.has(nodes.left) &&
						this.isEachTextureSame(nodes.left, Texture.Water)
					) {
						indexProcessed.add(nodes.left)
						regionMap[nodes.left] = waterIndex
						waterSize++
						// topLeft, left, bottomLeft
						stack.push({ index: nodes.left, nodeFlags: 0x23 })
					}

					if (
						(item.nodeFlags & 0x02) === 0x02 &&
						!indexProcessed.has(nodes.topLeft) &&
						this.isEachTextureSame(nodes.topLeft, Texture.Water)
					) {
						indexProcessed.add(nodes.topLeft)
						regionMap[nodes.topLeft] = waterIndex
						waterSize++
						// left, topLeft, topRight
						stack.push({ index: nodes.topLeft, nodeFlags: 0x07 })
					}

					if (
						(item.nodeFlags & 0x04) === 0x04 &&
						!indexProcessed.has(nodes.topRight) &&
						this.isEachTextureSame(nodes.topRight, Texture.Water)
					) {
						indexProcessed.add(nodes.topRight)
						regionMap[nodes.topRight] = waterIndex
						waterSize++
						// topLeft, topRight, right
						stack.push({ index: nodes.topRight, nodeFlags: 0x0e })
					}

					if (
						(item.nodeFlags & 0x08) === 0x08 &&
						!indexProcessed.has(nodes.right) &&
						this.isEachTextureSame(nodes.right, Texture.Water)
					) {
						indexProcessed.add(nodes.right)
						regionMap[nodes.right] = waterIndex
						waterSize++
						// topRight, right, bottomRight
						stack.push({ index: nodes.right, nodeFlags: 0x1c })
					}

					if (
						(item.nodeFlags & 0x10) === 0x10 &&
						!indexProcessed.has(nodes.bottomRight) &&
						this.isEachTextureSame(nodes.bottomRight, Texture.Water)
					) {
						indexProcessed.add(nodes.bottomRight)
						regionMap[nodes.bottomRight] = waterIndex
						waterSize++
						// right, bottomRight, bottomLeft
						stack.push({ index: nodes.bottomRight, nodeFlags: 0x38 })
					}

					if (
						(item.nodeFlags & 0x20) === 0x20 &&
						!indexProcessed.has(nodes.bottomLeft) &&
						this.isEachTextureSame(nodes.bottomLeft, Texture.Water)
					) {
						indexProcessed.add(nodes.bottomLeft)
						regionMap[nodes.bottomLeft] = waterIndex
						waterSize++
						// bottomRight, bottomLeft, left
						stack.push({ index: nodes.bottomLeft, nodeFlags: 0x31 })
					}
				}
			} else if (this.isEachTextureWithAnyOfFlags(i, TextureFeatureFlag.Impassable)) {
				indexProcessed.add(i)
				regionMap[i] = RegionType.Impassable
			} else {
				indexProcessed.add(i)
				regionMap[i] = regionIndex
				let regionSize = 1
				// nodeFlags tells which of six directions is possible to check
				const stack = [{ index: i, nodeFlags: 0x3f }]

				while (stack.length) {
					const item = stack.shift()
					const nodes = getNodesByIndex(item.index, this.width, this.height)

					if (
						(item.nodeFlags & 0x01) === 0x01 &&
						!indexProcessed.has(nodes.left) &&
						!this.isEachTextureWithAnyOfFlags(nodes.left, TextureFeatureFlag.Impassable)
					) {
						indexProcessed.add(nodes.left)
						regionMap[nodes.left] = regionIndex
						regionSize++
						// topLeft, left, bottomLeft
						stack.push({ index: nodes.left, nodeFlags: 0x23 })
					}

					if (
						(item.nodeFlags & 0x02) === 0x02 &&
						!indexProcessed.has(nodes.topLeft) &&
						!this.isEachTextureWithAnyOfFlags(nodes.topLeft, TextureFeatureFlag.Impassable)
					) {
						indexProcessed.add(nodes.topLeft)
						regionMap[nodes.topLeft] = regionIndex
						regionSize++
						// left, topLeft, topRight
						stack.push({ index: nodes.topLeft, nodeFlags: 0x07 })
					}

					if (
						(item.nodeFlags & 0x04) === 0x04 &&
						!indexProcessed.has(nodes.topRight) &&
						!this.isEachTextureWithAnyOfFlags(nodes.topRight, TextureFeatureFlag.Impassable)
					) {
						indexProcessed.add(nodes.topRight)
						regionMap[nodes.topRight] = regionIndex
						regionSize++
						// topLeft, topRight, right
						stack.push({ index: nodes.topRight, nodeFlags: 0x0e })
					}

					if (
						(item.nodeFlags & 0x08) === 0x08 &&
						!indexProcessed.has(nodes.right) &&
						!this.isEachTextureWithAnyOfFlags(nodes.right, TextureFeatureFlag.Impassable)
					) {
						indexProcessed.add(nodes.right)
						regionMap[nodes.right] = regionIndex
						regionSize++
						// topRight, right, bottomRight
						stack.push({ index: nodes.right, nodeFlags: 0x1c })
					}

					if (
						(item.nodeFlags & 0x10) === 0x10 &&
						!indexProcessed.has(nodes.bottomRight) &&
						!this.isEachTextureWithAnyOfFlags(nodes.bottomRight, TextureFeatureFlag.Impassable)
					) {
						indexProcessed.add(nodes.bottomRight)
						regionMap[nodes.bottomRight] = regionIndex
						regionSize++
						// right, bottomRight, bottomLeft
						stack.push({ index: nodes.bottomRight, nodeFlags: 0x38 })
					}

					if (
						(item.nodeFlags & 0x20) === 0x20 &&
						!indexProcessed.has(nodes.bottomLeft) &&
						!this.isEachTextureWithAnyOfFlags(nodes.bottomLeft, TextureFeatureFlag.Impassable)
					) {
						indexProcessed.add(nodes.bottomLeft)
						regionMap[nodes.bottomLeft] = regionIndex
						regionSize++
						// bottomRight, bottomLeft, left
						stack.push({ index: nodes.bottomLeft, nodeFlags: 0x31 })
					}
				}

				// keep using index 250 forever for all remaining pieces of land
				if (regionIndex < 250) {
					const x = i % this.width
					const y = Math.round((i - x) / this.width) || 0
					regions.push([RegionType.Land, x, y, regionSize])
					regionIndex++
				}
			}
		}

		regions.unshift([RegionType.Water, waterX, waterY, waterSize])

		this.regions = regions
	}

	/**
	 * Pre-calculated light map stored in a map file. Required by the original game.
	 *
	 * Calculated based on height map block.
	 */
	updateLightMap = () => {
		const size = this.width * this.height
		const heightMap = new Uint8Array(
			this.blocks[BlockType.HeightMap].buffer,
			this.blocks[BlockType.HeightMap].byteOffset,
			size
		)
		const lightMap = new Uint8Array(
			this.blocks[BlockType.LightMap].buffer,
			this.blocks[BlockType.LightMap].byteOffset,
			size
		)
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
			if (regionType === 0 || regionType > 2 || regionX >= width || regionY >= height || regionSize >= size) {
				throw new NotMapError(`Given region data is invalid for current map`)
			}
			regions.push([regionType, regionX, regionY, regionSize])
		}
		this.regions = regions
	}

	getFileBuffer = ({ format = 'SWD' }: { format: 'WLD' | 'SWD' | 'CONTI.DAT' | 'WORLD.DAT' }): ArrayBuffer => {
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
				const source = new Uint8Array(
					this.blocks[blockIndex].buffer,
					this.blocks[blockIndex].byteOffset,
					this.blocks[blockIndex].byteLength
				)
				target.set(source)
			}

			return buffer
		}

		const footerSize = this.animals.length * 5
		const filesize = 0x930 + (size + 16) * 14 + footerSize + 1
		const buffer = new ArrayBuffer(filesize)
		const view = new DataView(buffer)

		// width and height might get overwritten by title so write them first
		view.setUint16(30, this.width, true)
		view.setUint16(32, this.height, true)
		view.setUint8(34, this.terrain)
		view.setUint8(35, this.playerCount)

		// allow title to be 19, 23, or 24 bytes long depending on conditions
		const maxTitleLength = format === 'WLD' ? 23 + (this.terrain === 0 ? 1 : 0) : 19
		const titleBuffer = new Uint8Array(buffer, 0, 10 + maxTitleLength)
		titleBuffer.set(stringToCp437(`WORLD_V1.0${this.title || 'Untitled'}`))
		// ensure NULL character to indicate end of string for the original game
		view.setUint8(10 + maxTitleLength, 0)

		const authorBuffer = new Uint8Array(buffer, 36, 19)
		authorBuffer.set(stringToCp437(this.author || `Merri♥settlers2.net`))
		view.setUint8(55, 0)

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
			const source = new Uint8Array(
				this.blocks[blockIndex].buffer,
				this.blocks[blockIndex].byteOffset,
				this.blocks[blockIndex].byteLength
			)
			blocks.set(source, offset + 16)
		}

		const footerIndex = 0x930 + blocksSize

		this.animals.forEach(([animalType, animalX, animalY], index) => {
			const offset = footerIndex + 5 * index
			view.setUint8(offset, animalType)
			view.setUint16(offset + 1, animalX, true)
			view.setUint16(offset + 3, animalY, true)
		})

		// mark end of file
		view.setUint8(footerIndex + footerSize, 0xff)
		return buffer
	}
}