import { Texture } from './types'

// FIXME: implement CompressionStream once Firefox and Safari support it
import palette0 from './textures/0_GREENLAND.BBM?uint8array'
import palette1 from './textures/1_WASTELAND.BBM?uint8array'
import palette2 from './textures/2_WINTER_WORLD.BBM?uint8array'
import gfx0 from './textures/0_GREENLAND.LBM?uint8array'
import gfx0_152 from './textures/0_GREENLAND_PATCH_152.LBM?uint8array'
import gfx0jungle from './textures/0_JUNGLE.LBM?uint8array'
import gfx0new from './textures/0_NEW_GREENLAND.LBM?uint8array'
import gfx1 from './textures/1_WASTELAND.LBM?uint8array'
import gfx2 from './textures/2_WINTER_WORLD.LBM?uint8array'
//import palette0Alt from './textures/0_WETLANDS.BBM?uint8array'
import gfx0Alt from './textures/0_WETLANDS.LBM?uint8array'
//import palette1Alt from './textures/1_RUSTY_VALLEY.BBM?uint8array'
import gfx1Alt from './textures/1_RUSTY_VALLEY.LBM?uint8array'
//import palette2Alt from './textures/2_POLAR_NIGHT.BBM?uint8array'
import gfx2Alt from './textures/2_POLAR_NIGHT.LBM?uint8array'
import { getAmigaImage, getAmigaPalette } from './textures/ilbm'
import { SupportedTexture } from './textures'

export type TextureGfxSet = Exclude<ReturnType<typeof getAmigaImage>, false> & { palette: ArrayBuffer }

const lies = { width: 0, height: 0, body: new ArrayBuffer(0) }

export const textureGfxSet: Record<SupportedTexture, TextureGfxSet> = {
	[SupportedTexture.Greenland]: {
		...(getAmigaImage(gfx0) || lies),
		palette: getAmigaPalette(palette0) || new ArrayBuffer(0),
	},
	[SupportedTexture.Wasteland]: {
		...(getAmigaImage(gfx1) || lies),
		palette: getAmigaPalette(palette1) || new ArrayBuffer(0),
	},
	[SupportedTexture.WinterWorld]: {
		...(getAmigaImage(gfx2) || lies),
		palette: getAmigaPalette(palette2) || new ArrayBuffer(0),
	},
	[SupportedTexture.GreenlandPatch152]: {
		...(getAmigaImage(gfx0_152) || lies),
		palette: getAmigaPalette(palette0) || new ArrayBuffer(0),
	},
	[SupportedTexture.NewGreenland]: {
		...(getAmigaImage(gfx0new) || lies),
		palette: getAmigaPalette(gfx0new) || new ArrayBuffer(0),
	},
	[SupportedTexture.Jungle]: {
		...(getAmigaImage(gfx0jungle) || lies),
		palette: getAmigaPalette(palette0) || new ArrayBuffer(0),
	},
	[SupportedTexture.Wetlands]: {
		...(getAmigaImage(gfx0Alt) || lies),
		palette: getAmigaPalette(gfx0Alt) || new ArrayBuffer(0),
	},
	[SupportedTexture.RustyValley]: {
		...(getAmigaImage(gfx1Alt) || lies),
		palette: getAmigaPalette(gfx1Alt) || new ArrayBuffer(0),
	},
	[SupportedTexture.PolarNight]: {
		...(getAmigaImage(gfx2Alt) || lies),
		palette: getAmigaPalette(gfx2Alt) || new ArrayBuffer(0),
	},
}

interface GFXOptions {
	canvas: HTMLCanvasElement
	width: number
	height: number
	body: ArrayBuffer
	palette: ArrayBuffer
}

