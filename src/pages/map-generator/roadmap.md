---
title: 'Map Generator feature roadmap'
description: Feature list for possible features to be added into The Settlers II.net Map Generator over time.
pubDate: 2023-01-28
layout: '$layouts/BlogEnglish.astro'
---

This is a loose roadmap of features that have been implemented, and features to be implemented to the [Map Generator](/map-generator). As can be seen there is a lot you can do with a map generator.

Green checkmark (☑️) indicates a feature has been implemented.<br />Empty box (⬜) indicates feature is to be implemented.

## Landscaping

### ☑️ Elevation based textures

-   Split map into lowlands, land, hillside, and highlands
-   Generate water areas to lowlands
-   Support drawing coasts on water
-   Guarantee access through mining areas by creating regular building spots

### ☑️ Terrain set support

-   Support Greenland, Wasteland, Winter World
-   Use texture combinations that work with each other in each set

### ⬜ Custom terrain set support

Support for fan-made textures.

-   Use texture combinations that work with each other

### ⬜ Choosing textures to use per elevation

This requires lots of UI design work.

-   Allow user to select textures to use in each elevation region type (lowlands/land/hillside/highlands)
-   Allow user to know the features and meaning of each texture
-   Allow user to save the customized configuration

### ⬜ Improved coastal drawing

-   Draw more varied coastal regions instead of having only one type of brush

### ⬜ Sub-area drawing

Split land regions to multiple specialized sub areas.

- Forest areas
- Flower areas
- Desert areas
- Wet swampy areas
- Cold areas

The possibilities depend on chosen terrain set.

### ⬜ Rivers

- Generate random rivers from high areas to low water areas
- Allow turning feature on/off

Note that rivers use water texture which allows buildings to be built on them.

### ⬜ Lakes

- Generate small lakes along the rivers
- Allow turning feature on/off
- Allow generating the lakes regardless of river feature

Lakes will have the normal water texture.

### ⬜ Mountain / mining access improvements

The goal of these features are to give more control on how hard accessing mines is. Useful especially for multiplayer purposes.

-   Allow disabling building spots into mining areas
-   Allow setting how often a building spot is generated to a mining area
-   Make sure you can get past a mining area
-   Allow customization of tree and granite placement likelyhood

### ⬜ Exotic texture support

Add support for all texture values supported by the original game. This means clones of mountain #1 and mountain #2 textures that are plentiful, however there are two different variants for edges: for example in Greenland some have snow edges.

This is not a very high priority since support for these textures would also need to be added to Return to the Roots before they would be useful for everyone. And also: someone would need to draw new specialized terrain set that would make use of the new possibilities!

### ⬜ Player location based landscaping

Instead of creating textures based on elevation use player locations and set of parameters to determine areas around the players.

- Options to block / allow direct access to other players
- Contested resources
- Guaranteed safe resources

This is an entirely different mode compared to the first implemented elevation based textures = lots of work. The order in which generator steps are processed might become entirely different.

## Player placement

### ☑️ Basic player placement

Place players to a hexagon. When 5 or 7 players set one of the players to the middle of the map.

- Give a starting location for desired number of players (1 - 7)
- Place players to a distance from the center of the map
- Guarantee a castle level position
- Allow limiting players to the same land area

### ⬜ More player placement options

- Place evenly to a circle
- Place evenly to a rectangle
- Place evenly to a line
- Place evenly to a triangle
- Support more than 7 players (RttR)

### ⬜ Custom placement

Simple enough: allow to select where to place the headquarters.

### ⬜ Balance report

Determine player advantage / disadvantage rating.

This is a very intensive feature to implement as the game logic needs to be implemented: expansion via military buildings, woodcutter, stonemason, mining, farming, space for other bigger buildings, conflicts of border areas, estimation when resources start to be gathered and when they start to provide benefits.

There is a lot of complexity but doing this work will allow for creation of much more balanced "unbalanced" maps which provide good gaming experience regardless of which player you play with.

## Multiplayer support

Generating maps suitable for multiplayer is totally different from unbalanced single player maps.

### ⬜ Balanced land generation

Generate land areas that are perfect clones (mirrors) to guarantee that each player has as similar conditions as possible.

-   2-way split (vertical/horizontal/diagonals)
-   3-way mirror
-   4-way mirror
-   6-way mirror

#### ⬜ Balanced seafaring

As a sub-set of mirror maps: generate similar islands that are only accessible from each player's own starting area, meaning you need to conquer a player to get access to their harbour islands.

Islands provide rewards with extra resources such as gold, iron ore, farming land.

### ⬜ Balanced resources generation

Generate resources that are as balanced as possible, even on non-balanced generated maps.

This will need considerations on player placement, player access to mining areas, castle building spots, distances to resources.

## Seafaring support

Harbour maps with ships are hard as they often require careful design to work, especially when considering Return to the Roots multiplayer or playing against the AI.

Often it is easier to design harbour maps for single player campaigns and with the limitation that AI cannot build at all near harbour spots.

### ☑️ Generate random harbours

A minimal plausible implementation to generate harbours:

-   Make sure a harbour connects to other harbours
-   Generate harbours only on sufficiently large bodies of water
-   Limit generation so that not every castle on coast becomes a harbour spot
-   Player HQ spot must not be a harbour

However this still might mean the generated harbour spots aren't good.

### ⬜ Improved coastal harbour placement

Instead of considering each spot individually consider locating the actual coast line of each land area.

-   Find all nodes of a coast line
-   Ignore nodes that are too close to a player headquarters
-   On remaining nodes check which ones can have a harbour
-   After placing a harbour spot ignore other spots that are too close along the coast line

The goal of the feature is to limit harbour spots so that they are not too close to any other harbour spot on the same land area.

### ⬜ Block harbours in Roman Campaign scripts

This is part of supporting generating a mission script for replacing the campaigns in The Settlers II.

-   Allow generating blocked positions on harbour spots so that AI can't destroy harbour spots
-   Specialize small islands to award with a specific resource or a need (for example gold or lots of open farm areas)
-   This option available when generating map for S2 (not in balanced or RttR)

### ⬜ Improved RttR AI game play by limitations

Goal of this setting would be to make sea attacks work more nicely even when playing against the AI.

-   Allow limiting total number of harbour spots per land area
-   Guarantee that the harbour spot closest to a player will always be reached by that player first
-   These options available when generating map for RttR (not in balanced or S2)

This won't make the AI work better, but aims to reduce annoyances and improve the play experience.
