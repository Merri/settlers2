---
title: 'One more texture ID to use'
description: Reverse engineering discovery when analyzing the map files.
pubDate: 2012-08-19
layout: '$layouts/BlogEnglish.astro'
tags:
		- docs
    - textures
---

I found one more texture that is usable in the game! With usable I have the following requirements:

1. It must have texture borders that blend well with other textures.
2. The texture shouldn't look like a glitchy one.
3. The texture is different in some way than other textures.

The new texture has an ID of 34 (or 0x22 for those who prefer hex) and it represents Mountain #2 texture (ID 11 / 0x0B). It has a correct border pattern against other textures in all three types of world. The color on the minimap appears correctly as well. It even renders similarly in both in the game and map editor, which can't be said to be true for all of the other previously unused textures.

This texture is useful if you want to have a mountain spot where you can build regular buildings and you would like to use something else than Mountain Meadow texture.

Currently there is no tool that would support any of these previously unused textures. Maybe later this year...

**Update!**

By request, here are a few screenshots of the texture in use:

![](/wp-content/uploads/2012/08/texture_0x22_1.png)

![](/wp-content/uploads/2012/08/texture_0x22_2.png)

The edge isn't perfect against a meadow, but it doesn't look too bad.
