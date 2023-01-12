import { useEffect, useRef } from 'preact/hooks'

import { renderTextureToCanvas, TextureGfx, TextureGfxSet } from '$/lib/textureGfx'

export function RawTextureCanvas({ gfx, gfxSet }: { gfx?: TextureGfx; gfxSet: TextureGfxSet }) {
	const ref = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (ref.current && gfx) {
			renderTextureToCanvas({
				canvas: ref.current,
				...gfxSet,
				gfx,
			})
		}
	}, [gfx, gfxSet])

	if (!gfx) return null

	return (
		<canvas
			ref={ref}
			width={gfx.renderWidth ?? gfx.width}
			height={gfx.renderHeight ?? gfx.height}
			style="border: 1px solid transparent; width: 32px; height: 32px; border-radius: 0.25rem;"
		/>
	)
}
