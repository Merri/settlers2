---
title: Map Block 8 (building sites)
description: Documentation for The Settlers II map file format, map block 8.
pubDate: 2015-08-20
modDate: 2023-07-21
layout: '$layouts/BlogEnglish.astro'
---

The following values abstract known meanings of bits.

| Active bits | Value  | Description |
| :---------- | :----- | :---------- |
| `00000001`  | `0x01` | Flag pole   |
| `00000010`  | `0x02` | Hut         |
| `00000011`  | `0x03` | House       |
| `00000100`  | `0x04` | Castle      |
| `00000101`  | `0x05` | Mine        |
| `00001000`  | `0x08` | Non-arable  |
| `01100000`  | `0x60` | Tree        |
| `01110000`  | `0x70` | Impassable  |

## Arable textures

The following textures are arable and therefore bitflag `0x08` for non-arable does not exist on nodes which all textures are one of following:

| ID     | Greenland texture name                         |
| :----- | :--------------------------------------------- |
| `0x00` | Savannah                                       |
| `0x08` | Meadow #1                                      |
| `0x09` | Meadow #2                                      |
| `0x0A` | Meadow #3                                      |
| `0x0E` | Steppe                                         |
| `0x0F` | Flower Meadow                                  |
| `0x17` | (Unused textures)                              |
| `...`  | None of these trigger non-arable flag.         |
| `0x3F` | (Last unused texture before harbor repetition) |

**However**, nearby objects may still introduce non-arable bitflag on a node.

## Non-arable textures

The following textures trigger non-arable bitflag `0x08`:

| ID     | Greenland texture name             |
| :----- | :--------------------------------- |
| `0x01` | Mountain #1                        |
| `0x02` | Snow                               |
| `0x03` | Swamp                              |
| `0x04` | Desert                             |
| `0x05` | Water                              |
| `0x06` | Water you can build on             |
| `0x07` | Partially glitchy desert           |
| `0x0B` | Mountain #2                        |
| `0x0C` | Mountain #3                        |
| `0x0D` | Mountain #4                        |
| `0x10` | Lava                               |
| `0x11` | Stretched pixel                    |
| `0x12` | Mountain meadow                    |
| `0x13` | Water like lava/snow               |
| `0x14` | Unused low resolution lava-like #1 |
| `0x15` | Unused low resolution lava-like #2 |
| `0x16` | Unused low resolution lava-like #3 |

Or any of these rules:

-   Granite on or around the node
-   Tree on the node

## Calculating building sites

The following values have to be joined with the result of non-arable check.

These checks don't yet account for values to be found in savegame files.

### Step 1: impassable `0x70`

1. Any texture around node is snow (`0x02`), lava (`0x10`) or `0x13` - `0x16`
2. Every texture around node is swamp (`0x03`) or water (`0x05`)
3. Node has granite object

### Step 2: tree `0x60`

4. Node has tree object

### Step 3: flag `0x01`

5. Any texture around node is swamp (`0x03`), water (`0x05`), desert (`0x04` or `0x07`) or `0x11`
6. Bottom right node has a tree object
7. Any surrounding node has a granite object
8. Any texture around bottom right node is snow (`0x02`), lava (`0x10`) or `0x13` - `0x16`

### Step 4: mine `0x05`

9. Every texture around node is mountain (`0x01`, `0x0B` - `0x0D`) and height in bottom right node isn't higher than 3

### Step 5: flag `0x01`

10. Height in bottom right node is lower than 3
11. Height in bottom right node is higher than 1
12. Height difference in other surrounding nodes is bigger than 3 (radius 1)

### Step 6: hut `0x02`

13. Nodes around have a tree (but not bottom right one)
14. Height difference is nodes at two nodes away is bigger than 2 (radius 2)

### Step 7: castle `0x04`

15. By now nothing prevents building a castle category building
