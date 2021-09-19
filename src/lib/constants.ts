export const AREA = {
	UNUSED: 0,
	LAND: 1,
	WATER: 2,
	IMPASSABLE: 254,
}

export const COLOR = {
	ORIGINAL: [
		[
			233, 216, 123, 233, 199, 240, 240, 199, 231, 233, 230, 216, 216, 215, 236, 231, 57, 254, 216, 240, 57, 57,
			57, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 216, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		],
		[
			114, 167, 139, 160, 85, 42, 42, 85, 165, 166, 166, 33, 212, 212, 167, 114, 248, 254, 160, 42, 248, 248, 248,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 33, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff,
		],
		[
			123, 116, 244, 244, 183, 240, 240, 183, 36, 102, 123, 117, 118, 118, 233, 120, 248, 254, 122, 240, 248, 248,
			248, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 117, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		],
	],
	MERRI: [
		[
			236, 195, 124, 231, 199, 242, 242, 199, 233, 232, 231, 195, 194, 193, 217, 232, 249, 254, 169, 242, 249,
			249, 249, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 195, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		],
		[
			98, 145, 23, 41, 85, 42, 42, 85, 32, 166, 33, 113, 245, 41, 34, 33, 251, 254, 97, 42, 251, 251, 251, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 113, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff,
		],
		[
			122, 118, 179, 178, 182, 242, 242, 182, 122, 172, 101, 120, 144, 119, 171, 101, 249, 252, 123, 242, 249,
			249, 249, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 120, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		],
	],
}

export const CP437 = [
	0, 9786, 9787, 9829, 9830, 9827, 9824, 8226, 9688, 9675, 9689, 9794, 9792, 9834, 9835, 9788, 9658, 9668, 8597, 8252,
	182, 167, 9644, 8616, 8593, 8595, 8594, 8592, 8735, 8596, 9650, 9660, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
	43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
	72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
	101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123,
	124, 125, 126, 8962, 199, 252, 233, 226, 228, 224, 229, 231, 234, 235, 232, 239, 238, 236, 196, 197, 201, 230, 198,
	244, 246, 242, 251, 249, 255, 214, 220, 162, 163, 165, 8359, 402, 225, 237, 243, 250, 241, 209, 170, 186, 191, 8976,
	172, 189, 188, 161, 171, 187, 9617, 9618, 9619, 9474, 9508, 9569, 9570, 9558, 9557, 9571, 9553, 9559, 9565, 9564,
	9563, 9488, 9492, 9524, 9516, 9500, 37, 37, 9566, 567, 9562, 9556, 9577, 9574, 9568, 9552, 9580, 9575, 9576, 9572,
	9573, 9561, 9560, 9554, 9555, 9579, 9578, 9496, 9484, 9608, 9604, 9612, 9616, 9600, 945, 223, 915, 960, 931, 963,
	181, 964, 934, 920, 937, 948, 8734, 966, 949, 8745, 8801, 177, 8805, 8804, 8992, 8993, 247, 8776, 176, 8729, 183,
	8730, 8319, 178, 9632, 160,
]

export const OBJECT_TYPE = {
	TREE: 0xc4,
	GRANITE: 0xcc,
	MATCH: 0xfc,
}

export const RESOURCE = {
	FRESH_WATER: 0x21,
	// 0x40 - 0x47
	COAL: 0x40,
	// 0x48 - 0x4F
	IRON_ORE: 0x48,
	// 0x50 - 0x57
	GOLD: 0x50,
	// 0x58 - 0x5F
	GRANITE: 0x58,
	FISH: 0x87,
}

export const SITE = {
	FLAG: 0x01,
	HUT: 0x02,
	HOUSE: 0x03,
	CASTLE: 0x04,
	MINE: 0x05,
	OCCUPIED: 0x08,
	FLAG_OCCUPIED: 0x09,
	HUT_OCCUPIED: 0x0a,
	CASTLE_OCCUPIED: 0x0c,
	MINE_OCCUPIED: 0x0d,
	TREE: 0x68,
	IMPASSABLE: 0x78,
}

export const TERRAIN = {
	GREENLAND: 0,
	WASTELAND: 1,
	WINTERWORLD: 2,
}

