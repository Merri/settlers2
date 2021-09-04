---
title: "Working on it after so many years"
publishDate: "2011-07-24"
layout: '$layouts/BlogPost.astro'
categories: 
  - "site-news"
---

![](/wp-content/uploads/2011/07/Precise-color-SWD-maps.png)I guess one could say I should be upset. All my old documentation I wrote to papers some five years ago has been long lost and I don't even have the code for my own Map Generator anymore. I've lost all my old e-mail too, with some information on The Settlers II file formats in them.

That really hasn't stopped me from being in a very creative mood. I now read the map files very well. I've analyzed all the data outside the main map data, which means I know exactly what each byte in the file represents and how the game interprets these. As freshly new information I even found out the longest possible title is 23 bytes. Earlier I thought only 19 bytes is possible. Blue Byte's original Map Editor is cruel and only lets you save 17 bytes long titles! So this is something that I'll "fix" with what I'm doing.

The challenging part is analyzing all the other bytes in all the "submaps" that are in each SWD file. There is 14 of these. At the moment I only know each byte represented in submaps #1, #2 & #3, and I know how this information can be used with submap #13 to get that kind of a pretty picture you can see here. I even went as far as producing Blue Byte pixel perfect result, but then I thought I could do it a little bit differently and then went ahead to produce more "color accurate" end result by calculating the avarage color of texture, taking the closest one from the game's palette and use that instead.

The road to getting anything useful done is still long and hard. The simplest thing I could do is a map upload service. I just don't know if I want to spend my time on it just yet. I don't even know if I have any visitors around here!

**Update!** Looks like I do have visitors and people are looking for... you guessed it, maps! I guess it is worth it then.
