---
title: 'To validate or not to validate'
description: Guaranteeing quality is slow.
pubDate: 2012-09-04
layout: '$layouts/BlogEnglish.astro'
tags:
    - news
---

I'm in the process of writing map uploading code. You might wonder why this is a slow process, but I have a very good reason: I write a lot of validation code. Why? Because I want to make absolutely sure nobody even wants to try to abuse the Map Database service. This means making the life of a spammer as hard as possible and to make things so solid that it isn't easy to break through by code injection of any kind.

The downside is that coding is very slow. I'm also not the fastest programmer out there, but I think I write pretty solid code. And I'm not even employed as a developer, far from it!

There is also this thing called duplicate uploads. I don't want those. So I'm writing my code in a way that there will be no two maps of the same kind, but I also have to make sure I don't use too much processing power to do so. PHP isn't the fastest language to work with so looping through all map data is out of the question. Just simply can't do that. I think.

However I'm also planning on allowing revisions so that it is possible to provide a slightly changed version of an existing map. In this case both maps will have the same Map ID. This is a special ID in that it is DOS83 compatible, giving easy way to have a unique DOS filename for all the maps. I'm not forcing it though, merely it is an option when downloading a map.
