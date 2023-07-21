---
title: Map Block 1 & 2 (textures)
description: Documentation for The Settlers II map file format, map blocks 1 and 2.
pubDate: 2015-08-20
modDate: 2023-07-21
layout: '$layouts/BlogEnglish.astro'
---

There is a lot of information that revolves around textures!

-   [Blocks to visuals](#blocks-to-visuals)
-   [Texture values](#texture-values)
-   [Mapping values to textures](#mapping-values-to-textures)
-   [Usages for less common textures](#usages-for-less-common-textures)
-   [Texture border priorities](#texture-border-priorities)

---

## Blocks to visuals

The following is a visual representation on how X and Y information correlates with map nodes on a 4&times;4 map.

```
       00----01----02----03----00
       /\  0 /\  1 /\  2 /\  3 /
      /  \  /  \  /  \  /  \  /
     / 0  \/ 1  \/ 2  \/ 3  \/
    04----05----06----07----04
    /\  4 /\  5 /\  6 /\  7 /
   /  \  /  \  /  \  /  \  /
  / 4  \/ 5  \/ 6  \/ 7  \/
 0B----08----09----0A----0B----08
       /\  8 /\  9 /\  A /\  B /
      /  \  /  \  /  \  /  \  /
     / 8  \/ 9  \/ A  \/ B  \/
    0C----0D----0E----0F----0C
    /\  C /\  D /\  E /\  F /
   /  \  /  \  /  \  /  \  /
  / C  \/ D  \/ E  \/ F  \/
 03----00----01----02----03
```

First map block's first texture is drawn between nodes `0x00`, `0x04` and `0x05`. Visually this results in ▲ triangle.

Second map block's first texture is drawn between nodes `0x00`, `0x01` and `0x05`. Visually this results in ▼ inverse triangle.

When looking at node at index `0x05` on the above 4&times;4 map it has the following textures:

1. Block 1, index 0
2. Block 2, index 0
3. Block 1, index 1
4. Block 2, index 4
5. Block 1, index 5
6. Block 2, index 5

A way to think about textures is that they are a fully shared "resource" with nearby nodes. They are not exclusive to any particular node, each texture is always bound to three nodes.

The textures determine whether the node can be crossed, or have a road, building, fresh water, mine, or ship access.

---

## Texture values

The Settlers II can render all values from `0x00` to `0x3F`, but not all of these values are used nor practically usable.

Of the whole byte the remaining two highest bits `0x40` and `0x80` are reserved for bit flags. In other words the same textures repeat a total of four times within the full range of a byte value.

Bitflags have known meanings:

-   `0x40` in map block 1 means that you can build a harbor on that node.
-   Meaning of `0x80` is unknown, but it does exist in a few of the maps (_Plateau of Dragons_ being one).
-   Meaning of these bit flags in map block 2 is unknown.

The following table displays the hardcoded texture features. Each texture value has same features regardless of texture set in use.

<div data-scrolling="inline">

| Value    | Sideroad | Roads | Buildings | Farming | Mining | Ships | S2EDIT |
| :------- | :------: | :---: | :-------: | :-----: | :----: | :---: | :----: |
| `0x00`   |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |   ✔️   |
| `0x01`   |    ✔️    |  ✔️   |           |         |   ✔️   |       |   ✔️   |
| `0x02`   |    ✔️    |       |           |         |        |       |   ✔️   |
| `0x03`   |    ✔️    |       |           |         |        |       |   ✔️   |
| `0x04`   |    ✔️    |  ✔️   |           |         |        |       |   ✔️   |
| `0x05`   |    ✔️    |       |           |         |        |  ✔️   |   ✔️   |
| `0x06`   |    ✔️    |  ✔️   |    ✔️     |         |        |       |        |
| `0x07`   |    ✔️    |  ✔️   |           |         |        |       |        |
| `0x08`   |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |   ✔️   |
| `0x09`   |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |   ✔️   |
| `0x0A`   |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |   ✔️   |
| `0x0B`   |    ✔️    |  ✔️   |           |         |   ✔️   |       |   ✔️   |
| `0x0C`   |    ✔️    |  ✔️   |           |         |   ✔️   |       |   ✔️   |
| `0x0D`   |    ✔️    |  ✔️   |           |         |   ✔️   |       |   ✔️   |
| `0x0E`   |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |   ✔️   |
| `0x0F`   |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |   ✔️   |
| `0x10`   |          |       |           |         |        |       |   ✔️   |
| `0x11`   |    ✔️    |  ✔️   |           |         |        |       |        |
| `0x12`   |    ✔️    |  ✔️   |    ✔️     |         |        |       |   ✔️   |
| `0x13`   |          |       |           |         |        |       |        |
| `0x14`   |          |       |           |         |        |       |        |
| `0x15`   |          |       |           |         |        |       |        |
| `0x16`   |          |       |           |         |        |       |        |
| `0x17`   |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |        |
| &hellip; |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |        |
| `0x3F`   |    ✔️    |  ✔️   |    ✔️     |   ✔️    |        |       |        |

</div>

-   **Sideroad**: texture allows road to be built to a node if the node has any texture that allows roads
-   **Roads**: you can build roads on this texture (unless blocked by objects or roads)
-   **Buildings**: you can build buildings on a node when each texture supports buildings and the surrounding ground is flat enough (unless blocked by objects or roads)
-   **Farming**: when each texture on node allows for farming then a field can be planted, and fresh water exists on the node (fields can be blocked by objects and roads)
-   **Mining**: when each texture on node allows for mining then a mine can be constructed (unless blocked by objects or roads)
-   **Ships**: ships can move in nodes surrounded by water texture; however there are three water textures but only one of them is for ships
-   **S2EDIT**: original Map Editor allows drawing the texture

> **Return to the Roots** supports textures `0x00` to `0x16`, and `0x22`.

---

## Mapping values to textures

The game's texture set consist of a single 256&times;256 pixel image. There are three sets available under directory `GFX\TEXTURES`: `TEX5.LBM`, `TEX6.LBM` and `TEX7.LBM`. These are Greenland, Wasteland, and Winter world respectively.

The texture set image looks like this:

<p><img alt="" src="/wp-content/uploads/2015/09/Tex5.png" width="512" height="512" loading="lazy" style="image-rendering: pixelated;" /></p>

Or a textual representation giving a name to each texture graphic:

```
     |     |     |     | ROAD1
 ID0 | ID1 | ID2 | ID3 | ROAD2
     |     |     |     | WATERWAY
-----+-----+-----+-----+
     |     |     |     |
 ID4 | ID5 | ID6 | ID7 | WATER
     |     |     |     |
-----+-----+-----+-----+
     |     |     |     |
 ID8 | ID9 | ID10| ID11|
     |     |     |     | LAVA1
-----+-----+-----+-----+
     |     |     |     |
 ID12| ID13|     |     | ROAD3
     |     |     |     | BORDER1
-----+-----+-----+-----+ BORDER2
                         BORDER3
       LAVA2 LAVA3 LAVA4 BORDER4
PIXEL                    BORDER5
```

In total there are 19 unique graphics + the pixel for 20 unique graphics. Some texture values share the same texture graphic.

<div data-scrolling="inline">

| Value  | GFX   | Greenland       | Wasteland         | Winter World   | Notes                                          |
| :----- | :---- | :-------------- | :---------------- | :------------- | :--------------------------------------------- |
| `0x00` | ID8   | Savannah        | Dark Steppe       | Taiga          |                                                |
| `0x01` | ID4   | Mountain #1     | Mountain #1       | Mountain #1    |                                                |
| `0x02` | ID0   | Snow            | Lava / few stones | Few ice floes  |                                                |
| `0x03` | ID2   | Swamp           | Lava / stones     | Ice floes      |                                                |
| `0x04` | ID1   | Desert          | Wasteland         | Ice            |                                                |
| `0x05` | WATER | Water           | Moor              | Water          | Palette animation. No shading.                 |
| `0x06` | WATER | Water           | Moor              | Water          | Palette animation. No shading.                 |
| `0x07` | ID1   | Desert          | Wasteland         | Ice            | Clone of 0x04 with no known benefits.          |
| `0x08` | ID9   | Meadow #1       | Pasture #1        | Taiga / tundra |                                                |
| `0x09` | ID10  | Meadow #2       | Pasture #2        | Tundra #1      |                                                |
| `0x0A` | ID11  | Meadow #3       | Pasture #3        | Tundra #2      |                                                |
| `0x0B` | ID5   | Mountain #2     | Mountain #2       | Mountain #2    |                                                |
| `0x0C` | ID6   | Mountain #3     | Mountain #3       | Mountain #3    |                                                |
| `0x0D` | ID7   | Mountain #4     | Mountain #4       | Mountain #4    |                                                |
| `0x0E` | ID12  | Steppe          | Light Steppe      | Tundra #3      |                                                |
| `0x0F` | ID3   | Flower Meadow   | Flower Pasture    | Tundra #4      |                                                |
| `0x10` | LAVA1 | Lava            | Lava              | Lava           | Palette animation. No shading.                 |
| `0x11` | PIXEL | Pixel           | Pixel             | Pixel          | Palette animation. No shading. One pixel.      |
| `0x12` | ID13  | Mountain Meadow | Alpine Pasture    | Snow           |                                                |
| `0x13` | WATER | Water           | Moor              | Water          | Palette animation. No shading.                 |
| `0x14` | LAVA2 | Lava #2         | Lava #2           | Lava #2        | Palette animation. No shading. Low resolution. |
| `0x15` | LAVA3 | Lava #3         | Lava #3           | Lava #3        | Palette animation. No shading. Low resolution. |
| `0x16` | LAVE4 | Lava #4         | Lava #4           | Lava #4        | Palette animation. No shading. Low resolution. |

</div>

From `0x17` to `0x3F` there are only 7 texture values that are usable with no changes done to the texture graphics. These are textures which let you build regular buildings on mountains. There can be some minor graphical glitches in texture border priorities (in original The Settlers II game, RttR is fine).

<div data-scrolling="inline">

| Value  | GFX | Greenland   | Wasteland   | Winter World |
| :----- | :-- | :---------- | :---------- | :----------- |
| `0x22` | ID5 | Mountain #2 | Mountain #2 | Mountain #2  |
| `0x25` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x2F` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x30` | ID5 | Mountain #2 | Mountain #2 | Mountain #2  |
| `0x36` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x37` | ID5 | Mountain #2 | Mountain #2 | Mountain #2  |
| `0x38` | ID5 | Mountain #2 | Mountain #2 | Mountain #2  |

</div>

Additionally these values also provide usable textures, however you need to build a custom texture set so that visually pleasant borders can be drawn around them. These values use mountain texture, but make use of first texture's border style (Snow / Lava with few stones / Few ice floes).

<div data-scrolling="inline">

| Value  | GFX | Greenland   | Wasteland   | Winter World |
| :----- | :-- | :---------- | :---------- | :----------- |
| `0x17` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x19` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x1A` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x1B` | ID5 | Mountain #2 | Mountain #2 | Mountain #2  |
| `0x1C` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x1D` | ID5 | Mountain #2 | Mountain #2 | Mountain #2  |
| `0x1E` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x29` | ID5 | Mountain #2 | Mountain #2 | Mountain #2  |
| `0x2A` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x2C` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x31` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x32` | ID5 | Mountain #2 | Mountain #2 | Mountain #2  |
| `0x35` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x3C` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |
| `0x3F` | ID4 | Mountain #1 | Mountain #1 | Mountain #1  |

</div>

---

## Usages for less common textures

Please note that as of writing there is not a lot of support made in the tools for the game for the more special usages! Making a very custom texture set means you would also have to manually hack map files to have something worthwhile for others to use.

### `0x06`

This texture value is water, but allows buildings on it. You may find use for it as rivers. Or if you make a custom texture you can replace water for something else, and simply not use textures `0x05` and `0x13` for maps that are designed for the custom texture.

### `0x07`

No practical use in the game. I recommend never releasing a map using this texture value. Should you write map utilities you can use this texture value for your internal code purposes, such as marking untouched areas. You could even go so far that when this value in encountered in texture block you mark the map as unplayable in the map file header.

### `0x11`

This is a single pixel stretched to entire texture triangle which supports palette animation, but also allows for roads to be built on it. If you design a custom texture you may find some use for it, like providing a connection via snow by having a near-white pixel.

### `0x13`

Used by the original game to blockade border regions of water from ships. When designing a map is is possible to use this texture to limit the area ships can use, which in some cases in the original game could help with performance and ship behavior. Also if Return to the Roots adds proper support for this texture and mimicks the original game behavior this texture has, then the same design trick would be available in RttR to limit possibilities of sea attacks by design.

### `0x14`, `0x15` and `0x16`

These are additional low resolution lava textures. They appear as lava on minimap, and behave like lava being totally inaccessible for anything. When designing a custom texture you could consider replacing lava entirely with something more pleasant to look at. Some ideas: mud, or deep sea.

### `0x22` and `0x25`

These extra mountain textures which allow buildings to be built. You can use them in your maps and the original game will support them right away. RttR might not yet support `0x25`.

### `0x17` and `0x1B`

These are extra mountain textures, but make use of Snow / Lava with few stones/ Few ice floes borders. To make use of both of these textures in a custom texture set you would need to drop use of `0x01`, `0x0B`, `0x22` and `0x25`.

For example these textures could represent partial snow textures that do have a lot of snow, but you could see meadow, mountain, desert, or mountain meadow peeking through.

### Other values

The remaining values between `0x18` and `0x3F` not listed above can be considered free use for Return to the Roots future development and expansion. This would mean 38 texture values.

For example it would be possible that RttR adds support for having all texture graphics in one map file. Since each texture set has 16 unique graphics it would mean 32 values could be assigned to those graphics. 6 texture values would remain free for fully custom expansion.

This of course only matters if wishing to keep it technically possible to open the RttR extended map files in the original game, even if those maps would not work correctly. In a sense the benefit of technical compatibility would be more beneficial for having some sort of support with existing tooling as well.

### Summary

-   Officially game supports 16 textures
-   You can have 24 unique textures by creating a custom texture set (when ignoring `0x07`, and when counting in `0x22` and `0x25`)
-   Or you can have 22 unique textures by dropping mountain #1 and mountain #2 from mountain usage and instead use `0x17` and `0x1B` as additional variety of "Snow" textures

---

## Texture border priorities

The following information tells which border gets drawn with more priority.

-   `<` means that textures on the right side will draw their border on top
-   `=` means that textures are equal and no border is drawn
-   `>` means that this texture's border is drawn on top of the other texture

There can be conflicts where both textures draw their borders. It can look buggy. There may be errors in this information as it has been manually collected by eye in the Map Editor and not validated against game's rendering engine.

### Greenland

```
00 < 01 02 04 06 08 09 0A 0B 0C 0D 0E 0F 12 13
00 = 11
00 > 03 05 10 14 15 16 22

01 < 02 04 06 0E 13
01 = 11
01 > 00 03 05 08 09 0A 0B 0C 0D 0F 10 12 14 15 16 22

02 < 13
02 = 11
02 > 00 01 03 04 05 06 08 09 0A 0B 0C 0D 0E 0F 10 12 14 15 16 22

03 < 00 01 02 04 06 08 09 0A 0B 0C 0D 0E 0F 12 13 22
03 = 11
03 > 05 10 14 15 16

04 < 02 06 12
04 = 11
04 > 00 01 03 05 08 09 0A 0B 0C 0D 0E 0F 10 13 14 15 16 22

05 < 00 01 02 03 04 06 08 09 0A 0B 0C 0D 0E 0F 12 13 22
05 = 11
05 > 10 14 15 16

06 < 02 12
06 > 00 01 03 04 05 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 14 15 16 22

08 < 01 02 04 06 09 0A 0B 0C 0D 0E 0F 12 13 22
08 = 11
08 > 00 03 05 10 14 15 16 22

09 < 01 02 04 06 0A 0B 0C 0D 0E 0F 12 13 22
09 = 11
09 > 00 03 05 08 10 14 15 16 22

0A < 01 02 04 06 0B 0C 0D 0E 0F 12 13 22
0A = 11
0A > 00 03 05 08 09 10 14 15 16 22

0B < 01 02 04 06 0E 13
0B = 11 22
0B > 00 03 05 08 09 0A 0F 10 12 14 15 16

0C < 01 02 04 06 0E 13
0C = 11
0C > 00 03 05 08 09 0A 0F 10 12 14 15 16

0D < 01 02 04 06 0E 13
0D = 11
0D > 00 03 05 08 09 0A 0F 10 12 14 15 16

0E < 02 04 06 12 13
0E = 11
0E > 00 01 03 05 08 09 0A 0B 0C 0D 0E 0F 10 13 14 15 16 22

0F < 01 02 04 06 08 09 0A 0B 0C 0D 0E 12 13 22
0F = 11
0E > 00 03 05 10 14 15 16 22

10 < 00 01 02 03 04 05 06 08 09 0A 0B 0C 0D 0E 0F 12 13 14 15 16 22
10 = 11
10 > 14 15 16

11 < 06 12
11 = 00 01 02 03 04 05 08 09 0A 0B 0C 0D 0E 0F 10 13 14 15 16 22

12 < 02 06
12 > 00 03 04 05 06 08 09 0A 0E 0F 10 11 13 14 15 16

13 < 05 0E 12
13 = 11
13 > 00 01 02 03 04 08 09 0A 0B 0C 0D 0F 10 14 15 16 22

14 < 00 01 02 03 04 05 06 08 09 0A 0B 0C 0D 0E 0F 10 12 13 15 16 22
14 = 11

15 < 00 01 02 03 04 05 06 08 09 0A 0B 0C 0D 0E 0F 10 12 13 14 16 22
15 = 11

16 < 00 01 02 03 04 05 06 08 09 0A 0B 0C 0D 0E 0F 10 12 13 14 15 22
16 = 11

22 < 00 02 04 06 08 09 0A 0E 0F 13
22 = 11
22 > 00 03 05 08 09 0A 0F 10 12 14 15 16
```

### In Return to the Roots

RttR draws texture borders slightly better than the original game; these values provided by [Flamefire](https://github.com/Flamefire).

```
/* Greenland */
{
  {  },
  { -1 },
  { -1, -1 },
  { -1, -1,  1 },
  { -1, -1,  1,  1 },
  { -1, -1,  1,  1,  0 },
  { -1, -1,  1,  1,  0,  0 },
  { -1, -1,  1,  1,  0,  0,  0 },
  { -1, -1,  1,  0, -1, -1, -1, -1 },
  { -1, -1,  1,  0, -1, -1, -1, -1,  0 },
  { -1, -1,  1,  0, -1, -1, -1, -1,  0,  0 },
  { -1, -1,  1,  0, -1, -1, -1, -1,  0,  0,  0 },
  { -1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1 },
  { -1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1 },
  { -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 },
  { -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 },
  {  1, -1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, -1,  0,  1 },
  { -1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  0 },
  { -1, -1,  1,  1,  0,  0,  0,  0,  0,  1,  1,  1, -1,  0,  1,  1, -1, -1 }
},
/* Wasteland */
{
  {  },
  {  1 },
  {  1,  1 },
  {  1, -1, -1 },
  {  1,  1, -1, -1 },
  {  1,  1, -1, -1,  0 },
  {  1,  1, -1, -1,  0,  0 },
  {  1,  1, -1, -1,  0,  0,  0 },
  {  1, -1, -1,  0,  1,  1,  1,  1 },
  {  1, -1, -1,  0,  1,  1,  1,  1,  0 },
  {  1, -1, -1,  0,  1,  1,  1,  1,  0,  0 },
  {  1, -1, -1,  0,  1,  1,  1,  1,  0,  0,  0 },
  {  1,  0, -1,  1, -1, -1, -1, -1,  1,  1,  1,  1 },
  {  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1 },
  {  1,  1, -1,  1, -1, -1, -1, -1,  1,  1,  1,  1,  1, -1 },
  {  0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 },
  {  1,  1, -1,  1, -1, -1, -1, -1,  1,  1,  1,  1,  1, -1,  0,  1 },
  {  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 },
  {  1,  1, -1, -1,  0,  0,  0,  0, -1, -1, -1, -1,  1, -1,  1,  1,  1,  0 }
},
/* Winter World */
{
  {  },
  { -1 },
  {  0,  1 },
  { -1, -1, -1 },
  {  1,  1,  1,  1 },
  {  1,  1,  1,  1,  0 },
  {  1,  1,  1,  1,  0,  0 },
  {  1,  1,  1,  1,  0,  0,  0 },
  { -1, -1, -1,  0, -1, -1, -1, -1 },
  { -1, -1, -1,  0, -1, -1, -1, -1,  0 },
  { -1, -1, -1,  0, -1, -1, -1, -1,  0,  0 },
  { -1, -1, -1,  0, -1, -1, -1, -1,  0,  0,  0 },
  { -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 },
  { -1, -1, -1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1 },
  {  0,  1,  0,  1, -1, -1, -1, -1,  1,  1,  1,  1,  1,  1 },
  { -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  0 },
  {  0,  1,  0,  1, -1, -1, -1, -1,  1,  1,  1,  1,  1,  1,  0,  0 },
  {  0,  1,  0,  1, -1, -1, -1, -1,  1,  1,  1,  1,  1,  1,  0,  0,  0 },
  {  1,  1,  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1, -1,  1,  1,  1,  1 }
}
```
