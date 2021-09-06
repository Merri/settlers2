---
title: "Graphics files (LBM)"
publishDate: "2011-06-25"
layout: '$layouts/BlogPost.astro'
disqusIdentifier: 13
---

The game uses LBM files which originate from Amiga's Deluxe Paint. These images are used for full screen graphics such as title and loading screens. The problem with the files of The Settlers II is that they're uncompressed PBM variant, which happens to be a very rare format in the PC world. To give an example, Paint Shop Pro has long been able to both read & write LBM files, but the files it produces by default are compressed and use the ILBM variant of LBM files. You can turn off the compression, but the files are ILBM and make them unusable in The Settlers II.

Luckily there is a solution to this problem: an old graphics conversion program called Graphic Workshop 1.1Y. This program is able to save the files in Settlers II compatible format, but the settings must be changed before this is possible. Like other programs, it also defaults to compression as well as using the ILBM variant.

![Graphic Workshop 1.1Y toolbar](/modding/graphic_workshop_11y_toolbar.png)

After installing the program you can see a toolbar in the top of the program window. You can see a green wrench there (eight icon from the right), click it to open options:

![The Settlers II compatible LBM settings](/modding/graphic_workshop_11y_lbm.png)

As you can see, I have highlighted the correct options: untick "Compress IFF/LBM/PSD files" and tick "LBM files w/ PBM packing". After pressing OK you can now convert any 256 color image you like to The Settlers II compatible format. To do this you can simply move to a folder of you choosing (third icon from right in the toolbar), highlight a file by clicking it and then hitting the first button in the toolbar (Convert between file formats). A window opens and you can select a format you want.

**Windows 10/7/Vista**: Run the downloaded executable as Administrator.

> [**Download Graphics Workshop 95 1.1Y**](/wp-content/uploads/2011/06/gwsw95.exe) (32-bit)<br />Works on **32-bit & 64-bit** Windows 10, 7, Vista and XP.
>
> [**Download Graphic Workshop 1.1Y**](/modding/gwswin11.exe) (16-bit)<br />Works on **32-bit** Windows 7, Vista and XP.<br />Does **NOT** work on **64-bit** Windows!

### More graphics tools

If you are interested on nice old graphics programs, try [Paint Shop Pro 4.12](https://piittinen.name/files/psp412.exe) & [Paint Shop Pro 7.04](https://piittinen.name/files/psp704.exe) out. I still use the latter one, you can make it work forever simply by opening a file. The 4.12 version works forever with no special tricks even after hitting the 60 day limit. Also, [IrfanView](https://www.irfanview.com/) is able to create very good 256 color palettes as well as dither existing palettes very well. You can find palette files bundled with Map Generator.

## LBM File Format

In Settlers II LBM files are used for full screen graphics, such as title images and loading screens. LBM bitmap file is actually in Amiga IFF general purpose container format, developed for Commodore Business Machines by Electronic Arts in 1985. Most LBM files available are of ILBM type as this is a native format for Amiga. LBM format supports compression, most images you can find are compressed. The Settlers II uses LBM files that are of PBM type and are also uncompressed. This type was mostly used by Deluxe Paint for DOS and very few applications support writing it, although many modern day graphics programs do support reading it.

C++ source code for reading and writing The Settlers II LBM files can be found at [Return to the Roots SVN](https://svn.siedler25.org/wsvn/siedler15/libsiedler2/trunk/src/) user = gast, password = gast. The source code is licensed in GNU GPL2.

The SVN is no longer in active use since December 2010, but here are backups:

- [siedler15-libendian-trunk.r7178.tar](/wp-content/uploads/2011/07/siedler15-libendian-trunk.r7178.tar.gz)
- [siedler15-libsiedler2-trunk.r7294.tar](/wp-content/uploads/2011/07/siedler15-libsiedler2-trunk.r7294.tar.gz)

Also note that the [BBM page contains ILBM documentation](/documentation/bbm-file-format/ "BBM File Format")!
