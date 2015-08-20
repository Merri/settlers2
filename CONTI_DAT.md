# CONTI###.DAT file format

This file exists alongside WORLD###.DAT files and contains passable areas. This format is identical to what is part of WLD and SWD file header in Mission CD and Gold Edition versions of The Settlers II.

The file is always 2250 bytes long. It contains 250 entries of following structure:

Offset     | Size  | Type       | Description
:----------|:------|:-----------|:-----------
0x00000000 | 1     | Integer    | **Type ID**:<br />`0x00` unused entry<br />`0x01` land area<br />`0x02` water area
0x00000001 | 2     | Integer    | X location for first index in map data where this area is contained.
0x00000003 | 2     | Integer    | Y location for first index in map data where this area is contained.
0x00000005 | 4     | Integer    | Total size of area.

This information is probably used in the game for seafaring and transportation optimization purposes. Return to the Roots does not require this data.

It also has to be noted that original game maps may have calculated these incorrectly: the original logic used to calculate the areas was naive and sometimes resulted in one continuous land area having two or more indexes.
