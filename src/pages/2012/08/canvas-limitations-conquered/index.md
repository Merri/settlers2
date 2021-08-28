---
title: "Canvas limitations conquered"
publishDate: "2012-08-02"
layout: '../../../../layouts/BlogPost.astro'
categories: 
  - "site-news"
  - "tools"
---

So, today I noticed a serious issue with my earlier PNG implementation: HTML5 Canvas doesn't treat colors as exactly as I'd like to when alpha channel is active on a pixel. This results RGB data on a semitransparent pixel to be incorrect when reading it. So I can't use a PNG image with alpha transparency.

Now I've sorted out this issue by making the image larger, dropping all 7-bit stuff and providing everything as a 24-bit PNG image. This actually compresses better than image with an alpha channel which is nice.

Besides fixing the PHP side of things I have of course been working with the JavaScript side of things. I now read the PNG file without issues, although gotta remember canvas always provides alpha channel information that just has to be ignored.

You can find the PHP source as well as an example page at [https://settlers2.net/canvas/](/canvas/)
