---
title: "Figuring out building sites"
publishDate: "2012-08-07"
layout: '../../../../layouts/BlogPost.astro'
categories: 
  - "site-news"
---

Flag, hut or castle? That is the question. At this point I'm only interested on how height map affects building site icon, thus ignoring effects of objects (trees & granite) and houses.

To start figuring out the mystery I made a simple flat map and then started to modify the height of a single point and took a few images along the way. From past experience I know that the Map Editor only allows a maximum height difference of 5. You can hack more if you want, of course, but Map Editor starts increasing height of all nearby points until each have a maximum height difference of 5. This means to me that flags, huts and castle icons are calculated on a very small scale of differences. So here we go:

| Strength | Plus | Minus |
| --- | --- | --- |
| 1 | ![](/wp-content/uploads/2012/08/plus_1.png "plus_1") | ![](/wp-content/uploads/2012/08/minus_1.png "minus_1") |
| 2 | ![](/wp-content/uploads/2012/08/plus_2.png "plus_2") | ![](/wp-content/uploads/2012/08/minus_2.png "minus_2") |
| 3 | ![](/wp-content/uploads/2012/08/plus_3.png "plus_3") | ![](/wp-content/uploads/2012/08/minus_3.png "minus_3") |
| 4 | ![](/wp-content/uploads/2012/08/plus_4.png "plus_4") | ![](/wp-content/uploads/2012/08/minus_4.png "minus_4") |
| 5 | ![](/wp-content/uploads/2012/08/plus_5.png "plus_5") | ![](/wp-content/uploads/2012/08/minus_5.png "minus_5") |

The next part is wondering how game's algorithm works. For the most part it seems like there is one point that is more sensitive than others: the bottom right one. You can see this for yourself by comparing images Minus 2 and Plus 2: when the bottom right point is larger by 2, then the icon is a flag.

When the difference hits 3 things start to get very interesting. Surprisingly the nearest points right next to the difference of 3 remain as castle icons (!!!) and points one step further away instead react to the difference, becoming huts. Also, hitting plus 3 difference on the spot itself is enough to make that spot appear as a hut.

Then we have 4 and 5, which are finally enough to set the closest points as flagpoles.

I haven't yet tried to put this information into an algorithm. Also, there are still other things to look at, such as mine icons and how an object changes these.
