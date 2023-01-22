---
title: 'A new map generator'
publishDate: '2023-01-22'
layout: '$layouts/BlogPost.astro'
---

For over a month now I've been working on creating a new map generator, and I'm
happy to let you know that it is now ready for daily use!

The map generator provides a lot of options on how to generate your maps. This
means the generator isn't immediately the easiest to learn and use, but I've
tried to make things clear!

There are also more features still to be done, and the generator code has some
features that have not yet been exposed.

### Built on seeds

[The old map generator](/map-generator/legacy) had an issue that it was built
to be entirely random all the time. This made debugging end results harder and
you'd never really know what you would get. A seed value was added into it as
an afterthought so it never really worked that well to fix the issue.

[The new map generator](/map-generator) is consistent: same seed and same
options provide the same result each time. As an example of the benefits of
this approach you can now share the map URLs with your friends!

### Support any known texture set

As I've worked on creating alternate texture sets I noticed that there is one
big problem: there is no tooling that would support these different textures.
This is a problem because you don't always get visually pleasant results when
you're playing say, a Wasteland map with Rusty Valley texture.

In the future the new generator will fully support creating map optimized for
a particular texture set **and** will allow you to customize the texturization
process so you get the kind of map you want!

### Information to help you know if the map is fine

As the map generator provides a variety of possibilities it becomes quite
important that you can tell if the map is playable. For this reason you can
see information on number of mine sites, castle sites, well sites, and mining
resources.

The generator has also been split to show five preview images of the final
map, each customized to provide information that is relevant to each step of
the process of deciding if the map is worthy.

### Feedback?

I'm active on [Return to the Roots Discord](https://discord.gg/kyTQsSx) on
their #settlers2 channel. You can find me posting about latest changes
which currently happen on a nearly daily basis, occasionally multiple times
each day.

The map generator is still much under construction: there are things that I'm
not happy with, some stuff is incomplete "almost there", and there are more
features to be done. Some notable things to add are balanced multiplayer maps,
balancing resources in the unbalanced maps, balancing player placement, allow
for entirely custom player placement, making sure players are not too close to
each other, making sure players can reach each other... the list goes on and
on! I've even though about adding Widelands support to increase the user base.
