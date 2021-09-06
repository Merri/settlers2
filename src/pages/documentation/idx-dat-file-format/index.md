---
title: "IDX & DAT File Format"
publishDate: "2011-07-23"
layout: '$layouts/BlogPost.astro'
disqusIdentifier: 250
---

The IDX is an index for a DAT archive file.

The first **4 bytes** in IDX file is the number of items described in the IDX file. Then all the items are listed. Each item is **28 bytes**.

| Size | Data |
| --- | --- |
| 16 bytes | Name of dataset |
| 4 bytes | Offset to data in DAT file |
| 6 bytes | Unknown (always 0 = hex `00 00 00 00`) |
| 2 bytes | Type ID (see [LST File Format](/documentation/lst-file-format/ "LST File Format")) |

The DAT file is a simple continuous file of data. Each item starts with a 2 bytes Type ID, repeating the same Type ID defined for the item entry in IDX file. The rest works as it does in an LST file.
