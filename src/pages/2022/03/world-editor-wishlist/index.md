---
title: 'World Editor wishlist'
publishDate: '2022-03-08'
layout: '$layouts/BlogPost.astro'
---

I've been working on the [World Editor](/world-editor/index.html) slowly but steadily and it now boosts a few new
features!

1. You can drag'n'drop `CNTRL###.DAT` together with `CONTI###.DAT` and `WORLD###.DAT` to merge them into a map.
2. You can make the above a game compatible map by toggling the new "Keep only SWD/WLD compatible data"!
3. Animal processing has been improved: if animals are found in block that are not in the footer, they are added to
   footer when downloading SWD/WLD.

There have also been some bug fixes and improvements. Savegame decompression routine now accounts some files missing one
byte of data in compression. There is maybe a bug in the original game's compression routine.

### The wishlist

I've been thinking about features I'd like to implement and also asked for some thoughts over at
[RttR Discord](https://discord.gg/B8FfpTfs).

So here are some of the things to implement:

- Flip map vertically, horizontally
- Rotate map
- Expand map size (add new empty space)
- Double map width & height
- Remove inaccessible resources (granite that can't be collected, fish that can't be caught)
- Increase animal populations
- Remove all trees, remove all granite
- Add forest, add granite
- Change mineral composition per mountain

You may be able to have effect on which things get implemented first by throwing comments! But overall I keep doing what
I can when I can, and avoid getting too much burden.
