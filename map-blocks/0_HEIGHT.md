# Map Block 0: height map

Contains the height map. The original map editor uses range of values from `0x00` to `0x3C` (60).

**Base level** (default height) value depends on age of file. Maps made before Mission CD have a base level of 0. Upon release of Mission CD the base level was upgraded to `0x28` (40). Map Editor uses base level of `0x0A` (10).

There are some graphical glitches in the game if height is roughly above `0x32` (50). For this reason it is recommended that all tools limit the range of values between 0 and `0x32`.

Maximum **height difference** in original and Map Editor maps is limited to 5. Game can render bigger differences, however there can be visual glitches and things like building a road to a too big height difference area can cause the game to crash. Too big height difference also makes it impossible to see behind things, which is why it is highly recommended the maximum height difference of 5 between nodes is implemented in map tools.
