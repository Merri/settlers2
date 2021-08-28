# Map Block 7: unknown

- Unused in map files; used in savegames.
- In `WORLD###.DAT` files this is filled with `0xFF`.
- In WLD/SWD files this is filled with `0x00`.
- Attempting to load a map with any `0xFF` in this block with Map Editor will crash the editor.
