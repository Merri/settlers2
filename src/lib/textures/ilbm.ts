const IFF_HEADER = 0x464f524d
const PBM_HEADER = 0x50424d20
const ILBM_HEADER = 0x494c424d
const IFF_COLOR_MAP = 0x434d4150
const IFF_BODY = 0x424f4459
const IFF_BITMAP_HEADER = 0x424d4844

export function getAmigaPalette(arrayBuffer: ArrayBuffer) {
	if (!arrayBuffer) return false

	if ('buffer' in arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) arrayBuffer = arrayBuffer.buffer
	if (!(arrayBuffer instanceof ArrayBuffer)) return false

	const read = new DataView(arrayBuffer)
	if (read.getUint32(0, false) !== IFF_HEADER) return false

	const chunkSize = read.getUint32(4, false)
	if (read.byteLength !== chunkSize + 8) return false

	const header = read.getUint32(8, false)
	if (header !== PBM_HEADER && header !== ILBM_HEADER) return false

	let k = 12

	while (k < read.byteLength) {
		if (read.getUint32(k, false) === IFF_COLOR_MAP) break
		const chunkSize = read.getUint32(k + 4, false)
		const jumpSize = chunkSize & 1 ? chunkSize + 1 : chunkSize
		k += jumpSize + 8
	}

	if (k >= read.byteLength) return false

	const paletteSize = read.getUint32(k + 4, false)
	const rgba = new ArrayBuffer((paletteSize / 3) * 4)
	const write = new DataView(rgba)
	const startIndex = k + 8
	const endIndex = startIndex + paletteSize

	for (let i = startIndex, j = 0; i < endIndex; i += 3, j += 4) {
		const red = read.getUint8(i)
		const green = read.getUint8(i + 1)
		const blue = read.getUint8(i + 2)
		write.setUint32(j, (red << 24) | (green << 16) | (blue << 8) | 0xff, false)
	}

	return rgba
}

export function getAmigaImage(arrayBuffer: ArrayBuffer) {
	if (!arrayBuffer) return false

	if ('buffer' in arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) arrayBuffer = arrayBuffer.buffer
	if (!(arrayBuffer instanceof ArrayBuffer)) return false

	const read = new DataView(arrayBuffer)
	if (read.getUint32(0, false) !== IFF_HEADER) return false

	const chunkSize = read.getUint32(4, false)
	if (read.byteLength !== chunkSize + 8) return false

	const header = read.getUint32(8, false)
	if (header !== PBM_HEADER && header !== ILBM_HEADER) return false

	let k = 12
	let width = 0
	let height = 0
	let compression = 0

	while (k < read.byteLength) {
		const chunk = read.getUint32(k, false)
		if (chunk === IFF_BODY) break

		const chunkSize = read.getUint32(k + 4, false)

		if (chunk === IFF_BITMAP_HEADER) {
			width = read.getUint16(k + 8, false)
			height = read.getUint16(k + 10, false)
			compression = read.getUint8(k + 18)
		}

		const jumpSize = chunkSize & 1 ? chunkSize + 1 : chunkSize
		k += jumpSize + 8
	}

	if (k >= read.byteLength) return false

	const size = width * height
	const sizeInFile = read.getUint32(k + 4, false)
	const startIndex = k + 8

	if (compression === 0) {
		if (sizeInFile !== size) return false
		return { width, height, body: arrayBuffer.slice(startIndex, startIndex + sizeInFile) }
	}

	const body = new ArrayBuffer(size)
	const write = new Uint8Array(body)
	const endIndex = startIndex + sizeInFile

	let i = startIndex,
		j = 0

	while (i < endIndex) {
		const value = read.getUint8(i)
		if (value > 128) {
			const len = 257 - value
			const byte = read.getUint8(i + 1)
			write.fill(byte, j, j + len)
			j += len
			i += 2
		} else if (value < 128) {
			const len = value + 1
			i++
			write.set(new Uint8Array(arrayBuffer.slice(i, i + len)), j)
			i += len
			j += len
		} else {
			break
		}
	}

	return { width, height, body }
}
