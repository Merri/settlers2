---
title: 'A new tool under construction'
description: World Editor utility is now under construction.
pubDate: 2022-03-02
layout: '$layouts/BlogEnglish.astro'
tags:
    - news
---

Recently I've been continuing my work on porting the old JavaScript code to TypeScript. There has been some nice
progress and the code is now able to read old map files, and also to write them back into files! This alone isn't much
fun since there isn't yet much you can do with this, but it is a solid beginning for adding new stuff on top of.

I've named the tool as [World Editor](/world-editor/index.html) and it will be sort of a generic editor for existing
map files and saved games. At the moment the editing features are rather minimal, you can only edit stuff like title,
author, and the terrain type (greenland / wasteland / winter world).

In the future I hope to incorporate some neat features, like "make this map great" sort of feature where you can drop
uninteresting flat map in with solid single type tree forests, but get out a map file that has has ground above water
level, uneven ground, decorative objects, forests with varied types of trees, all that good stuff that make a map much
more interesting! And you know, there are **a lot** of old maps that might have interesting layout, but just lack the
decoration and polish that would make them stand out. So I hope to be able to do this kind of automated tool which could
fix these maps.

The code would also help future work on map generator as I can use the same map code for it as well. The web and world
of JavaScript has changed quite a bit over the years making it much nicer to work with these things on the web platform
so I hope that I can keep up working on this more often than I've been in the past few years. Really looking forward to
spending more time on hobby side programming again after many many years doing it mostly professionally.
