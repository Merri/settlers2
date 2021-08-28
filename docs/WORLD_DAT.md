# WORLD###.DAT file format

These files exist in pre Mission CD versions of the game, including V0.15, V0.16, V1.00 and V1.02. The file format is also used for saved games in all versions of the game.

There are two versions of the format: uncompressed and compressed. The file has header and map data, but it has no footer. The file ends in end of file indicator `0xFF`.

## Uncompressed file header

Offset     | Size  | Type       | Description
:----------|:------|:-----------|:-----------
0x00000000 | 2     | Int16      | `0x2711` Map file identification.
0x00000002 | 4     | Int32      | Always null.
0x00000006 | 2     | Int16      | Always `0x0001`.
0x00000008 | 2     | Int16      | Map width.
0x0000000A | 2     | Int16      | Map height.

## Compressed file header

Offset     | Size  | Type       | Description
:----------|:------|:-----------|:-----------
0x00000000 | 2     | Int16      | `0x2711` Map file identification.
0x00000002 | 4     | Int32      | `0xFFFFFFFF`.
0x00000006 | 4     | Int32      | Always null.
0x0000000A | 2     | Int16      | Always `0x0001`.
0x0000000C | 2     | Int16      | Map width.
0x0000000E | 2     | Int16      | Map height.

## Uncompressed map data header

The file has at least 14 map data blocks. Each map data block has identical 16 byte header:

Offset     | Size  | Type       | Description
:----------|:------|:-----------|:-----------
0x00000000 | 2     | Integer    | Map data block identification.
0x00000002 | 4     | Integer    | Always null.
0x00000006 | 2     | Integer    | Width.
0x00000008 | 2     | Integer    | Height.
0x0000000A | 2     | Integer    | Always `0x0001`.
0x0000000C | 4     | Integer    | Bytes of map data to read; equal to width * height.

## Compressed map data

The file has at least 14 map data blocks. Each map data block has a 4 byte header:

Offset     | Size  | Type       | Description
:----------|:------|:-----------|:-----------
0x00000000 | 4     | Integer    | Bytes of map data to read; size of compressed data.

Compression method for map data is a simple variant of RLE ([run-length encoding](https://en.wikipedia.org/wiki/Run-length_encoding)).
