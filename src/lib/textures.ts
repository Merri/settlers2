import { Texture, TextureSet } from './types'

/**
 * - noRoad: any node having this type of texture can't have a road
 * - edgeRoad: node allows roads to be built except if every type of texture in node is this type
 * - road: node allows roads to be built
 * - house: node allows roads and houses to be built
 * - mine: node allows roads and mines to be built
 */
export type TextureBuildLevel = 'noRoad' | 'edgeRoad' | 'road' | 'house' | 'mine'

export const TextureBuildFeature: Record<Texture, TextureBuildLevel> = {
	[Texture.Fertile1]: 'house',
	[Texture.Mining1]: 'mine',
	[Texture.Inaccessible]: 'noRoad',
	[Texture.UnbuildableLand]: 'edgeRoad',
	[Texture.Houseless]: 'road',
	[Texture.UnbuildableWater]: 'edgeRoad',
	[Texture.BuildableWater]: 'house',
	[Texture.HouselessAlt]: 'road',
	[Texture.Fertile2]: 'house',
	[Texture.Fertile3]: 'house',
	[Texture.Fertile4]: 'house',
	[Texture.Mining2]: 'mine',
	[Texture.Mining3]: 'mine',
	[Texture.Mining4]: 'mine',
	[Texture.Fertile5]: 'house',
	[Texture.Fertile6]: 'house',
	[Texture.InaccessibleLava]: 'noRoad',
	[Texture.HouselessSingleColor]: 'road',
	[Texture.Buildable]: 'house',
	[Texture.InaccessibleWater]: 'noRoad',
	[Texture.InaccessibleLavaLowRes1]: 'noRoad',
	[Texture.InaccessibleLavaLowRes2]: 'noRoad',
	[Texture.InaccessibleLavaLowRes3]: 'noRoad',
	[Texture.FertileMining]: 'house',
}

const lavaSet = new Set([
	Texture.InaccessibleLava,
	Texture.InaccessibleLavaLowRes1,
	Texture.InaccessibleLavaLowRes2,
	Texture.InaccessibleLavaLowRes3,
])

export function isLavaTexture(texture: number) {
	return lavaSet.has(texture)
}

const waterSet = new Set([Texture.UnbuildableWater, Texture.BuildableWater, Texture.InaccessibleWater])

export function looksLikeWaterTexture(texture: number) {
	return waterSet.has(texture)
}

export const TreeType = {
	Fellable1: 0,
	Fellable2: 1,
	Fellable3: 2,
	Fellable4: 3,
	Fellable5: 4,
	Solid1: 6,
	Fellable6: 6,
	Fellable7: 7,
	Fellable8: 8,
} as const

export type TreeType = typeof TreeType[keyof typeof TreeType]

export interface TextureResource {
	fish: boolean
	freshWater: boolean
	minerals: boolean
}

export interface TextureGroup {
	name: string
	type: TextureSet
	textureNames: Record<Texture, string>
	textureResources: Record<Texture, TextureResource>
	treeNames: Record<TreeType, string>
}

export const SupportedTexture = {
	Greenland: 'Greenland',
	Wasteland: 'Wasteland',
	WinterWorld: 'WinterWorld',
	NewGreenland: 'NewGreenland',
	Wetlands: 'Wetlands',
	RustyValley: 'RustyValley',
	PolarNight: 'PolarNight',
} as const

export type SupportedTexture = typeof SupportedTexture[keyof typeof SupportedTexture]

export const defaultResources = {
	Fertile: { fish: false, freshWater: true, minerals: false } as TextureResource,
	Mining: { fish: false, freshWater: false, minerals: true } as TextureResource,
	Water: { fish: true, freshWater: false, minerals: false } as TextureResource,
	Nothing: { fish: false, freshWater: false, minerals: false } as TextureResource,
} as const

