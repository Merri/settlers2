---
title: "LST File Format"
publishDate: "2011-07-23"
layout: '$layouts/BlogPost.astro'
---

LST is an archive format that can contain multiple type of information.

Header is **6 bytes**. The first two bytes are the file ID, hex `20 43`. This is then followed by 4 bytes that tell the number of items in the archive. The items that follow are always continuous, so all data for one item is in one block.

Each item is identified with a **2 byte** value. It only has two valid values: 0 tells the item is unused and you should continue to the next item, 1 tells the item exists and a **2 byte** Type ID follows.

Type ID has following valid values:

- `0x01` = WAV or XMIDI
- `0x02` = RLE Compressed Bitmap
- `0x03` = Font
- `0x04` = Player Colored Bitmap
- `0x05` = Palette
- `0x07` = Shadow Bitmap
- `0x0E` = Uncompressed Bitmap

## WAV or XMIDI (01)

The first **4 bytes** tell the length of the data.

- WAV files are 8-bit mono 11025 Hz PCM files without WAV header.
- XMIDI files can be identified by FORM at the start of the data.

## RLE Compressed Bitmap (02)

| Size | Data |
| --- | --- |
| 2 bytes | Zero point X |
| 2 bytes | Zero point Y |
| 4 bytes | Unknown (always 0 = hex `00 00 00 00`) |
| 2 bytes | Width |
| 2 bytes | Height |
| 2 bytes | Palette ID (always 1 = hex `01 00`) |
| 4 bytes | Length of data |

Data begins with the start positions of each line in the bitmap. This is a **2 byte** value and there is Height amount of them. The actual RLE compressed data follows and this always ends with a hex FF.

## Font (03)

Contains 224 Player Colored Bitmaps for each valid letter (characters 32 - 255). The header before all bitmaps is only **2 bytes** and tells the X and Y spacing of the font (one byte each). This is then followed by all the bitmaps.

## Player Colored Bitmap (04)

| Size | Data |
| --- | --- |
| 2 bytes | Zero point X |
| 2 bytes | Zero point Y |
| 4 bytes | Unknown (always 0 = hex `00 00 00 00`) |
| 2 bytes | Width |
| 2 bytes | Height |
| 2 bytes | Palette ID (always 1 = hex `01 00`) |
| 4 bytes | Length of data |

Data begins with the start positions of each line in the bitmap. This is a **2 byte** value and there is Height amount of them. The actual data is compressed using a custom algorithm.

| Start value | End value | Description |
| --- | --- | --- |
| 0x01 | 0x3F | Number of transparent pixels No data |
| 0x41 | 0x7F | Number of uncompressed pixels Length = Value - `0x40` Data \* Length follows |
| 0x81 | 0xBF | Number of player colored pixels Length = Value - `0x80` Data \* Length follows |
| 0xC1 | 0xFF | Number of compressed pixels Length = Value - `0xC0` Data \* 1 follows |
| 0x00 |  | Invalid, unused |
| 0x40 |  | Invalid, unused |
| 0x80 |  | Invalid, unused |
| 0xC0 |  | Invalid, unused |

## Palette (05)

Contains 256 colors in RGB order. The first **2 bytes** = Palette ID (always 1 = hex 01 00), followed by **768 bytes** of palette data.

## Shadow Bitmap (07)

| Size | Data |
| --- | --- |
| 2 bytes | Zero point X |
| 2 bytes | Zero point Y |
| 4 bytes | Unknown (always 0 = hex `00 00 00 00`) |
| 2 bytes | Width |
| 2 bytes | Height |
| 2 bytes | Palette ID (always 1 = hex `01 00`) |
| 4 bytes | Length of data |

Data begins with the start positions of each line in the bitmap. This is a **2 byte** value and there is Height amount of them. The actual data is compressed using a custom algorithm.

The compression swaps between semitransparent and fully transparent mode, basically the bitmap is a 1-bit monochrome image.

| Start value | End value | Description |
| --- | --- | --- |
| `0x00` | `0xFE` | Mode 1: Number of shadow pixels Mode 2: Number of transparent pixels |
| `0xFF` |  | End of line |

## Uncompressed Bitmap (0E)

The only bitmap type to have a footer as well as a header.

###  Header

| Size | Data |
| --- | --- |
| 2 bytes | Palette ID (always 1 = hex `01 00`) |
| 4 bytes | Length of data |

### Data

A raw paletted 8-bit bitmap, pixel-by-pixel.

### Footer

| Side | Data |
| --- | --- |
| 2 bytes | Zero point X |
| 2 bytes | Zero point Y |
| 2 bytes | Width |
| 2 bytes | Height |
| 8 bytes | Unknown (always hex `00 00 02 01 06 70 00 F4`) |
