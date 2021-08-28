# Map Block 4 & 5: object

Contents of block 5 determine what to do with the values of block 4.

## Abstraction of block 5

Value   | Operation
:-------|:---------
Variant | `value & 0x03`
Type    | `(value >> 2) & 0x03`
Info    | `(value >> 4)`

Notes:
- At the moment is not known why headquarters are marked in this map data as `0x80`.

### Object info

These are bitflags on how to deal with the object.

Bit | Mask | Meaning
:---|:-----|:-------
1   |`0x01`| Time limited object
2   |`0x02`| Burnt building
3   |`0x04`| Terrain object
4   |`0x08`| Object exists

Bit 3 is always set. The only exception is with headquarters / buildings.

### Object type

These values are for when object is not time limited or burnt.

Value | Description | Value
:-----|:------------|:--------
`0x00`| No object   | N/A
`0x01`| Tree        | Value is separatable to two values: which tree to display and which animation index it is at.
`0x02`| Decorative  | Value determines which object to display.
`0x03`| Granite     | Quantity from 1 to 7. Object is removed when quantity reaches 0.

This value essentially determines what to do with the value in block 4.

### Object variant

This value is useful for determining which kind of granite or tree to display. Unused in other cases.

Object type | Usable values
:-----------|:-------------
Tree        | 0, 1 and 2.
Decorative  | 0 only.
Granite     | 0 and 1.

There is room for expansion for a lot of more objects of these types. Technically the map format can support:
- Up to 16 trees. (9 is maximum used by Greenland texture).
- Up to 1024 different decorative objects. (Original game uses only 50 or so.)
- Up to 128 granites; or alternatively much longer lasting granites. (Original game use only 2.)

## Decorative objects

See http://settlers2.net/documentation/objects-landscape-table/ for details.

## Granite

There are only two types of granite; other types are technically usable, but invisible in the game.

Block 4 value works as quantity and it must be from 1 to 7. You can also use bigger values, but those are bitmasked out by the original game.

## Trees

Variant value can be combined with value from the object value map data block:

Data  | Operation
:-----|:---------
ID    | `(ObjectVariant << 2) & (Block4Value >> 6)`
IsCut | `(Block4Value >> 3) & 0x01`
Size  | `(Block4Value >> 4) & 0x03`
Step  | `Block4Value & 0x07`

Step simply tells which animation variant to display; it shrinks over time.

This will result into following tree IDs:

ID    | Greenland  | Wasteland  | Winter World   | Future RttR expansion?
:-----|:-----------|:-----------|:---------------|:----------------------
`0x00`| Pine       | Spider     | Pine (snow)    | Pine
`0x01`| Birch      | Marley     | Birch (snow)   | Birch
`0x02`| Oak        | Spider     | Fir (snow)     | Oak
`0x03`| Palm #1    | Marley     | Palm #1        | Palm #1
`0x04`| Palm #2    | Spider     | Palm #2        | Palm #2
`0x05`| Pine Apple | Pine Apple | Pine Apple     | Pine Apple
`0x06`| Cypress    | Spider     | Cypress (snow) | Cypress
`0x07`| Cherry     | Cherry     | Fir (snow)     | Cherry
`0x08`| Fir        | Marley     | Fir (snow)     | Fir
`0x09`| Glitched #1| Glitched #1| Glitched #1    | Spider
`0x0A`| Glitched #2| Glitched #2| Glitched #2    | Marley
`0x0B`| Glitched #3| Glitched #3| Glitched #3    | Pine (snow)
`0x0C`| Glitched #4| Glitched #4| Glitched #4    | Birch (snow)
`0x0D`| Glitched #5| Glitched #5| Glitched #5    | Fir (snow)
`0x0E`| Glitched #6| Glitched #6| Glitched #6    | Cypress (snow)
`0x0F`| Glitched #7| Glitched #7| Glitched #7    | -

The sizes for a tree are:

Value | Size
:-----|:-------
`0x00`| Tiny
`0x01`| Small
`0x02`| Medium
`0x03`| Full grown

However is IsCut is set then the above works in reverse for a tree falling to the ground where 3 is a tree that lays on the ground. IsCut is only meant to be used internally in game as it will result to tree trunks that cannot be removed.

## Time limited objects and burnt buildings

These values are meant for game internal use only; using them on maps will simply result in objects that are eventually removed from the play field as time goes on. Removal happens by reducing the value in block 4 until it reaches 0.

See http://settlers2.net/documentation/objects/ for details.
