---
title: "World Map File Format (WLD/SWD)"
pubDate: 2011-07-23
layout: '$layouts/BlogEnglish.astro'
disqusIdentifier: 253
---

<style>
.terrains td:nth-child(2) img {
	background: url('/assets/docs/terrain0.png') no-repeat;
}
.terrains td:nth-child(3) img {
	background: url('/assets/docs/terrain1.png') no-repeat;
}
.terrains td:nth-child(4) img {
	background: url('/assets/docs/terrain2.png') no-repeat;
}
.terrains tr:nth-child(2) img {
	background-position: 0 -3rem;
}
.terrains tr:nth-child(3) img {
	background-position: 0 -6rem;
}
.terrains tr:nth-child(4) img {
	background-position: 0 -9rem;
}
.terrains tr:nth-child(5) img {
	background-position: 0 -12rem;
}
.terrains tr:nth-child(6) img {
	background-position: 0 -15rem;
}
.terrains tr:nth-child(7) img {
	background-position: 0 -18rem;
}
.terrains tr:nth-child(8) img {
	background-position: 0 -21rem;
}
.terrains tr:nth-child(9) img {
	background-position: 0 -24rem;
}
.terrains tr:nth-child(10) img {
	background-position: 0 -27rem;
}
.terrains tr:nth-child(11) img {
	background-position: 0 -30rem;
}
.terrains tr:nth-child(12) img {
	background-position: 0 -33rem;
}
.terrains tr:nth-child(13) img {
	background-position: 0 -36rem;
}
.terrains tr:nth-child(14) img {
	background-position: 0 -39rem;
}
.terrains tr:nth-child(15) img {
	background-position: 0 -42rem;
}
.terrains tr:nth-child(16) img {
	background-position: 0 -45rem;
}
.terrains tr:nth-child(17) img {
	background-position: 0 -48rem;
}
.terrains tr:nth-child(18) img {
	background-position: 0 -51rem;
}
.terrains tr:nth-child(19) img {
	background-position: 0 -54rem;
}
.terrains tr:nth-child(20) img {
	background-position: 0 -57rem;
}
.terrains tr:nth-child(21) img {
	background-position: 0 -51rem;
}
.terrains tr:nth-child(22) img {
	background-position: 0 -51rem;
}
.terrains tr:nth-child(23) img {
	background-position: 0 -51rem;
}
.terrains tr:nth-child(24) img {
	background-position: 0 -33rem;
}
</style>

