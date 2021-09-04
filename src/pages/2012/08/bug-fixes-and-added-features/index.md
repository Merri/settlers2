---
title: "Bug fixes and added features"
publishDate: "2012-08-15"
layout: '$layouts/BlogPost.astro'
categories: 
  - "site-news"
  - "tools"
---

Online Editor has been updated. Updates since yesterday:

- Fixed: mining resources disappeared "randomly" due to incorrect Y-location in the resource validation routine.
- New: height randomizer has been updated to provide much richer options (gentle, medium, strong and dangerous).
- Performance of some of the routines has been improved at the cost of more memory consumption (max. 4 MB more).
- Editor's user interface is now prettier.
- Debug feature: you can now see the raw map data as an image.

Issues found since Sunday:

- Downloading a huge map doesn't work. This is a server side / PHP issue, the PHP code needs to be improved for memory efficiency.
- Downloaded file doesn't no longer gets decompressed by browser automagically. The file remains GZIP compressed after file transfer. This shouldn't happen.
- Setting player's leader in the editor doesn't change the leader (note: this change would be only visible if the map is loaded as a World Campaign mission).
