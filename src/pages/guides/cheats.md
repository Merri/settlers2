---
title: 'Cheat codes and basic modding'
description: Cheat shortcuts, developer debug tools and basic modding knowledge for The Settlers 2.
pubDate: 2011-07-16
modDate: 2023-02-14
layout: '$layouts/BlogEnglish.astro'
disqusIdentifier: '143 http://settlers2.net/?page_id=143'
disqusCanonical: 'https://settlers2.net/the-settlers-2/cheats'
---

You can enable and disable cheat mode by typing **WINTER** when playing the game. Cheat mode works when playing any map or mission.

When cheat mode is activated you can see this icon in top right corner of the screen: <img alt="Cheat mode icon" src="/assets/docs/cheat-mode-icon.png" height="30" width="30" />

**Note!** Cheat code applies to The Settlers II: Gold Edition (original game version 1.51).

## Cheat code effects

-   In campaign maps the cheat mode will enable all buildings to be built even if mission script has not enabled those buildings.
-   **F7** can be pressed to remove fog of war, or to restore it.
-   **ALT + number** where number is 1 to 6 can be used to set game speed. 6 will make the game run as fast as possible and will greatly reduce screen update frequency, so be careful!
-   You can build a new Headquarters building by clicking an empty area outside your borders as long as that position on the map can have a building constructed. HQ will have merchandise when in unlimited play mode, in missions it will be empty.

### Older game versions

In earlier releases of the game the cheat code is **THUNDER** and the icon is slightly different: <img alt="Cheat mode icon v1.02" src="/assets/docs/cheat-mode-icon-v102.png" height="30" width="32" />

Also: placing the Headquarters is only available since v1.51 of the game.

---

## Basic modding

These are some of the simplest modifications you can make to the game with a little bit of effort. If you wish to be careful you should make a backup copy before editing the files!

### Enable all Roman Campaign missions

The game installation directory contains a **SAVE** directory.

-   Open `SAVE\MISSION.DAT` with a "pure" text editor such as Notepad, Notepad++, Sublime Text
-   Replace contents with `1111111111`
-   Or to reset back to fresh install: `1100000000`

This file always exists.

### Enable all World Campaign missions

This file might be missing if you have played a World Campaign mission.

-   Open or create `SAVE\MISSION2.DAT` with a hex editor, such as [HxD](http://mh-nexus.de/en/hxd/)
-   `01 01 01 01 01 01 01 01 01 01` will enable all missions

<img alt="Screenshot of HxD with MISSION2.DAT open where all missions are enabled" src="/assets/docs/mission2-dat-hxd.png" height="637" width="1002" />

If instead preferring to use a text editor you can also try copying this: <input type="text" size="28" value="" readonly style="font-family:var(--mono-font)" />
