---
title: WLD/SWD file format
description: Documentation for The Settlers II WLD and SWD file formats.
pubDate: 2015-08-19
modDate: 2023-07-20
layout: '$layouts/BlogEnglish.astro'
---

The Settlers II: Mission CD and Gold Edition use WLD files mainly for campaigns and for pre provided sets of Unlimited Play mode maps. They are remakes of Veni Vidi Vici [`WORLD###.DAT`](./WORLD.DAT) files in a Map Editor SWD compatible format. Essentially the file format of WLD and SWD is identical, but there are some usage and feature differences depending on context the map is loaded in.

Map files have a header block, a data block with all map data, an optional footer and end of file indicator `0xFF`. It is possible to add custom data after EOF indicator; it will simply by ignored by the game.

## Header

File can be identified by first ten bytes ASCII string reading `WORLD_V1.0`. Total header size is always 2352 bytes. All strings are in [code page 437](https://en.wikipedia.org/wiki/Code_page_437) character set, however the original game does not support rendering all the characters.

<div data-scrolling="inline">

| Offset     | Size | Type      | Description                                                                                                                                                                                                                                                                                                                                            |
| :--------- | :--- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0x00000000 | 10   | String    | `WORLD_V1.0` File format identification.                                                                                                                                                                                                                                                                                                               |
| 0x0000000A | 20   | String    | **Map title**; must end in null terminator. Unused bytes should be null.<br />_S2 Map Editor only allows 18 bytes long titles. There is no known use for the two bytes between title and map width + height._                                                                                                                                          |
| 0x0000001E | 2    | Integer   | **UI width**; used to display map width in Unlimited Play.                                                                                                                                                                                                                                                                                             |
| 0x00000020 | 2    | Integer   | **UI height**; used to display map height in Unlimited Play.                                                                                                                                                                                                                                                                                           |
| 0x00000022 | 1    | Integer   | **Texture and palette ID**:<br />`0x00` = Greenland<br />`0x01` = Wasteland<br />`0x02` = Winter World<br />Other values can be made to work but will result in glitched graphics.                                                                                                                                                                     |
| 0x00000023 | 1    | Integer   | **Player count**. Setting to zero makes map unplayable in Unlimited Play.                                                                                                                                                                                                                                                                              |
| 0x00000024 | 20   | Author    | **Map author**; must end in null terminator. Unused bytes should be null.                                                                                                                                                                                                                                                                              |
| 0x00000038 | 14   | Int16 x 7 | Player **headquarters X** position.<br />`0xFF` = Not set / player not in game.                                                                                                                                                                                                                                                                        |
| 0x00000046 | 14   | Int16 x 7 | Player **headquarters Y** position.<br />`0xFF` = Not set / player not in game.                                                                                                                                                                                                                                                                        |
| 0x00000054 | 1    | Integer   | **Invalid indicator**.<br />`0x00` = Playable in Unlimited Play.<br />Any other value: not playable in Unlimited Play.                                                                                                                                                                                                                                 |
| 0x00000055 | 7    | Int8 x 7  | **Player face**; only used in World Campaign.<br />`0x00` = Octavianus<br />`0x01` = Julius<br />`0x02` = Brutus<br />`0x03` = Erik<br />`0x04` = Knut<br />`0x05` = Olof<br />`0x06` = Yamauchi<br />`0x07` = Tsunami<br />`0x08` = Hakirawashi<br />`0x09` = Shaka<br />`0x0A` = Todo<br />`0x0B` = Mnga Tscha                                       |
| 0x0000005C | 2250 |           | **Passable areas**; contains up to 250 entries that tell the first index of each unique water and land mass.<br />`Int8` Type ID, `0x00` unused, `0x01` land, `0x02` water<br />`Int16` X position<br />`Int16` Y position<br />`Int32` Total mass<br />Impassable areas such as lava or swamp are not accounted for in here. Unused entries are null. |
| 0x00000926 | 2    | Int16     | `0x2711` **Map file identification** (as in `WORLD###.DAT` files).                                                                                                                                                                                                                                                                                     |
| 0x00000928 | 4    | Int32     | Always null in WLD files.                                                                                                                                                                                                                                                                                                                              |
| 0x0000092C | 2    | Int16     | Always `0x0001` in WLD files.                                                                                                                                                                                                                                                                                                                          |
| 0x0000092E | 2    | Int16     | **Map width** as used by all map loaders.                                                                                                                                                                                                                                                                                                              |
| 0x00000930 | 2    | Int16     | **Map height** as used by all map loaders.                                                                                                                                                                                                                                                                                                             |

</div>

Note that while the end header of WLD and SWD files is technically identical to what `WORLD###.DAT` files use the game does not support features that were supported by the DAT file format such as short block headers and map data compression.

**UI width** and **UI height** can be omitted in campaign maps, thus allowing 4 more bytes to be used for map title.

## Map Data

The file always has 14 map data blocks. Each map data block has identical 16 byte header:

<div data-scrolling="inline">

| Offset     | Size | Type    | Description                    |
| :--------- | :--- | :------ | :----------------------------- |
| 0x00000000 | 2    | Integer | Map data block identification. |
| 0x00000002 | 4    | Integer | Always null in WLD files.      |
| 0x00000006 | 2    | Integer | Width.                         |
| 0x00000008 | 2    | Integer | Height.                        |
| 0x0000000A | 2    | Integer | Always `0x0001` in WLD files.  |
| 0x0000000C | 4    | Integer | Bytes of map data to read.     |

</div>

Contents of map blocks are documented separately:

-   [Block 0 (height map)](./block-0)
-   [Block 1 & 2 (textures)](./block-1-and-2)
-   [Block 3 (roads)](./block-3)
-   [Block 4 & 5 (objects)](./block-4-and-5)
-   [Block 6 (animal)](./block-6)
-   [Block 7 (unknown)](./block-7)
-   [Block 8 (building sites)](./block-8)
-   [Block 9 (fog of war)](./block-9)
-   [Block 10 (icon)](./block-A)
-   [Block 11 (resources)](./block-B)
-   [Block 12 (light and shadow map)](./block-C)
-   [Block 13 (areas)](./block-D)

## Footer

Footer can contain optional extra animal information. The game will end reading the file immediately when it encounters `0xFF`.

<div data-scrolling="inline">

| Offset     | Size | Type    | Description        |
| :--------- | :--- | :------ | :----------------- |
| 0x00000000 | 1    | Integer | Animal ID.         |
| 0x00000001 | 2    | Integer | Animal X location. |
| 0x00000003 | 2    | Integer | Animal Y location. |

</div>

Number of entries can only be determined by reading the file until `0xFF` is encountered.

## Usage differences

### Roman Campaign

-   In the original main campaign it is possible to build ships. This means only these WLD files may contain harbor placements.
-   It is possible to use longer titles up to 24 bytes, because UI width and height values are not used.
-   Player faces are not used.

### World Campaign

-   No harbors.
-   Longer titles are usable here.
-   You can set player faces, and this is the only play mode where this information is used.

### Unlimited Play

-   No harbors.
-   Short titles: UI width and height are used to determine whether map can be loaded or not.
-   Player faces have no effect.

### Return to the Roots

-   Reads 20 bytes of title, does not require null terminator.
-   Player faces are not used.
-   Harbors are always supported.
-   Ignores a lot of the header: for example you can put anything in the passable areas block and the map will still work.

RttR may in future add support for new file features after footer, thus staying technically compatible with The Settlers II file loader.
