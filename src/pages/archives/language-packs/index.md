---
title: "Language Packs"
publishDate: "2011-06-25"
layout: '$layouts/BlogPost.astro'
disqusIdentifier: 2
---

The new Gold Edition release in GOG.com is English only, which effectively means there is a need for localized versions. These self extracting downloads help you meet this need. See installation instructions below.

- [English V1.51](/downloads/language/s2eng151.exe)
- [Deutsch V1.51](/wp-content/uploads/2011/06/S2GER151.zip)
- [Deutsch V1.52 "unofficial patch"](/downloads/language/s2ger152.exe) (note: does not have everything, you need V1.51 first)
- [Français V1.02](/downloads/language/s2fre102.exe) (works in V1.51, map editor untranslated)
- [Suomi V1.00](/downloads/language/s2fin100.exe) ([lisätietoja suomennoksesta](https://vesa.piittinen.name/suomeksi))

I'm always open for more translations and improvements to the existing ones. Contact me for further information, my Gmail account is vesa.piittinen or you can go to GOG.com Settlers forum and post in a thread there.

### Installation

I recommend first to make a backup copy of the whole DATA folder just in case something goes wrong. You can find this folder in `C:\BLUEBYTE\SETTLER2\`, `C:\GOG Games\Settlers 2 GOLD\`, `C:\Program Files\GOG.com\Settlers 2 GOLD\`, or whichever path you have installed the game into.

Once you have made a copy of the DATA folder you can extract the contents of the downloaded archive. Execute the download, browse to the DATA folder and extract files there.

### Creating language packs

To **translate the game to your language** you need to be aware of a few things. First of all the text files in the game are in two formats: plain text files and in game's own proprietary string format. Plain text files are easy enough to edit, but there is a catch: you **must use [IBM Code page 437](https://en.wikipedia.org/wiki/Code_page_437)** (or possibly [CP850](https://en.wikipedia.org/wiki/Code_page_850) or [CP852](https://en.wikipedia.org/wiki/Code_page_852), I have to recheck this detail again). This is a **character set** that tells which value represents which character. This means writing non-English alphabet characters such as ÜÅÄÖ will display incorrectly in the game if the character set is not correct. Also, CP437 is very limited on which characters it supports as can be seen from the linked Wikipedia page.

The easily editable plain text files are located in directories:

- `DATA\ONLINE`
- `DATA\TXT2`

The proprietary format string files are located in directories:

- `DATA\TXT`
- `DATA\TXT3`

To make things easier there is a TextEditor tool made by The Settlers II.5 Return to the Roots team. The tool converts `*.ENG` (and `*.GER`) files to XML format, converting characters from CP437 to UTF-8 (Unicode). This means editing the file is much easier as Unicode is widely supported these days. XML files are easy to edit in text editors and even easier in XML editors.

The tool itself requires launching a command prompt, but I've made things a little bit easier and have made a ready-to-go package to get you started. It includes two executable batch files: `eng_to_xml.bat` and `xml_to_eng.bat`. You only launch a batch file and all the files are converted. The file also includes both English XML & ENG files, so it is very easy to get started!

1. Download #1: [TextEditor](/downloads/tools/TextEditor.zip "TextEditor")
2. Download #2: [Ingame Strings Editor](/downloads/tools/instr212_2009-05-24.zip)
