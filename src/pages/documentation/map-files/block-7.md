---
title: Map Block 7 (unknown)
description: Documentation for The Settlers II map file format, map block 7.
pubDate: 2015-08-20
modDate: 2023-07-21
layout: '$layouts/BlogEnglish.astro'
---

-   Unused in map files; used in savegames.
-   In `WORLD###.DAT` files this is filled with `0xFF`.
-   In WLD/SWD files this is filled with `0x00`.
-   Attempting to load a map with any `0xFF` in this block on Map Editor (`S2EDIT.EXE`) will crash the program.
