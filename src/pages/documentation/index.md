---
title: 'The Settlers II Technical File Format Documentation'
publishDate: '2021-09-01'
layout: '$layouts/BlogPost.astro'
disqusIdentifier: 474
---

## File formats

- [WLD / SWD](/documentation/world-map-file-format-wldswd) Maps
- [BBM](/documentation/bbm-file-format)
- [LBM](/documentation/graphics-files-lbm)
- [IDX](/documentation/idx-dat-file-format)
- [LST](/documentation/lst-file-format)
- [RTX](/documentation/mission-resource-text)

### Game internals

- [Objects](/documentation/objects)
- [Objects landscape table](/documentation/objects-landscape-table)

### Do it yourself

- [Tools](/documentation/tools) to help analyze the game


## Game root directory

<pre>
<a href="#data">📁 DATA</a>             | Game data.
📁 DRIVERS          | Contains DOS drivers required to play music and sounds.
<a href="#gfx">📁 GFX</a>              | Graphics.
<a href="#save">📁 SAVE</a>             | Saved games and progress.
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

### DATA

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
📁 TEXTURES         | Gouraud shading for each world type
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
📄 MAP_0_Y.LST      | -
📄 MAP_0_Z.LST      | -
📄 MAP_1_Y.LST      | -
📄 MAP_1_Z.LST      | -
📄 MAP_2_Y.LST      | -
📄 MAP_2_Z.LST      | -
📄 MAP00.LST        | -
📄 MAP01.LST        | -
📄 MAP02.LST        | -
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

### GFX

<pre>
📁 PALETTE
╙─📄 PAL5.BBM       | Greenland palette
╙─📄 PAL6.BBM       | Wasteland palette
╙─📄 PAL7.BBM       | Winter World palette
╙─📄 PALETTI0.BBM   | Greenland palette (unused in Gold Edition)
╙─📄 PALETTI1.BBM   | Wasteland palette (unused in Gold Edition)
╙─📄 PALETTI8.BBM   | Winter World palette (unused in Gold Edition)
📁 PICS
╙─📁 MISSION        | World Campaign mission selection countries
╙─📄 *.LBM          | Various background graphics
╙─📄 WORLD.LBM      | World Campaign mission selection screen
╙─📄 WORLDMSK.LBM   | World Campaign mission mask for determining selection
📁 PICS2
╙─📄 CREDIT00.LBM   | Credits background image
📁 TEXTURES
╙─📄 TEX5.LBM       | Greenland texture
╙─📄 TEX6.LBM       | Wasteland texture
╙─📄 TEX7.LBM       | Winter World texture
╙─📄 TEXTUR_0.LBM   | Greenland texture (unused in Gold Edition)
╙─📄 TEXTUR_3.LBM   | Wasteland texture (unused in Gold Edition)
</pre>

### SAVE

<pre>
📄 TODO
</pre>

## Where can I find the files?

You must own a copy of the game. You can get a copy easily from [GoG.com](https://www.gog.com/game/the_settlers_2_gold_edition). It is often discounted to 2.49 € from a full 9.99 € price.

Once owning a copy the game may get installed to multiple locations. If you download a digital copy with separate installer (without GoG Galaxy) on Windows systems you will find the game likely installed at `C:\GOG Games\Settlers 2 GOLD\`.
