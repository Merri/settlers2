---
title: 'Setting a PNG standard'
description: Thoughts on creating a new PNG format for easier manipulation of map files.
pubDate: 2012-08-01
layout: '$layouts/BlogEnglish.astro'
tags:
    - news
    - tools
---

I have successfully completed a WLD/SWD/DAT to PNG world converter! A resulting file:

![Europe World Campaign](/wp-content/uploads/2012/08/EUROPE.png 'EUROPE')

It doesn't look like much, but it contains all the information one needs to restore it back into a complete WLD/SWD file! It just needs a lot of recalculations for some data that has been left out.

Left side block:

-   R = height map
-   G = texture 1
-   B = texture 2

Right side block:

-   R = object 1
-   G = object 2
-   B = resources

Alpha channel (in PHP's limited 7-bit mode) runs animal information 5 bytes per animal:

-   1 byte ID
-   Low 7-bits of X
-   Next 7-bits of X (= 14 bits, loss of 2 highest bits)
-   Low 7-bits of Y
-   Next 7-bits of Y (= 14 bits, loss of 2 highest bits)

However, last 298 bytes are reserved for extra map information. Of this only 84 bytes is actually used for data, the remaining 214 bytes are left for possible future expansion. This means the smallest 32 x 32 map can have up to 350 animals. That should be enough!

The data is formatted as such:

-   Title, 23 bytes (lowest 7-bits of each character)
-   Author, 19 bytes (lowest 7-bits of each character)
-   \= Total of 42 bytes
-   Carry over bits, 6 bytes (highest 7-bits, one bit per character)
-   \= Total of 42 bits
-   Map type, 1 byte (greenland = 0, wasteland = 1, winter = 2)
-   Player face, 7 bytes (0 to 13)
-   Player HQ X pos, 14 bytes (halved to two 7-bit bytes like animal X)
-   Player HQ Y pos, 14 bytes (halved to two 7-bit bytes like animal Y)

And that is it. Everything else in a Settlers II map file is something that can be recalculated based on this information.

_Download removed, outdated because of HTML5 canvas alpha channel issues_



And then I need to start experimenting with HTML5 Canvas & JavaScript...
