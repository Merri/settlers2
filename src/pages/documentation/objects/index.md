---
title: "Objects"
publishDate: "2012-08-28"
layout: '$layouts/BlogPost.astro'
---

There are several kind of objects in the game. Objects are identified from two different blocks in a map file, blocks 5 & 6. Block 5 carries index information while Block 6 tells the type of an object.

## Headquarters

Type block contains `0x80`. Index block is always 0. This signals a player's start position is set here.

RttR extends this information by setting player ID to the index block. This makes it possible to have maps with more than 7 players. Original game does not have room for more players in it's header so RttR's solution helps to overcome this limitation.

## Type `0xC0` to `0xC3`

Unused.

## Type `0xC4` to `0xC6`: trees

```
There steps exist for all trees similar to Pine.
C4: 00 ... 07, Pine (planted step 1)
C4: 08 ... 0F, Pine (cut tree step 1)

C4: 10 ... 17, Pine (planted step 2)
C4: 18 ... 1F, Pine (cut tree step 2)

C4: 20 ... 27, Pine (planted step 3)
C4: 28 ... 2F, Pine (cut tree step 3)

C4: 38 ... 3F, Pine (cut tree step 4)
---
C4: 30 ... 37, Pine
C4: 70 ... 77, Birch
C4: B0 ... B7, Oak
C4: F0 ... F7, Palm 1
C5: 30 ... 37, Palm 2
C5: 70 ... 77, Pine Apple
C5: B0 ... B7, Cypress
C5: F0 ... F7, Cherry
C6: 30 ... 37, Fir
C6: 70 ... 77, glitch tree
C6: B0 ... B7, glitch shadow tree #1
C6: F0 ... F7, glitch shadow tree #2
C7: 30 ... 37, glitch shadow tree #3
C7: 70 ... 77, glitch shadow tree #4
C7: B0 ... B7, glitch shadow tree #5
C7: F0 ... F7, glitch shadow tree #6
```

Please note that using the cut tree steps in map data will cause the tree to become unremovable in the game.

You can vary the starting value of a tree to specify the animation start index for each tree individually. This achieves that every tree won't have the exact same animation cycle.

## Type `0xC8`: decorative objects

Index represents a particular object ID. Some IDs are reserved for displaying special campaign mission specific objects and are only displayed if a special `MIS#BOBS.LST` file is loaded via RTX command.

0. Mushroom 1
1. Mushroom 2
2. Stone 1
3. Stone 2
4. Stone 3
5. Dead tree trunk
6. Dead tree
7. Bone 1
8. Bone 2
9. Flowers
10. Bush 1
11. Stone (usually on water)
12. Big cactus
13. Medium cactus
14. Shrub 1
15. Shrub 2
16. Bush 2
17. Bush 3
18. Bush 4
19. Shrub 3
20. Shrub 4
21. `[MIS#BOBS GFX 1]`
22. Closed Gateway
23. Open Gateway
24. `[MIS#BOBS GFX 1]`
25. `[MIS#BOBS GFX 2]`
26. `[MIS#BOBS GFX 3]`
27. `[MIS#BOBS GFX 4]`
28. `[MIS#BOBS GFX 5]`
29. `[MIS#BOBS GFX 6]`
30. `[MIS#BOBS GFX 7]`
31. `[MIS#BOBS GFX 8]`
32. `[MIS#BOBS GFX 9]`
33. `[MIS#BOBS GFX 10]`
34. Mushroom 3
35. Stone 4
36. Stone 5
37. Pebble 1
38. Pebble 2
39. Pebble 3
40. Grass 1
41. Blue flowers / berries
42. Grass 2
43. Snowman
44. `[MIS#BOBS GFX 1]`
45. `[MIS#BOBS GFX 2]`
46. `[MIS#BOBS GFX 3]`
47. `[MIS#BOBS GFX 4]`
48. `[MIS#BOBS GFX 5]`
49. `[MIS#BOBS GFX 1]`
50. `[MIS#BOBS GFX 1]`
51. `[MIS#BOBS GFX 1]`
52. `[MIS#BOBS GFX 1]`
53. `[MIS#BOBS GFX 1]`
54. `[MIS#BOBS GFX 1]`
55. unused all the way to 255

**Note!** If the map is a campaign mission that loads additional graphics from a `MIS#BOBS.LST` file then there are IDs that crash the game.

