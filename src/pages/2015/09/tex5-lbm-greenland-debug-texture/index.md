---
title: "TEX5.LBM Greenland Debug Texture"
publishDate: "2015-09-05"
layout: '$layouts/BlogPost.astro'
categories: 
  - "textures"
---

If you ever want to consider drawing your own texture for the game then this information here will be quite useful! Download can be found at the end of this post.

![Tex5](/wp-content/uploads/2015/09/Tex5.png)

### Normal textures

These are triangles within a 32 x 31 sized rectangle. The two triangle textures overlap each other. This gives some additional challenge for drawing a seamless texture, because repeating parts will be also within the triangle and not just in the outer edges.

Also normal textures have their minimap color ripped directly from the texture from position 16 x 0.

### Water and lava

Water and lava textures are quite simple in that they are two triangles stacked on top of each other. Each triangle fits within a 53 x 27 rectangle. A more challenging thing to understand is that the textures are rendered 135 degrees clockwise (so that the "water" text in the debug texture above appears horizontally in the game).

### Roads

Regular roads, gravel / donkey roads, waterways and mountain roads consist of two parts: the main road part and a node part that is drawn to the ends of a road.

The odd part about these graphics is that they are **inverted vertically**. In addition to this the node part is rotated 90 degrees clockwise after being inverted so that the dashed line will points upwards.

Another thing to note about roads is that they are drawn at roughly half the resolution. Each pixel does get used at some point though depending on slopes, height etc.

### Edges

These triangles are drawn to the edges seamlessly so that if you have a lone triangle texture the visual end result would be a hegaxon if the edges would be of a fully solid color.

Also note that all the debug textures use the same color that is in the edges.

### Unused lava textures

These were once part of the game but were removed before release, however they do remain usable. They are drawn exactly as you can see them, which makes them somewhat more convenient. The sad part about these textures is that their edge is desert so when they are against each other a desert edge is drawn.

As these triangles are quite small they appear quite low resolution in the game, which is also a bit nasty.

### Solid color texture

There is a lone pixel at the bottom left corner in position 0 x 254. This will result in a solid single color texture with no shading and no edges.

### Other things to note

- Magenta pixels around the textures are never drawn. If you use this debug texture and see magenta somewhere then please report it to me so I can adjust and fix the debug texture file!
- I drew a dotted line near each road texture. I think this is the point where going much further makes the edge look a bit "off". At least if you attempt to make a smooth transition.
- You can see a single pixel extending off water and lava textures. It is actually a lone pixel that can get drawn outside of the triangle area probably due to a small calculation error within the game.

![2015-09-06 Greenland Debug Texture Preview](/wp-content/uploads/2015/09/2015-09-06-Greenland-Debug-Texture-Preview-1024x768.png)

## Download

**[TEX5.LBM Greenland Debug Texture](/wp-content/uploads/2015/09/2015-09-05_tex5_greenland-debug-texture.zip)**

Remember to backup the original TEX5.LBM!
