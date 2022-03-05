# CNTRL###.DAT file format

This file exists alongside WORLD###.DAT files.

## Beta

File size is 78 bytes.

## Version 1.0

File size is always 358 bytes.

## Version 1.51

File size is always 578 bytes.

Offset     | Size  | Type       | Description
:----------|:------|:-----------|:-----------
0x00000000 | 4     | Integer    | Ticks. Game runs at 8 ticks per second. Use this to calculate game run time.
0x00000004 | 28    | Integer    | *Unknown.*
0x00000020 | 1     | Integer    | **Texture and palette ID**:<br />`0x00` = Greenland<br />`0x01` = Wasteland<br />`0x02` = Winter World
0x00000021 | 88    | Integer    | *Unknown.*
0x00000079 | 1     | Integer    | Appears to always match **Player count**
0x00000080 | 111   | Integer    | *Unknown.*
0x000000E9 | 1     | Integer    | **Player count**
0x000000EA | 4     | Int16 x 2  | Player 1 headquarters X and Y.
0x000000EF | 4     | Int16 x 2  | Player 2 headquarters X and Y.
0x000000F3 | 4     | Int16 x 2    | Player 3 headquarters X and Y.
0x000000F7 | 4     | Int16 x 2  | Player 4 headquarters X and Y.
0x000000FA | 4     | Int16 x 2  | Player 5 headquarters X and Y.
0x000000FF | 4     | Int16 x 2  | Player 6 headquarters X and Y.
0x00000103 | 4     | Int16 x 2  | Player 7 headquarters X and Y.
0x00000107 | 4     | Integer    | `0x00540029`
0x0000010B | 64    | Integer    | Always zero.
0x0000014B | 22    | Int16 x 11 | *Unknown.* Seems to only contain values of 0, 1, or 2.
0x00000161 | 200   | String     | Path and filename of the original map that was loaded. Null terminated.
0x00000229 | 4     | Int16 x 2  | **Width** and **Height**.
0x0000022D | 21    | String     | **Map title**. Null terminated.