The documentation is still incomplete. If you know more or find incorrect information why not [contribute changes via GitHub](https://github.com/Merri/settlers2)?

Total header size for WLD/SWD files is 2352 bytes. Total header size for `WORLD###.DAT` files is 14 bytes or 18 bytes.

| Bytes | Content | Description |
| --- | --- | --- |
| 10 | `WORLD_V1.0` | File format identification |
| 19(SWD)<br />23(WLD) | Title | Unused bytes filled with NULL.<br />**Map Editor** (`S2EDIT.EXE`) saves only **17 bytes** long titles, but preserves longer titles!<br />**19 bytes** is maximum for **SWD maps**.<br />Unlimited Play mode uses this Width & Height information. Long title prevents loading the map.<br />**23 bytes** is maximum for **WLD maps**. Width & Height information is not read when loading campaign missions. |
| 1 | NULL | NULL terminator for Title. Game reads the title until it encounters this end of string indicator. |
| 2 + 2 (SWD)<br />0 (WLD) | Width & Height | This information is not read by Campaign mission loader & Map Editor, but is read by Unlimited Play loader. Safe to ignore in WLD maps. |
| 1 | Terrain<br />0 = Greenland<br />1 = Wasteland<br />2 = Winter | Selects which palette & terrain textures to use. |
| 1 | Player count<br />0 = WLD only<br />1 - 7 = SWD | 0 is allowed for WLD, Unlimited Play accepts any value above 0 and trusts the player count from 1 to 6. Return to the Roots supports more than 7 players, in which case HQ locations for those players must be read from object index block. |
| 19 | Author | Map creator or owner. Unused bytes filled with NULL. |
| 1 | NULL | Null terminator for Author. |
| 14 | HQ X position | Horizontal position of each player's headquarters as a 16-bit value (2 bytes each = 7 total). |
| 14 | HQ Y position | Vertical position of each player's headquarters. |
| 1 | Validation flags | 0 = map is playable in Unlimited Play<br />1 = no players set<br />Any bit active means the map is unplayable in Unlimited Play. |
| 7 | Player leader<br />Roman:<br />0 = Octavianus<br />1 = Julius<br />2 = Brutus<br />Viking:<br />3 = Erik<br />4 = Knut<br />5 = Olof<br />Japanese:<br />6 = Yamauchi<br />7 = Tsunami<br />8 = Hakirawashi<br />Nubian:<br />9 = Shaka<br />10 = Todo<br />11 = Mnga Tscha | Each byte represents one player. This information seems to be only used by World Campaign. I suspect Blue Byte has an in-house Map Editor that was developed further than the version released to consumers. |
| 2250 | Passable areas | 250 values that tell the starting location of each unique watermass & landmass:<br />Type ID (1 byte): 0 = unused, 1 = land, 2 = water<br />X position (2 bytes)<br />Y position (2 bytes)<br />Total mass (4 bytes)<br />= 9 bytes each<br />This information used to be in `CONTI###.DAT` |
| 2 | Hex `11 27` | Map file identification. `WORLD###.DAT` files start with this information! |
| 4 | Hex `00 00 00 00` | Unused in `WORLD_V1.0` maps, must be NULL. `WORLD###.DAT` files may have `FF FF FF FF` before this information, forcing short block headers. Short block header is NOT supported in WLD/SWD files! |
| 2 | Hex `01 00` | Unknown; maybe multiplier for amount of map data, but is always 1. |
| 2 | Width | Map width, the one that is actually being used by map loaders. |
| 2 | Height | Map height, the one that is actually being used by map loaders. |

After this the actual map data blocks follow.

## Blocks

There is a total of 14 map data blocks. Each block = 16 bytes header + Width * Height of actual map data. These blocks are not identified in any means other than their order of appearance in the file.

### Map data header

Each block starts with this header and it is exactly the same for each block. There are two versions: long version used by nearly all maps, and short version that is only used by some rare `WORLD###.DAT` maps.

| Bytes | Content | Description |
| --- | --- | --- |
| 2 | Hex `10 27` | Map data identification. |
| 4 | Hex `00 00 00 00` | Always NULL. |
| 2 | Hex `01 00` | Unknown; maybe multiplier for amount of map data, but is always 1. |
| 2 | Width | Map width, the one that is actually being used by map loaders. |
| 2 | Height | Map height, the one that is actually being used by map loaders. |
| 4 | Length | Size of map data, always Width * Height. This is also the "short block header" that may appear in `WORLD###.DAT` maps. |

After reading the actual map file header you simply create a check variable to compare against block header and make sure it is a match. There is no reason to make reading "dynamic" as there is no map that contains varying information.

### Block 1: Height map

Original WLD mission maps base level = 0. New WLD maps base level = 40.

Map Editor SWD maps base level = 10. Maximum value = 60.

Greatest allowed height difference from point to point (in Map Editor) = 5. You can have a bigger difference, but building a road etc. near it may cause a crash. It may also make the map partially unplayable.

### Block 2: Texture triangle #1 ▲

This is the graphical triangle with it's top corner pointing to the X & Y of other map data locations.

**NOTE!** Textures may have bits `0x40` or `0x80` set active. `0x40` = harbor site textures, the meaning of `0x80` is currently unknown.

<div class="terrains">

| Value | Greenland | Wasteland | Winter |
| --- | --- | --- | --- |
| 0<br />`0x00` | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Savannah | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Dark Steppe | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Taiga |
| 1<br />`0x01` | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #1 | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #1 | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #1 |
| 2<br />`0x02` | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Snow | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava with few stones | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Few Ice Floes |
| 3<br />`0x03` | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Swamp | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava with many stones | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Many Ice Floes |
| 4<br />`0x04` | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Desert #1 | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Wasteland #1 | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Ice #1 |
| 5<br />`0x05` | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Water | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Moor | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Water |
| **6<br />`0x06`** | ![](/assets/docs/terrain_buildable.png "Buildable")<br />Buildable water | ![](/assets/docs/terrain_buildable.png "Buildable")<br />Buildable moor<br />Sharp edge! | ![](/assets/docs/terrain_buildable.png "Buildable")<br />Buildable water<br />Icy edge! |
| **7<br />`0x07`** | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Desert #2 | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Wasteland #2 | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Ice #2<br />Desert edge! |
| 8<br />`0x08` | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Meadow #1 | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Pasture #1 | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Taiga / Tundra |
| 9<br />`0x09` | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Meadow #2 | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Pasture #2 | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Tundra #1 |
| 10<br />`0x0A` | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Meadow #3 | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Pasture #3 | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Tundra #2 |
| 11<br />`0x0B` | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #2 | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #2 | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #2 |
| 12<br />`0x0C` | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #3 | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #3 | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #3 |
| 13<br />`0x0D` | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #4 | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #4 | ![](/assets/docs/terrain_mine.png "Mountain")<br />Mountain #4 |
| 14<br />`0x0E` | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Steppe | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Light Steppe | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Tundra #3 |
| 15<br />`0x0F` | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Flower Meadow | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Flower Pasture | ![](/assets/docs/terrain_farmland.png "Buildable farmland")<br />Tundra #4 |
| 16<br />`0x10` | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava |
| **17<br />`0x11`** | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Magenta<br />Sharp edge! | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Dark Red<br />Sharp edge! | ![](/assets/docs/terrain_flaggable.png "Can build roads")<br />Black<br />Sharp edge! |
| 18<br />`0x12` | ![](/assets/docs/terrain_buildable.png "Buildable")<br />Mountain Meadow | ![](/assets/docs/terrain_buildable.png "Buildable")<br />Alpine Pasture | ![](/assets/docs/terrain_buildable.png "Buildable")<br />Snow |
| 19<br />`0x13` | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Water Ships don't use this | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Moor Ships don't use this | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Water Ships don't use this |
| **20<br />`0x14`** | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #2 / Magenta | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #2 / Dark Red | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #2 / Black |
| **21<br />`0x15`** | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #3 / Magenta | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #3 / Dark Red | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #3 / Black |
| **22<br />`0x16`** | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #4 / Magenta | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #4 / Dark Red | ![](/assets/docs/terrain_impassable.png "Impassable")<br />Lava #4 / Black |
| 34<br />`0x22` | ![](/assets/docs/terrain_buildable.png "Mountain")<br />Buildable Mountain #2 | ![](/assets/docs/terrain_buildable.png "Mountain")<br />Buildable Mountain #2 | ![](/assets/docs/terrain_buildable.png "Mountain")<br />Buildable Mountain #2 |

</div>

Value 17 is probably best for totally bizarre levels. The only terrain tiles that draw a shaded edge against it are Mountain Meadow and Desert #2, so that is a limitation. This texture is represented by a single pixel in `TEX5.LBM`, `TEX6.LBM` & `TEX7.LBM` (at 0 x 254).

Value 19 could be used to create fully invisible sea blocks for ships, giving more control on where to let the ships go and where not. So it would be an excellent custom mission tool to make sure the player can't explore freely...

Values 20 - 22 are three textures that locate at the bottom of the texture bitmap. These are unused and appear as magenta on the map, but display in lava color in map preview. No gouraud shading is applied to this texture. Value 21 has desert edge.

Values 23 and above are invalid/unusable textures except for 34 which is usable as a mountain spot where one can build buildings.

Below you can see how `TEX#.LBM` graphics maps to texture indexes:

![](/wp-content/uploads/2011/07/texture_map.png "Simple ")

Or if interested which pixels are actually used by the game:

![](/wp-content/uploads/2015/09/Tex5.png "Debug Texture")

### Block 3: Texture triangle #2 ▼

This is the graphical triangle with it's left top corner pointing to the X & Y of other map data locations.

### Block 4: Roads

...

### Block 5: Object Index

The value here tells the object's index or quantity. The next block defines the context.

**Granite Type 0 (Bits 3/4/7/8)** **Granite Type 1 (Bits 1/3/4/7/8)** Quantity value range from 1 to 6, 6 = maximum

Trees are animated in the game. Each tree is assigned a random value so that all trees do not animate at the same position at the same time (thus avoiding a "wave effect" where all trees move the same way).

| Value | Hex | Tree Type 0 (Bits 3/7/8) | Tree Type 1 (Bits 1/3/7/8) | Tree Type 2 (Bits 2/3/7/8) |
| --- | --- | --- | --- | --- |
|  | `30 ... 37` | Pine | Palm 2 | Fir |
|  | `70 ... 77` | Birch | Pine Apple | \- |
|  | `B0 ... B7` | Oak | Cypress | \- |
|  | `F0 ... F7` | Palm 1 | Cherry | \- |

The rest are just object indexes for decorative landscape objects.

| Value | Hex | Landscape Object (Bits 4/7/8) |
| --- | --- | --- |
| 0 | `00` | Mushroom 1 |
| 1 | `01` | Mushroom 2 |
| 2 | `02` | Stone 1 |
| 3 | `03` | Stone 2 |
| 4 | `04` | Stone 3 |
| 5 | `05` | Dead Tree (trunk) |
| 6 | `06` | Dead Tree |
| 7 | `07` | Bone 1 |
| 8 | `08` | Bone 2 |
| 10 | `0A` | Bush 1 |
| 11 | `0B` | Water stone |
| 12 | `0C` | Cactus 1 |
| 13 | `0D` | Cactus 2 |
| 14 | `0E` | Shrub 1 |
| 15 | `0F` | Shrub 2 |
| 16 | `10` | Bush 2 |
| 17 | `11` | Bush 3 |
| 18 | `12` | Bush 4 |
| 19 | `13` | Shrub 3 |
| 20 | `14` | Shrub 4 |
| 24 | `18` | Stalagmite 1 |
| 25 | `19` | Stalagmite 2 |
| 26 | `1A` | Stalagmite 3 |
| 27 | `1B` | Stalagmite 4 |
| 28 | `1C` | Stalagmite 5 |
| 29 | `1D` | Stalagmite 6 |
| 30 | `1E` | Stalagmite 7 |
| 34 | `22` | Mushroom 3 |
| 37 | `25` | Pebble 1 |
| 38 | `26` | Pebble 2 |
| 39 | `27` | Pebble 3 |
| 40 | `28` | Big bush |
| 41 | `29` | Blue bush |
| 42 | `2A` | Small bush |

### Block 6: Object Type

This defines what the index value in block 5 means. 0 = no object

| Bit | Decimal | Description |
| --- | --- | --- |
| 1 | 1 | Tree (197) Granite (205) |
| 2 | 2 | Tree (198) |
| 3 | 4 | Bit 3 = Tree Bit 3 + 4 = Granite Tree (196) Granite (204) |
| 4 | 8 | Bit 4 = Landscape Bit 4 + 3 = Granite Landscape (200) Granite (204) |
| 5 | 16 | Not used? |
| 6 | 32 | Not used? |
| 7 | 64 | Is a tree/granite/landscape object Exists with all except headquarters icon. |
| 8 | 128 | Object exists Headquarters icon (128) |

### Block 7: Animals

| Value | Animal |
| --- | --- |
| 0 | No animal |
| 1 | Rabbit |
| 2 | Fox |
| 3 | Stag |
| 4 | Deer |
| 5 | Duck |
| 6 | Sheep |
| 7 | Deer |
| 8 | Duck |
| 9 | Pack donkey |

WORLD###.DAT files fill empty area with FF. This crashes Map Editor.

### Block 8: Unknown / Internal? / Savegame?

WLD/SWD files contain hex 00. WORLD###.DAT files fill this with FF. This crashes Map Editor.

### Block 9: Buildable sites

Missing from this list: harbor, coast flag?

808Bitflag for occupied / near occupied terrain ?

| Value | Hex | Description |
| --- | --- | --- |
| 0 | `00` | Unused |
| 1 | `01` | Flag (road) |
| 2 | `02` | Hut (small building) |
| 3 | `03` | House (medium building) |
| 4 | `04` | Castle (large building) |
| 5 | `05` | Mine |
| 6 | `06` | Unused? |
| 7 | `07` | Unused? |
| 9 | `09` | Flag (next to inaccessible terrain, see 78) |
| 12 | `0C` | Castle near/on water? (next to inaccessible terrain, see 78) |
| 13 | `0D` | Mine near water (next to inaccessible terrain, see 78) |
| 104 | `68` | Occupied by a tree |
| 120 | `78` | Occupied by inaccessible terrain (water, lava, snow, swamp, granite) Water, swamp & granite allow flag 9 around point 78. Lava & snow do not allow this, instead any point close to snow/lava is 78. |

### Block 10: Unknown / Internal? / Savegame?

Everything is 7.

### Block 11: Map Editor cursor position

1 = location where Map Editor's cursor was pointed at when saving the map. Otherwise empty.

### Block 12: Resources

Water is always there, Fish is removed once consumed, and then Coal, Gold, Iron & Granite quantities. Smallest value for mining resources = none available anymore.

| Value | Hex | Resource |
| --- | --- | --- |
| 33 | `21` | Water |
| 135 | `87` | Fish |
| 64 ... 71 | `40 ... 47` | Coal |
| 72 ... 79 | `48 ... 4F` | Iron ore |
| 80 ... 87 | `50 ... 57` | Gold |
| 88 ... 95 | `58 ... 5F` | Granite |

### Block 13: Gouraud Shading

Map Editor always recalculates this information based on map data #1 (height map). Game instead trusts the file. This information must be correct or the map appears "flat" in the game.

The GOU5.DAT, GOU6.DAT and GOU7.DAT files include a gouraud color map for shading with this map data. You can use information from map data #2 or #3 to link it with this map, getting then a nicely colored picture. The values here range from 0 to 128.

The color index is either hardcoded (water, lava, steppe) or taken from TEX#.LBM position 16 x 0 for each of the 48 x 48 sized textures. The table shows the location in the whole texture file.

| Index | TEX5.LBM X & Y | Greenland | Wasteland | Winter |
| --- | --- | --- | --- | --- |
| 0<br />`0x00` | 16 x 96 | 233 | 114 | 123 |
| 1<br />`0x01` | 16 x 48 | 216 | 167 | 116 |
| 2<br />`0x02` | 16 x 0 | 123 | 139 | 244 |
| 3<br />`0x03` | 112 x 0 | 233 | 160 | 244 |
| 4<br />`0x04` | 64 x 0 | 199 | 85 | 183 |
| 5<br />`0x05` | Hardcoded | 61 | 42 | 240 |
| 6<br />`0x06` | Hardcoded | 61 | 42 | 240 |
| 7<br />`0x07` | 64 x 0 | 199 | 85 | 183 |
| 8<br />`0x08` | 64 x 96 | 231 | 165 | 36 |
| 9<br />`0x09` | 112 x 96 | 233 | 166 | 102 |
| 10<br />`0x0A` | 160 x 96 | 230 | 166 | 123 |
| 11<br />`0x0B` | 64 x 48 | 216 | 33 | 117 |
| 12<br />`0x0C` | 112 x 48 | 216 | 212 | 118 |
| 13<br />`0x0D` | 160 x 48 | 215 | 212 | 118 |
| 14<br />`0x0E` | Hardcoded | 236 | 167 | 233 |
| 15<br />`0x0F` | 160 x 0 | 231 | 114 | 120 |
| 16<br />`0x10` | Hardcoded | 57 | 248 | 248 |
| 17<br />`0x11` | 0 x 254 | 254 | 254 | 254 |
| 18<br />`0x12` | 64 x 144 | 216 | 160 | 122 |
| 19<br />`0x13` | Hardcoded | 61 | 42 | 240 |
| 20<br />`0x14` | Hardcoded | 57 | 248 | 248 |
| 21<br />`0x15` | Hardcoded | 57 | 248 | 248 |
| 22<br />`0x16` | Hardcoded | 57 | 248 | 248 |

In the above table the Greenland/Wasteland/Winter value is the X position in gouraud color map. You get the Y position from the map data #13. The index value can come from map data #2 or #3.

[![](/wp-content/uploads/2011/07/shading.png "shading")](/wp-content/uploads/2011/07/shading.png)<br /><small>Relative points calculated in shading</small>

**To calculate shading:**

In the image to the left you can see one white point and four grey points. White point is the point we are calculating the shading value for.

The grey points are the relative points we also use to calculate the shading for the white point. From top to bottom, left to right, we can call these point 1, point 2, point 3 & point 4.

```
Shading = 64
Shading += 9 \* (Point1 - WhitePoint)
Shading -= 3 \* (Point2 - WhitePoint)
Shading -= 6 \* (Point3 - WhitePoint)
Shading -= 9 \* (Point4 - WhitePoint)
If Shading > 128 Then Shading = 128
If Shading < 0 Then Shading = 0
```

### Block 14: Passable Areas

Indexed passable areas (0 to 249). These locations are referred to in the file header. Index 254 is reserved for impassable areas (snow, swamps, lava etc.). Header does not refer to these areas.

## Footer

The file always ends with hex `FF`.

After the final map data the file may contain a list of animals and their position, replicating the information in one of the map data blocks in a different format. Each of these list items is 7 bytes long. The only difference to the map data block is that it is allowed to have the same location covered multiple times, so you can have more than one animal starting from each location.

| Bytes | Description |
| --- | --- |
| 1 | Animal. See map data 7 table above. |
| 2 | Animal X location. |
| 2 | Animal Y location. |

 

## Buggy maps

- **Island of Hills** (`MAPS3\OMAP00.WLD`) provided in The Settlers II: Gold Edition DEMO lets you build houses on water. Yeah, it's cool! Water texture index 6 is being used instead of index 5.

## Credits

This information is largely figured out by myself (Merri / Vesa Piittinen). Farm field information by [Jürgen Nagel](http://www.jnsoftware.de/Siedler2/tips.htm). Additional information on textures, shading calculation and building sites calculation by Xaser ([WLD\_reference.txt](http://www.le-softworks.com/WLD_reference.txt)). Some minor details may have come from other sources.
