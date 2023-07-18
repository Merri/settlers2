---
title: "Mission Resource Text"
pubDate: 2011-07-17
layout: '$layouts/BlogEnglish.astro'
disqusIdentifier: 210
---

Each setting on this page is followed by **numeric parameters** (except for `!ENABLE_ALL_HOUSES`).

The documentation is incomplete. Why not contribute? [You can do so via GitHub](https://github.com/Merri/settlers2)!

## `[GLOBAL_MAP_SETTINGS]`

These values set the basic map information from defining the players to their alliances and the graphics used.

- **`!GLOBAL_SET_MAP ###`**

    Sets active map (200 to 209)

- **`!GLOBAL_SET_BOBS #`**
    
    Sets which `MIS_#_BOBS.LST` file to use for special mission only graphics (0 to 5)
    
    [![MISBOBS.LST](/wp-content/uploads/2011/07/MISBOBS.png "MIS0BOBS, MIS1BOBS, MIS2BOBS, MIS3BOBS, MIS4BOBS, MIS5BOBS")](/wp-content/uploads/2011/07/MISBOBS.png)_ 
    
    0. 2 graphics
    1. 10 graphics
    2. 5 graphics
    3. 1 graphic
    4. 1 graphic
    5. 4 graphics

- **`!GLOBAL_SET_HQ_BOBS #, #, #`**

    Changes headquarters graphic.
    
    First number is internal file ID for a graphic from loaded `MIS#BOBS.LST` file. Trying to give other than graphic will crash the game.
    
    Second number if shadow graphic.
    
    Third number is yet unknown.
    
- **`!GLOBAL_ADD_COMPUTER_PLAYER # #`**

   Adds a computer player.
   
   First value = player color (1 to 6):
    
    0. Blue (human player only)
    1. Yellow
    2. Red
    3. Purple
    4. Grey
    5. Green
    6. Orange
    
    Second value = which person (0 to 11):

    0. Octavianus (human player is always Octavianus)
    1. Julius
    2. Brutus
    3. Erik
    4. Knut
    5. Olof
    6. Yamauchi
    7. Tsunami
    8. Hakirawashi
    9. Shaka
    10. Todo
    11. Mnga Tscha 

- **`!LOAD_MISSION_TEXTS #`**

    Sets which DATA\\TXT\\MISS\_0##.RTX file to use (1 to 10)

- **`!GLOBAL_SET_COMPUTER_BARRIER # # #`**

    Disallows AI players to build buildings within that area.
    
    Numeric parameters are as follows:

    1. Radius Should be atleast 10 or more. Otherwise AI might build a fortress right at the edge thus claiming the land covered by the barrier anyway.
    2. X location of barrier on the map.
    3. Y location of barrier on the map.

- **`!GLOBAL_SET_COMPUTER_ALLIANCE # #`**

    Sets alliance between ALL players (not only between computer players).

## `[MAPCOMMANDS]`

- **!SET_HOUSE # # #**<br />Adds a building (ie. 24 = headquarters) to specified X & Y position.
- **!ENABLE_HOUSE #**<br />Allows currently active player to build given building type.
- **!ENABLE_ALL_HOUSES**<br />Allows building all building types.
- **!DISABLE_HOUSE #**<br />Removes building type from being available to build.
- **!ADD_WARE # #**<br />Sets resource's amount for active player. The first value is a type ID that ranges from 0 to 30.
- **!ADD_PEOPLE # #**<br />Like resources but with worker types. The type ID values range from 0 to 29 where last five values set the amount of soldiers of each type.
- **!SET_ACT_PLAYER #**<br />Changes the active player for which the above rules apply. When this is not yet given the rules apply to human player (player 0).
- **!ADD_ANIMAL # # #**<br />Adds animal (0 to 9) to given X & Y location.

### Scripted mission events

- `!MET_DIRECT_EVENT`
- `!MET_HOUSE_ENABLING`
- `!MET_POSITION_EXPLORED`
- `!MET_POSITION_OCCUPIED`
- `!MET_END_EVENT`
- `!MET_SET_FINAL_EVENT`
- `!MET_SET_MAP_ELEMENT`
- `!MET_ADD_AS_ACT_EVENT`

## `[ENDE]`

This is an optional end of file, sometimes with an additional `0x1A` as the last character of the file. If you wish to type it you can push `ALT + 0026` (using numbers on the numpad). However since this is optional the file will work fine without.
