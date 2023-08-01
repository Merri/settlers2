---
title: WORLD###.DAT file format
description: Documentation for The Settlers II WORLD.DAT file format.
pubDate: 2015-08-20
modDate: 2023-07-20
layout: '$layouts/BlogEnglish.astro'
---

These files exist in pre Mission CD versions of the game, including V0.15, V0.16, V1.00, V1.01, and V1.02. The file format is also used for saved games in all versions of the game.

There are two versions of the format: uncompressed and compressed. The file has header and map data, but it has no footer. The file ends in end of file indicator `0xFF`.

Saved games depend on multiple other files:

-   [`CNTRL###.DAT`](./CNTRL.DAT)
-   [`CONTI###.DAT`](./CONTI.DAT)

`COMPY###.DAT`, `DESKT###.DAT`, `MAILS###.DAT` and `TRANS###.DAT` to be analyzed.

## Uncompressed

### File header

Size of header is 12 bytes:

<div data-scrolling="inline">

| Offset     | Size | Type  | Description                       |
| :--------- | :--- | :---- | :-------------------------------- |
| 0x00000000 | 2    | Int16 | `0x2711` Map file identification. |
| 0x00000002 | 4    | Int32 | Always null.                      |
| 0x00000006 | 2    | Int16 | Always `0x0001`.                  |
| 0x00000008 | 2    | Int16 | Map width.                        |
| 0x0000000A | 2    | Int16 | Map height.                       |

</div>

### Map data header

The file has at least 14 map data blocks. Each map data block has identical 16 byte header:

<div data-scrolling="inline">

| Offset     | Size | Type    | Description                                          |
| :--------- | :--- | :------ | :--------------------------------------------------- |
| 0x00000000 | 2    | Integer | Map data block identification.                       |
| 0x00000002 | 4    | Integer | Always null.                                         |
| 0x00000006 | 2    | Integer | Width.                                               |
| 0x00000008 | 2    | Integer | Height.                                              |
| 0x0000000A | 2    | Integer | Always `0x0001`.                                     |
| 0x0000000C | 4    | Integer | Bytes of map data to read; equal to width \* height. |

</div>

## Compressed

### File header

Size of header is 16 bytes:

<div data-scrolling="inline">

| Offset     | Size | Type  | Description                       |
| :--------- | :--- | :---- | :-------------------------------- |
| 0x00000000 | 2    | Int16 | `0x2711` Map file identification. |
| 0x00000002 | 4    | Int32 | `0xFFFFFFFF`.                     |
| 0x00000006 | 4    | Int32 | Always null.                      |
| 0x0000000A | 2    | Int16 | Always `0x0001`.                  |
| 0x0000000C | 2    | Int16 | Map width.                        |
| 0x0000000E | 2    | Int16 | Map height.                       |

</div>

### Map data header

The file has at least 14 map data blocks. Each map data block has a 4 byte header:

<div data-scrolling="inline">

| Offset     | Size | Type    | Description                                         |
| :--------- | :--- | :------ | :-------------------------------------------------- |
| 0x00000000 | 4    | Integer | Bytes of map data to read; size of compressed data. |

</div>

Compression method for map data is a simple variant of RLE ([run-length encoding](https://en.wikipedia.org/wiki/Run-length_encoding)).

Here is a sample decompression routine in JavaScript:

```ts
const key = source[0]
let writePos = 0
for (let i = 1; i < blockSize; i++) {
	const currentByte = source[i]
	if (currentByte === key) {
		const count = source[++i]
		if (count === 0) {
			target[writePos] = key
			writePos++
		} else {
			const byteToCopy = source[++i]
			target.fill(byteToCopy, writePos, writePos + count)
			writePos += count
		}
	} else {
		target[writePos++] = currentByte
	}
}
// Patch: only one byte missing? replicate last written byte
if (writePos + 1 === size) {
	this.log.push(`Decompression error in block index ${blockIndex}: last byte missing, replicating previous byte`)
	target[writePos] = target[writePos - 1]
	writePos++
}
// should never see these messages!
if (writePos < size) {
	this.log.push(`Critical decompression error in block index ${blockIndex}: ${size - writePos} bytes too short!`)
} else if (writePos > size) {
	this.log.push(`Critical decompression error in block index ${blockIndex}: ${writePos - size} bytes too long!`)
}
```

As can be seen there was an implementation bug in compression regarding the last byte and it was occasionally missing.

## Map data blocks

Contents of map blocks are documented separately:

-   [Block 0 (height map)](./block-0)
-   [Block 1 & 2 (textures)](./block-1-and-2)
-   [Block 3 (roads)](./block-3)
-   [Block 4 & 5 (objects)](./block-4-and-5)
-   [Block 6 (animal)](./block-6)
-   [Block 7 (unknown)](./block-7)
-   [Block 8 (building sites)](./block-8)
-   [Block 9 (fog of war)](./block-9)
-   [Block 10 (icon)](./block-A)
-   [Block 11 (resources)](./block-B)
-   [Block 12 (light and shadow map)](./block-C)
-   [Block 13 (areas)](./block-D)
