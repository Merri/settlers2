---
title: "Tools"
publishDate: "2012-08-23"
layout: '$layouts/BlogPost.astro'
disqusIdentifier: 611
---

Some stuff that might help, mostly stuff that helps us to figure out how the original The Settlers II works in a technical level.

## Texture edges debug files

[**EdgeDebug**](/wp-content/uploads/2012/08/EdgeDebug.zip)

Contains replacement textures and map files for all the textures that are more or less usable/unique.

## Texture on texture map files

These three map files are useful for checking against new/previously unused textures. What you do is to use hex editor and replace all 07 values with an unknown texture ID such as 17. The only thing certain about texture IDs from 17 to 3F is that they are like a regular meadow. You can build houses on them and they contain water. The unknown part is how these textures interact with known textures; in a good case there might still be one or two lurking that are actually usable in one way or another.

[**Texture on texture**](/wp-content/uploads/2012/08/Texture-on-texture.zip)

### Sample screenshots

Displaying the unchanged file with background texture being Desert #2 (0x07), with visible rows of texture IDs...

```
00, 01, 02, 03, 04, 05
08, 09, 0A, 0B, 0C, 0D
10, 11, 12, 13, 14, 15
```

> [![Greenland](/wp-content/uploads/2012/08/txontx_0-300x91.png)](/wp-content/uploads/2012/08/txontx_0.png)<br />
> Greenland
>
> [![Merri's New Greenland](/wp-content/uploads/2012/08/txontx_0Merris-New-Greenland-300x91.png)](/wp-content/uploads/2012/08/txontx_0Merris-New-Greenland.png)<br />
> Merri's New Greenland
>
> [![Wasteland](/wp-content/uploads/2012/08/txontx_1-300x91.png)](/wp-content/uploads/2012/08/txontx_1.png)<br />
> Wasteland
>
> [![Winter World](/wp-content/uploads/2012/08/txontx_2-300x91.png)](/wp-content/uploads/2012/08/txontx_2.png)<br />
> Winter World

## Object viewer map file

This map file is filled with all object indexes (0 to 255). Just change object type to see what you end up with!

In a hex editor you can find object types starting at position 0x1D90 (= 7568 bytes). The default C8 = decorative landscape object.

[Object viewer `[OBJECTS.SWD]`](/wp-content/uploads/2012/08/Object-viewer.zip)

[![](/wp-content/uploads/2012/08/S2_objects-300x225.png)](/wp-content/uploads/2012/08/S2_objects.png)