const DefaultResources: Record<Texture, TextureResource> = {
	[Texture.Fertile1]: defaultResources.Fertile,
	[Texture.Mining1]: defaultResources.Mining,
	[Texture.Inaccessible]: defaultResources.Nothing,
	[Texture.UnbuildableLand]: defaultResources.Nothing,
	[Texture.Houseless]: defaultResources.Nothing,
	[Texture.UnbuildableWater]: defaultResources.Water,
	[Texture.BuildableWater]: defaultResources.Nothing,
	[Texture.HouselessAlt]: defaultResources.Nothing,
	[Texture.Fertile2]: defaultResources.Fertile,
	[Texture.Fertile3]: defaultResources.Fertile,
	[Texture.Fertile4]: defaultResources.Fertile,
	[Texture.Mining2]: defaultResources.Mining,
	[Texture.Mining3]: defaultResources.Mining,
	[Texture.Mining4]: defaultResources.Mining,
	[Texture.Fertile5]: defaultResources.Fertile,
	[Texture.Fertile6]: defaultResources.Fertile,
	[Texture.InaccessibleLava]: defaultResources.Nothing,
	[Texture.HouselessSingleColor]: defaultResources.Nothing,
	[Texture.Buildable]: defaultResources.Nothing,
	[Texture.InaccessibleWater]: defaultResources.Nothing,
	[Texture.InaccessibleLavaLowRes1]: defaultResources.Nothing,
	[Texture.InaccessibleLavaLowRes2]: defaultResources.Nothing,
	[Texture.InaccessibleLavaLowRes3]: defaultResources.Nothing,
	[Texture.FertileMining]: defaultResources.Fertile,
} as const

