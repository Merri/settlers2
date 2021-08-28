---
title: "Map header's last unknown byte now known!"
publishDate: "2012-09-08"
layout: '../../../../layouts/BlogPost.astro'
categories: 
  - "return-to-the-roots"
  - "site-news"
---

Earlier all documentation has stated one unknown byte in a map file header that is between player HQ locations and leaders. I now know the meaning of this byte: Map Editor sets it to 1 if the map is invalid, in it's terms meaning there are no players set. The game reads this byte when selecting a map in Unlimited Play and ranks the map as Invalid Map. It however also shows map title and size.

I noticed this just a moment ago after having a look those demo maps that I made. I used Map Editor to generate a map of correct size, title and author information and then manually pasted the bytes with a hex editor. Only now I paid attention to what header content the maps had when I just happened to open them in a hex editor.

Because this byte is used like this I throw a recommendation that any map that works exclusively for RttR should set this byte to 0x02. This prevents users of the original game from trying to play the map file. Any non-zero value in this byte prevents the map from loading in Unlimited Play.