/** Render the entire raw texture image */
export function gfxToCanvas({ canvas, width, height, body, palette }: GFXOptions) {
	const buffer = canvas.getContext('2d')
	if (!buffer) throw new Error('Could not get canvas')
	const imageData = buffer.getImageData(0, 0, width, height)
	const image = imageData.data

	const imgData = new Uint8Array(body)
	const palData = new Uint8Array(palette)

	for (let i = 0; i < body.byteLength; i++) {
		const palIndex = imgData[i]
		image[i * 4] = palData[palIndex * 4]
		image[i * 4 + 1] = palData[palIndex * 4 + 1]
		image[i * 4 + 2] = palData[palIndex * 4 + 2]
		image[i * 4 + 3] = 255
	}

	buffer.putImageData(imageData, 0, 0)
}

interface TextureOptions extends GFXOptions {
	gfx: TextureGfx
}

export function renderTextureToCanvas({ canvas, width, body, palette, gfx }: TextureOptions) {
	const buffer = canvas.getContext('2d')
	if (!buffer) throw new Error('Could not get canvas')
	const imageData = buffer.getImageData(0, 0, gfx.type === 'high-res' ? 54 : 32, gfx.type === 'high-res' ? 27 : 32)
	const image = imageData.data

	const imgData = new Uint8Array(body)
	const palData = new Uint8Array(palette)

	switch (gfx.type) {
		case 'normal': {
			for (let y = gfx.y, target = 0; y < gfx.y + gfx.height; y++) {
				const sourceIndex = y * width

				for (let x = gfx.x; x < gfx.x + gfx.width; x++, target += 4) {
					const palIndex = imgData[sourceIndex + x]
					image[target] = palData[palIndex * 4]
					image[target + 1] = palData[palIndex * 4 + 1]
					image[target + 2] = palData[palIndex * 4 + 2]
					image[target + 3] = 255
				}
			}

			break
		}

		case 'high-res': {
			const startX = gfx.x + (gfx.width >>> 1)
			const startY = gfx.y + gfx.height - 1
			const size = gfx.height >>> 1

			for (let y = startY, x = startX, target = 0; y > startY - size; y--, x += size + 1) {
				for (let rmX = 0; rmX < 27; rmX++, x--) {
					let palIndex = imgData[(y - rmX) * width + x]
					image[target] = palData[palIndex * 4]
					image[target + 1] = palData[palIndex * 4 + 1]
					image[target + 2] = palData[palIndex * 4 + 2]
					image[target + 3] = 255
					target += 4
					palIndex = imgData[(y - rmX - 1) * width + x]
					image[target] = palData[palIndex * 4]
					image[target + 1] = palData[palIndex * 4 + 1]
					image[target + 2] = palData[palIndex * 4 + 2]
					image[target + 3] = 255
					target += 4
				}
			}

			break
		}

		case 'low-res': {
			const size = (gfx.width >>> 1) + 1
			const ySize = (gfx.height >>> 1) + 1
			const startX = gfx.x + size
			const startY = gfx.y

			for (let y = startY, target = 0, xCut = 0; y < startY + size; y++, xCut++) {
				for (let x = startX; x < startX + size; x++) {
					const cut = x - startX < xCut
					const palIndex = imgData[(y + (cut ? 0 : ySize)) * width + x - (cut ? 0 : size)]
					image[target] = palData[palIndex * 4]
					image[target + 1] = palData[palIndex * 4 + 1]
					image[target + 2] = palData[palIndex * 4 + 2]
					image[target + 3] = 255
					target += 4
				}
				for (let x = startX; x < startX + size; x++) {
					const cut = x - startX < size - xCut - 1
					const palIndex = imgData[(y + (cut ? ySize : 0)) * width + x - (cut ? 0 : size)]
					image[target] = palData[palIndex * 4]
					image[target + 1] = palData[palIndex * 4 + 1]
					image[target + 2] = palData[palIndex * 4 + 2]
					image[target + 3] = 255
					target += 4
				}
			}

			break
		}
	}

	buffer.putImageData(imageData, 0, 0)
}

export interface TextureGfx {
	x: number
	y: number
	width: number
	height: number
	type: 'normal' | 'low-res' | 'high-res'
	renderWidth?: number
	renderHeight?: number
	paletteIndex?: number
}

