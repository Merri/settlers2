---
title: Map Block 3 (roads)
description: Documentation for The Settlers II map file format, map block 3.
pubDate: 2015-08-20
modDate: 2023-07-21
layout: '$layouts/BlogEnglish.astro'
---

For each node there is a road going to these directions:

-   right
-   bottom right
-   bottom left
-   middle dot

Each road is stored as a two bit value.

| Direction    | Operation             |
| :----------- | :-------------------- |
| Right        | `value & 0x03`        |
| Bottom right | `(value >> 2) & 0x03` |
| Bottom left  | `(value >> 4) & 0x03` |
| Middle dot   | `(value >> 6) & 0x03` |

Resulting value for each direction then decides which road type to render:

| Value  | Type                          |
| :----- | :---------------------------- |
| `0x00` | No road                       |
| `0x01` | Normal road (helper)          |
| `0x02` | Gravel road (helper + donkey) |
| `0x03` | Waterway (helper + boat)      |

Additionally road appearance will change on mountain.
