---
title: "Texture and palette differences"
publishDate: "2011-08-28"
layout: '$layouts/BlogPost.astro'
categories: 
  - "textures"
coverImage: "Textures.png"
---

Here comes my first attempt at making a complete summary of textures, palettes and gouraud shading in The Settlers II.

There are three versions of the game that matter to us:

1. Version 0.16 DEMO only released to German fans
2. Version 1.01 Veni Vidi Vici
3. Version 1.51 Gold Edition / Mission CD

0.16 and 1.01 have textures, palettes and gouraud shadings in files:

- GOURAUD.DAT (0.16) Greenland
- GOURAUD0.DAT (1.01) Greenland / palette mismatch!
- GOURAUD1.DAT (1.01) Wasteland / palette mismatch!
- PALETTI0.BBM (0.16) Greenland
- PALETTI0.BBM (1.01) Greenland
- PALETTI1.BBM (1.01) Wasteland
- TEXTUR\_0.LBM (0.16) Greenland
- TEXTUR\_0.LBM (1.01) Greenland
- TEXTUR\_3.LBM (0.16) Wasteland
- TEXTUR\_3.LBM (1.01) Wasteland

While version 1.51 uses shorter and different filenames:

- GOU5.DAT Greenland
- GOU6.DAT Wasteland
- GOU7.DAT Winter World
- PAL5.BBM Greenland
- PAL6.BBM Wasteland
- PAL7.BBM Winter World
- TEX5.LBM Greenland
- TEX6.LBM Wasteland
- TEX7.LBM Winter World

Version 1.51 is the definitive version that we all know and love. The older versions however all contain some mysteries to be unveiled! Unused textures, gouraud shading bugs revealed in version 1.01... have a look!

### Palette & gouraud shading comparison

The image to the left is Greenland palette & it's gouraud shading, the right one is for Wasteland.

![](/wp-content/uploads/2011/08/Wasteland-Version-016.png) Version 0.16

![](/wp-content/uploads/2011/08/Wasteland-Version-101.png) Version 1.01

![](/wp-content/uploads/2011/08/Wasteland-Version-151.png) Version 1.51

Mostly the interesting parts in these images is the difference in player colors (around the middle of the palette) and that the first commercial release of the game shipped with buggy gouraud shading files! These buggy files actually reflected palettes used earlier in the game's development. You can clearly see some distortion in the version 1.01 shading.

Just for completion here is also the Winter World for version 1.51:

![](/wp-content/uploads/2011/08/Winter-World-Version-151.png)

### Texture map

Now here things get interesting: the older versions of textures often contain more textures than the final 1.51 version textures files. I have made one huge image for comparison:

![](/wp-content/uploads/2011/08/Textures.png)

The order here is reversed: the first column has version 1.51 textures, the second column has version 1.01 and the final third column contains version 0.16. The last texture shows the texture locations used by version 1.51 - which spoils to us that the original Wasteland plans included three more lava textures and we know the index values for textures. There just is no tool to use these texture indexes in existing maps so using them is manual work with a hex editor.

One of the minor interesting bits of information is that Wasteland originally mirrored Greenland quite well, then in version 1.01 things got quite messed up, until when getting back to version 1.51 things started to make more sense again. Or, atleast a little bit, because there are some dramatic differences with textures such as Greenland's Mountain Meadow appearing as Alpine Pasture, which resembles Lava with stones without the lava, and being Snow in Winter World. All these are the same texture which you can build buildings on!

Comparing between Wasteland versions you can see how an idea of various kinds of lava simply jumps from three new animated textures to having just one of them in 1.01 and finally replacing which-would-be Greenland's Snow and Swamp textures in 1.51. But most importantly we can see how broken development started to get in version 1.01 and how they made massive fixes and corrections, and these changes are probably reflected in all Wasteland maps as well. So if one converts a version 1.01 map into a 1.51 map with some technical knowledge he'll find out the textures appear incorrect as they are handled in a very different way. Of course there is a possibility that V1.01 ises texture files differently between Greenland and Wasteland, and texture indexes remain the same.

But why is all this information useful? Well, I guess the importance is kind of minor, but you can see some textures that you can't see in 1.51 which may give ideas for further development in projects such as RttR. For me this gives some clues for additional textures to be used in my New Greenland texture, and for possible future Wasteland and Winter World textures. Also, it may be fun to customize the palette a little bit!
