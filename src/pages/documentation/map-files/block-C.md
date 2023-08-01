---
title: Map Block 12 (light and shadow map)
description: Documentation for The Settlers II map file format, map block 12.
pubDate: 2015-08-20
modDate: 2023-07-31
layout: '$layouts/BlogEnglish.astro'
---

This is a precalculated light and shadow map information for minimap, and is also used for values the game uses for calculating shading on landscape textures. <a href="/return-to-the-roots">Return to the Roots</a> ignores this block as it uses more modern rendering techniques to present the landscape.

The calculation is based purely on values from height map. For each position you take:

1. Top right value
2. Right right value
3. Right value
4. Bottom right right value

In the diagram below parantheses point the index position we would calculate to the precalculated map table.

```
    .-----.-----1
   / \   / \   / \
  /   \ /   \ /   \
 2-----3----( )----.
  \   / \   / \   /
   \ /   \ /   \ /
    4-----.-----.
```

The algorithm is as follows:

```ts
let result = 64

result += 9 * (topLeftHeight - indexHeight)
result -= 3 * (rightRightHeight - indexHeight)
result -= 6 * (rightHeight - indexHeight)
result -= 9 * (bottomRightRightHeight - indexHeight)

if (result > 128) result = 128
else if (result < 0) result = 0
```

The original Map Editor `S2EDIT.EXE` recalculates this information upon load. Game itself however trusts what the map
file contains, and only updates the information as height map changes due to construction work. Thus if you fill this
block with empty values you will see a terrain free of light and shadow in the game even when it has elevation
differences.

This information is used for both rendering the minimap as well as the terrain itself.

## Minimap colors

Lava and water palette entries have been hardcoded. Lava is always palette entry 57 while water is 61.

The remaining colors use a particular pixel position from `TEX5.LBM` (Greenland), `TEX6.LBM` (Wasteland), and `TEX7.LBM`
(Winter World) respectively.

In the table below I have written up the palette entries used by the original files.

|     Texture ID | Texture X & Y  | Greenland | Wasteland | Winter |
| -------------: | :------------: | --------: | --------: | -----: |
|  0<br />`0x00` | 16 &times; 96  |       233 |       114 |    123 |
|  1<br />`0x01` | 16 &times; 48  |       216 |       167 |    116 |
|  2<br />`0x02` |  16 &times; 0  |       123 |       139 |    244 |
|  3<br />`0x03` | 112 &times; 0  |       233 |       160 |    244 |
|  4<br />`0x04` |  64 &times; 0  |       199 |        85 |    183 |
|  5<br />`0x05` |   Hardcoded    |        61 |        42 |    240 |
|  6<br />`0x06` |   Hardcoded    |        61 |        42 |    240 |
|  7<br />`0x07` |  64 &times; 0  |       199 |        85 |    183 |
|  8<br />`0x08` | 64 &times; 96  |       231 |       165 |     36 |
|  9<br />`0x09` | 112 &times; 96 |       233 |       166 |    102 |
| 10<br />`0x0A` | 160 &times; 96 |       230 |       166 |    123 |
| 11<br />`0x0B` | 64 &times; 48  |       216 |        33 |    117 |
| 12<br />`0x0C` | 112 &times; 48 |       216 |       212 |    118 |
| 13<br />`0x0D` | 160 &times; 48 |       215 |       212 |    118 |
| 14<br />`0x0E` |   Hardcoded    |       236 |       167 |    233 |
| 15<br />`0x0F` | 160 &times; 0  |       231 |       114 |    120 |
| 16<br />`0x10` |   Hardcoded    |        57 |       248 |    248 |
| 17<br />`0x11` | 0 &times; 254  |       254 |       254 |    254 |
| 18<br />`0x12` | 64 &times; 144 |       216 |       160 |    122 |
| 19<br />`0x13` |   Hardcoded    |        61 |        42 |    240 |
| 20<br />`0x14` |   Hardcoded    |        57 |       248 |    248 |
| 21<br />`0x15` |   Hardcoded    |        57 |       248 |    248 |
| 22<br />`0x16` |   Hardcoded    |        57 |       248 |    248 |

To get the final light/shadow color you must use an equivalent `GOU5.DAT`, `GOU6.DAT`, or `GOU7.DAT` color table. It is
a 256 &times; 256 raw data table, of which only 130 rows have been filled. The row `0x40` (64) which was used as the
starting value in the algorithm further above is always values 0 to 255 in order, as they are the base level palette
values.

When loading `GOU5.DAT` as a raw image into a graphics program and applying a palette from `PAL5.BBM` we can see the
actual table:

<img
	alt="GOU5.DAT with a palette"
	src="/assets/articles/2023-07-30_gou5-dat-palette.png"
	width="256"
	height="256"
	loading="lazy"
	style="image-rendering: pixelated;"
/>

Should you wish to learn to modify this table I can recommend you to read:

-   <a href="/2023/07/how-palette-and-lighting-works-in-the-settlers-2">How palette and lighting works in The Settlers II</a>
