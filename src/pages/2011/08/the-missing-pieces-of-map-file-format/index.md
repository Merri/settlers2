---
title: 'The missing pieces of map file format'
description: I've been looking further into the map files and now also RttR documentation to figure out the remaining pieces of the puzzle.
pubDate: 2011-08-09
layout: '$layouts/BlogEnglish.astro'
tags:
    - tools
---

After finding out about RttR documentation and having a look at some of the source code we now have gathered a great deal of information about The Settlers II WLD/SWD file format. Yet there is still things that need further investigation:

-   The single unknown byte in file header, what is it for? A wild guess at this point without testing: maybe it could set the MISS#BOB graphics? That is a feature that could've been added from RTX files just like the leaders...
-   Block 8: being always just full of NULL this probably needs a look from savegame files. We haven't had a proper look at the savegame files yet!
-   Block 10: this is always full of 7. Since there is a maximum of seven players in the game maybe values 0 to 6 could indicate the player who owns that spot? So an ownership block. But this can only be verified by having a look at the savegame files.
-   Block 11: I can hardly believe this would be used only for Map Editor's cursor position. So I throw a wild guess: maybe it is the highlighted icons map! This would be internal game use only, and the Map Editor simply saves memory as it is at that very moment, explaining why we appear to get the "cursor position".

Return to the Roots project has done some job in other areas. A simple thing they've done with the RttR Map Editor is to allow for bigger maps, up to 1024 x 1024 (which is way bigger than the maximum of 256 x 256 the original game can handle). The problem is that this breaks backwards compatibility!

## Thoughts for RttR

Backwards compatibility issue leads to the interesting idea of simply creating a new file format, but there is no reason to create a new one if there is already one that would fit the needs. For example the Widelands team already made their own map format, which is simply a renamed ZIP file with contained files and a few folders, which also makes the format quite extendable in the future. The drawback is that the format is highly incompatible with The Settlers II file format and would require a lot of reprocessing of existing data. This may prove to be inconvenient and unnecessary development.

For a new file format there is no reason to reinvent the wheel. We could take the bare minimum from the existing map files and put it as it is into the new format. The WLD/SWD format includes 14 blocks of map data, with a file header and a footer. However there is a lot of blocks we don't really need. As I understand it, Blue Byte designed the files to be simply read into the memory as they are. No compression, no encryption of any kind, and not much processing of data.

The reason for this is performance. The Settlers II has a great deal of tricks to perform well on computers of it's time of release. Today performance is not as much of an issue, therefore game companies often take good care of protecting their data into a format that is not very easy for human brains to analyze, yet the actual data is probably quite standard such as XML.

My core point with all of this is that the file format can contain just the data that is truly needed. Heights, textures, objects, resources, animals... this means for just the actual map data we can ignore most of the original WLD/SWD file.

But where and how should we contain this data? Well, it happens to be that The Settlers II already has a custom file format that would fit the requirement: LST archive file format. RttR can already read this file format quite well. However for map file purposes the LST needs to be extended as the file is originally meant for some gamedata such as graphics. The interesting things about the map data is that you can actually consider it as graphics, so you could basically use the existing graphics loading and saving routines to save the map data, but you would still have the issue of saving information such as Title and Author of the map.

What I think is the biggest disappointment regarding The Settlers II maps is that you can't store all the information there. And I really mean the campaigns and their missions. They're very separated file wise, as you have separate LST files directly under DATA folder for mission specific graphics, the map files themselves at DATA\\MAPS folder, then you can find RTX files at DATA\\MISSIONS and one more folder for the actual texts that the RTX files refer to! Now while it is nice to keep this information separate and it somewhat makes localization easy for the single mission, it really makes things hard when you as a fan make your own campaign and want to share it with others!

So my suggestion is to create a file format that can contain:

1. Multiple maps (one for each mission)
2. Mission RTX
3. One or more language texts so that a campaign can be translated to multiple languages
4. Special graphics required by the missions

This one file format could hold just one map, or an entire campaign!

What do you say, wouldn't this be worthwhile to do?