- `MIS0BOBS.LST`: first ID to crash = 55 (`0x37`)
- `MIS1BOBS.LST`: first ID to crash = 55 (`0x37`)
- `MIS2BOBS.LST` IDs that crash: 31 (`0x1F`), 32 (`0x20`), 33 (`0x21`), 55 (`0x37`)
- `MIS3BOBS.LST` IDs that crash: 31 (`0x1F`), 32 (`0x20`), 33 (`0x21`), 55 (`0x37`), 56 (`0x38`)
- `MIS4BOBS.LST` IDs that crash: 31 (`0x1F`), 32 (`0x20`), 33 (`0x21`), 55 (`0x37`), 56 (`0x38`)
- `MIS5BOBS.LST` IDs that crash: 31 (`0x1F`), 32 (`0x20`), 33 (`0x21`), 55 (`0x37`), 56 (`0x38`)

<details>
    <summary>Mission graphic objects</summary>
    <div class="accordion"><div>

The LST files are located at `SETTLER2\DATA\MIS#BOBS.LST` where # is a number from 0 to 5.

The RTX files are located at `SETTLER2\DATA\MISSION\MIS_000#.RTX` where # is the mission number from 0 to 9.

In RTX file a mission graphics file can be used with the line `!GLOBAL_SET_BOBS #` where # is a number from 0 to 5 (matching the `MIS#BOBS.LST` file in the DATA directory).

| File ID | Object | Object IDs |
| --- | --- | --- |
| 0 | ![](/wp-content/uploads/2012/08/MIS0BOBS_00.png "MIS0BOBS_00") | 21, 24, 44, 49, 50, 51, 52, 53, 54 |
| 0 | ![](/wp-content/uploads/2012/08/MIS0BOBS_01.png "MIS0BOBS_01") | 27, 47 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_00.png "MIS1BOBS_00") | 21, 24, 44, 49, 50, 51, 52, 53, 54 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_01.png "MIS1BOBS_01") | 25, 45 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_02.png "MIS1BOBS_02") | 26, 46 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_03.png "MIS1BOBS_03") | 27, 47 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_04.png "MIS1BOBS_04") | 28, 48 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_05.png "MIS1BOBS_05") | 29 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_06.png "MIS1BOBS_06") | 30 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_07.png "MIS1BOBS_07") | 31 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_08.png "MIS1BOBS_08") | 32 |
| 1 | ![](/wp-content/uploads/2012/08/MIS1BOBS_09.png "MIS1BOBS_09") | 33 |
| 2 | ![](/wp-content/uploads/2012/08/MIS2BOBS_00.png "MIS2BOBS_00") | 21, 24, 44, 49, 50, 51, 52, 53, 54, 56 |
| 2 | ![](/wp-content/uploads/2012/08/MIS2BOBS_01.png "MIS2BOBS_01") | 25, 45 |
| 2 | ![](/wp-content/uploads/2012/08/MIS2BOBS_02.png "MIS2BOBS_02") | 26, 46 |
| 2 | ![](/wp-content/uploads/2012/08/MIS2BOBS_03.png "MIS2BOBS_03") | 27, 47 |
| 2 | ![](/wp-content/uploads/2012/08/MIS2BOBS_04.png "MIS2BOBS_04") | 28, 48 |
| 3 | ![](/wp-content/uploads/2012/08/MIS3BOBS_00.png "MIS3BOBS_00") | 21, 24, 44, 49, 50, 51, 52, 53, 54 |
| 4 | ![](/wp-content/uploads/2012/08/MIS4BOBS_00.png "MIS4BOBS_00") | 21, 24, 44, 49, 50, 51, 52, 53, 54 |
| 5 | ![](/wp-content/uploads/2012/08/MIS5BOBS_00.png "MIS5BOBS_00") | 21, 24, 44, 49, 50, 51, 52, 53, 54 |
| 5 | ![](/wp-content/uploads/2012/08/MIS5BOBS_01.png "MIS5BOBS_01") | 25, 45 |
| 5 | ![](/wp-content/uploads/2012/08/MIS5BOBS_02.png "MIS5BOBS_02") | 26, 46 |
| 5 | ![](/wp-content/uploads/2012/08/MIS5BOBS_03.png "MIS5BOBS_03") | 27, 47 |

</div></div></details>

## Type `0xC9`, `0xCA`, `0xCB`

Replicates `0xC8` (decorative objects). Never used in any game map.

## Type `0xCC` to `0xCF`: granite

Index represents the quantity of granite left where 1 is least and 6 is most. As granite is consumed the index hits 0 and the object is then removed.

Value of 0 shows shrub that can be collected as granite. Value of 7 seems like a small amount of granite, but is actually most of it. Values of 8 - 255 just repeat the same logic.

`0xCE` and `0xCF` also work like granite, but show incorrect graphics (empty graphics, farm fields etc.).

