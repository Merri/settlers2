export enum BlockType {
	HeightMap = 0,
	Texture1 = 1,
	Texture2 = 2,
	Roads = 3,
	Object1 = 4,
	Object2 = 5,
	Animal = 6,
	Unknown = 7,
	BuildSite = 8,
	FogOfWar = 9,
	Icon = 10,
	Resource = 11,
	LightMap = 12,
	RegionMap = 13,
}

export enum AnimalType {
	None = 0,
	Rabbit = 1,
	Fox = 2,
	Stag = 3,
	Deer = 4,
	Duck = 5,
	Sheep = 6,
	DeerAlt = 7,
	DuckAlt = 8,
	PackDonkey = 9,
	/** Block 6 in WORLD###.DAT fills empty spots with 0xFF, but this value crashes Map Editor when converted to WLD */
	InvalidFill = 255,
}

export enum RegionType {
	Unused = 0,
	Land = 1,
	Water = 2,
	Impassable = 254,
}

/** Five high bits indicate resource type. The lowest three bits are reserved for quantity. */
export enum ResourceFlag {
	/** Fresh water never runs out when quantity is 1. */
	FreshWater = 0x21,
	Coal = 0x40,
	IronOre = 0x48,
	Gold = 0x50,
	Granite = 0x58,
	/** Fish will run out once all 7 fishes have been caught. */
	Fish = 0x87,
}

export enum ObjectType {
	Tree = 0xc4,
	Granite = 0xcc,
	/** Mask away two lowest bits */
	Match = 0xfc,
}

export enum ConstructionSite {
	Flag = 0x01,
	Hut = 0x02,
	House = 0x03,
	Castle = 0x04,
	Mine = 0x05,
	/** "Occupied" at minimum means that it is not possible for farm crops to be placed here. */
	Occupied = 0x08,
	OccupiedFlag = 0x09,
	OccupiedHut = 0x0a,
	OccupiedHouse = 0x0b,
	OccupiedCastle = 0x0c,
	OccupiedMine = 0x0d,
	Tree = 0x68,
	Impassable = 0x78,
}

export enum TextureSet {
	Greenland = 0,
	Wasteland = 1,
	WinterWorld = 2,
}

export enum TextureFeatureFlag {
	/** Texture: Meadow, Savannah, Mountain Meadow (farm fields can exist on these textures) */
	Arable = 0x00000001,
	/** Texture: Meadow, Steppe, Savannah, Mountain Meadow (buildings can be built) */
	Habitable = 0x00000002,
	/** Texture: Desert (no buildings can be built, only flagpoles) */
	Arid = 0x00000004,
	/** Texture: Mountain (mine can be built on node where each texture is rock) */
	Rock = 0x00000008,
	/** Texture: Swamp and Water (flagpole can be built on edge of texture) */
	Wet = 0x00000010,
	/** Texture: Snow and Lava (flagpole cannot be built on edge of texture) */
	Extreme = 0x00000020,
	/** Match textures inaccessible by player (water, swamp, snow, lava) */
	Impassable = 0x00000030,
	// Texture type flags
	IsWater = 0x00001000,
	IsSteppe = 0x00002000,
	IsSavannah = 0x00004000,
	IsMeadow = 0x00008000,
	IsMountMeadow = 0x00010000,
}

/**
 * The game supports 64 different textures but only some are being used.
 *
 * Two high bits are reserved for feature flags.
 */
export enum TextureFlag {
	/** Use to remove the flags and to only retain texture id. */
	ToIdValue = 0x3f,
	/** Indicates a harbour building can be built here. */
	Harbor = 0x40,
	/** This flag exists only on one or two BlueByte maps in early revisions of the game, meaning is unknown. */
	Unknown = 0x80,
}

interface TextureData {
	featureFlags: number
	name: [string, string, string]
	x: number
	y: number
	width: number
	height: number
}

export enum Texture {
	Water = 0x05,
}

