---
title: 'The problems of data and performance'
description: Issues with existing web standards not being performant enough.
pubDate: 2012-08-16
layout: '$layouts/BlogEnglish.astro'
tags:
    - news
    - tools
---

In my current effort of understanding the performance issues with Online Editor's PNG implementation I've noticed that there aren't many good solutions available as far as it goes to transferring a single big chunk of data that is an entire file. Using PNG image as a data container doesn't work as well as I wanted to thanks to PHP side being too slow in rearranging data back to the order it is supposed to be. Also some of the data lengths become quite long when sending base64 encoded data via JavaScript, even if it a compressed PNG image. This approach just has too many elements that fail on me right now, especially with big maps that I personally tend to like the most.

So this put me back into research mode and I noticed Mozilla's FileReader documentation and it would simplify things a great deal: I no longer would have to have a separate "upload" phase to allow map editing to be possible. Instead I could just let users select a few maps, have an instant display and analysis and only after that go for any upload requirement. Also thanks to Mozilla's pages I now know that browser support is good enough to go with these new "HTML5" technologies. The biggest issue going with this is that I need to rethink a lot of things again. Like, the component that I initially used for file upload will be of no use. Instead of sending a big chunk of data I should send multiple smaller chunks, validate them on server side and then construct the final file. Even this way some Return to the Roots 1024 x 1024 map files may cause problems and I need to implement some form of compression.

The question at this point is: is it worth the time to redesign again?
