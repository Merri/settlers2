import { asHex } from './hex'
import { getNodesByIndex, MapClass } from './MapClass'
import { BlockType, ConstructionSite, TextureFlag, Textures } from './types'

/** Validate the map for saving as SWD/WLD file. */
export function validateMapClass(world: MapClass) {
	const issues = []

	if (world.title.length === 0) issues.push(`Map has no title`)
	if (world.validationFlag !== 0) issues.push(`Validation flag is active: map can only be played as a campaign`)
	if (world.playerCount === 0) issues.push(`No players set`)
	if (world.playerCount > 7) issues.push(`[Return to the Roots] More than 7 players`)
	if (world.terrain > 2) issues.push(`Unknown terrain type: ${world.terrain} (expected 0, 1, or 2)`)
	if (world.width & 3 || world.height & 3) issues.push(`World width and height should be divisable by 8`)

	if (world.hqX.length !== world.hqY.length) {
		issues.push(`Uneven amount of headquarters X and Y locations`)
	} else if (world.hqX.length > 7) {
		issues.push(`[Return to the Roots] More than 7 headquarters locations`)
	} else if (world.hqX.reduce((count, x) => (count += x !== 0xffff ? 1 : 0), 0) !== world.playerCount) {
		issues.push(`Player count does not match with headquarters count`)
	} else {
		if (
			world.hqX.some((x) => x >= world.width && x < 0xffff) ||
			world.hqY.some((y) => y >= world.height && y < 0xffff)
		) {
			issues.push(`A player's headquarters is out of bounds`)
		}
	}

	if (world.animals.some(([type, _x, _y]) => type === 0 || type > 9)) {
		issues.push(`Unknown animal type exists within animal data`)
	}

	if (world.animals.some(([_type, x, y]) => x >= world.width || y >= world.height)) {
		issues.push(`Animal is out of bounds`)
	}

	const heightMap = world.blocks[BlockType.HeightMap]

	if (heightMap.some((value) => value > 60)) {
		issues.push(`There are height values higher than 60. This guarantees graphical glitches within the game.`)
	}

	const largeHeightDiffs = heightMap.reduce((items, value, index) => {
		const nodes = getNodesByIndex(index, world.width, world.height)
		if (
			[
				heightMap[nodes.topLeft],
				heightMap[nodes.topRight],
				heightMap[nodes.left],
				heightMap[nodes.right],
				heightMap[nodes.bottomLeft],
				heightMap[nodes.bottomRight],
			].some((compare) => Math.abs(compare - value) > 5)
		) {
			items.push(index)
		}
		return items
	}, [])

	if (largeHeightDiffs.length) {
		issues.push(`There are height differences larger than 5. This might cause game to crash during play.`)
	}

	const t1 = world.blocks[BlockType.Texture1]
	const t2 = world.blocks[BlockType.Texture2]
	const buildSite = world.blocks[BlockType.BuildSite]

	t1.forEach((value, index) => {
		// harbor?
		if (value & 0x40) {
			const site = buildSite[index]
			if (site !== ConstructionSite.Castle && site !== ConstructionSite.OccupiedCastle) {
				issues.push(
					`Texture 1 contains harbor flag 0x40 at index ${index}, but castle size building can't be built on that spot.`
				)
			}
		}
		if (value & 0x80) {
			issues.push(`Texture 1 contains the unknown flag 0x80 at index ${index}`)
		}

		const textureId = value & TextureFlag.ToIdValue

		if (!Textures.has(textureId)) {
			issues.push(`Unknown texture 1 id value 0x${asHex(textureId)} at index ${index}`)
		}
	})

	t2.forEach((value, index) => {
		if (value & 0xc0) {
			const x = index % world.width
			const y = Math.floor((index - x) / world.width)
			issues.push(`Texture 2 contains flags ${asHex(value & 0xc0)} at index ${index} / ${x} x ${y} (probably a savegame)`)
		}

		const textureId = value & TextureFlag.ToIdValue

		if (!Textures.has(textureId)) {
			issues.push(`Unknown texture 2 id value 0x${asHex(textureId)} at index ${index}`)
		}
	})

	const hasRoads = world.blocks[BlockType.Roads].some((value) => value !== 0)

	if (hasRoads) {
		issues.push(`Road block contains roads. It should be all empty in SWD/WLD files.`)
	}

	const o1 = world.blocks[BlockType.Object1]
	const o2 = world.blocks[BlockType.Object2]

	let hasTimeLimited = false
	let hasBurntBuilding = false
	let hasEmptyObjectFlags = false
	let hasEmptyObjectVariant = false
	let hasInvalidDecorativeVariant = false
	let hasInvalidDecorativeId = false
	let hasInvalidGraniteVariant = false
	let hasInvalidGraniteQuantity = false
	let hasInvalidTreeVariant = false
	let hasCutTrees = false
	let hasGrowingTrees = false
	let hasInvalidTrees = false

	o1.forEach((value, index) => {
		const variant = o2[index] & 0x03
		const type = (o2[index] >> 2) & 0x03
		const flags = o2[index] >> 4

		if (flags & 0x01) hasTimeLimited = true
		if (flags & 0x02) hasBurntBuilding = true

		if (type === 0x00) {
			if (flags & 0x07) hasEmptyObjectFlags = true
			if (variant) hasEmptyObjectVariant = true
		} else if (type === 0x01) {
			if (variant > 2) hasInvalidTreeVariant = true
			const id = (variant << 2) | (value >> 6)
			const isCut = (value >> 3) & 0x01
			const size = (value >> 4) & 0x03
			const step = value & 0x07

			if (isCut) hasCutTrees = true
			if (size < 3) hasGrowingTrees = true
			if (id > 8) hasInvalidTrees = true
		} else if (type === 0x02) {
			if (variant > 0) hasInvalidDecorativeVariant = true
			if (value > 0x2b) hasInvalidDecorativeId = true
		} else if (type === 0x03) {
			if (variant > 1) hasInvalidGraniteVariant = true
			if (value > 7) hasInvalidGraniteQuantity = true
		}
	})

	if (hasTimeLimited) issues.push(`Map has time limited objects`)
	if (hasBurntBuilding) issues.push(`Map has burnt buildings`)
	if (hasEmptyObjectFlags) issues.push(`There are objects flags set when not expected to have them`)
	if (hasEmptyObjectVariant) issues.push(`There are object variants set when not expected to have them`)
	if (hasInvalidDecorativeVariant) issues.push(`Map has invalid decorative variant`)
	if (hasInvalidDecorativeId) issues.push(`Map has invalid decorative id`)
	if (hasInvalidGraniteVariant) issues.push(`Map has invalid granite variant`)
	if (hasInvalidGraniteQuantity) issues.push(`Map has invalid granite quantity`)
	if (hasInvalidTreeVariant) issues.push(`Map has invalid tree variant`)
	if (hasCutTrees) issues.push(`Map has cut trees`)
	if (hasGrowingTrees) issues.push(`Map has growing trees`)
	if (hasInvalidTrees) issues.push(`Map has invalid tree id`)

	if (world.blocks[BlockType.Animal].some((value) => value === 0xff)) {
		issues.push(`Map has savegame information in block index 6`)
	} else {
		if (world.blocks[BlockType.Unknown].some((value) => value === 0xff)) {
			issues.push(`Map has savegame information in block index 7`)
		}

		if (world.blocks[BlockType.Animal].some((animalType) => animalType > 9)) {
			issues.push(`Map has unknown animal types`)
		}
	}

	world.blocks[BlockType.BuildSite].forEach((value) => {
		if (value === 0x78) return
		if (value === 0x68) return
		if ((value & 0xf7) < 6) return

		issues.push(`Map has unknown build site flag: 0x${asHex(value)} (probably a savegame)`)
	})

	if (world.blocks[BlockType.FogOfWar].some((value) => value !== 0x07)) {
		issues.push(`Map has non-empty fog of war`)
	}

	if (world.blocks[BlockType.Icon].some((value) => value > 1)) {
		issues.push(`Map has building radius calculations, should be empty in SWD/WLD files.`)
	}

	world.blocks[BlockType.Resource].forEach((value) => {
		if (value === 0) return
		if (value === 0x20) return
		if (value === 0x21) return
		if (value >= 0x40 && value <= 0x5f) return
		if (value >= 0x80 && value <= 0x87) return
		issues.push(`Map has unknown resource type: 0x${asHex(value)}`)
	})

	if (world.blocks[BlockType.RegionMap].some((value) => value === 0xff)) {
		issues.push(`Map region data will crash the game and map editor`)
	}

	return issues
}