export const TEXTURE = {
	// texture is usable in The Settlers II
	SUPPORT_S2: 0x01,
	// texture is usable in Return to the Roots
	SUPPORT_RTTR: 0x02,
	// you can expect farm fields to grow here
	ARABLE: 0x04,
	// you can build buildings here
	HABITABLE: 0x08,
	// it's too hard to build anything here, but you can make roads
	ARID: 0x10,
	// mines be here
	ROCK: 0x20,
	// swamp and water
	WET: 0x40,
	// snow and lava
	EXTREME: 0x80,
	// water only!
	WATER: 0x100,
	STEPPE: 0x200,
	SAVANNAH: 0x400,
	MEADOW: 0x800,
	MOUNT_MEADOW: 0x1000,

	// bitflag for matching WET and EXTREME for all areas that not usable for the player
	IMPASSABLE: 0xc0,

	// For actual texture ID matching
	// bitflag for removing two highest bits that are used for bitflags!
	TO_ID_VALUE: 0x3f,
	// this is the other bitflag for the two highest bits
	HARBOR: 0x40,
	// we do not know the meaning of this bitflag; only exists on one or two BlueByte maps
	UNKNOWN: 0x80,
	// to get rid of support flags
	DROP_SUPPORT: 0xfc,
}

export const TEXTURE_INFO = {
	0: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE | TEXTURE.SAVANNAH,
		NAME: {
			0: 'Savannah',
			1: 'Dark Steppe',
			2: 'Taiga',
		},
		X: 0,
		Y: 96,
		WIDTH: 37,
		HEIGHT: 31,
	},
	1: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK,
		NAME: {
			0: 'Mountain #1',
			1: 'Mountain #1',
			2: 'Mountain #1',
		},
		X: 0,
		Y: 48,
		WIDTH: 37,
		HEIGHT: 31,
	},
	2: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.EXTREME,
		NAME: {
			0: 'Snow',
			1: 'Lava Stones',
			2: 'Pack Ice',
		},
		X: 0,
		Y: 0,
		WIDTH: 37,
		HEIGHT: 31,
	},
	3: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.WET,
		NAME: {
			0: 'Swamp',
			1: 'Lava Ground',
			2: 'Drift Ice',
		},
		X: 96,
		Y: 0,
		WIDTH: 37,
		HEIGHT: 31,
	},
	4: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARID,
		NAME: {
			0: 'Desert',
			1: 'Wasteland',
			2: 'Ice',
		},
		X: 48,
		Y: 0,
		WIDTH: 37,
		HEIGHT: 31,
	},
	5: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.WET | TEXTURE.WATER,
		NAME: {
			0: 'Water',
			1: 'Moor',
			2: 'Water',
		},
		X: 201,
		Y: 59,
		WIDTH: 37,
		HEIGHT: 31,
	},
	6: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.HABITABLE,
		NAME: {
			0: 'Habitable Water',
			1: 'Habitable Moor',
			2: 'Habitable Water',
		},
		X: 201,
		Y: 59,
		WIDTH: 37,
		HEIGHT: 31,
	},
	7: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARID,
		NAME: {
			0: 'Clone Desert',
			1: 'Clone Wasteland',
			2: 'Clone Ice',
		},
		X: 48,
		Y: 0,
		WIDTH: 37,
		HEIGHT: 31,
	},
	8: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE | TEXTURE.MEADOW,
		NAME: {
			0: 'Meadow #1',
			1: 'Pasture #1',
			2: 'Taiga / Tundra',
		},
		X: 48,
		Y: 96,
		WIDTH: 37,
		HEIGHT: 31,
	},
	9: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE | TEXTURE.MEADOW,
		NAME: {
			0: 'Meadow #2',
			1: 'Pasture #2',
			2: 'Tundra #1',
		},
		X: 96,
		Y: 96,
		WIDTH: 37,
		HEIGHT: 31,
	},
	10: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE | TEXTURE.MEADOW,
		NAME: {
			0: 'Meadow #3',
			1: 'Pasture #3',
			2: 'Tundra #2',
		},
		X: 144,
		Y: 96,
		WIDTH: 37,
		HEIGHT: 31,
	},
	11: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK,
		NAME: {
			0: 'Mountain #2',
			1: 'Mountain #2',
			2: 'Mountain #2',
		},
		X: 48,
		Y: 48,
		WIDTH: 37,
		HEIGHT: 31,
	},
	12: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK,
		NAME: {
			0: 'Mountain #3',
			1: 'Mountain #3',
			2: 'Mountain #3',
		},
		X: 96,
		Y: 48,
		WIDTH: 37,
		HEIGHT: 31,
	},
	13: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK,
		NAME: {
			0: 'Mountain #4',
			1: 'Mountain #4',
			2: 'Mountain #4',
		},
		X: 144,
		Y: 48,
		WIDTH: 37,
		HEIGHT: 31,
	},
	14: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE | TEXTURE.STEPPE,
		NAME: {
			0: 'Steppe',
			1: 'Light Steppe',
			2: 'Tundra #3',
		},
		X: 0,
		Y: 144,
		WIDTH: 37,
		HEIGHT: 31,
	},
	15: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE | TEXTURE.MEADOW,
		NAME: {
			0: 'Flower Meadow',
			1: 'Flower Pasture',
			2: 'Tundra #4',
		},
		X: 144,
		Y: 0,
		WIDTH: 37,
		HEIGHT: 31,
	},
	16: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.EXTREME,
		NAME: {
			0: 'Lava',
			1: 'Lava',
			2: 'Lava',
		},
		X: 201,
		Y: 116,
		WIDTH: 37,
		HEIGHT: 31,
	},
	17: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.ARID,
		NAME: {
			0: 'Solid Color (Magenta)',
			1: 'Solid Color (Dark Red)',
			2: 'Solid Color (Black)',
		},
		X: 0,
		Y: 254,
		WIDTH: 1,
		HEIGHT: 1,
	},
	18: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.HABITABLE | TEXTURE.MOUNT_MEADOW,
		NAME: {
			0: 'Mountain Meadow',
			1: 'Alpine Pasture',
			2: 'Snow',
		},
		X: 48,
		Y: 144,
		WIDTH: 37,
		HEIGHT: 31,
	},
	19: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME,
		NAME: {
			0: 'Border Water',
			1: 'Border Moor',
			2: 'Border Water',
		},
		X: 201,
		Y: 59,
		WIDTH: 37,
		HEIGHT: 31,
	},
	20: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME,
		NAME: {
			0: 'Solid Color Lava #1 (Magenta)',
			1: 'Solid Color Lava #1 (Dark Red)',
			2: 'Solid Color Lava #1 (Black)',
		},
		X: 64,
		Y: 221,
		WIDTH: 34,
		HEIGHT: 34,
	},
	21: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME,
		NAME: {
			0: 'Solid Color Lava #2 (Magenta)',
			1: 'Solid Color Lava #2 (Dark Red)',
			2: 'Solid Color Lava #2 (Black)',
		},
		X: 98,
		Y: 221,
		WIDTH: 34,
		HEIGHT: 34,
	},
	22: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME,
		NAME: {
			0: 'Solid Color Lava #3 (Magenta)',
			1: 'Solid Color Lava #3 (Dark Red)',
			2: 'Solid Color Lava #3 (Black)',
		},
		X: 132,
		Y: 221,
		WIDTH: 34,
		HEIGHT: 34,
	},
	34: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.HABITABLE | TEXTURE.MOUNT_MEADOW,
		NAME: {
			0: 'Mountain #2 (Habitable)',
			1: 'Mountain #2 (Habitable)',
			2: 'Mountain #2 (Habitable)',
		},
		X: 48,
		Y: 48,
		WIDTH: 37,
		HEIGHT: 31,
	},
}