export const Textures = new Map<number, TextureData>([
	[
		0,
		{
			featureFlags: TextureFeatureFlag.Arable | TextureFeatureFlag.Habitable | TextureFeatureFlag.IsSavannah,
			name: ['Savannah', 'Dark Steppe', 'Taiga'],
			x: 0,
			y: 96,
			width: 37,
			height: 31,
		},
	],
	[
		1,
		{
			featureFlags: TextureFeatureFlag.Rock,
			name: ['Mountain #1', 'Mountain #1', 'Mountain #1'],
			x: 0,
			y: 48,
			width: 37,
			height: 31,
		},
	],
	[
		2,
		{
			featureFlags: TextureFeatureFlag.Extreme,
			name: ['Snow', 'Lava Stones', 'Pack Ice'],
			x: 0,
			y: 0,
			width: 37,
			height: 31,
		},
	],
	[
		3,
		{
			featureFlags: TextureFeatureFlag.Wet,
			name: ['Swamp', 'Lava Ground', 'Drift Ice'],
			x: 96,
			y: 0,
			width: 37,
			height: 31,
		},
	],
	[
		4,
		{
			featureFlags: TextureFeatureFlag.Arid,
			name: ['Desert', 'Wasteland', 'Ice'],
			x: 48,
			y: 0,
			width: 37,
			height: 31,
		},
	],
	[
		5,
		{
			featureFlags: TextureFeatureFlag.Wet | TextureFeatureFlag.IsWater,
			name: ['Water', 'Moor', 'Water'],
			x: 201,
			y: 59,
			width: 37,
			height: 31,
		},
	],
	[
		6,
		{
			featureFlags: TextureFeatureFlag.Habitable,
			name: ['Water (habitable)', 'Moor (habitable)', 'Water (habitable)'],
			x: 201,
			y: 59,
			width: 37,
			height: 31,
		},
	],
	[
		7,
		{
			featureFlags: TextureFeatureFlag.Arid,
			name: ['Desert #2', 'Wasteland #2', 'Ice #2'],
			x: 48,
			y: 0,
			width: 37,
			height: 31,
		},
	],
	[
		8,
		{
			featureFlags: TextureFeatureFlag.Arable | TextureFeatureFlag.Habitable | TextureFeatureFlag.IsMeadow,
			name: ['Meadow #1', 'Pasture #1', 'Taiga / Tundra'],
			x: 48,
			y: 96,
			width: 37,
			height: 31,
		},
	],
	[
		9,
		{
			featureFlags: TextureFeatureFlag.Arable | TextureFeatureFlag.Habitable | TextureFeatureFlag.IsMeadow,
			name: ['Meadow #2', 'Pasture #2', 'Tundra #1'],
			x: 96,
			y: 96,
			width: 37,
			height: 31,
		},
	],
	[
		10,
		{
			featureFlags: TextureFeatureFlag.Arable | TextureFeatureFlag.Habitable | TextureFeatureFlag.IsMeadow,
			name: ['Meadow #3', 'Pasture #3', 'Tundra #2'],
			x: 144,
			y: 96,
			width: 37,
			height: 31,
		},
	],
	[
		11,
		{
			featureFlags: TextureFeatureFlag.Rock,
			name: ['Mountain #2', 'Mountain #2', 'Mountain #2'],
			x: 48,
			y: 48,
			width: 37,
			height: 31,
		},
	],
	[
		12,
		{
			featureFlags: TextureFeatureFlag.Rock,
			name: ['Mountain #3', 'Mountain #3', 'Mountain #3'],
			x: 96,
			y: 48,
			width: 37,
			height: 31,
		},
	],
	[
		13,
		{
			featureFlags: TextureFeatureFlag.Rock,
			name: ['Mountain #4', 'Mountain #4', 'Mountain #4'],
			x: 144,
			y: 48,
			width: 37,
			height: 31,
		},
	],
	[
		14,
		{
			featureFlags: TextureFeatureFlag.Arable | TextureFeatureFlag.Habitable | TextureFeatureFlag.IsSteppe,
			name: ['Steppe', 'Light Steppe', 'Tundra #3'],
			x: 0,
			y: 144,
			width: 37,
			height: 31,
		},
	],
	[
		15,
		{
			featureFlags: TextureFeatureFlag.Arable | TextureFeatureFlag.Habitable | TextureFeatureFlag.IsMeadow,
			name: ['Steppe', 'Light Steppe', 'Tundra #3'],
			x: 144,
			y: 0,
			width: 37,
			height: 31,
		},
	],
	[
		16,
		{
			featureFlags: TextureFeatureFlag.Extreme,
			name: ['Lava', 'Lava', 'Lava'],
			x: 201,
			y: 116,
			width: 37,
			height: 31,
		},
	],
	[
		17,
		{
			featureFlags: TextureFeatureFlag.Arid,
			name: ['Color (magenta)', 'Color (dark red)', 'Color (black)'],
			x: 0,
			y: 254,
			width: 1,
			height: 1,
		},
	],
	[
		18,
		{
			featureFlags: TextureFeatureFlag.Habitable | TextureFeatureFlag.IsMountMeadow,
			name: ['Mountain Meadow', 'Alpine Pasture', 'Snow'],
			x: 48,
			y: 144,
			width: 37,
			height: 31,
		},
	],
	[
		19,
		{
			featureFlags: TextureFeatureFlag.Extreme,
			name: ['Water (impassable)', 'Moor (impassable)', 'Water (impassable)'],
			x: 201,
			y: 59,
			width: 37,
			height: 31,
		},
	],
	[
		20,
		{
			featureFlags: TextureFeatureFlag.Extreme,
			name: ['Lava #1', 'Lava #1', 'Lava #1'],
			x: 64,
			y: 221,
			width: 34,
			height: 34,
		},
	],
	[
		21,
		{
			featureFlags: TextureFeatureFlag.Extreme,
			name: ['Lava #2', 'Lava #2', 'Lava #2'],
			x: 98,
			y: 221,
			width: 34,
			height: 34,
		},
	],
	[
		22,
		{
			featureFlags: TextureFeatureFlag.Extreme,
			name: ['Lava #3', 'Lava #3', 'Lava #3'],
			x: 132,
			y: 221,
			width: 34,
			height: 34,
		},
	],
	[
		34,
		{
			featureFlags: TextureFeatureFlag.Arable | TextureFeatureFlag.Habitable | TextureFeatureFlag.IsMountMeadow,
			name: ['Mountain #2 (meadow)', 'Mountain #2 (meadow)', 'Mountain #2 (meadow)'],
			x: 48,
			y: 48,
			width: 37,
			height: 31,
		},
	],
])

