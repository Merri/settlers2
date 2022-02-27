import { useEffect, useRef } from 'preact/compat'

import { MapClass } from '$/lib/MapClass'

import styles from './Map.module.css'
import { BlockType } from '$/lib/types'

function drawToCanvas(canvas: HTMLCanvasElement, world: MapClass) {
	const buffer = canvas.getContext('2d')
	const imageData = buffer.getImageData(0, 0, world.width, world.height)
	const image = imageData.data
	const size = world.width * world.height

	for (let i = 0; i < size; i++) {
		const region = world.blocks[BlockType.RegionMap][i] & 1
		const height = Math.round(world.blocks[BlockType.HeightMap][i] / 60 * 255)
		image[i * 4] = Math.min(255, height * 2)
		image[i * 4 + 1] = region ? 160 : height
		image[i * 4 + 2] = region ? height : 160
		image[i * 4 + 3] = 255
	}

	buffer.putImageData(imageData, 0, 0)
}

export function MapCanvas({ world }: { world: MapClass }) {
	const ref = useRef<HTMLCanvasElement>()

	useEffect(() => {
		if (ref.current && world) drawToCanvas(ref.current, world)
	}, [world])

	return (
		<div className={styles.container}>
			<canvas ref={ref} width={world.width} height={world.height} />
		</div>
	)
}
