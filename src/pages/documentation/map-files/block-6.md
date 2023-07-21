---
title: Map Block 6 (animals)
description: Documentation for The Settlers II map file format, map block 6.
pubDate: 2015-08-20
modDate: 2023-07-21
layout: '$layouts/BlogEnglish.astro'
---

| Value  | Animal      |
| :----- | :---------- |
| `0x00` | None        |
| `0x01` | Rabbit      |
| `0x02` | Fox         |
| `0x03` | Stag        |
| `0x04` | Deer        |
| `0x05` | Duck        |
| `0x06` | Sheep       |
| `0x07` | Deer        |
| `0x08` | Duck        |
| `0x09` | Pack donkey |

`WORLD###.DAT` files fill unused bytes with `0xFF`, which is a value that will crash Map Editor (`S2EDIT.EXE`).
