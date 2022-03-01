import { useEffect, useRef } from 'preact/compat'

import { getNodesByIndex, getTextureNodesByIndex, MapClass } from '$/lib/MapClass'

import styles from './Map.module.css'
import { BlockType, TextureFlag, Trees } from '$/lib/types'
import { palettes, texturePaletteIndex } from '$/lib/palette'

function drawToCanvas(canvas: HTMLCanvasElement, world: MapClass, color1 = 0, color2 = 255) {
	const buffer = canvas.getContext('2d')
	const imageData = buffer.getImageData(0, 0, world.width, world.height)
	const image = imageData.data
	const size = world.width * world.height
	const palette = palettes[world.terrain]
	const texPalette = texturePaletteIndex[world.terrain]
	const heightMap = world.blocks[BlockType.HeightMap]
	const t1 = world.blocks[BlockType.Texture1]
	const t2 = world.blocks[BlockType.Texture2]
	const o1 = world.blocks[BlockType.Object1]
	const o2 = world.blocks[BlockType.Object2]

	for (let i = 0; i < size; i++) {
		const nodes = getNodesByIndex(i, world.width, world.height)
		const bottomLeft =
			nodes.bottomLeft % world.width === 0 ? nodes.bottomLeft + world.width - 1 : nodes.bottomLeft - 1

		let g = 96
		let baseHeight = heightMap[i]
		g += 12 * (heightMap[nodes.topRight] - baseHeight)
		g += 8 * (heightMap[nodes.topLeft] - baseHeight)
		g += 8 * (heightMap[nodes.right] - baseHeight)
		g -= 8 * (heightMap[nodes.left] - baseHeight)
		g -= 8 * (heightMap[nodes.bottomLeft] - baseHeight)
		g -= 12 * (heightMap[bottomLeft] - baseHeight)
		if (g > 0) g = g * 0.85
		if (g < 0) g = g * 0.25
		g = Math.min(255, Math.max(0, g))

		const tNodes = getTextureNodesByIndex(i, world.width, world.height)
		const i1 = texPalette[t1[tNodes.top1Left] & TextureFlag.ToIdValue]
		const i2 = texPalette[t2[tNodes.top2] & TextureFlag.ToIdValue]
		const i3 = texPalette[t1[tNodes.top1Right] & TextureFlag.ToIdValue]
		const i4 = texPalette[t2[tNodes.bottom2Left] & TextureFlag.ToIdValue]
		const i5 = texPalette[t1[tNodes.bottom1] & TextureFlag.ToIdValue]
		const i6 = texPalette[t2[tNodes.bottom2Right] & TextureFlag.ToIdValue]

		const lightRatio = Math.abs(g - 128) / 224
		const lightR = lightRatio * (g < 100 ? color1 : color2)
		const lightG = lightRatio * (g < 128 ? color1 : color2)
		const lightB = lightRatio * (g < 144 ? color1 : color2)
		const colorRatio = 1 - lightRatio

		const r1 = palette[i1 * 3] * colorRatio + lightR
		const r2 = palette[i2 * 3] * colorRatio + lightR
		const r3 = palette[i3 * 3] * colorRatio + lightR
		const r4 = palette[i4 * 3] * colorRatio + lightR
		const r5 = palette[i5 * 3] * colorRatio + lightR
		const r6 = palette[i6 * 3] * colorRatio + lightR
		const g1 = palette[i1 * 3 + 1] * colorRatio + lightG
		const g2 = palette[i2 * 3 + 1] * colorRatio + lightG
		const g3 = palette[i3 * 3 + 1] * colorRatio + lightG
		const g4 = palette[i4 * 3 + 1] * colorRatio + lightG
		const g5 = palette[i5 * 3 + 1] * colorRatio + lightG
		const g6 = palette[i6 * 3 + 1] * colorRatio + lightG
		const b1 = palette[i1 * 3 + 2] * colorRatio + lightB
		const b2 = palette[i2 * 3 + 2] * colorRatio + lightB
		const b3 = palette[i3 * 3 + 2] * colorRatio + lightB
		const b4 = palette[i4 * 3 + 2] * colorRatio + lightB
		const b5 = palette[i5 * 3 + 2] * colorRatio + lightB
		const b6 = palette[i6 * 3 + 2] * colorRatio + lightB

		let red = (r1 + r2 + r3 + r4 + r5 + r6) / 6
		let green = (g1 + g2 + g3 + g4 + g5 + g6) / 6
		let blue = (b1 + b2 + b3 + b4 + b5 + b6) / 6

		switch (o2[i]) {
			case 196:
			case 197:
			case 198:
			case 199: {
				const treeIndex = ((o2[i] & 2) << 2) | ((o1[i] & 0xc0) >> 6)
				const treeRnd = ((o1[i] & 7) + 1) / 7
				const treeColors = Trees.get(treeIndex).color[world.terrain]
				const treeAlpha = treeColors[3] * treeRnd + 0.2
				const colorAlpha = 1 - treeAlpha
				red = Math.floor(red * colorAlpha + treeColors[0] * treeAlpha)
				green = Math.floor(green * colorAlpha + treeColors[1] * treeAlpha)
				blue = Math.floor(blue * colorAlpha + treeColors[2] * treeAlpha)
				break
			}
			case 204:
			case 205: {
				const graniteQty = o1[i] / 10
				const greyColor = ((red + green + blue) / 3 + 64) * graniteQty
				red = Math.min(255, red * (1 - graniteQty) + greyColor)
				green = Math.min(255, green * (1 - graniteQty) + greyColor)
				blue = Math.min(255, blue * (1 - graniteQty) + greyColor)
				break
			}
		}

		image[i * 4] = red
		image[i * 4 + 1] = green
		image[i * 4 + 2] = blue
		image[i * 4 + 3] = 255
	}

	buffer.putImageData(imageData, 0, 0)
}

export function MapCanvas({ color1, color2, ...world }: MapClass & { color1: number; color2: number }) {
	const ref = useRef<HTMLCanvasElement>()

	useEffect(() => {
		if (ref.current && world) drawToCanvas(ref.current, world as MapClass, color1, color2)
	}, [world])

	return (
		<div className={styles.container}>
			<canvas ref={ref} width={world.width} height={world.height} />
		</div>
	)
}
