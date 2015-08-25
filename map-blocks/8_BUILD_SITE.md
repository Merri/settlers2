# Map Block 8: build sites

Active bits | Value | Description
:-----------|:------|:-----------
`00000001`  |`0x01` | Flag pole
`00000010`  |`0x02` | Hut
`00000011`  |`0x03` | House
`00000100`  |`0x04` | Castle
`00000101`  |`0x05` | Mine
`00001000`  |`0x08` | "Impassable or near impassable"
`00111000`  |`0x68` | Tree
`01111000`  |`0x78` | Impassable

Bit `0x08` is probably some sort of game's internal book keeping bitflag. It only exists on or around specific textures or on and near granite.

## Triggers of bit `0x08`

Any of these textures around the node:

ID     | Greenland texture name
:------|:----------------------
`0x01` | Mountain #1
`0x02` | Snow
`0x03` | Swamp
`0x04` | Desert
`0x05` | Water
`0x06` | Water you can build on (this needs to be verified)
`0x07` | Partially glitchy desert
`0x0B` | Mountain #2
`0x0C` | Mountain #3
`0x0D` | Mountain #4
`0x10` | Lava
`0x11` | Stretched pixel
`0x12` | Mountain meadow
`0x13` | Water like lava/snow
`0x14` | Unused low resolution lava-like #1
`0x15` | Unused low resolution lava-like #2
`0x16` | Unused low resolution lava-like #3
`0x22` | Mountain you can build on (this needs to be verified)

Or any of these rules:

- Any texture around node in bottom right is snow (`0x02`), lava (`0x10`) or `0x19`
- Granite on or around the node

The two rules above also force flag pole to be the best thing that can be built on the node.

## Calculating building sites

The following logic will result in almost the exact same results as The Settlers II. There are only a few edge cases on a few existing maps where the result is different.

1. Any texture around node is snow (`0x02`), lava (`0x10`) or `0x13` - `0x16`: impassable `0x78`
2. Every texture around node is swamp (`0x03`) or water (`0x05`): impassable `0x78`
3. Node has granite object: impassable `0x78`
4. Node has tree object: tree `0x68`
5. Every texture around node is mountain (`0x01`, `0x0B` - `0x0D`)&hellip;<br />
and height in bottom right node isn't greater than 3: mine `0x0D`
6. Any texture around node is swamp (`0x03`), water (`0x05`), desert (`0x04` or `0x07`) or `0x11`: flag `0x09`
7. Node's neighbor has granite object: flag `0x09`
8. TODO
