---
title: "DOSBox"
publishDate: "2011-07-14"
layout: '$layouts/BlogPost.astro'
---

This page is for those adventurous persons who wish to setup The Settlers II by themselves without paying for [GOG.com's version](https://www.gog.com/game/the_settlers_2_gold_edition) (which runs the game via preconfigured DOSBox). In this case you already own the game on a CD and are not willing to pay again, or maybe you wish to try out a demo version before rushing things and buying a copy from GOG.com.

DOSBox requires a few steps to get a game running:

1. You need to [download & install DOSBox](https://www.dosbox.com/download.php?main=1)
2. Run DOSBox & mount a drive
3. Now you can access the game files and start the game

Note that DOSBox running on Windows 7 and Vista may have issues with CD-ROM access. In that case you can create an image out of your game CD using tools such as [ImgBurn](https://www.imgburn.com/).

## Step-by-step with images

Once you have installed DOSBox and are running it you may wonder what to do. So here is how I got the original The Settlers II demo version 1.02] running on my computer.

[![Mounting a directory as a drive in DOSBox](/wp-content/uploads/2011/07/DOSBox_Mount.png "DOSBox_Mount")](/wp-content/uploads/2011/07/DOSBox_Mount.png)

The first step is to mount a real local directory to your DOS games directory. I have mine located at `C:\Games\DOS` so that is what I mount as my drive C in DOSBox. The syntax is simple:

`Mount C C:\RealPathOfYourDOSGames`

Then you can move to the newly mounted drive C by typing `C:`, and then move to the directory where you have your version of Settlers II.

[![Running The Settlers 2 setup](/wp-content/uploads/2011/07/DOSBox_Setup.png "DOSBox_Setup")](/wp-content/uploads/2011/07/DOSBox_Setup.png)

I have multiple versions of The Settlers II installed, so that is why I have both Settler2 and SET2DEMO directories. Anyway, the first thing to do is to **run setup**. This lets you setup **music and sound**.

[![Setting up MIDI for music](/wp-content/uploads/2011/07/DOSBox_Setup_MIDI.png "DOSBox_Setup_MIDI")](/wp-content/uploads/2011/07/DOSBox_Setup_MIDI.png)

You don't really need to do much here, just first go to select MIDI for music and make sure you select **Creative Labs Sound Blaster or 100% compatible**. This same selection also works for setting up digital sound.

Once the setup is complete you can exit and quit the graphical setup screen, you're told to enjoy the game (which you will!) and then you can simply launch the game by writing **S2**.

[![Ready to launch The Setters II demo version](/wp-content/uploads/2011/07/DOSBox_S2.png "DOSBox_S2")](/wp-content/uploads/2011/07/DOSBox_S2.png)

And you should soon be greeted with the game's title screen:

[![The Settlers II: Veni Vidi Vici](/wp-content/uploads/2011/07/DOSBox_S2_Title.png "DOSBox_S2_Title")](/wp-content/uploads/2011/07/DOSBox_S2_Title.png)

For me the game ran perfectly fine with the default DOSBox settings, so I didn't need to change anything. For a more complete tutorial to get DOSBox running you can reference [Basic Setup and Installation](https://www.dosbox.com/wiki/Basic_Setup_and_Installation_of_DosBox) page at DOSBox wiki. Happy gaming!