const normal1: TextureGfx = { x: 0, y: 0, height: 32, width: 32, type: 'normal' }
const normal2: TextureGfx = { x: 48, y: 0, height: 32, width: 32, type: 'normal' }
const normal3: TextureGfx = { x: 96, y: 0, height: 32, width: 32, type: 'normal' }
const normal4: TextureGfx = { x: 144, y: 0, height: 32, width: 32, type: 'normal' }
const normal5: TextureGfx = { x: 0, y: 48, height: 32, width: 32, type: 'normal' }
const normal6: TextureGfx = { x: 48, y: 48, height: 32, width: 32, type: 'normal' }
const normal7: TextureGfx = { x: 96, y: 48, height: 32, width: 32, type: 'normal' }
const normal8: TextureGfx = { x: 144, y: 48, height: 32, width: 32, type: 'normal' }
const normal9: TextureGfx = { x: 0, y: 96, height: 32, width: 32, type: 'normal' }
const normalA: TextureGfx = { x: 48, y: 96, height: 32, width: 32, type: 'normal' }
const normalB: TextureGfx = { x: 96, y: 96, height: 32, width: 32, type: 'normal' }
const normalC: TextureGfx = { x: 144, y: 96, height: 32, width: 32, type: 'normal' }
const normalD: TextureGfx = { x: 0, y: 144, height: 32, width: 32, type: 'normal' }
const normalE: TextureGfx = { x: 48, y: 144, height: 32, width: 32, type: 'normal' }
const pixelGfx: TextureGfx = { x: 0, y: 254, height: 1, width: 1, type: 'normal' }
const garbageGfx: TextureGfx = { x: 0, y: 255, height: 1, width: 1, type: 'normal' }
// water + lava
const highRes1: TextureGfx = {
	x: 193,
	y: 49,
	height: 54,
	width: 53,
	renderWidth: 54,
	renderHeight: 27,
	type: 'high-res',
	paletteIndex: 240
}
const highRes2: TextureGfx = {
	x: 193,
	y: 105,
	height: 54,
	width: 53,
	renderWidth: 54,
	renderHeight: 27,
	type: 'high-res',
	paletteIndex: 57
}
// lava + lava + lava
const lowRes1: TextureGfx = { x: 66, y: 222, height: 33, width: 31, renderWidth: 32, renderHeight: 16, type: 'low-res', paletteIndex: 57 }
const lowRes2: TextureGfx = { x: 99, y: 222, height: 33, width: 31, renderWidth: 32, renderHeight: 16, type: 'low-res', paletteIndex: 57 }
const lowRes3: TextureGfx = {
	x: 132,
	y: 222,
	height: 33,
	width: 31,
	renderWidth: 32,
	renderHeight: 16,
	type: 'low-res',
	paletteIndex: 57
}

export const texturePos: Map<Exclude<Texture, Texture.HouselessAlt>, TextureGfx> = new Map([
	[Texture.UnbuildableWater, highRes1],
	[Texture.Houseless, normal2],
	[Texture.Fertile5, normalD],
	[Texture.Fertile1, normal9],
	[Texture.Fertile2, normalA],
	[Texture.Fertile3, normalB],
	[Texture.Fertile4, normalC],
	[Texture.Fertile6, normal4],
	[Texture.FertileMining, normal6],
	[Texture.Buildable, normalE],
	[Texture.Mining1, normal5],
	[Texture.Mining2, normal6],
	[Texture.Mining3, normal7],
	[Texture.Mining4, normal8],
	[Texture.BuildableWater, highRes1],
	[Texture.Inaccessible, normal1],
	[Texture.UnbuildableLand, normal3],
	[Texture.InaccessibleLava, highRes2],
	[Texture.InaccessibleLavaLowRes1, lowRes1],
	[Texture.InaccessibleLavaLowRes2, lowRes2],
	[Texture.InaccessibleLavaLowRes3, lowRes3],
	[Texture.InaccessibleWater, highRes1],
	[Texture.HouselessSingleColor, pixelGfx],
	// [Texture.HouselessAlt]: normal2,
])

