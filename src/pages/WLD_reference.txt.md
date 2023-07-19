---
title: WLD_reference.txt
description: Explanation of the WLD/SWD format used in Settlers 2 (backup for historical preservation).
pubDate: 2010-12-22
modDate: 2011-07-31
layout: '$layouts/BlogEnglish.astro'
---

This is a HTML converted backup of `WLD_reference.txt` preserved for historical conservation.

Original file locations:

-   `http://www.mindermeinung.net/WLD_reference.txt`
-   `http://www.le-softworks.com/WLD_reference.txt`

Relevant discussion over at Return to the Roots forums:

-   https://www.siedler25.org/index.php?com=forum&mod=forum&action=thread&id=750

This copy was made July 19th 2023.

---

**Explanation of the WLD/SWD format used in Settlers 2**

Written and mostly decrypted by Xaser

**Thanks**

First of all:

-   FloSoft from the "Return to the Roots" team

Others:

-   Vesa Piittinen
-   Andre Dahmen

## Header Information

<div data-scrolling="inline">

| Offset | Length | Content                                                                                                           |
| ------ | ------ | ----------------------------------------------------------------------------------------------------------------- |
| 0      | 10     | WORLD_V1.0                                                                                                        |
| 10     | 20     | name of the map --> incl. the ending `\0`                                                                         |
| 30     | 2      | width of the map, but this value is not necessarily the "right" width, it can be zero, so don't trust this data   |
| 32     | 2      | height of the map, but this value is not necessarily the "right" height, it can be zero, so don't trust this data |
| 34     | 1      | type of the map: 0 = greenland, 1 = wasteland, 2 = winterland                                                     |
| 35     | 1      | number of players, reaches from 1 to 7                                                                            |
| 36     | 20     | name of the author --> incl. the ending `\0`                                                                      |
| 56     | 14     | seven "two-byte" values for x-positions of the players headquarters, if `FFFF`, player is not in game             |
| 70     | 14     | seven "two-byte" values for y-positions of the players headquarters, if `FFFF`, player is not in game             |
| 84     | 8      | unknown                                                                                                           |
| 92     | 2250   | 250 items with 9 Byte for area information: 1 Byte "Type", 2 Bytes "X", 2 Bytes "Y", 4 Bytes "Area"               |
| 2342   | 6      | Hex 11 27 00 00 00 00 --> introduces any kind of "sub-header" with the right information about width and height   |
| 2348   | 2      | width of the map                                                                                                  |
| 2350   | 2      | height of the map                                                                                                 |

</div>

### area information

In this big map header (250 items \* 9 Bytes = 2250 Bytes) we have information about areas (land or water).
This is important for seafaring. If this block isn't correct or has only 0x00, the ships won't move.
The 9 Byte values are separated into:

#### 1 Byte for the type

| value | description |
| ----- | ----------- |
| 0x01  | land        |
| 0x02  | water       |

Snow, swamp and lava are not counted and therefore have no type.

-   2 Bytes for the x-coord
-   2 Bytes for the y-coord
-   4 Bytes for the area

#### Two little examples

Example 1:

-   32x32 map only with water
-   type = 0x02
-   x = 0x0000
-   y = 0x0000
-   area = 0x00040000 = decimal 1024 = decimal 32\*32

Example 2:

-   32x32 map with water and a little hexagon with meadow that we set at position 8x8
-   water: type = 0x02
-   x = 0x0000
-   y = 0x0000
-   area = 0xF9030000 = decimal 1017 = decimal 32\*32 &ndash; 7 (7 vertices for the meadow)
-   meadow:type = 0x01
-   x = 0x0700
-   y = 0x0700
-   area = 0x07000000 = decimal 7

Now you could wonder why meadow is at 7x7 and not 8x8. If you save the map then the editor walks from the top to the
bottom of the map and if it hits land it walks to the most left position of the land while not changing Y.
Water is only counted if it is surrounded by land (a lake). So we could say every lake is counted, especially the
biggest lake that is sourrounded by the map edges.

**NOTE**: Water is only counted if it is at least a small hexagon. So the vertex has to be surrounded by water to be count.

One thing may confuse you if you test with the editor: If you set textures and after that delete them, the editor
doesn't delete x, y and area, it deletes only the type (sets it to 0x00).

From now the file is divided into 14 blocks with informations for the vertices, every block has a header. First block header starts always on 2352.

Note that i assume every triangle has a width of 56px and a height of 28px. (You can check this when you use the original
editor to create a 32x32 map and then save a 1:1 picture of this pic. The new picture will have a width of 32x56 and a height of 32x28.)

-   If i say RSU-Triangle, i mean RightSideUp-Triangle. This is a triangle that has the bottom point up.
-   If i say USD-Triangle, i mean UpSideDown-Triangle. This is a triangle that has the bottom point down.

---

## block headers

<div data-scrolling="inline">

| Position | Length | Content                                                       |
| -------- | ------ | ------------------------------------------------------------- |
| 1        | 6      | HEX 10 27 00 00 00 00 --> introduces each header              |
| 2        | 2      | width of the map                                              |
| 3        | 2      | height of the map                                             |
| 4        | 2      | always 01 00                                                  |
| 5        | 4      | length of the following data block, this equals width\*height |