export const TextureInfo: Partial<Record<SupportedTexture, TextureGroup>> = {
	Greenland: {
		type: TextureSet.Greenland,
		name: 'Greenland',
		textureNames: {
			[Texture.Fertile1]: 'Savannah',
			[Texture.Mining1]: 'Mountain #1',
			[Texture.Inaccessible]: 'Snow',
			[Texture.UnbuildableLand]: 'Swamp',
			[Texture.Houseless]: 'Desert',
			[Texture.UnbuildableWater]: 'Water',
			[Texture.BuildableWater]: 'Water (land)',
			[Texture.HouselessAlt]: 'Desert (clone)',
			[Texture.Fertile2]: 'Meadow #1',
			[Texture.Fertile3]: 'Meadow #2',
			[Texture.Fertile4]: 'Meadow #3',
			[Texture.Mining2]: 'Mountain #2',
			[Texture.Mining3]: 'Mountain #3',
			[Texture.Mining4]: 'Mountain #4',
			[Texture.Fertile5]: 'Steppe',
			[Texture.Fertile6]: 'Flower meadow',
			[Texture.InaccessibleLava]: 'Lava',
			[Texture.HouselessSingleColor]: 'Pixel',
			[Texture.Buildable]: 'Mountain Meadow',
			[Texture.InaccessibleWater]: 'Water (no access)',
			[Texture.InaccessibleLavaLowRes1]: 'Lava LQ #1',
			[Texture.InaccessibleLavaLowRes2]: 'Lava LQ #2',
			[Texture.InaccessibleLavaLowRes3]: 'Lava LQ #3',
			[Texture.FertileMining]: 'Arable mountain #2',
		},
		textureResources: DefaultResources,
		treeNames: {
			[TreeType.Fellable1]: 'Pine',
			[TreeType.Fellable2]: 'Birch',
			[TreeType.Fellable3]: 'Oak',
			[TreeType.Fellable4]: 'Palm #1',
			[TreeType.Fellable5]: 'Palm #2',
			[TreeType.Solid1]: 'Pine Apple',
			[TreeType.Fellable6]: 'Cypress',
			[TreeType.Fellable7]: 'Cherry',
			[TreeType.Fellable8]: 'Fir',
		},
	},
	Wasteland: {
		type: TextureSet.Wasteland,
		name: 'Wasteland',
		textureNames: {
			[Texture.Fertile1]: 'Dark Steppe',
			[Texture.Mining1]: 'Mountain #1',
			[Texture.Inaccessible]: 'Few stones on lava',
			[Texture.UnbuildableLand]: 'Many stones on lava',
			[Texture.Houseless]: 'Wasteland',
			[Texture.UnbuildableWater]: 'Water',
			[Texture.BuildableWater]: 'Water (land)',
			[Texture.HouselessAlt]: 'Wasteland (clone)',
			[Texture.Fertile2]: 'Pasture #1',
			[Texture.Fertile3]: 'Pasture #2',
			[Texture.Fertile4]: 'Pasture #3',
			[Texture.Mining2]: 'Mountain #2',
			[Texture.Mining3]: 'Mountain #3',
			[Texture.Mining4]: 'Mountain #4',
			[Texture.Fertile5]: 'Light Steppe',
			[Texture.Fertile6]: 'Flower Pasture',
			[Texture.InaccessibleLava]: 'Lava',
			[Texture.HouselessSingleColor]: 'Pixel',
			[Texture.Buildable]: 'Stones (Alpine Pasture)',
			[Texture.InaccessibleWater]: 'Water (no access)',
			[Texture.InaccessibleLavaLowRes1]: 'Lava LQ #1',
			[Texture.InaccessibleLavaLowRes2]: 'Lava LQ #2',
			[Texture.InaccessibleLavaLowRes3]: 'Lava LQ #3',
			[Texture.FertileMining]: 'Arable mountain #2',
		},
		textureResources: DefaultResources,
		treeNames: {
			[TreeType.Fellable1]: 'Spider',
			[TreeType.Fellable2]: 'Marley',
			[TreeType.Fellable3]: 'Spider #1',
			[TreeType.Fellable4]: 'Marley #1',
			[TreeType.Fellable5]: 'Spider #2',
			[TreeType.Solid1]: 'Pine Apple',
			[TreeType.Fellable6]: 'Spider #3',
			[TreeType.Fellable7]: 'Cherry',
			[TreeType.Fellable8]: 'Marley #3',
		},
	},
	WinterWorld: {
		type: TextureSet.WinterWorld,
		name: 'Winter World',
		textureNames: {
			[Texture.Fertile1]: 'Taiga',
			[Texture.Mining1]: 'Mountain #1',
			[Texture.Inaccessible]: 'Few ice floes on water',
			[Texture.UnbuildableLand]: 'Many ice floes on water',
			[Texture.Houseless]: 'Ice',
			[Texture.UnbuildableWater]: 'Water',
			[Texture.BuildableWater]: 'Water (land)',
			[Texture.HouselessAlt]: 'Ice (clone)',
			[Texture.Fertile2]: 'Taiga / Tundra',
			[Texture.Fertile3]: 'Tundra #1',
			[Texture.Fertile4]: 'Tundra #2',
			[Texture.Mining2]: 'Mountain #2',
			[Texture.Mining3]: 'Mountain #3',
			[Texture.Mining4]: 'Mountain #4',
			[Texture.Fertile5]: 'Tundra #3',
			[Texture.Fertile6]: 'Tundra #4',
			[Texture.InaccessibleLava]: 'Lava',
			[Texture.HouselessSingleColor]: 'Pixel',
			[Texture.Buildable]: 'Snow',
			[Texture.InaccessibleWater]: 'Water (no access)',
			[Texture.InaccessibleLavaLowRes1]: 'Lava LQ #1',
			[Texture.InaccessibleLavaLowRes2]: 'Lava LQ #2',
			[Texture.InaccessibleLavaLowRes3]: 'Lava LQ #3',
			[Texture.FertileMining]: 'Arable mountain #2',
		},
		textureResources: DefaultResources,
		treeNames: {
			[TreeType.Fellable1]: 'Pine',
			[TreeType.Fellable2]: 'Birch',
			[TreeType.Fellable3]: 'Fir',
			[TreeType.Fellable4]: 'Palm #1',
			[TreeType.Fellable5]: 'Palm #2',
			[TreeType.Solid1]: 'Pine Apple',
			[TreeType.Fellable6]: 'Cypress',
			[TreeType.Fellable7]: 'Fir #1',
			[TreeType.Fellable8]: 'Fir #2',
		},
	},
	NewGreenland: {
		type: TextureSet.Greenland,
		name: `Merri's New Greenland`,
		textureNames: {
			[Texture.Fertile1]: 'Savannah',
			[Texture.Mining1]: 'Mountain #1',
			[Texture.Inaccessible]: 'Snow',
			[Texture.UnbuildableLand]: 'Swamp',
			[Texture.Houseless]: 'Desert',
			[Texture.UnbuildableWater]: 'Water',
			[Texture.BuildableWater]: 'Water (land)',
			[Texture.HouselessAlt]: 'Desert (clone)',
			[Texture.Fertile2]: 'Meadow #1',
			[Texture.Fertile3]: 'Meadow #2',
			[Texture.Fertile4]: 'Meadow #3',
			[Texture.Mining2]: 'Mountain #2',
			[Texture.Mining3]: 'Mountain #3',
			[Texture.Mining4]: 'Mountain #4',
			[Texture.Fertile5]: 'Steppe',
			[Texture.Fertile6]: 'Flower meadow',
			[Texture.InaccessibleLava]: 'Lava',
			[Texture.HouselessSingleColor]: 'Pixel',
			[Texture.Buildable]: 'Mountain Meadow',
			[Texture.InaccessibleWater]: 'Water (no access)',
			[Texture.InaccessibleLavaLowRes1]: 'Lava LQ #1',
			[Texture.InaccessibleLavaLowRes2]: 'Lava LQ #2',
			[Texture.InaccessibleLavaLowRes3]: 'Lava LQ #3',
			[Texture.FertileMining]: 'Arable mountain #2',
		},
		textureResources: DefaultResources,
		treeNames: {
			[TreeType.Fellable1]: 'Pine',
			[TreeType.Fellable2]: 'Birch',
			[TreeType.Fellable3]: 'Oak',
			[TreeType.Fellable4]: 'Palm #1',
			[TreeType.Fellable5]: 'Palm #2',
			[TreeType.Solid1]: 'Pine Apple',
			[TreeType.Fellable6]: 'Cypress',
			[TreeType.Fellable7]: 'Cherry',
			[TreeType.Fellable8]: 'Fir',
		},
	},
	Wetlands: {
		type: TextureSet.Greenland,
		name: `Wetlands`,
		textureNames: {
			[Texture.Fertile1]: 'Stones',
			[Texture.Mining1]: 'Mountain #1',
			[Texture.Inaccessible]: 'Mud',
			[Texture.UnbuildableLand]: 'Swamp',
			[Texture.Houseless]: 'Wet stones',
			[Texture.UnbuildableWater]: 'Water',
			[Texture.BuildableWater]: 'Water (land)',
			[Texture.HouselessAlt]: 'Wet stones (clone)',
			[Texture.Fertile2]: 'Meadow #1',
			[Texture.Fertile3]: 'Meadow #2',
			[Texture.Fertile4]: 'Meadow #3',
			[Texture.Mining2]: 'Mountain #2',
			[Texture.Mining3]: 'Mountain #3',
			[Texture.Mining4]: 'Mountain #4',
			[Texture.Fertile5]: 'Meadow stones',
			[Texture.Fertile6]: 'Flower meadow',
			[Texture.InaccessibleLava]: 'Lava',
			[Texture.HouselessSingleColor]: 'Pixel',
			[Texture.Buildable]: 'Mountain Meadow',
			[Texture.InaccessibleWater]: 'Water (no access)',
			[Texture.InaccessibleLavaLowRes1]: 'Lava flow left LQ #1',
			[Texture.InaccessibleLavaLowRes2]: 'Lava flow right LQ #2',
			[Texture.InaccessibleLavaLowRes3]: 'Lava flow down LQ #3',
			[Texture.FertileMining]: 'Arable mountain #2',
		},
		textureResources: DefaultResources,
		treeNames: {
			[TreeType.Fellable1]: 'Pine',
			[TreeType.Fellable2]: 'Birch',
			[TreeType.Fellable3]: 'Oak',
			[TreeType.Fellable4]: 'Palm #1',
			[TreeType.Fellable5]: 'Palm #2',
			[TreeType.Solid1]: 'Pine Apple',
			[TreeType.Fellable6]: 'Cypress',
			[TreeType.Fellable7]: 'Cherry',
			[TreeType.Fellable8]: 'Fir',
		},
	},
	RustyValley: {
		type: TextureSet.Wasteland,
		name: `Rusty Valley`,
		textureNames: {
			[Texture.Fertile1]: 'Stones',
			[Texture.Mining1]: 'Light mountain',
			[Texture.Inaccessible]: 'Mud',
			[Texture.UnbuildableLand]: 'Quicksand',
			[Texture.Houseless]: 'Stone desert',
			[Texture.UnbuildableWater]: 'Water',
			[Texture.BuildableWater]: 'Water (land)',
			[Texture.HouselessAlt]: 'Stone desert (clone)',
			[Texture.Fertile2]: 'Pasture #1',
			[Texture.Fertile3]: 'Green pasture',
			[Texture.Fertile4]: 'Pasture #2',
			[Texture.Mining2]: 'Mountain #1',
			[Texture.Mining3]: 'Mountain #2',
			[Texture.Mining4]: 'Dark mountain',
			[Texture.Fertile5]: 'Meadow stones',
			[Texture.Fertile6]: 'Flower pasture',
			[Texture.InaccessibleLava]: 'Lava',
			[Texture.HouselessSingleColor]: 'Pixel',
			[Texture.Buildable]: 'Sand',
			[Texture.InaccessibleWater]: 'Water (no access)',
			[Texture.InaccessibleLavaLowRes1]: 'Lava flow left LQ #1',
			[Texture.InaccessibleLavaLowRes2]: 'Lava flow right LQ #2',
			[Texture.InaccessibleLavaLowRes3]: 'Lava flow down LQ #3',
			[Texture.FertileMining]: 'Arable mountain #1',
		},
		textureResources: DefaultResources,
		treeNames: {
			[TreeType.Fellable1]: 'Spider',
			[TreeType.Fellable2]: 'Marley',
			[TreeType.Fellable3]: 'Spider #1',
			[TreeType.Fellable4]: 'Marley #1',
			[TreeType.Fellable5]: 'Spider #2',
			[TreeType.Solid1]: 'Pine Apple',
			[TreeType.Fellable6]: 'Spider #3',
			[TreeType.Fellable7]: 'Cherry',
			[TreeType.Fellable8]: 'Marley #3',
		},
	},
	PolarNight: {
		type: TextureSet.WinterWorld,
		name: 'Polar Night',
		textureNames: {
			[Texture.Fertile1]: 'Coldest meadow',
			[Texture.Mining1]: 'Cold mountain',
			[Texture.Inaccessible]: 'Few ice floes on water',
			[Texture.UnbuildableLand]: 'Many ice floes on water',
			[Texture.Houseless]: 'Ice',
			[Texture.UnbuildableWater]: 'Water',
			[Texture.BuildableWater]: 'Water (land)',
			[Texture.HouselessAlt]: 'Ice (clone)',
			[Texture.Fertile2]: 'Colder meadow',
			[Texture.Fertile3]: 'Meadow #1',
			[Texture.Fertile4]: 'Meadow #2',
			[Texture.Mining2]: 'Mountain #1',
			[Texture.Mining3]: 'Mountain #2',
			[Texture.Mining4]: 'Mountain #3',
			[Texture.Fertile5]: 'Meadow #3',
			[Texture.Fertile6]: 'Cold meadow',
			[Texture.InaccessibleLava]: 'Lava',
			[Texture.HouselessSingleColor]: 'Pixel',
			[Texture.Buildable]: 'Snow',
			[Texture.InaccessibleWater]: 'Water (no access)',
			[Texture.InaccessibleLavaLowRes1]: 'Lava flow left LQ #1',
			[Texture.InaccessibleLavaLowRes2]: 'Lava flow right LQ #2',
			[Texture.InaccessibleLavaLowRes3]: 'Lava flow down LQ #3',
			[Texture.FertileMining]: 'Arable mountain #1',
		},
		textureResources: DefaultResources,
		treeNames: {
			[TreeType.Fellable1]: 'Pine',
			[TreeType.Fellable2]: 'Birch',
			[TreeType.Fellable3]: 'Fir',
			[TreeType.Fellable4]: 'Palm #1',
			[TreeType.Fellable5]: 'Palm #2',
			[TreeType.Solid1]: 'Pine Apple',
			[TreeType.Fellable6]: 'Cypress',
			[TreeType.Fellable7]: 'Fir #1',
			[TreeType.Fellable8]: 'Fir #2',
		},
	},
}