export const TREE_INFO = [
	[
		{
			RED: 21,
			GREEN: 73,
			BLUE: 15,
			ALPHA: 0.62352941176470588235294117647059,
			NAME: 'Pine',
		},
		{
			RED: 23,
			GREEN: 70,
			BLUE: 27,
			ALPHA: 0.55686274509803921568627450980392,
			NAME: 'Birch',
		},
		{
			RED: 21,
			GREEN: 65,
			BLUE: 16,
			ALPHA: 0.70196078431372549019607843137255,
			NAME: 'Oak',
		},
		{
			RED: 48,
			GREEN: 87,
			BLUE: 24,
			ALPHA: 0.32549019607843137254901960784314,
			NAME: 'Palm 1',
		},
		{
			RED: 42,
			GREEN: 78,
			BLUE: 19,
			ALPHA: 0.25490196078431372549019607843137,
			NAME: 'Palm 2',
		},
		{
			RED: 34,
			GREEN: 73,
			BLUE: 19,
			ALPHA: 0.36470588235294117647058823529412,
			NAME: 'Pine Apple',
		},
		{
			RED: 34,
			GREEN: 71,
			BLUE: 18,
			ALPHA: 0.45882352941176470588235294117647,
			NAME: 'Cypress',
		},
		{
			RED: 131,
			GREEN: 53,
			BLUE: 36,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Cherry',
		},
		{
			RED: 20,
			GREEN: 78,
			BLUE: 18,
			ALPHA: 0.46274509803921568627450980392157,
			NAME: 'Fir',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #1',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #2',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #3',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #4',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #5',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #6',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #7',
		},
	],
	[
		{
			RED: 117,
			GREEN: 80,
			BLUE: 62,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Spider',
		},
		{
			RED: 127,
			GREEN: 70,
			BLUE: 49,
			ALPHA: 0.45490196078431372549019607843137,
			NAME: 'Marley',
		},
		{
			RED: 117,
			GREEN: 80,
			BLUE: 62,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Clone Spider #1',
		},
		{
			RED: 127,
			GREEN: 70,
			BLUE: 49,
			ALPHA: 0.45490196078431372549019607843137,
			NAME: 'Clone Marley #1',
		},
		{
			RED: 117,
			GREEN: 80,
			BLUE: 62,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Clone Spider #2',
		},
		{
			RED: 34,
			GREEN: 73,
			BLUE: 19,
			ALPHA: 0.36470588235294117647058823529412,
			NAME: 'Pine Apple',
		},
		{
			RED: 117,
			GREEN: 80,
			BLUE: 62,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Clone Spider #3',
		},
		{
			RED: 131,
			GREEN: 53,
			BLUE: 36,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Cherry',
		},
		{
			RED: 127,
			GREEN: 70,
			BLUE: 49,
			ALPHA: 0.45490196078431372549019607843137,
			NAME: 'Clone Marley #2',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #1',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #2',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #3',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #4',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #5',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #6',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #7',
		},
	],
	[
		{
			RED: 88,
			GREEN: 99,
			BLUE: 77,
			ALPHA: 0.50196078431372549019607843137255,
			NAME: 'Pine',
		},
		{
			RED: 63,
			GREEN: 82,
			BLUE: 58,
			ALPHA: 0.49019607843137254901960784313725,
			NAME: 'Birch',
		},
		{
			RED: 77,
			GREEN: 94,
			BLUE: 60,
			ALPHA: 0.4078431372549019607843137254902,
			NAME: 'Fir',
		},
		{
			RED: 48,
			GREEN: 87,
			BLUE: 24,
			ALPHA: 0.32549019607843137254901960784314,
			NAME: 'Palm 1',
		},
		{
			RED: 42,
			GREEN: 78,
			BLUE: 19,
			ALPHA: 0.25490196078431372549019607843137,
			NAME: 'Palm 2',
		},
		{
			RED: 34,
			GREEN: 73,
			BLUE: 19,
			ALPHA: 0.36470588235294117647058823529412,
			NAME: 'Pine Apple',
		},
		{
			RED: 83,
			GREEN: 85,
			BLUE: 58,
			ALPHA: 0.41176470588235294117647058823529,
			NAME: 'Cypress',
		},
		{
			RED: 77,
			GREEN: 94,
			BLUE: 60,
			ALPHA: 0.4078431372549019607843137254902,
			NAME: 'Clone Fir #1',
		},
		{
			RED: 77,
			GREEN: 94,
			BLUE: 60,
			ALPHA: 0.4078431372549019607843137254902,
			NAME: 'Clone Fir #2',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #1',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #2',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #3',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #4',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #5',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #6',
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #7',
		},
	],
]
