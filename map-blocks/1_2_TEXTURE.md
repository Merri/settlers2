# Map Block 1 & 2: textures

The following is a visual representation on how X and Y information correlates with map indexes on a 4 x 4 map.

```
  00  01  02  03
04  05  06  07
  08  09  0A  0B
0C  0D  0E  0F
```

First map block's first texture is drawn between indexes `0x00`, `0x04` and `0x05`. Visually this results in ▲ triangle.

Second map block's first texture is drawn between indexes `0x00`, `0x01` and `0x05`. Visually this results in ▼ inverse triangle.

Thus even if you could think that each node has six textures it really only has two textures, which are visually thinking the two last textures of a node. All six surrounding textures will however affect calculations in other map data blocks!

## Data

The Settlers II can render all values from `0x00` to `0x3F`, but not all of these values are used. The remaining two highest bits `0x40` and `0x80` are reserved as bit flags.

- `0x40` in map block 1 means that you can build a harbor on that node.
- Meaning of `0x80` is still unknown, but it does exist in a few of the maps (*Plateau of Dragons* being one).

The following table tells texture features: the visual result of depends on chosen terrain graphics set.

Value | Can build road | Can build on | Can farm on | Can mine on | Can ships move | Map Editor
:-----|:---------------|:-------------|:------------|:------------|:---------------|:----------
`0x00`| X              | X            | X           |             |                | X
`0x01`| X              |              |             | X           |                | X
`0x02`|                |              |             |             |                | X
`0x03`|                |              |             |             |                | X
`0x04`| X              |              |             |             |                | X
`0x05`|                |              |             |             | X              | X
`0x06`| X              | X            |             |             |                |
`0x07`| X              |              |             |             |                |
`0x08`| X              | X            | X           |             |                | X
`0x09`| X              | X            | X           |             |                | X
`0x0A`| X              | X            | X           |             |                | X
`0x0B`| X              |              |             | X           |                | X
`0x0C`| X              |              |             | X           |                | X
`0x0D`| X              |              |             | X           |                | X
`0x0E`| X              | X            | X           |             |                | X
`0x0F`| X              | X            | X           |             |                | X
`0x10`|                |              |             |             |                | X
`0x11`| X              |              |             |             |                |
`0x12`| X              | X            |             |             |                | X
`0x13`|                |              |             |             |                |
`0x14`|                |              |             |             |                |
`0x15`|                |              |             |             |                |
`0x16`|                |              |             |             |                |
`0x22`| X              | X            |             |             |                |

Other values are practically pointless to use due to graphical glitches in texture border rendering. However, as can be seen some unused values did have a purpose at some point of game's development and there is behavior and even unique texture linked to it. The last value `0x22` is probably an accident that just happens to be an usable mountain texture with unique features.

## Value to texture

<img alt="" src="http://settlers2.net/wp-content/uploads/2011/07/texture_map.png" />

Value | Greenland       | Wasteland         | Winter World   | Notes
:-----|:----------------|:------------------|:---------------|:-----
`0x00`| Savannah        | Dark Steppe       | Taiga          |
`0x01`| Mountain #1     | Mountain #1       | Mountain #1    |
`0x02`| Snow            | Lava / few stones | Few ice floes  |
`0x03`| Swamp           | Lava / stones     | Ice floes      |
`0x04`| Desert          | Wasteland         | Ice            |
`0x05`| Water           | Moor              | Water          |
`0x06`| Water           | Moor              | Water          | Buildings and roads on water? Yes!
`0x07`| Desert          | Wasteland         | Ice            | No real point in using this texture.
`0x08`| Meadow #1       | Pasture #1        | Taiga / tundra |
`0x09`| Meadow #2       | Pasture #2        | Tundra #1      |
`0x0A`| Meadow #3       | Pasture #3        | Tundra #2      |
`0x0B`| Mountain #2     | Mountain #2       | Mountain #2    |
`0x0C`| Mountain #3     | Mountain #3       | Mountain #3    |
`0x0D`| Mountain #4     | Mountain #4       | Mountain #4    |
`0x0E`| Steppe          | Light Steppe      | Tundra #3      |
`0x0F`| Flower Meadow   | Flower Pasture    | Tundra #4      |
`0x10`| Lava            | Lava              | Lava           |
`0x11`| Unused #1       | Unused #1         | Unused #1      | A palette animatable stretched pixel.
`0x12`| Mountain Meadow | Alpine Pasture    | Snow           |
`0x13`| Water           | Moor              | Water          | Can be used to prevent ship access.
`0x14`| Unused #2       | Unused #2         | Unused #2      | Unused low resolution palette animated texture.
`0x15`| Unused #3       | Unused #3         | Unused #3      | Unused low resolution palette animated texture.
`0x16`| Unused #4       | Unused #4         | Unused #4      | Unused low resolution palette animated texture.
`0x22`| Mountain #2     | Mountain #2       | Mountain #2    | Regular buildings on mountains? Yes!

In total the game supports 16 textures officially, and an additional 8 textures more that could be made use of in customized texture sets. Although the second desert `0x07` is very much pointless; but 23 unique textures via customization is possible.

## Texture border priorities

The following information tells which border gets drawn with more priority.

- `<` means that textures on the right side will draw their border on top
- `=` means that textures are equal and no border is drawn
- `>` means that this texture's border is drawn on top of the other texture

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
