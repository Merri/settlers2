---
seriesTitle: 'The Settlers II Game Guide'
title: 'Road and waterway construction tips'
description: This guide helps you to build better roads and waterways in The Settlers 2 or Return to the Roots.
pubDate: 2023-02-19
layout: '$layouts/BlogEnglish.astro'
---

In it's core The Settlers II is a resource management game. This makes logistics an important aspect of the game. On this page you can find a few tips to make your road network more efficient and find out causes for issues that you may have noticed.

**Table of contents**

-   [Efficient use of building space](#efficient-use-of-building-space)
-   [Shortest roads](#shortest-roads)
-   [Double roads](#double-roads)
-   [Three node roads](#three-node-roads)
-   [Effective use of waterways](#effective-use-of-waterways)
-   [Importance of storehouses](#importance-of-storehouses)
-   [Solving transportation jams](#solving-transportation-jams)
-   [Transportation priorities](#transportation-priorities)

## Road strategies

An interesting thing to note about the road and flagpole system of the game is that the length of the road is not enforced. This means that a piece of road could technically be very, very long. However since carriers only move stuff between flag poles and there is only one carrier (and a donkey) for each of these sections it would be inefficient to make a long road with no flag poles to split it.

### Efficient use of building space

Roads can be built in three directions. And there is one direction that is the least optimal for use of building space: from bottom right to top left. That is the same direction that every building uses to connect to a flag pole.

The reason for ineffectiveness is that a road built in this alignment will prevent a lot of buildings to be built! This information leads us to a secret sauce to make maximum use of space: a grid of horizontal roads mixed with bottom left to top right roads.

### Shortest roads

The shortest distance you can have between two flag poles is two nodes. Enforcing this as the only length can often be the most efficient way to build your road network as it makes every carrier walk the same distance and have the equal distance to each flag pole when waiting for more goods to carry.

The downside of going for this pattern is the work and discipline required to maintain the system throughout a game. Especially on multiplayer it can often get to a point where speed of construction and number of actions given is more important than keeping a strict system.

Another downside in this system is that you need more resources to maintain it: eventually you need donkeys and

### Double roads

This technique is good for your busiest intersections, especially connections to headquarters and storehouses. The gist is to connect two flag poles with two roads instead of having only one.

What makes double roads beneficial for headquarters? There are two reasons for this:

1. When carrier delivers stuff to HQ they walk all the way in.
2. When stuff comes from HQ it is laid in front of the building.

The first reason means that carriers working near HQ not only do more work than other carriers, they will also take a longer time doing it!

The second is important to note as it means HQ flag pole can hit it's item limit if there is not enough carrier throughput to take the stuff away. It is also important to notice that you should make sure there are routes that bypass HQ's flag pole so that you are not in danger of creating a transport jam right in front of your HQ.

### Three node roads

Another common road length is to have your carriers travel a distance of three nodes instead of only two. There is a benefit to this system: you need less donkeys and goods spend a bit more more of their time being carried instead of waiting on a flag pole. The longer a piece of road between flag poles gets the faster a single item can be carried over.

The downside of a longer road, however, is the reduced throughput: less items get carried for the cost of a less interrupted travel. But you can compensate this with double roads.

### Effective use of waterways

Waterways are mostly similar to roads: usually the shorter they are the better they are. However each waterway can only contain one carrier with a boat and this is a very limiting factor! This means you should always prefer making double routes between flag poles, and the more crucial the route is the more you should compensate the missing throughput due to lack of donkey assist.

In case you are moving stuff over a wide river it also makes sense to have multiple crossings. The tricky part might be ensuring that most or all of the stuff don't use just a single crossing point: sometimes the shortest route might not be the best one, and to balance the use of waterways you may need to move your roads to make the stuff via a longer route so that the distance of the further away waterways becomes relatively equal to the waterway that would otherwise have the shortest route.

Luckily it is rather rare that you need to consider waterways this much!

### Importance of storehouses

One thing that is rather easy to ignore (or forget about) is to build storehouses. There are a couple of reasons why storehouses exist:

-   They reduce the average distance goods need to travel to storage
-   They provide a closer access point for your workers and soldiers
-   They reduce the logistics pressure on roads that lead to your HQ

Effective use of storehouses mostly comes through experience of playing the game as things such as map's layout can have a major effect on where a storehouse is ideal to place. The way you place your buildings and roads also have an effect on where a storehouse should go. Your overall strategy on what you want to achieve, and within what timeframe, will also decide whether a storehouse has a good or a mediocre placement.

In general: the faster you need to spread into a specific direction the faster you need to have a storehouse, an accompanying sawmill, and ideally a stonemason or a granite mine to provide it with faster access to construction resources.

### Solving transportation jams

Every player is likely to experience this at some point: stuff piles up on flag poles, carriers are standing with stuff on their back, and eventually the whole transportation network comes to a halt. Nothing is built, nothing moves, nothing seems to help!

What makes this happen? As it usually is there can be many reasons. One of the easiest ways to make this happen is to have **a single main route through your lands**. Making this happen might make sense to you, you might like the idea that "this is the main route, everything goes through here". But this is also disastrous from the perspective of logistics! Imagine if everyone had a car and they tried to drive through a city. It just doesn't work!

To solve the previously mentioned issue you need to consider your road network more like a true network: it makes sense to have multiple options for the goods to move along. A feature that makes your life slightly harder for you is that goods never consider how busy a specific route is and they are always moved using the shortest route, even if taking the longer way around would be faster than pushing the heavy traffic route with even more pressure. So eventually the only way you can control the issue is to create focused local industries where possible.

Another cause for jams is to force all the stuff pass through a HQ or a storehouse. These buildings are special in that they store all kinds of stuff, and if you suddenly have a request to take lots of stuff out of storage all at once the flag pole is strained with workers moving stuff quickly out of HQ, while your other carriers get busy moving them away.

The main problem with having your main route through HQ flag pole becomes obvious: all the other stuff is passing through that flag pole as well! So when suddenly HQ starts pushing out a lot of stuff and you already have the carriers busy with other stuff you may suddenly find the flag pole maxing out and a jam is ready.

The way out of this issue is to make sure you either have very robust double road system to carry stuff quickly, or to make sure your main transportation route does not go through the HQ. Ideally you can do both.

### Transportation priorities

There is one more system that can have notable effect on how your goods move around the map: transport priorities!

<img alt="Transport priorities" src="/assets/guides/transport-priorities.png" height="333" width="166" loading="lazy" />

The default settings place military needs above all else, so you will see gold, weapons and beer taking the top spots in importance. The priority means that if a flag pole has a gold coin then it will be picked first for transportation. And if there are multiple gold coins then those coins will keep getting chosen first until none remain. Only then the next item found on priority list will be chosen to be moved away from the flag pole.

Usually the defailt settings are sane and work for you. However on special occasions such as when you've noticed a possible jam starting to happen it can make sense to change the priorities. Also, sometimes you may end up in a state where you're producing too much of a single resource and it can make sense try to reduce it's importance of further production by limiting the raw resources that are needed to produce it.

## Summary

1. Always have multiple routes for goods to take, avoid having one main route
2. Decentralize: assist HQ with storehouses, create multiple specialized regions around the map
3. Keep storehouses a step or two away from the main transportation routes
4. Create ring roads around your bordering areas, not only roads that lead directly to your HQ
5. Check and adjust your transportation priorities

Did you find this useful? Do you have more details to add? Still need more help? Visit [RttR discord](https://discord.gg/kyTQsSx) or [RttR forums](https://www.rttr.info/)!

<!---

## Creative ideas

Not everything has to be that effective, so here are some alternative things to try out!

### Mega storehouse

![Mega storehouse](/assets/guides/mega-storehouse-1.png)

This road pattern consumes a lot of space initially. The idea is to have two storehouses right next to each other to balance out strain on the roads close to a storehouse. Looking from outside the road pattern there are three entrances: two on the sides, and one direct access to the bottom storehouse.

Ideally this placement pattern should balance out resource transportation between the two storehouses while also providing an option to strain the bottom storehouse more from the south entrance.

Likely this idea doesn't work all that well in practise and you at least have to select what is stored in each of the storehouses. -->

---

**Next page:** [Stock management](/guides/stock)

[Back to Game guides](/guides)
