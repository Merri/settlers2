# Map block 11: resources

Value           | Resource
---------------:|:-------
`0x21`          | Water
`0x40` … `0x47` | Coal
`0x48` … `0x4F` | Iron ore
`0x50` … `0x57` | Gold
`0x58` … `0x5F` | Granite
`0x80` … `0x87` | Fish (`0x87` is what should only be used by map tools)

- Water is always preserved.
- Fish is consumed immediately.
- Mining resources are consumed until they reach their lowest value, at which point they can no longer be mined.

Essentially these values can be split to two:

Value    | Operation
:--------|:---------
Quantity | `Value & 0x07`
ID       | `Value >>> 3`

ID    | Resource
:-----|:---
`0x00`| -
`0x01`| -
`0x02`| -
`0x03`| -
`0x04`| Water
`0x05`| -
`0x06`| -
`0x07`| -
`0x08`| Coal
`0x09`| Iron ore
`0x0A`| Gold
`0x0B`| Granite
`0x0C`| -
`0x0D`| -
`0x0E`| -
`0x0F`| -
`0x10`| Fish
`0x11`| -
`0x12`| -
`0x13`| -
`0x14`| -
`0x15`| -
`0x16`| -
`0x17`| -
`0x18`| -
`0x19`| -
`0x1A`| -
`0x1B`| -
`0x1C`| -
`0x1D`| -
`0x1E`| -
`0x1F`| -

That is a lot of unused resource IDs unless there are hidden resources to be found in savegame files.
