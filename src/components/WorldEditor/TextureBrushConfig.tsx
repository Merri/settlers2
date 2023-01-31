import { ElevationBrush } from '$/lib/PlayerBasedGenerator'
import { TextureGfxSet, textureGfxSet, TexturePos, texturePos } from '$/lib/textureGfx'
import { SupportedTexture, TextureBuildFeature } from '$/lib/textures'
import { Texture } from '$/lib/types'
import { ComponentProps } from 'preact'
import { RawTextureCanvas } from './RawTexture'

interface Props {
	brush: SupportedTexture
	elevationBrush: ElevationBrush
}

interface GfxInfoProps {
	gfxSet: TextureGfxSet
	texture: Texture
}

function GfxInfo({ gfxSet, texture }: GfxInfoProps) {
	const feature = texture === Texture.UnbuildableWater ? 'water' : TextureBuildFeature[texture]

	return (
		<div style="line-height:1;border-radius:0.5rem;background-color:#eee;align-items:center;justify-content:center;display:inline-flex;flex-direction:column;height:64px;width:64px;margin:2px">
			<small>{feature}</small>
			<br />
			<RawTextureCanvas gfx={texturePos.get(texture as TexturePos)} gfxSet={gfxSet} />
		</div>
	)
}

export function TextureBrushConfig({ brush, elevationBrush }: Props) {
	const gfxSet = textureGfxSet[brush]

	return null

	return (
		<div>
			<p>
				<strong style="font-size:1.25rem">Elevation brushes</strong>
			</p>
			<div>
				<strong>Low regions</strong>
				<br />
				<small>Lowest areas, usually filled with water.</small>
			</div>
			<GfxInfo texture={elevationBrush.sea} gfxSet={gfxSet} />
			<div>
				<strong>Coast</strong>
				<br />
				<small>Randomly picks one of these to draw a "coast" between water and land.</small>
			</div>
			{elevationBrush.coast.map((texture) => (
				<GfxInfo texture={texture} gfxSet={gfxSet} />
			))}
			<div>
				<strong>Low land edge</strong>
				<br />
				<small>These are used between land and low region textures which are not water or lava.</small>
			</div>
			{elevationBrush.lowLandEdge.map((texture) => (
				<GfxInfo texture={texture} gfxSet={gfxSet} />
			))}
			<div>
				<strong>Default land</strong>
				<br />
				<small>Texture to draw on places that did not match any other rule between low and land regions.</small>
			</div>
			<GfxInfo texture={elevationBrush.default} gfxSet={gfxSet} />
			<div>
				<strong>Land</strong>
				<br />
				<small>The areas nearest to hills.</small>
			</div>
			{elevationBrush.meadow.map((texture) => (
				<GfxInfo texture={texture} gfxSet={gfxSet} />
			))}
			<div>
				<strong>Hill root</strong>
				<br />
				<small>Area where land transitions to hill.</small>
			</div>
			<GfxInfo texture={elevationBrush.mountainRoot} gfxSet={gfxSet} />
			<div>
				<strong>Hill climb</strong>
				<br />
				<small>Or in other words: mountain sides.</small>
			</div>
			{elevationBrush.mining.map((texture) => (
				<GfxInfo texture={texture} gfxSet={gfxSet} />
			))}
			<div>
				<strong>Highlands</strong>
				<br />
				<small>Textures to use for the highest regions.</small>
			</div>
			{elevationBrush.peak.map((texture) => (
				<GfxInfo texture={texture} gfxSet={gfxSet} />
			))}
			<div>
				<strong>Lava edge</strong>
				<br />
				<small>Textures that can surround lava.</small>
			</div>
			{elevationBrush.lavaEdge.map((texture) => (
				<GfxInfo texture={texture} gfxSet={gfxSet} />
			))}
		</div>
	)
}
