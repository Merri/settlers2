---
title: "Map handling updates"
publishDate: "2012-08-05"
layout: '$layouts/BlogPost.astro'
categories: 
  - "site-news"
  - "tools"
---

Now that the technical side is no longer such a big of a problem I have rebuilt the JavaScript code in a more object oriented manner to make it easier to manipulate map data. I added a few features to showcase things that are possible to do:

- You can now change terrain type in real time.
- You can switch between two different palettes.
- You can manipulate a map's height map with some randomness - and see the changes happen.
- You can try a few maps instead of seeing just one.

These aren't very major yet, but it gives a little bit of something. Some important stuff is to be done, like recalculating the part of map data that deals with buildable areas and landmasses. Knowing this information and calculating it correctly is very important for some future features, such as placement of headquarters or finding out about possible harbor sites. Deeper validation of maps also benefits of knowing more. There are also some bugs in the original game that can be fixed by disallowing stuff that causes these bugs to appear, such as placement of granite over water/lava/snow/swamp or Map Editor's bug of placing fish to unwalkable parts of coastline.

Visit the [Canvas Map Viewer](/canvas/) to see the current progress.
