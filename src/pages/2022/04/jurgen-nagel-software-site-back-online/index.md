---
title: 'Jürgen Nagel Software site back online'
publishDate: '2022-04-09'
layout: '$layouts/BlogPost.astro'
---

Thanks to community member The Archivist's efforts Jürgen Nagel has brought back their German site, [Software fur Siedler2-MissionCD](http://www.jnsoftware.de/Siedler2/home.htm). The site contains a lot of Settlers II related utilities, graphic changes and maps to play, some which have notable customizations such as the Great Wall of China (see `g_mauer.zip`).

<img alt="The Great Wall" src="/assets/2022-04-09_The_Great_Wall.png" width="1024" height="768" />

If interested on other recent happenings on the world of The Settlers II feel welcome to join our chat at [Return to the Roots Discord](https://discord.gg/kyTQsSx)!


### A new text tool available!

Our another story today is that the game comes with some string files that are not regular text files. While you **can** open some ENG/GER files in the `DATA\TXT` directory in a regular text editor (which ideally supports viewing as DOS Code Page 437), there are other files that contain binary information.

While there are existing tooling available for localization such as Ingame String Editor and an XML converter, these are not always perfect or ideal. For this reason you can now find <a href="https://codesandbox-astro-solidjs-playground-dwgql6gwv-merri.vercel.app/settlers2Text">The Settlers II Text Editor</a>! It can load all existing ENG/GER files, and save them again in working order supported by the original game. You can also use it for creation of new files, such as files for your own missions. The tool also works as a translation tool as it will display the original unchanged strings alongside the changed ones.
