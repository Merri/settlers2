import { MapClass } from '$/lib/MapClass'
import type { ResourceResult } from '$/lib/resources'
import styles from './ResourceStats.module.css'

interface Props {
	map: MapClass
	resources: ResourceResult
}

type Rating = 'none' | 'bad' | 'poor' | 'tolerable' | 'good' | 'very-good' | 'excellent' | 'outstanding'

function getRatioRating(ratio: number): Rating {
	if (ratio < 0.01) return 'none'
	if (ratio < 0.1) return 'bad'
	if (ratio < 0.25) return 'poor'
	if (ratio < 0.5) return 'tolerable'
	if (ratio < 0.75) return 'good'
	if (ratio < 1) return 'very-good'
	if (ratio < 1.5) return 'excellent'
	return 'outstanding'
}

export function ResourceStats({ map, resources }: Props) {
	const { fish, granite, mineralCoal, mineralGold, mineralGranite, mineralIronOre, tree } = resources
	const mineralTotal = mineralCoal + mineralGold + mineralGranite + mineralIronOre
	const size = map.width * map.height

	const fishRatio = (fish * 2) / size

	return null

	return (
		<ul className={styles.resourceStats}>
			<li>
				<img
					alt="Coal"
					data-rating={getRatioRating((mineralCoal * 1.25) / mineralTotal)}
					src="/assets/res/coal.png"
					height="24"
					width="24"
				/>
			</li>
			<li>
				<img
					alt="Iron ore"
					data-rating={getRatioRating((mineralIronOre * 1.5) / mineralTotal)}
					src="/assets/res/iron-ore.png"
					height="24"
					width="24"
				/>
			</li>
			<li>
				<img
					alt="Gold"
					data-rating={getRatioRating((mineralGold * 3) / mineralTotal)}
					src="/assets/res/gold.png"
					height="24"
					width="24"
				/>
			</li>
			<li>
				<img
					alt="Stone"
					data-rating={getRatioRating(mineralGranite / mineralTotal)}
					src="/assets/res/granite.png"
					height="24"
					width="24"
				/>
			</li>
			<li>
				<img
					alt="Fish"
					data-rating={getRatioRating(fishRatio)}
					src="/assets/res/fish.png"
					height="24"
					width="24"
				/>
			</li>
			<li>
				<img
					alt="Wood"
					data-rating={getRatioRating((tree * 7) / size)}
					src="/assets/res/wood.png"
					height="24"
					width="24"
				/>
			</li>
			<li>
				<img
					alt="Granite"
					data-rating={getRatioRating((granite * 2) / size)}
					src="/assets/res/granite.png"
					height="24"
					width="24"
				/>
			</li>
		</ul>
	)
}
