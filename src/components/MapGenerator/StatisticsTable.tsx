interface Props {
	coal: number
	gold: number
	granite: number
	ironOre: number
	landTotalMass: number
	mineTotal: number
	players: number
	resources: Record<string, number>
}

export function StatisticsTable({ coal, gold, granite, ironOre, landTotalMass, mineTotal, players, resources }: Props) {
	return (
		<table>
			<thead>
				<tr>
					<th>Resource</th>
					<th>Value</th>
					<th>% of max</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><img alt="Castle" src="/design/icon_castle.png" /> Players</td>
					<td>{players}</td>
					<td>-</td>
				</tr>
				<tr>
					<td><img alt="Hut" src="/design/icon_hut.png" /> Trees</td>
					<td>{resources.tree || 0}</td>
					<td>{Math.round(((resources.tree || 0) / landTotalMass) * 100)} %</td>
				</tr>
				<tr>
					<td><img alt="Hut" src="/design/icon_hut.png" /> Granite</td>
					<td>{resources.granite || 0}</td>
					<td>{Math.round(((resources.granite || 0) / (landTotalMass * 7)) * 100)} %</td>
				</tr>
				<tr>
					<td><img alt="Mountain" src="/design/icon_mine.png" /> Coal</td>
					<td>{coal}</td>
					<td>{Math.round((coal / mineTotal) * 100)} %</td>
				</tr>
				<tr>
					<td><img alt="Mountain" src="/design/icon_mine.png" /> Iron ore</td>
					<td>{ironOre}</td>
					<td>{Math.round((ironOre / mineTotal) * 100)} %</td>
				</tr>
				<tr>
					<td><img alt="Mountain" src="/design/icon_mine.png" /> Gold</td>
					<td>{gold}</td>
					<td>{Math.round((gold / mineTotal) * 100)} %</td>
				</tr>
				<tr>
					<td><img alt="Mountain" src="/design/icon_mine.png" /> Granite</td>
					<td>{granite}</td>
					<td>{Math.round((granite / mineTotal) * 100)} %</td>
				</tr>
			</tbody>
		</table>
	)
}