type TextureEdge = 'A' | 'B' | 'C' | 'D' | 'E' | null

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export type UniqueTextureId = Range<0x00, 0x40>

// TODO: texture priorities, which draw textures over which, which are equal?
// FIXME: edges need to be validated against s2 & s2edit - ideally every texture against each other one... much boring
export const TextureData: Record<UniqueTextureId, { gfx: TextureGfx, edge0: TextureEdge, edge1: TextureEdge, edge2: TextureEdge }> = {
	0x00: { gfx: normal9, edge0: 'D', edge1: 'D', edge2: 'D' },
	0x01: { gfx: normal5, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x02: { gfx: normal1, edge0: 'A', edge1: null, edge2: 'E' },
	0x03: { gfx: normal3, edge0: 'D', edge1: 'A', edge2: 'E' },
	0x04: { gfx: normal2, edge0: 'C', edge1: 'C', edge2: 'C' },
	0x05: { gfx: highRes1, edge0: 'A', edge1: 'B', edge2: 'E' },
	0x06: { gfx: highRes1, edge0: 'A', edge1: 'B', edge2: 'E' },
	0x07: { gfx: normal2, edge0: 'D', edge1: 'A', edge2: 'C' },
	0x08: { gfx: normalA, edge0: 'D', edge1: 'D', edge2: 'D' },
	0x09: { gfx: normalB, edge0: 'D', edge1: 'D', edge2: 'D' },
	0x0a: { gfx: normalC, edge0: 'D', edge1: 'D', edge2: 'D' },
	0x0b: { gfx: normal6, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x0c: { gfx: normal7, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x0d: { gfx: normal8, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x0e: { gfx: normalD, edge0: 'C', edge1: 'C', edge2: 'D' },
	0x0f: { gfx: normal4, edge0: 'D', edge1: 'D', edge2: 'D' },
	0x10: { gfx: highRes2, edge0: null, edge1: null, edge2: null },
	0x11: { gfx: pixelGfx, edge0: null, edge1: null, edge2: null },
	0x12: { gfx: normalE, edge0: 'B', edge1: 'A', edge2: 'A' },
	0x13: { gfx: highRes1, edge0: 'E', edge1: null, edge2: 'E' },
	0x14: { gfx: lowRes1, edge0: null, edge1: null, edge2: null },
	0x15: { gfx: lowRes2, edge0: null, edge1: null, edge2: null },
	0x16: { gfx: lowRes3, edge0: null, edge1: null, edge2: null },
	// 0x17 ... 0x21 not supported by RttR
	0x17: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x18: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x19: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x1A: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x1B: { gfx: normal6, edge0: 'A', edge1: null, edge2: 'E' },
	0x1C: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x1D: { gfx: normal6, edge0: 'A', edge1: null, edge2: 'E' },
	0x1E: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x1F: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x20: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x21: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	// Supported
	0x22: { gfx: normal6, edge0: 'B', edge1: 'D', edge2: 'B' },
	// 0x23 ... 0x3F not supported by RttR
	0x23: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x24: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x25: { gfx: normal5, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x26: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x27: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x28: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x29: { gfx: normal6, edge0: 'A', edge1: null, edge2: 'E' },
	0x2A: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x2B: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x2C: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x2D: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x2E: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x2F: { gfx: normal5, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x30: { gfx: normal6, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x31: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x32: { gfx: normal6, edge0: 'A', edge1: null, edge2: 'E' },
	0x33: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x34: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x35: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x36: { gfx: normal5, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x37: { gfx: normal6, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x38: { gfx: normal6, edge0: 'B', edge1: 'D', edge2: 'B' },
	0x39: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x3A: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x3B: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x3C: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
	0x3D: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x3E: { gfx: garbageGfx, edge0: null, edge1: null, edge2: null },
	0x3F: { gfx: normal5, edge0: 'A', edge1: null, edge2: 'E' },
} as const

export type TextureData = typeof TextureData[keyof typeof TextureData]
