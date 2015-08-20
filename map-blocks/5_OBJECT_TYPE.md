# Map Block 5: object type

Value | Operation
:-----|:---------
Set   | `value & 0x03`
ID    | `(value >> 2) & 0x03`
Info  | `(value >> 6) & 0x03`

## Object Info

Value | Description
:-----|:-----------
`0x01`| Unused value
`0x02`| Headquarters exists on this position
`0x03`| Object exists

## Object ID

Value | Description
:-----|:-----------
`0x01`| Tree object
`0x02`| Landscape object
`0x03`| Granite

## Object Set

Object ID | Usable set values
:---------|:-----------------
Tree      | 0, 1 and 2.
Landscape | 0 only.
Granite   | 0 and 1.