</div>

After this informations the data block follows. Every data block has 1-Byte values.

### Block 1:

This block contains the altitude information of each vertex. It is necessary to calculate the y- and z-coordinates of the vertex.

-   Minimum is 0x00.
-   Maximum is 0x3C.
-   Standard is 0x0A. (even)

### Block 2:

This block contains the texture information for the RSU-Triangles.

### Block 3:

This block contains the texture information for the USD-Triangles.

<div data-scrolling="inline">

| POSSIBLE TEXTURE VALUES:                | (for harbour you only need to add 0x40) |
| --------------------------------------- | --------------------------------------- |
| TRIANGLE_TEXTURE_STEPPE_MEADOW1         | 0x00                                    |
| TRIANGLE_TEXTURE_STEPPE_MEADOW1_HARBOUR | 0x40                                    |
| TRIANGLE_TEXTURE_MINING1                | 0x01                                    |
| TRIANGLE_TEXTURE_SNOW                   | 0x02                                    |
| TRIANGLE_TEXTURE_SWAMP                  | 0x03                                    |
| TRIANGLE_TEXTURE_STEPPE                 | 0x04                                    |
| TRIANGLE_TEXTURE_WATER                  | 0x05                                    |
| TRIANGLE*TEXTURE_WATER*                 | 0x06                                    |
| TRIANGLE*TEXTURE_STEPPE*                | 0x07                                    |
| TRIANGLE_TEXTURE_MEADOW1                | 0x08                                    |
| TRIANGLE_TEXTURE_MEADOW1_HARBOUR        | 0x48                                    |
| TRIANGLE_TEXTURE_MEADOW2                | 0x09                                    |
| TRIANGLE_TEXTURE_MEADOW2_HARBOUR        | 0x49                                    |
| TRIANGLE_TEXTURE_MEADOW3                | 0x0A                                    |
| TRIANGLE_TEXTURE_MEADOW3_HARBOUR        | 0x4A                                    |
| TRIANGLE_TEXTURE_MINING2                | 0x0B                                    |
| TRIANGLE_TEXTURE_MINING3                | 0x0C                                    |
| TRIANGLE_TEXTURE_MINING4                | 0x0D                                    |
| TRIANGLE_TEXTURE_STEPPE_MEADOW2         | 0x0E                                    |
| TRIANGLE_TEXTURE_STEPPE_MEADOW2_HARBOUR | 0x4E                                    |
| TRIANGLE_TEXTURE_FLOWER                 | 0x0F                                    |
| TRIANGLE_TEXTURE_FLOWER_HARBOUR         | 0x4F                                    |
| TRIANGLE_TEXTURE_LAVA                   | 0x10                                    |
| TRIANGLE_TEXTURE_COLOR                  | 0x11                                    |
| TRIANGLE_TEXTURE_MINING_MEADOW          | 0x12                                    |
| TRIANGLE_TEXTURE_MINING_MEADOW_HARBOUR  | 0x52                                    |
| TRIANGLE_TEXTURE_WATER\_\_              | 0x13                                    |
| TRIANGLE_TEXTURE_STEPPE\_\_             | 0x80                                    |
| TRIANGLE_TEXTURE_STEPPE\_\_\_           | 0x84                                    |

</div>

These are the greenland textures. Wasteland and winterland have the same values but other names.

### Block 4:

road informations

This data block tells us what a road to render from the vertex to its right vertex, lower left vertex or lower right vertex.

<div data-scrolling="inline">

| value | description                         |
| ----- | ----------------------------------- |
| 0x00  | no road                             |
| 0x01  | normal road                         |
| 0x02  | main road (darker than normal road) |
| 0x03  | water road                          |

</div>

At first the road from the vertex to its lower left vertex:

-   Calculate `RoadInformation/16` (only the integer value) and decide.

Now the road from the vertex to its lower right vertex:

-   Calculate `(RoadInformation%16)/4` (only the integer value) and decide.

At least the road from the vertex to its right vertex:

-   Calculate `((RoadInformation%16)%4)%4` and decide.

Minimum is 0x00, maximum is 0x3F

The following blocks 5 and 6 belong together. The first block contains an object type like "tree" or "granite" and the second block contains
an object information that classifies the object type. It is some kind of "category".

### Block 5:

object type

Don't worry about the "or's", cause what kind of tree it really is depends on block 6

<div data-scrolling="inline">

| value             | description          |
| ----------------- | -------------------- |
| 0x30 &ndash; 0x37 | pine or palm2 or fir |
| 0x70 &ndash; 0x77 | birch or pineapple   |
| 0xB0 &ndash; 0xB7 | oak or cypress       |
| 0xF0 &ndash; 0xF7 | palm1 or cherry      |

</div>

Wasteland and winterland have the same values, but other names.

