---
title: 'Technical Documentation'
description: The Settlers 2 technical file format documentation for graphics, map files, sprites, palettes, localization, saved games and other.
pubDate: 2021-09-01
modDate: 2023-07-22
layout: '$layouts/BlogEnglish.astro'
disqusIdentifier: 474
---

## New!

[Map files documentation](/documentation/map-files) has new information on WLD/SWD and how savegame files relate to the map files.

## File formats

-   [WLD / SWD](/documentation/world-map-file-format-wldswd) Maps
-   [BBM](/documentation/bbm-file-format)
-   [LBM](/documentation/graphics-files-lbm)
-   [IDX](/documentation/idx-dat-file-format)
-   [LST](/documentation/lst-file-format)
-   [RTX](/documentation/mission-resource-text)

### Game internals

-   [Objects](/documentation/objects)
-   [Objects landscape table](/documentation/objects-landscape-table)

### Do it yourself

-   [Tools](/documentation/tools) to help analyze the game

---

## Game files explained

-   [Root directory](#root-directory)
-   [Data directory](#data-directory)
-   [Graphics directories](#graphics-directories-gfx)
-   [Save directory](#save-directory)

### Root directory

<pre>
<a href="#data-directory">📁 DATA</a>             | Game data.
📁 DRIVERS          | Contains DOS drivers required to play music and sounds.
<a href="#graphics-directories-gfx">📁 GFX</a>              | Graphics.
<a href="#save-directory">📁 SAVE</a>             | Saved games and progress.
📁 VIDEO            | Intro video.
📁 WORLDS           | Custom maps.
📄 DOS4GW.EXE       | DOS memory extender.
📄 INSTALL.SCR      | Install script instructions text file.
📄 S2.EXE           | Main game executable.
📄 S2EDIT.EXE       | Map Editor executable.
📄 SETTLER2.EXE     | English game launcher.
📄 SETTLER2.VMC     | Virtual Memory Manager configuration text file.
📄 SETUP.EXE        | Setup sound and music.
📄 SETUP.INI        | Setup configuration file.
📄 SIEDLER2.EXE     | German game launcher.
</pre>

### `DATA` directory

<pre>
📁 ANIMDAT          | Animation.
📁 BOBS             | Carriers and workers.
📁 CBOB             | Workers.
📁 IO               | Fonts, graphics.
📁 MAPS             | The Roman Campaign
📁 MAPS2            | World Campaign
📁 MAPS3            | Old Unlimited Play maps
📁 MAPS4            | New Unlimited Play maps
📁 MASKS            | Masks
📁 MBOB             | Buildings
📁 MISSIONS         | Campaign mission scripts
📁 ONLINE           | Game help strings
📁 SOUNDDAT         | Sounds and music
<a href="#graphics-directories-gfx">📁 TEXTURES</a>         | Palette light table for light and shadow on textures
📁 TXT              | Game strings
📁 TXT2             | Credits and keyboard strings
📁 TXT3             | Map Editor strings
📄 BOOT_Y.LST       | -
📄 BOOT_Z.LST       | -
📄 BOOTBOBS.LST     | -
📄 CREDITS.LST      | -
📄 EDITBOB.LST      | -
📄 EDITRES.DAT      | -
📄 EDITRES.IDX      | -
📄 IO.LST           | -
📄 MAP_0_Y.LST      | - (Greenland)
📄 MAP_0_Z.LST      | - (Greenland)
📄 MAP_1_Y.LST      | - (Wasteland)
📄 MAP_1_Z.LST      | - (Wasteland)
📄 MAP_2_Y.LST      | - (Winter World)
📄 MAP_2_Z.LST      | - (Winter World)
📄 MAP00.LST        | - (Greenland)
📄 MAP01.LST        | - (Wasteland)
📄 MAP02.LST        | - (Winter World)
📄 MAPBOBS.LST      | -
📄 MAPBOBS0.LST     | -
📄 MAPBOBS1.LST     | -
📄 MIS0BOBS.LST     | Special graphics for a mission.
📄 MIS1BOBS.LST     | Special graphics for a mission.
📄 MIS2BOBS.LST     | Special graphics for a mission.
📄 MIS3BOBS.LST     | Special graphics for a mission.
📄 MIS4BOBS.LST     | Special graphics for a mission.
📄 MIS5BOBS.LST     | Special graphics for a mission.
📄 REMAP.DAT        | -
📄 RESOURCE.DAT     | -
📄 RESOURCE.IDX     | -
</pre>

### Graphics directories (GFX)

<pre>
📁 DATA\TEXTURES
╙─📄 GOURAUD.DAT     | Greenland light table (V0.15, V0.16)
╙─📄 GOURAUD0.DAT    | Greenland light table (V1.00 to V1.02)
╙─📄 GOURAUD1.DAT    | Wasteland light table (V1.00 to V1.02)
╙─📄 GOU5.DAT        | Greenland light table (V1.51)
╙─📄 GOU6.DAT        | Wasteland light table (V1.51)
╙─📄 GOU7.DAT        | Winter World light table (V1.51)

📁 GFX\PALETTE
╙─📄 PAL5.BBM       | Greenland palette (V1.51)
╙─📄 PAL6.BBM       | Wasteland palette (V1.51)
╙─📄 PAL7.BBM       | Winter World palette (V1.51)
╙─📄 PALETTI0.BBM   | Greenland palette (V0.15 &ndash; V1.02)
╙─📄 PALETTI1.BBM   | Wasteland palette (V0.15 &ndash; V1.02)
╙─📄 PALETTI8.BBM   | Unknown use; replaces brown with greyscale, also differences in some other colors

📁 GFX\PICS
╙─📁 MISSION        | World Campaign mission selection continents
╙─📄 *.LBM          | Various background graphics
╙─📄 WORLD.LBM      | World Campaign mission selection screen
╙─📄 WORLDMSK.LBM   | World Campaign mission mask for determining selection

📁 GFX\PICS2
╙─📄 CREDIT00.LBM   | Credits background image

📁 GFX\TEXTURES
╙─📄 TEX5.LBM       | Greenland texture set
╙─📄 TEX6.LBM       | Wasteland texture set
╙─📄 TEX7.LBM       | Winter World texture set
╙─📄 TEXTUR_0.LBM   | Greenland texture (V0.15 &ndash; V1.02)
╙─📄 TEXTUR_3.LBM   | Wasteland texture (V0.16 &ndash; V1.02)
</pre>

-   Most of the graphics are Amiga IFF (Interchange File Format) files, but use extensions LBM and BBM.
-   The gouraud files are raw byte tables 256&times;256 pixels in size, but only use the top half for actual data.
-   Colors used during gameplay always come from the palette files, so palette in main texture set is ignored.

Making changes to a palette will also require changing the gouraud table, otherwise the light and shadow colors will
become corrupted. Blue Byte developers made late changes to the palette but forgot to update the gouraud table in V1.0
releases of the game so there is corrupt / glitchy colors visible with some of the colors in the game in some levels of
shadow. The issue was fixed in V1.51 release.

### `SAVE` directory

<pre>
📄 DIR.DAT          | Table of saved games (900 &ndash; 909)
📄 MISSION.DAT      | Roman Campaign mission play status: text file with "1" for enabled, "0" for disabled
📄 MISSION2.DAT     | World Campaign missions play status: binary file with 01 for enabled, 00 for disabled
📄 RES.DAT          | Unknown use

📄 CNTRL800.DAT     | Beta/demo map (control / metadata, later versions include the name of the loaded map)
📄 COMPY800.DAT     | Beta/demo map (unknown / AI status?)
📄 CONTI800.DAT     | Beta/demo map (table of regions: sizes and starting points of bodies of land and water)
📄 DESKT800.DAT     | Beta/demo map (unknown)
📄 MAILS800.DAT     | Beta/demo map (messages)
📄 TRANS800.DAT     | Beta/demo map (transportation)
📄 WORLD800.DAT     | Beta/demo map
</pre>

Beta and demo versions of the game has one of their playable maps stored as a saved game with the number 800.

Normal savegame slots use numbers 900 to 909.
