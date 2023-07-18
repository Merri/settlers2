---
title: 'Plan revealed: an online map generator & mission builder'
description: Thoughts about creating a new online map generator and mission builder.
pubDate: 2011-07-22
layout: '$layouts/BlogEnglish.astro'
tags:
    - news
    - tools
---

I've been thinking about this for some time now. While the game is old, there is still atleast some life on it thanks to GOG.com and especially thanks to the very active German community of Settlers fans. Just having a look at Return to the Roots forum gives a good view of what is happening: there is even an entirely new people being developed, and graphics quality wise they're doing a pretty good job!

Initially I'm thinking on making the map tool only to create files that are compatible with the original Settlers II. However, this should also be very compatible with RttR, so that should be good news if my project gets anywhere. Most of the initial "mission support" comes from harbors. However, supporting missions will eventually mean providing whole campaigns, because changing missions easily means changing a whole lot of files starting from mission resource text files (RTX) to mission string files (ENG/GER) to core string files. With existing 2NDpaign campaign you even need to change some graphics files! So the tool really needs to be able to cover a lot of ground besides just being a replacement map editor that works online.

Technically I've already decided a few things. First of all I'll be using the new HTML5 Canvas, which means maps are generated and edited using JavaScript code. The map data will be transmitted as PNG images for minimal transfer sizes between the browser and server. I'll need to create a custom format/implementation for that. For the least there is no point delivering the WLD/SWD files unmodified, that is just a waste of bandwidth!

I don't know yet how quickly the development will proceed. But I'll eventually start working on it.