type RGBA = [number, number, number, number]

interface Tree {
	/** These are a set of customized colors for "prettier" rendering on minimap. */
	color: [RGBA, RGBA, RGBA]
	name: [string, string, string]
}

export const Trees = new Map<number, Tree>([
	[
		0,
		{
			name: ['Pine', 'Spider', 'Pine'],
			color: [
				[21, 73, 15, 0.6],
				[117, 80, 62, 0.4],
				[88, 99, 77, 0.5],
			],
		},
	],
	[
		1,
		{
			name: ['Birch', 'Marley', 'Birch'],
			color: [
				[23, 70, 27, 0.55],
				[127, 70, 49, 0.45],
				[63, 82, 58, 0.5],
			],
		},
	],
	[
		2,
		{
			name: ['Oak', 'Spider (clone #1)', 'Fir'],
			color: [
				[21, 65, 16, 0.7],
				[117, 80, 62, 0.4],
				[77, 94, 60, 0.4],
			],
		},
	],
	[
		3,
		{
			name: ['Palm #1', 'Marley (clone #1)', 'Palm #1'],
			color: [
				[48, 87, 24, 0.4],
				[127, 70, 49, 0.45],
				[48, 87, 24, 0.4],
			],
		},
	],
	[
		4,
		{
			name: ['Palm #2', 'Spider (clone #2)', 'Palm #2'],
			color: [
				[42, 78, 19, 0.4],
				[117, 80, 62, 0.4],
				[42, 78, 19, 0.4],
			],
		},
	],
	[
		5,
		{
			name: ['Pine Apple', 'Pine Apple', 'Pine Apple'],
			color: [
				[34, 73, 19, 0.4],
				[34, 73, 19, 0.4],
				[34, 73, 19, 0.4],
			],
		},
	],
	[
		6,
		{
			name: ['Cypress', 'Spider (clone #3)', 'Cypress'],
			color: [
				[34, 71, 18, 0.45],
				[117, 80, 62, 0.4],
				[83, 85, 58, 0.4],
			],
		},
	],
	[
		7,
		{
			name: ['Cherry', 'Cherry', 'Fir (clone #1)'],
			color: [
				[131, 53, 36, 0.4],
				[131, 53, 36, 0.4],
				[77, 94, 60, 0.4],
			],
		},
	],
	[
		8,
		{
			name: ['Fir', 'Marley (clone #2)', 'Fir (clone #1)'],
			color: [
				[20, 78, 18, 0.45],
				[127, 70, 49, 0.45],
				[77, 94, 60, 0.4],
			],
		},
	],
	// These trees work but have glitchy graphics.
	[
		9,
		{
			name: ['Unused #1', 'Unused #1', 'Unused #1'],
			color: [
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
			],
		},
	],
	[
		10,
		{
			name: ['Unused #2', 'Unused #2', 'Unused #2'],
			color: [
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
			],
		},
	],
	[
		11,
		{
			name: ['Unused #3', 'Unused #3', 'Unused #3'],
			color: [
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
			],
		},
	],
	[
		12,
		{
			name: ['Unused #4', 'Unused #4', 'Unused #4'],
			color: [
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
			],
		},
	],
	[
		13,
		{
			name: ['Unused #5', 'Unused #5', 'Unused #5'],
			color: [
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
			],
		},
	],
	[
		14,
		{
			name: ['Unused #6', 'Unused #6', 'Unused #6'],
			color: [
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
			],
		},
	],
	[
		15,
		{
			name: ['Unused #7', 'Unused #7', 'Unused #7'],
			color: [
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
				[0, 0, 0, 0.1],
			],
		},
	],
])