Why are there 8 pictures for every tree? Remember the trees are moving (otherwise it would look boring), so there are 8 pictures for each tree
with little differences. Drawing picture after picture let's the tree look like there is wind. Now you could ask, why save different values for
each picture and not only one value for every tree and drawing from picture 1 to 8 for each tree instead? The answer is simple: the trees would
move synchronous and that would look boring too. So the editor sets random values for each tree and make the trees moving asynchronous that way.

| value             | description |
| ----------------- | ----------- |
| 0x01 &ndash; 0x06 | granite     |

| value | description        |
| ----- | ------------------ |
| 0x00  | mushroom1          |
| 0x01  | mushroom2          |
| 0x02  | stone1             |
| 0x03  | stone2             |
| 0x04  | stone3             |
| 0x05  | trunk of dead tree |
| 0x06  | dead tree          |
| 0x07  | bone1              |
| 0x08  | bone2              |
| 0x10  | bush2              |
| 0x11  | bush3              |
| 0x12  | bush4              |
| 0x0A  | bush1              |
| 0x0C  | cactus1            |
| 0x0D  | cactus2            |
| 0x0E  | shrub1             |
| 0x0F  | shrub2             |
| 0x13  | shrub3             |
| 0x14  | shrub4             |
| 0x18  | stalagmite1        |
| 0x19  | stalagmite2        |
| 0x1A  | stalagmite3        |
| 0x1B  | stalagmite4        |
| 0x1C  | stalagmite5        |
| 0x1D  | stalagmite6        |
| 0x1E  | stalagmite7        |
| 0x22  | mushroom3          |
| 0x25  | pebble1            |
| 0x26  | pebble2            |
| 0x27  | pebble3            |

If we have a 0x80 in the block 6 "object info", then we have the player number here, from 0x00 to 0x06.

### Block 6:

object info

<div data-scrolling="inline">

| value | description                       |
| ----- | --------------------------------- |
| 0xC4  | pine, birch, oak, palm1           |
| 0xC5  | palm2, pineapple, cypress, cherry |
| 0xC6  | fir                               |

</div>

Wasteland and winterland have the same values, but other names.

<div data-scrolling="inline">

| value | description                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------------- |
| 0xC8  | landscape objects, see list in block 5 beginning with mushroom1 (0x00) and ending with pebble3 (0x27) |
| 0xCC  | granite                                                                                               |
| 0xCD  | granite                                                                                               |
| 0x80  | headquarters of a player                                                                              |

</div>

### Block 7:

animal data

| value | description |
| ----- | ----------- |
| 0x01  | rabbit      |
| 0x02  | fox         |
| 0x03  | stag        |
| 0x04  | roe         |
| 0x05  | duck        |
| 0x06  | sheep       |

### Block 8:

unknown

### Block 9:

build informations

This data block tells us what can be built at each vertex. Calculate `BuildInformation%8` and decide:

| value | description  |
| ----- | ------------ |
| 0x00  | no building  |
| 0x01  | flag         |
| 0x02  | small house  |
| 0x03  | middle house |
| 0x04  | great house  |
| 0x05  | mine         |
| 0x06  | no building  |
| 0x07  | no building  |

If you want to know how the original settlers 2 editor and game calculates the BuildInformation, take a look at:

http://bazaar.launchpad.net/~xaser/%2Bjunk/s2mapeditor/annotate/head%3A/CMap.cpp

The function called `modifyBuild(.....)` is what you need.

### Block 10:

unknown &ndash; always 0x07

### Block 11:

unknown

### Block 12:

resource data

| value             | description |
| ----------------- | ----------- |
| 0x21              | water       |
| 0x87              | fish        |
| 0x41 &ndash; 0x47 | coal        |
| 0x49 &ndash; 0x4F | ore         |
| 0x51 &ndash; 0x57 | gold        |
| 0x59 &ndash; 0x5F | granite     |

### Block 13:

Shading values.

-   Minimum is 0x00.
-   Maximum is 0x80.
-   Standard is 0x40. (even)

The editor calculates shading (light) values for each vertex. Note that the gouraud shading in settlers 2 is precalculated.
The game trusts this data and uses it to get the right color value from one of the GOUx.DAT-files (x = 5-Greenland, 6-Wasteland, 7-Winterland).
This files contain a color value for each of the light values the editor set. If you plan to change this block to see what happens, you have to
load this map in the game to see it. The editor is not interested in this block cause it calculates the values from scratch.

If you want to know how the original settlers 2 editor and game calculates the ShadingInformation, take a look at:

http://bazaar.launchpad.net/~xaser/%2Bjunk/s2mapeditor/annotate/head%3A/CMap.cpp

The function called `modifyShading(.....)` is what you need.

In the GOUx.DAT files there are color values ( = color indices = mapped rgb data 8bpp). If you want to shade a pixel, you have to read it
from the tileset (the 8bit pixel value) and you need the shading value from this block (more specifically the interpolated value at the point you
want to draw). The GOUx.DAT files are two-dimensional arrays, for every of the 256 possible shading values (0x00 &ndash; 0xFF) every shaded palette is saved in this array.

So do the following to get the new color value for a given color value and a given shading value:

```
new_color_value = $GOUx.DAT[$shading_value][$color_value]
```

### Block 14:

unknown
