---
title: "Sidequest for more texture sets in S2"
publishDate: "2012-08-06"
layout: '$layouts/BlogPost.astro'
categories: 
  - "textures"
---

I wanted to try out if it is possible to add a fourth texture set into the original The Settlers II. So I went ahead and copied a few files like MAP\_0\_Y.LST as MAP\_3\_Y.LST or GOU5.DAT as GOU8.DAT, as well as modified a map to point to texture 4 and introduced my own customized Greenland texture as TEX8.LST... and what do you know, it works!

![](/wp-content/uploads/2012/08/more_textures_to_s2.png)The only problem with this, as can be seen from the image, are the texture borders. I don't know where the game captures this information from. It can't be from the files I duplicated, because otherwise the information would be correct. It has to come from somewhere else. Figuring out this mystery will be a hard one. In worst case it is some data within the S2.EXE which is quite well beyond my usual modding experience. And I'd like to keep things easy anyway!
