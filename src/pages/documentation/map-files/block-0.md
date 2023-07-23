---
title: Map Block 0 (height map)
description: Documentation for The Settlers II map file format, map block 0.
pubDate: 2015-08-20
modDate: 2023-07-20
layout: '$layouts/BlogEnglish.astro'
---

Contains the height map. The original map editor uses range of values from `0x00` to `0x3C` (60).

**Base level** (default height) value depends on version of the game:

-   Maps made for Veni Vidi Vici have a base level of 0 ([`WORLD20#.DAT`](./WORLD.DAT)).
-   Blue Byte upgraded their maps base level to `0x28` (40) upon conversion to `WLD` extension.
-   Map Editor `S2EDIT.EXE` uses base level of `0x0A` (10) for `SWD` extension.

There are some graphical glitches in the game if height is roughly above `0x32` (50): the buildings start to clip out of view from bottom on high altitudes. For this reason this documentation recommends that all future tools limit the range of values between 0 and `0x32`.

Maximum **height difference** in original and Map Editor maps is limited to 5. Game can render bigger differences, however there can be visual glitches, and things like building a road to a too big height difference area can cause the game to crash. Too big height difference also makes it impossible to see behind things. It is recommended the maximum height difference of 5 between nodes is implemented in map tools. However you can safely have larger height differences in inaccessible terrain.

[WLD/SWD file format](./wld-and-swd)
