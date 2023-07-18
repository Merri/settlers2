---
title: 'Thoughts on maps, PNG & JavaScript'
description: Have been working with the map stuff again after a while of hiatus.
pubDate: 2012-07-31
layout: '$layouts/BlogEnglish.astro'
tags:
    - news
---

It's been a while since I last spent time on The Settlers II maps. This is a return of a programmer so expect a lot of technical stuff that interests only few!

A year or so ago I was thinking about an online map generator, but I didn't go very far with the idea as far as implementation goes. I have a constant issue of balancing my free time against my days spent in work, as work tends to take more off of me than I'd like it to. And my past history has shown me that I'm very bad at keeping myself continuously on just one or two projects. So how come I'm writing now?

<marquee><blink>Because it's a vacation time!</blink></marquee>

So I'm again getting myself back on track with my project here and hopefully something nice comes out of it.

My current thoughts are based on the idea of PNG based map images that would provide the minimal required data. So far I've limited the needed map data to the following:

1. Block 1: height map
2. Block 2: texture 1
3. Block 3: texture 2
4. Block 5: object index
5. Block 6: object type
6. Block 12: resources
7. Footer: animals

Leaving out the following parts of information that usually come with map files:

1. Block 4: roads / empty (required only in savegames)
2. Block 7: animals (use footer only?)
3. Block 8: unknown / empty
4. Block 9: buildable sites (can be calculated)
5. Block 10: filled with 7 = empty
6. Block 11: map editor cursor position / empty
7. Block 13: gouraud shading (can be calculated)
8. Block 14: passable areas (can be calculated)

Yup, that alone is dropping the file size to half! Addition of PNG compression will drop the filesize even further. Which is exactly why I want to provide a PNG! The compression reduces filesize and I want to keep things optimized. Some Return to the Roots maps can be up to 1024 x 1024 in size, multiply that by 14 and you've got map files over 14 MB in size! I need to keep the size down between server and JavaScript interaction.

Last year I was still hoping to provide a paletted 8-bit PNG images. As I've spent more time reading about HTML5 Canvas element I've now started to think otherwise. Instead it'll be more efficient to provide a 32-bit PNG image. Why? Because Canvas does not provide support for manipulation of 8-bit image data, it is always handled in 32-bit. I don't want to multiply the data by 4 when it is held in browser's memory & cache, so keeping it 32-bit is technically better. The downside to this is that the data becomes unreadable to human eyes as each pixel will represent four points of image data. And there will be no palette information. In the other hand JavaScript exists to take care of visualizing the data, so this is only a developmental downside.

At the moment I'm slightly stuck on getting myself to start writing the code. I guess I'm still exhausted from a very long period of work with no good vacations in between. I did have two weeks of my holidays early in the summer, and this is the second half of it right now. Other than that my days off of work have been minimal, only the few days off in spring like Easter and in winter like Christmas. This year is much better in that regard and I'll have entire eleven days off in Christmas and New Year! Anyhow, it looks like I give my work far more energy than I should, but it also seems I'm unable to avoid giving my best at work. Tell me about it.

The next few days will show if I get my hands dirty with code. If I do, I hope what comes out of it will be useful for all of us in the community: be it the players of original The Settlers II or the folks enjoying Return to the Roots :)
