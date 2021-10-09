import { Component } from 'preact/compat'

import { TEXTURE_INFO } from '$/lib/constants'

// usable texture indexes in The Settlers II
const s2UsableTextures = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 34]

interface Props {
	name: string
	onChange: (value: number) => void
	terrain: number
	texture?: number
	textures?: number[]
}

interface State {
	texture: number
}

export class TextureOptions extends Component<Props, State> {
	constructor(props: Props) {
		super(props)

		this.state = { texture: this.props.texture ?? 0 }
	}

	componentWillReceiveProps(nextProps: Props) {
		this.setState({
			texture: nextProps.texture,
		})
	}

	handleChange = (event) => {
		var texture = ~~event.target.value
		this.setState({
			texture: texture,
		})
		this.props.onChange(texture)
	}

	render() {
		const textures = this.props.textures ?? s2UsableTextures;
		return (
			<ul className="texture-option-list">
				{textures.map((texture) => {
					var selected = this.state.texture === texture,
						className = 'texture-option texture-option--terrain' + this.props.terrain,
						textureInfo = TEXTURE_INFO[texture],
						ratio = Math.max(50 / textureInfo.WIDTH, 50 / textureInfo.HEIGHT),
						style = {
							backgroundPosition: ~~(-textureInfo.X * ratio) + 'px ' + ~~(-textureInfo.Y * ratio) + 'px',
							backgroundSize: ~~(256 * ratio) + 'px ' + ~~(256 * ratio) + 'px',
						},
						name = textureInfo.NAME[this.props.terrain]

					if (selected) {
						className += ' texture-option--selected'
					}

					return (
						<li className={className} title={name}>
							<label className="texture-option__label" style={style}>
								<input
									className="texture-option__input"
									checked={selected}
									onChange={this.handleChange}
									name={this.props.name}
									type="radio"
									value={texture}
								/>
								<span className="texture-option__name">{name}</span>
							</label>
						</li>
					)
				})}
			</ul>
		)
	}
}
