---
title: "Texture regions"
publishDate: "2015-09-04"
layout: '../../../../layouts/BlogPost.astro'
categories: 
  - "textures"
---

I just wanted to know which parts of textures are actually drawn by the game. So it uses two simple triangles and both triangles use the same texture. On flat surface the triangle is within roughly a 31 x 30 rectangle, but it can stretch by one additional pixel to both directions to 32 x 31 when drawing slopes.

The image below is most helpful when looking at it with some additional zoom. Things to note:

- Barely any water pixels are drawn; the ones that are drawn are leaked from the right side of the texture
- Most of yellow comes from the right side of the triangles, barely any from left side
- Top right magenta pixel makes an appearance
- Top right green pixel below magenta doesn't
- Magenta midpoint pixels don't make an appearance
- Green pixel above right one does; the one below doesn't

![Texture triangles](/wp-content/uploads/2015/09/2015-09-04-Textures-again.png)

This is only interesting if making texture mods or adjusting RttR rendering, but at least it has now been researched and somewhat documented :)