## Time limited objects

These objects are removed over time. All objects in type range 0xD0 to 0xFF eventually disappear from the game field.

### Type `0xD0`

- Index 0 - 3: growing farm field #1 (0 = least grown)
- Index 4 - 7: growing farm field #2 (4 = least grown)

The same repeats until 255.

### Type `0xD1`

- Index 0 - 3: growing farm field #3 (0 = least grown)
- Index 4: least grown farm field
- Index 5 - 7: shrinking bush (5 = biggest bush)

The same repeast until 255.

### Type `0xD2`

- Index 0 - 2: shrinking bush (0 = biggest bush)
- Index 3 - 4: shrinking shrub (3 = bigger shrub)
- Index 5 - 7: disappearing skeleton (7 = no longer visible)

The same repeats until 255.

### Type `0xD3`

- Index 0 - 2: disappearing skeleton (2 = no longer visible)
- Index 3: mushroom?
- Index 4 - 5: growing stone
- Index 6 - 7: disappearing pebble (catapult stone?)

The same repeats until 255.

### Type `0xD4`, `0xD5`, `0xD6` & `0xD7`

Outputs some graphics raw in the order as they are stored in memory. These graphics disappear as game is started.

- Index 0 - 15: repeat decorative objects of these IDs
- Index 16 - 21: growing granite #1
- Index 22 - 27: growing granite #2
- Index 28, 29, 30: unused / empty
- Index 31: tree leftovers (after woodcutter does his job)
- Index 32 - 35: growing farm field #1
- Index 36: scythed farm field #1
- Index 37 - 40: growing farm field #2
- Index 41: scythed farm field #2
- Index 42 - 44: shrinking bush
- Index 45 - 46: shrinking shrub
- Index 47 - 49: shrinking skeleton
- Index 50: mushroom?
- Index 51: stone 4
- Index 52: stone 5
- Index 53 - 55: shrinking pebble
- Index 56: grass 1
- Index 57: blue flowers / berries
- Index 58: grass 2
- Index 59: snowman
- Index 60: closed gateway
- Index 61: open gateway
- Index 62 - 101: unused
- Index 102 - 127: shadows (but not drawn with the shadow drawing logic)

Indexes 128 - 255 repeats the same contents, but disappear half a minute later.

### Type `0xD8`

- Index 0 - 31: SIGN low amount of iron ore
- Index 32 - 63: SIGN medium amount of iron ore
- Index 64 - 95: SIGN high amount of iron ore
- Index 96 - 127: low amount of gold (I guess this is not meant to be used)
- Index 128 - 159: SIGN low amount of gold
- Index 160 - 191: SIGN medium amount of gold
- Index 192 - 223: SIGN high amount of gold
- Index 224 - 255: low amount of coal (I guess this is not meant to be used)

### Type `0xD9`

- Index 0 - 31: SIGN low amount of coal
- Index 32 - 63: SIGN medium amount of coal
- Index 64 - 95: SIGN high amount of coal
- Index 96 - 127: low amount of granite (I guess this is not meant to be used)
- Index 128 - 159: SIGN low amount of granite
- Index 160 - 191: SIGN medium amount of granite
- Index 192 - 223: SIGN high amount of granite
- Index 224 - 255: water (I guess this is not meant to be used)

### Type `0xDA`

- Index 0 - 31: SIGN water
- Index 32 - 63: unused / empty
- Index 64 - 95: unused / empty
- Index 96 - 127: nothing found (I guess this is not meant to be used)
- Index 128 - 159: SIGN nothing found
- Index 160 - 191: unused /empty
- Index 192 - 223: unused /empty
- Index 224 - 255: unused /empty

### Type `0xDB`

Glitches / shadows.

### Type `0xDC`

Small building burning (original Map Editor animates this really fast!)

### Type `0xDD`

Big building burning (original Map Editor animates this really fast!)

### Type `0xDE`

Nothing appears, but might be reserved for more burning animations.

### Type `0xDF`

Remnants of a building (original Map Editor animates this really fast, looks like an oil rain!)

### Type `0xE0`

Remnants of a small building. Index 0 - 31, 0 = starts disappearing right on as the game behings.

Every half a minute a counter hits starting an operation and each value is shrunk by one, except if value is already 0, 32, 64, 128, 160, 192 or 224 then the object is removed.

### Type `0xE1`

Remnants of a big building, works just like 0xE0.

### Type `0xE2` to `0xEF`

Nothing, maybe reserved for more burnt buildings / objects disappearing over long period of time?

### Type `0xF0` to `0xFF`

Haven't found any existing objects in this range, but also haven't checked through all values.
