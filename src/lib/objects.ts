export const C8ObjectType = {
	Mushroom1: 0x00,
	Mushroom2: 0x01,
	Stone1: 0x02,
	Stone2: 0x03,
	Stone3: 0x04,
	DeadTreeTrunk: 0x05,
	DeadTree: 0x06,
	Bone1: 0x07,
	Bone2: 0x08,
	Flowers: 0x09,
	Bush1: 0x0a,
	BigStone: 0x0b,
	BigCactus: 0x0c,
	MediumCactus: 0x0d,
	Shrub1: 0x0e,
	Shrub2: 0x0f,
	Bush2: 0x10,
	Bush3: 0x11,
	Bush4: 0x12,
	Shrub3: 0x13,
	Shrub4: 0x14,
	GFX1_clone: 0x15,
	ClosedGateway: 0x16,
	OpenGateway: 0x17,
	/**
	 * - MIS0BOBS: Shipwreck
	 * - MIS1BOBS: Stone pillar 1
	 * - MIS2BOBS: Tent
	 * - MIS3BOBS: Viking and boat
	 * - MIS4BOBS: Scrolls
	 * - MIS5BOBS: Whale bones 1
	 */
	GFX1: 0x18,
	/**
	 * - MIS0BOBS: (unused)
	 * - MIS1BOBS: Stone pillar 2
	 * - MIS2BOBS: Broken guardhouse
	 * - MIS3BOBS: (unused)
	 * - MIS4BOBS: (unused)
	 * - MIS5BOBS: Whale bones 2
	 */
	GFX2: 0x19,
	/**
	 * - MIS0BOBS: (unused)
	 * - MIS1BOBS: Stone pillar 3
	 * - MIS2BOBS: Broken watchtower
	 * - MIS3BOBS: (unused)
	 * - MIS4BOBS: (unused)
	 * - MIS5BOBS: Abandoned mine
	 */
	GFX3: 0x1a,
	/**
	 * - MIS0BOBS: Tent HQ
	 * - MIS1BOBS: Stone pillar 4
	 * - MIS2BOBS: Broken fortress
	 * - MIS3BOBS: (unused)
	 * - MIS4BOBS: (unused)
	 * - MIS5BOBS: Viking and boat
	 */
	GFX4: 0x1b,
	/**
	 * - MIS0BOBS: (unused)
	 * - MIS1BOBS: Stone pillar 5
	 * - MIS2BOBS: Toys?
	 * - MIS3BOBS: (unused)
	 * - MIS4BOBS: (unused)
	 * - MIS5BOBS: (unused)
	 */
	GFX5: 0x1c,
	/**
	 * - MIS0BOBS: (unused)
	 * - MIS1BOBS: Stone pillar 6
	 * - MIS2BOBS: (unused)
	 * - MIS3BOBS: (unused)
	 * - MIS4BOBS: (unused)
	 * - MIS5BOBS: (unused)
	 */
	GFX6: 0x1d,
	/**
	 * - MIS0BOBS: (unused)
	 * - MIS1BOBS: Stone pillar 7
	 * - MIS2BOBS: (unused)
	 * - MIS3BOBS: (unused)
	 * - MIS4BOBS: (unused)
	 * - MIS5BOBS: (unused)
	 */
	GFX7: 0x1e,
	/**
	 * - MIS0BOBS: (unused)
	 * - MIS1BOBS: Dead tree 1
	 * - MIS2BOBS: CRASH
	 * - MIS3BOBS: CRASH
	 * - MIS4BOBS: CRASH
	 * - MIS5BOBS: CRASH
	 */
	GFX8: 0x1f,
	/**
	 * - MIS0BOBS: (unused)
	 * - MIS1BOBS: Dead tree 2
	 * - MIS2BOBS: CRASH
	 * - MIS3BOBS: CRASH
	 * - MIS4BOBS: CRASH
	 * - MIS5BOBS: CRASH
	 */
	GFX9: 0x20,
	/**
	 * - MIS0BOBS: (unused)
	 * - MIS1BOBS: Large bones
	 * - MIS2BOBS: CRASH
	 * - MIS3BOBS: CRASH
	 * - MIS4BOBS: CRASH
	 * - MIS5BOBS: CRASH
	 */
	GFX10: 0x21,
	Mushroom3: 0x22,
	Stone4: 0x23,
	Stone5: 0x24,
	Pebble1: 0x25,
	Pebble2: 0x26,
	Pebble3: 0x27,
	Grass1: 0x28,
	Berries: 0x29,
	Grass2: 0x2a,
	Snowman: 0x2b,
	GFX1_extra: 0x2c,
	GFX2_extra: 0x2d,
	GFX3_extra: 0x2e,
	GFX4_extra: 0x2f,
	GFX5_extra: 0x30,
} as const

export type C8ObjectType = typeof C8ObjectType[keyof typeof C8ObjectType]

export const allRegularDecoration = [
	C8ObjectType.Mushroom1,
	C8ObjectType.Mushroom2,
	C8ObjectType.Stone1,
	C8ObjectType.Stone2,
	C8ObjectType.Stone3,
	C8ObjectType.DeadTreeTrunk,
	C8ObjectType.DeadTree,
	C8ObjectType.Bone1,
	C8ObjectType.Bone2,
	C8ObjectType.Flowers,
	C8ObjectType.Bush1,
	C8ObjectType.BigStone,
	C8ObjectType.BigCactus,
	C8ObjectType.MediumCactus,
	C8ObjectType.Shrub1,
	C8ObjectType.Shrub2,
	C8ObjectType.Bush2,
	C8ObjectType.Bush3,
	C8ObjectType.Bush4,
	C8ObjectType.Shrub3,
	C8ObjectType.Shrub4,
	C8ObjectType.Mushroom3,
	C8ObjectType.Stone4,
	C8ObjectType.Stone5,
	C8ObjectType.Pebble1,
	C8ObjectType.Pebble2,
	C8ObjectType.Pebble3,
	C8ObjectType.Grass1,
	C8ObjectType.Berries,
	C8ObjectType.Grass2,
	C8ObjectType.Snowman,
]
