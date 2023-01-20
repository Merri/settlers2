import type { MapClass } from './MapClass'
import { BlockType, ObjectType, ResourceFlag } from './types'

interface CalculateResourceOptions {
	map: MapClass
}

export interface ResourceResult {
	mineralCoal: number
	mineralGold: number
	mineralGranite: number
	mineralIronOre: number
	fish: number
	granite: number
	tree: number
	freshWater: number
}

export function calculateResources({ map }: CalculateResourceOptions) {
	const object1 = map.blocks[BlockType.Object1]
	const object2 = map.blocks[BlockType.Object2]
	const resource = map.blocks[BlockType.Resource]

	ObjectType.Tree

	const result: ResourceResult = {
		mineralCoal: 0,
		mineralGold: 0,
		mineralGranite: 0,
		mineralIronOre: 0,
		fish: 0,
		granite: 0,
		tree: 0,
		freshWater: 0,
	}

	resource.forEach((value, index) => {
		const hasTree = (object2[index] & ObjectType.Tree) === ObjectType.Tree
		const hasGranite = (object2[index] & 0xfe) === ObjectType.Granite

		if (hasTree) result.tree++
		if (hasGranite) result.granite += object1[index] & 7

		if (value === ResourceFlag.FreshWater) {
			result.freshWater++
			return
		}

		const withoutQuantity: ResourceFlag = value & 0xf8

		switch (withoutQuantity) {
			case ResourceFlag.Fish: {
				result.fish += value & 7
				return
			}
			case ResourceFlag.Coal: {
				result.mineralCoal += value & 7
				return
			}
			case ResourceFlag.Gold: {
				result.mineralGold += value & 7
				return
			}
			case ResourceFlag.Granite: {
				result.mineralGranite += value & 7
				return
			}
			case ResourceFlag.IronOre: {
				result.mineralIronOre += value & 7
				return
			}
		}
	})

	return result
}
