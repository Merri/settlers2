import { RawTextureCanvas } from '../WorldEditor/RawTexture'
import { textureGfxSet, texturePos } from '$/lib/textureGfx'
import { SupportedTexture, TerrainSets } from '$/lib/textures'
import { TextureSet } from '$/lib/types'

const sets = Object.entries(textureGfxSet).map(([terrain, gfxSet]) => ({
	...TerrainSets[terrain as SupportedTexture],
	gfxSet,
}))

const [greenland, ...greens] = sets.filter(({ type }) => type === TextureSet.Greenland)
const [wasteland, ...wastes] = sets.filter(({ type }) => type === TextureSet.Wasteland)
const [winterWorld, ...winters] = sets.filter(({ type }) => type === TextureSet.WinterWorld)

function TextureGfx({ gfxSet, textureNames }: Pick<typeof greenland, 'gfxSet' | 'textureNames'>) {
	return (
		<>
			{Array.from(texturePos.entries()).map(([key, gfx]) => (
				<span key={key} title={textureNames[key]}>
					<RawTextureCanvas gfx={gfx} gfxSet={gfxSet} />
				</span>
			))}
		</>
	)
}

function MainTexture({
	alt,
	author,
	gfxSet,
	name,
	textureNames,
	year,
}: typeof greenland & { alt: typeof greenland[] }) {
	return (
		<>
			<h2>{name}</h2>
			<TextureGfx gfxSet={gfxSet} textureNames={textureNames} />
			<p>
				Made in {year} by {author}
			</p>

			<div>
				<h3>Alternatives</h3>

				{alt.map(({ author, gfxSet, id, name, textureNames, url, year }) => (
					<div key={id}>
						<strong>
							{name}
							{url && (
								<>
									{' '}
									<a href={url}>(source)</a>
								</>
							)}
						</strong>
						<br />
						<TextureGfx gfxSet={gfxSet} textureNames={textureNames} />
						<small style="display:block">
							Made in {year} by {author}
						</small>
						<br />
					</div>
				))}
			</div>
		</>
	)
}

export function Textures() {
	return (
		<>
			<MainTexture {...greenland} alt={greens} />
			<MainTexture {...wasteland} alt={wastes} />
			<MainTexture {...winterWorld} alt={winters} />
		</>
	)
}
