# Map Block 13: areas

In this block each node is ranked to specific index based on what area it is.

- Indexes `0x00` to `0xF9` are referenced from map file header (or `CONTI###.DAT`) and are either land or water areas.
- Value `0xFE` is reserved for impassable areas such as snow, lava and swamps.
- Impassable areas are not referenced from elsewhere.

Node impassability is determined by textures surrounding a node. If any of the six surrounding textures of a node is ranked as impassable type then the node is impassable.

A node is a water node if all surrounding textures are water. In any other case the node is a land node.
