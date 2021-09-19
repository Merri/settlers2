this.AREA = {
	UNUSED: 0,
	LAND: 1,
	WATER: 2,
	IMPASSABLE: 254
};

this.OBJECT_TYPE = {
	TREE: 0xC4,
	GRANITE: 0xCC,
	MATCH: 0xFC
};

this.RESOURCE = {
	FRESH_WATER: 0x21,
	COAL: 0x40, // 0x40 - 0x47
	IRON_ORE: 0x48, // 0x48 - 0x4F
	GOLD: 0x50, // 0x50 - 0x57
	GRANITE: 0x58, // 0x58 - 0x5F
	FISH: 0x87
};

this.SITE = {
	FLAG: 0x01,
	HUT: 0x02,
	HOUSE: 0x03,
	CASTLE: 0x04,
	MINE: 0x05,
	OCCUPIED: 0x08,
	FLAG_OCCUPIED: 0x09,
	HUT_OCCUPIED: 0x0A,
	CASTLE_OCCUPIED: 0x0C,
	MINE_OCCUPIED: 0x0D,
	TREE: 0x68,
	IMPASSABLE: 0x78
};

this.TERRAIN = {
	GREENLAND: 0,
	WASTELAND: 1,
	WINTERWORLD: 2
};

this.TEXTURE = {
	SUPPORT_S2: 0x01,	// texture is usable in The Settlers II
	SUPPORT_RTTR: 0x02,	// texture is usable in Return to the Roots
	ARABLE: 0x04,		// you can expect farm fields to grow here
	HABITABLE: 0x08,	// you can build buildings here
	ARID: 0x10,			// it's too hard to build anything here, but you can make roads
	ROCK: 0x20,			// mines be here
	WET: 0x40,			// swamp and water
	EXTREME: 0x80,		// snow and lava
	IMPASSABLE: 0xC0,	// bitflag for matching WET and EXTREME for all areas that not usable for the player

	// for actual texture ID matching
	TO_ID_VALUE: 0x3F,	// bitflag for removing two highest bits that are used for bitflags!
	HARBOR: 0x40,		// this is the other bitflag for the two highest bits
	UNKNOWN: 0x80,		// we do not know the meaning of this bitflag; only exists on one or two BlueByte maps
	DROP_SUPPORT: 0xFC	// to get rid of support flags
};

this.textureInfo = {
	0: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE},
	1: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK},
	2: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.EXTREME},
	3: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.WET},
	4: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARID},
	5: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.WET},
	6: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.HABITABLE},
	7: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARID},
	8: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE},
	9: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE},
	10: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE},
	11: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK},
	12: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK},
	13: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK},
	14: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE},
	15: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE},
	16: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.EXTREME},
	17: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.ARID},
	18: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.HABITABLE},
	19: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME},
	20: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME},
	21: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME},
	22: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME},
	34: {flag: TEXTURE.SUPPORT_S2 | TEXTURE.HABITABLE}
}

function Map() {
	// internal constants
	var MAX_ELEVATION = 5,
		MAX_HEIGHT = 60,
		// bitflags for marking touch level
		TOUCH_MARKED = 0x01,
		TOUCH_FROM_RIGHT = 0x02,
		TOUCH_FROM_LEFT = 0x04,
		TOUCH_FROM_BOTTOM_RIGHT = 0x08,
		TOUCH_FROM_TOP_LEFT = 0x10,
		TOUCH_FROM_BOTTOM_LEFT = 0x20,
		TOUCH_FROM_TOP_RIGHT = 0x40;

	var lastTextureIndex,
		lastTextureTopLeft,
		lastTextureTop,
		lastTextureTopRight,
		lastTextureBottomLeft,
		lastTextureBottom,
		lastTextureBottomRight,
		cache32bit;

	this.width = 0;
	this.height = 0;
	this.size = 0;
	this.title = '';
	this.author = '';
	this.terrain = 0;
	this.block = void 0;
	this.blockBuffer = void 0;
	this.blocks = {
		height: void 0,
		texture1: void 0,
		texture2: void 0,
		road: void 0,
		objIndex: void 0,
		objType: void 0,
		animal: void 0,
		unknown: void 0,
		buildSite: void 0,
		unknown7: void 0,
		unknown1: void 0, // used internally for touch bitflagging
		resource: void 0,
		lightmap: void 0,
		area: void 0
	};
	this.dirty = {};
	this.players = [];

	this.calculateAreas = function() {
		console.time('calculateAreas');

		var i,
			index = 0,
			areas = [],
			bitMask,
			current,
			nodes,
			mass,
			textures,
			total,
			touchBlock = this.size * 10,
			areaBlock = this.size * 13,
			EXTREME_AND_WET = TEXTURE.EXTREME | TEXTURE.WET;

		for(i = 0; i < this.size; i++) {
			if(this.block[touchBlock + i] === 0x00) {
				// see if it is water
				if(index < 250 && this.isEachTextureSame(i, 0x05)) {
					// so we start looping water
					this.block[areaBlock + i] = index;
					this.block[touchBlock + i] = 1;
					mass = 1;
					// add index and bitmask while also reseting a few variables
					cache32bit[current = total = 0] = (i << 6) | 0x3F;
					// this loop here is unoptimal, but does the job
					while(current <= total) {
						// bitmask for nodes to follow (small optimization: always three bits active, one for each direction)
						bitMask = cache32bit[current] & 0x3F;
						// get the nodes around
						nodes = this.getNodesByIndex((cache32bit[current++] & 0xFFFFFFC0) >> 6);
						// check points for matching land/water
						if((bitMask & 0x01) === 0x01 && this.block[touchBlock + nodes.left] === 0x00 && this.isEachTextureSame(nodes.left, 0x05)) {
							cache32bit[++total] = (nodes.left << 6) | 0x23;
							this.block[areaBlock + nodes.left] = index;
							this.block[touchBlock + nodes.left] = 1;
							mass++;
						}
						if((bitMask & 0x02) === 0x02 && this.block[touchBlock + nodes.topLeft] === 0x00 && this.isEachTextureSame(nodes.topLeft, 0x05)) {
							cache32bit[++total] = (nodes.topLeft << 6) | 0x07;
							this.block[areaBlock + nodes.topLeft] = index;
							this.block[touchBlock + nodes.topLeft] = 1;
							mass++;
						}
						if((bitMask & 0x04) === 0x04 && this.block[touchBlock + nodes.topRight] === 0x00 && this.isEachTextureSame(nodes.topRight, 0x05)) {
							cache32bit[++total] = (nodes.topRight << 6) | 0x0E;
							this.block[areaBlock + nodes.topRight] = index;
							this.block[touchBlock + nodes.topRight] = 1;
							mass++;
						}
						if((bitMask & 0x08) === 0x08 && this.block[touchBlock + nodes.right] === 0x00 && this.isEachTextureSame(nodes.right, 0x05)) {
							cache32bit[++total] = (nodes.right << 6) | 0x1C;
							this.block[areaBlock + nodes.right] = index;
							this.block[touchBlock + nodes.right] = 1;
							mass++;
						}
						if((bitMask & 0x10) === 0x10 && this.block[touchBlock + nodes.bottomRight] === 0x00 && this.isEachTextureSame(nodes.bottomRight, 0x05)) {
							cache32bit[++total] = (nodes.bottomRight << 6) | 0x38;
							this.block[areaBlock + nodes.bottomRight] = index;
							this.block[touchBlock + nodes.bottomRight] = 1;
							mass++;
						}
						if((bitMask & 0x20) === 0x20 && this.block[touchBlock + nodes.bottomLeft] === 0x00 && this.isEachTextureSame(nodes.bottomLeft, 0x05)) {
							cache32bit[++total] = (nodes.bottomLeft << 6) | 0x31;
							this.block[areaBlock + nodes.bottomLeft] = index;
							this.block[touchBlock + nodes.bottomLeft] = 1;
							mass++;
						}
					}
					areas[index] = {
						mass: mass,
						type: AREA.WATER,
						x: i % this.width,
						y: ~~((i - (i % this.width)) / this.width)
					};
					// next index
					index++;
				} else if(this.isEachTextureWithAnyOfFlags(i, EXTREME_AND_WET)) {
					this.block[areaBlock + i] = AREA.IMPASSABLE;
					this.block[touchBlock + i] = 1;
				} else if(index < 250) {
					// so we start looping land
					this.block[areaBlock + i] = index;
					this.block[touchBlock + i] = 1;
					mass = 1;
					// add index and bitmask while also reseting a few variables
					cache32bit[current = total = 0] = (i << 6) | 0x3F;
					// this loop here is unoptimal, but does the job
					while(current <= total) {
						// bitmask for nodes to follow (small optimization: always three bits active, one for each direction)
						bitMask = cache32bit[current] & 0x3F;
						// get the nodes around
						nodes = this.getNodesByIndex((cache32bit[current++] & 0xFFFFFFC0) >> 6);
						// check points for matching land/water
						if((bitMask & 0x01) === 0x01 && this.block[touchBlock + nodes.left] === 0x00 && !this.isEachTextureWithAnyOfFlags(nodes.left, EXTREME_AND_WET)) {
							cache32bit[++total] = (nodes.left << 6) | 0x23; // topLeft, left, bottomLeft
							this.block[areaBlock + nodes.left] = index;
							this.block[touchBlock + nodes.left] = 1;
							mass++;
						}
						if((bitMask & 0x02) === 0x02 && this.block[touchBlock + nodes.topLeft] === 0x00 && !this.isEachTextureWithAnyOfFlags(nodes.topLeft, EXTREME_AND_WET)) {
							cache32bit[++total] = (nodes.topLeft << 6) | 0x07; // left, topLeft, topRight
							this.block[areaBlock + nodes.topLeft] = index;
							this.block[touchBlock + nodes.topLeft] = 1;
							mass++;
						}
						if((bitMask & 0x04) === 0x04 && this.block[touchBlock + nodes.topRight] === 0x00 && !this.isEachTextureWithAnyOfFlags(nodes.topRight, EXTREME_AND_WET)) {
							cache32bit[++total] = (nodes.topRight << 6) | 0x0E; // topLeft, topRight, right
							this.block[areaBlock + nodes.topRight] = index;
							this.block[touchBlock + nodes.topRight] = 1;
							mass++;
						}
						if((bitMask & 0x08) === 0x08 && this.block[touchBlock + nodes.right] === 0x00 && !this.isEachTextureWithAnyOfFlags(nodes.right, EXTREME_AND_WET)) {
							cache32bit[++total] = (nodes.right << 6) | 0x1C; // topRight, right, bottomRight
							this.block[areaBlock + nodes.right] = index;
							this.block[touchBlock + nodes.right] = 1;
							mass++;
						}
						if((bitMask & 0x10) === 0x10 && this.block[touchBlock + nodes.bottomRight] === 0x00 && !this.isEachTextureWithAnyOfFlags(nodes.bottomRight, EXTREME_AND_WET)) {
							cache32bit[++total] = (nodes.bottomRight << 6) | 0x38; // right, bottomRight, bottomLeft
							this.block[areaBlock + nodes.bottomRight] = index;
							this.block[touchBlock + nodes.bottomRight] = 1;
							mass++;
						}
						if((bitMask & 0x20) === 0x20 && this.block[touchBlock + nodes.bottomLeft] === 0x00 && !this.isEachTextureWithAnyOfFlags(nodes.bottomLeft, EXTREME_AND_WET)) {
							cache32bit[++total] = (nodes.bottomLeft << 6) | 0x31; // bottomRight, bottomLeft, left
							this.block[areaBlock + nodes.bottomLeft] = index;
							this.block[touchBlock + nodes.bottomLeft] = 1;
							mass++;
						}
					}
					areas[index] = {
						mass: mass,
						type: AREA.LAND,
						x: i % this.width,
						y: ~~((i - (i % this.width)) / this.width)
					};
					// next index
					index++;
				} else {
					areas[index] = {
						mass: 0,
						type: AREA.UNUSED,
						x: i % this.width,
						y: ~~((i - (i % this.width)) / this.width)
					}
					// next index
					index++;
				}
			}
		}

		//  cleanup
		for(i = 0; i < this.size; i++) {
			this.block[touchBlock + i] = 0;
		}

		console.timeEnd('calculateAreas');

		return areas;
	}.bind(this);

	this.calculateSites = function() {
		var i,
			mines = 0,
			node = 0,
			nodes,
			objectIndexBlock = this.size * 4,
			objectTypeBlock = this.size * 5,
			radiusNodes,
			siteBlock = this.size * 8,
			tex1,
			tex2,
			tex3,
			tex4,
			tex5,
			tex6,
			textureBlocks = this.size,
			texNodes,
			waters = 0;

		// needs further investigation to the rules of original game; 99.9% correct for generated maps, but lacks information of ingame objects...
		for(i = 0; i < this.size; i++) {
			// cache nearby nodes
			nodes = this.getNodesByIndex(i);
			// cache texture information
			texNodes = this.getTextureNodesByIndex(i);
			tex1 = this.block[textureBlocks + texNodes.topLeft] & TEXTURE.TO_ID_VALUE;
			tex2 = this.block[textureBlocks + texNodes.top] & TEXTURE.TO_ID_VALUE;
			tex3 = this.block[textureBlocks + texNodes.topRight] & TEXTURE.TO_ID_VALUE;
			tex4 = this.block[textureBlocks + texNodes.bottomLeft] & TEXTURE.TO_ID_VALUE;
			tex5 = this.block[textureBlocks + texNodes.bottom] & TEXTURE.TO_ID_VALUE;
			tex6 = this.block[textureBlocks + texNodes.bottomRight] & TEXTURE.TO_ID_VALUE;
			texNodes = this.getTextureNodesByIndex(nodes.bottomRight);
			tex7 = this.block[textureBlocks + texNodes.topRight] & TEXTURE.TO_ID_VALUE;
			tex8 = this.block[textureBlocks + texNodes.bottomLeft] & TEXTURE.TO_ID_VALUE;
			tex9 = this.block[textureBlocks + texNodes.bottom] & TEXTURE.TO_ID_VALUE;
			texA = this.block[textureBlocks + texNodes.bottomRight] & TEXTURE.TO_ID_VALUE;

			if ( ((textureInfo[tex1].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((textureInfo[tex2].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((textureInfo[tex3].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((textureInfo[tex4].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((textureInfo[tex5].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((textureInfo[tex6].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				// water or swamp
				|| 6 === (waters = ((textureInfo[tex1].flag & TEXTURE.WET) === TEXTURE.WET)
				+ ((textureInfo[tex2].flag & TEXTURE.WET) === TEXTURE.WET)
				+ ((textureInfo[tex3].flag & TEXTURE.WET) === TEXTURE.WET)
				+ ((textureInfo[tex4].flag & TEXTURE.WET) === TEXTURE.WET)
				+ ((textureInfo[tex5].flag & TEXTURE.WET) === TEXTURE.WET)
				+ ((textureInfo[tex6].flag & TEXTURE.WET) === TEXTURE.WET) )
				// granite
				|| ((this.block[objectTypeBlock + i] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE)
			) {

				this.block[siteBlock + i] = SITE.IMPASSABLE;

			} else if ( (this.block[objectTypeBlock + i] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE ) {

				this.block[siteBlock + i] = SITE.TREE;

			} else if (
				// water nearby?
				waters > 0
				// granite nearby?
				|| (this.block[objectTypeBlock + nodes.left] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (this.block[objectTypeBlock + nodes.right] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (this.block[objectTypeBlock + nodes.topLeft] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (this.block[objectTypeBlock + nodes.topRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (this.block[objectTypeBlock + nodes.bottomLeft] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (this.block[objectTypeBlock + nodes.bottomRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				// any texture that forces flags
				|| ((textureInfo[tex1].flag & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((textureInfo[tex2].flag & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((textureInfo[tex3].flag & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((textureInfo[tex4].flag & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((textureInfo[tex5].flag & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((textureInfo[tex6].flag & TEXTURE.ARID) === TEXTURE.ARID)
			) {

				// point next to a swamp, water (outdated comment? "or there is a tree in bottom right point!")
				this.block[siteBlock + i] = SITE.FLAG_OCCUPIED;

			} else if ( 6 === (mines = ((textureInfo[tex1].flag & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((textureInfo[tex2].flag & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((textureInfo[tex3].flag & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((textureInfo[tex4].flag & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((textureInfo[tex5].flag & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((textureInfo[tex6].flag & TEXTURE.ROCK) === TEXTURE.ROCK) )
				// but some height rules apply to mines as well
				&& (this.block[i] - this.block[nodes.bottomRight]) >= -3
			) {
				if ( ((textureInfo[tex7].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
					|| ((textureInfo[tex8].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
					|| ((textureInfo[tex9].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
					|| ((textureInfo[texA].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
					|| ((this.block[objectTypeBlock + nodes.bottomRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				) {
					// snow or lava too close or a tree
					this.block[siteBlock + i] = SITE.FLAG_OCCUPIED;
				} else {
					// woohoo, a mine!
					this.block[siteBlock + i] = SITE.MINE_OCCUPIED;
				}
			} else if ( mines > 0 ) {

				this.block[siteBlock + i] = SITE.FLAG_OCCUPIED;

			} else if (
				((this.block[objectTypeBlock + nodes.bottomRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				// height differences
				|| ((this.block[i] - this.block[nodes.bottomRight]) > 3)
				|| ((this.block[nodes.bottomRight] - this.block[i]) > 1)
				|| (Math.abs(this.block[i] - this.block[nodes.topLeft]) > 3)
				|| (Math.abs(this.block[i] - this.block[nodes.topRight]) > 3)
				|| (Math.abs(this.block[i] - this.block[nodes.left]) > 3)
				|| (Math.abs(this.block[i] - this.block[nodes.right]) > 3)
				|| (Math.abs(this.block[i] - this.block[nodes.bottomLeft]) > 3)
			) {
				// so we can build a road, check for mountain meadow
				if (tex1 === 0x12 || tex2 === 0x12 || tex3 === 0x12 || tex4 === 0x12 || tex5 === 0x12 || tex6 === 0x12) {

					this.block[siteBlock + i] = SITE.FLAG_OCCUPIED;

				} else {

					this.block[siteBlock + i] = SITE.FLAG;

				}
			} else if ( ((textureInfo[tex7].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((textureInfo[tex8].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((textureInfo[tex9].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((textureInfo[texA].flag & TEXTURE.EXTREME) === TEXTURE.EXTREME)
			) {

				this.block[siteBlock + i] = SITE.FLAG_OCCUPIED;

			} else if ( ((this.block[objectTypeBlock + nodes.topLeft] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				|| ((this.block[objectTypeBlock + nodes.topRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				|| ((this.block[objectTypeBlock + nodes.left] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				|| ((this.block[objectTypeBlock + nodes.right] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				|| ((this.block[objectTypeBlock + nodes.bottomLeft] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				// or a too big height difference further away, so first get some nodes for us to work with
				|| !(radiusNodes = this.getRadiusNodes(i % this.width, ~~((i - (i % this.width)) / this.width), 2, true))
				|| (Math.abs(this.block[i] - this.block[radiusNodes[0]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[1]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[2]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[3]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[4]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[5]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[6]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[7]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[8]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[9]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[10]]) > 2)
				|| (Math.abs(this.block[i] - this.block[radiusNodes[11]]) > 2)
			) {
				// can build a hut, check for mountain meadow texture
				if (tex1 === 0x12 || tex2 === 0x12 || tex3 === 0x12 || tex4 === 0x12 || tex5 === 0x12 || tex6 === 0x12) {

					this.block[siteBlock + i] = SITE.HUT_OCCUPIED;

				} else {

					this.block[siteBlock + i] = SITE.HUT;

				}
			} else {
				// can build a castle, check for mountain meadow texture
				if (tex1 === 0x12 || tex2 === 0x12 || tex3 === 0x12 || tex4 === 0x12 || tex5 === 0x12 || tex6 === 0x12) {

					this.block[siteBlock + i] = SITE.CASTLE_OCCUPIED;

				} else {

					this.block[siteBlock + i] = SITE.CASTLE;

				}
			}
		}
	}.bind(this);

	// calculate light map
	this.calculateGouraud = function() {
		var around,
			i,
			j,
			k,
			node = 0,
			gouraudBlock = this.size * 12;

		for(i = 0; i < this.size; i++) {
			j = 64;
			k = this.block[i];
			around = this.getNodesByIndex(i);
			node = this.getNodesByIndex(around.left);
			j += 9 * (this.block[around.topRight] - k);
			j -= 6 * (this.block[around.left] - k);
			j -= 3 * (this.block[node.left] - k);
			j -= 9 * (this.block[node.bottomLeft] - k);
			this.block[gouraudBlock + i] = Math.max(Math.min(128, j), 0);
		}
	}.bind(this);

	this.changeHeight = function(x, y, radius, strength) {
		var newHeight,
			nodes,
			diff,
			maxDiff,
			i,
			j,
			k,
			index,
			around,
			mark = [],
			marked,
			touchBlock = this.size * 10;
		// sanitize
		strength = ~~strength;
		radius = Math.abs(~~radius);
		// optimize for speed by reducing unnecessary processing related to being positive or negative
		if(strength < 0) {
			if(strength < -MAX_ELEVATION) strength = -MAX_ELEVATION;
			nodes = this.getRadiusNodes(x, y, radius);
			for(i = 0; i < nodes.length; i++) {
				index = nodes[i];
				newHeight = this.block[index] + strength;
				if(newHeight < 0) newHeight = 0;
				// any change?
				if(this.block[index] !== newHeight) {
					this.block[index] = newHeight;
					// get nodes around the current index
					around = this.getNodesByIndex(index);
					// store in an array that we use to clean up the touchBlock
					if(this.block[touchBlock + index] === 0) mark.push(index);
					if(this.block[touchBlock + around.left] === 0) mark.push(around.left);
					if(this.block[touchBlock + around.right] === 0) mark.push(around.right);
					if(this.block[touchBlock + around.topLeft] === 0) mark.push(around.topLeft);
					if(this.block[touchBlock + around.topRight] === 0) mark.push(around.topRight);
					if(this.block[touchBlock + around.bottomLeft] === 0) mark.push(around.bottomLeft);
					if(this.block[touchBlock + around.bottomRight] === 0) mark.push(around.bottomRight);
					// mark the level of touch so we know how to avoid doing unnecessary work
					this.block[touchBlock + index] |= TOUCH_MARKED;
					this.block[touchBlock + around.left] |= TOUCH_FROM_RIGHT;
					this.block[touchBlock + around.right] |= TOUCH_FROM_LEFT;
					this.block[touchBlock + around.topLeft] |= TOUCH_FROM_BOTTOM_RIGHT;
					this.block[touchBlock + around.bottomRight] |= TOUCH_FROM_TOP_LEFT;
					this.block[touchBlock + around.topRight] |= TOUCH_FROM_BOTTOM_LEFT;
					this.block[touchBlock + around.bottomLeft] |= TOUCH_FROM_TOP_RIGHT;
				}
			}
			marked = nodes.length;
			// mark as dirty too
			this.dirty.blocks.height = true;
		} else if(strength > 0) {
			if(strength > MAX_ELEVATION) strength = MAX_ELEVATION;
			nodes = this.getRadiusNodes(x, y, radius);
			for(i = 0; i < nodes.length; i++) {
				index = nodes[i];
				newHeight = this.block[index] + strength;
				if(newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT;
				// any change?
				if(this.block[index] !== newHeight) {
					this.block[index] = newHeight;
					// get nodes around the current index
					around = this.getNodesByIndex(index);
					// store in an array that we use to clean up the touchBlock
					if(this.block[touchBlock + index] === 0) mark.push(index);
					if(this.block[touchBlock + around.left] === 0) mark.push(around.left);
					if(this.block[touchBlock + around.right] === 0) mark.push(around.right);
					if(this.block[touchBlock + around.topLeft] === 0) mark.push(around.topLeft);
					if(this.block[touchBlock + around.topRight] === 0) mark.push(around.topRight);
					if(this.block[touchBlock + around.bottomLeft] === 0) mark.push(around.bottomLeft);
					if(this.block[touchBlock + around.bottomRight] === 0) mark.push(around.bottomRight);
					// mark the level of touch so we know how to avoid doing unnecessary work
					this.block[touchBlock + index] |= TOUCH_MARKED;
					this.block[touchBlock + around.left] |= TOUCH_FROM_RIGHT;
					this.block[touchBlock + around.right] |= TOUCH_FROM_LEFT;
					this.block[touchBlock + around.topLeft] |= TOUCH_FROM_BOTTOM_RIGHT;
					this.block[touchBlock + around.bottomRight] |= TOUCH_FROM_TOP_LEFT;
					this.block[touchBlock + around.topRight] |= TOUCH_FROM_BOTTOM_LEFT;
					this.block[touchBlock + around.bottomLeft] |= TOUCH_FROM_TOP_RIGHT;
				}
			}
			marked = nodes.length;
			// mark as dirty too
			this.dirty.blocks.height = true;
		}
		while(mark.length > marked) {
			for(i = 0; i < mark.length; i++) {
				index = mark[i];
				j = this.block[touchBlock + index];
				// are we done with this node already?
				if((j & TOUCH_MARKED) === 0) {
					// we have processed it now!
					this.block[touchBlock + index] |= TOUCH_MARKED;
					marked++;
					// reset difference indicator
					maxDiff = 0;
					// cache the current value
					k = this.block[index];
					// get the surrounding nodes
					around = this.getNodesByIndex(index);
					// see if we need to adjust the elevation of this node
					if(j & TOUCH_FROM_RIGHT) {
						diff = k - this.block[around.right];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_LEFT) {
						diff = k - this.block[around.left];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_TOP_LEFT) {
						diff = k - this.block[around.topLeft];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_BOTTOM_RIGHT) {
						diff = k - this.block[around.bottomRight];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_TOP_RIGHT) {
						diff = k - this.block[around.topRight];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_BOTTOM_LEFT) {
						diff = k - this.block[around.bottomLeft];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					// okay, do we have anything to change in this node?
					if(maxDiff) {
						// calculate how much to change the height in this node
						if(maxDiff < 0) maxDiff += MAX_ELEVATION;
						else if(maxDiff > 0) maxDiff -= MAX_ELEVATION;
						// now we know how much change has to be done
						newHeight = k - maxDiff;
						if(newHeight < 0) { newHeight = 0; console.log('WTF! Below zero!'); }
						else if(newHeight > MAX_HEIGHT) { newHeight = MAX_HEIGHT; console.log('WTF! Above Max Height!'); }
						// it is always a good idea to draw your changes
						this.block[index] = newHeight;
						// mark the level of touch so we know how to avoid doing unnecessary work
						if((j & TOUCH_FROM_LEFT) === 0) {
							if(this.block[touchBlock + around.left] === 0) mark.push(around.left);
							this.block[touchBlock + around.left] |= TOUCH_FROM_RIGHT;
						}
						if((j & TOUCH_FROM_RIGHT) === 0) {
							if(this.block[touchBlock + around.right] === 0) mark.push(around.right);
							this.block[touchBlock + around.right] |= TOUCH_FROM_LEFT;
						}
						if((j & TOUCH_FROM_TOP_LEFT) === 0) {
							if(this.block[touchBlock + around.topLeft] === 0) mark.push(around.topLeft);
							this.block[touchBlock + around.topLeft] |= TOUCH_FROM_BOTTOM_RIGHT;
						}
						if((j & TOUCH_FROM_BOTTOM_RIGHT) === 0) {
							if(this.block[touchBlock + around.bottomRight] === 0) mark.push(around.bottomRight);
							this.block[touchBlock + around.bottomRight] |= TOUCH_FROM_TOP_LEFT;
						}
						if((j & TOUCH_FROM_TOP_RIGHT) === 0) {
							if(this.block[touchBlock + around.topRight] === 0) mark.push(around.topRight);
							this.block[touchBlock + around.topRight] |= TOUCH_FROM_BOTTOM_LEFT;
						}
						if((j & TOUCH_FROM_BOTTOM_LEFT) === 0) {
							if(this.block[touchBlock + around.bottomLeft] === 0) mark.push(around.bottomLeft);
							this.block[touchBlock + around.bottomLeft] |= TOUCH_FROM_TOP_RIGHT;
						}
					}
				}
			}
		}
		// clean our changes in the touchBlock
		for(i = 0; i < mark.length; i++) {
			this.block[touchBlock + mark[i]] = 0;
		}
	}.bind(this);

	this.getNodesByIndex = function(index) {
		var x = index % this.width,
			y = (index - x) / this.width,
			xL = (x > 0 ? x : this.width) - 1,
			xR = (x + 1) % this.width,
			yT = ((y > 0 ? y : this.height) - 1) * this.width,
			yB = ((y + 1) % this.height) * this.width,
			odd = (y & 1) === 1;

		y *= this.width;

		if(odd) {
			// odd
			return {
				left: y + xL,
				right: y + xR,
				topLeft: yT + x,
				topRight: yT + xR,
				bottomLeft: yB + xL,
				bottomRight: yB + x
			}
		} else {
			// even
			return {
				left: y + xL,
				right: y + xR,
				topLeft: yT + xL,
				topRight: yT + x,
				bottomLeft: yB + x,
				bottomRight: yB + xR
			}
		}
	}.bind(this);

	this.getAllSitesOfType = function(siteType, strictMode) {
		var i,
			mask = 0xFF,
			siteBlock = this.size * 8,
			sites = [];

		if(!strictMode && (siteType & 0xF0) === 0) {
			mask = 0x0F;
			siteType &= mask;
		}

		for(i = 0; i < this.size; i++) {
			if((this.block[siteBlock + i] & mask) === siteType) {
				sites.push(i);
			}
		}

		return sites;
	}.bind(this);

	this.getTextureNodesByIndex = function(index) {
		var x = index % this.width,
			y = (index - x) / this.width,
			xL = (x > 0 ? x : this.width) - 1,
			xR,
			yT = ((y > 0 ? y : this.height) - 1) * this.width,
			odd = (y & 1) === 1;

		y *= this.width;

		if(odd) {
			// only needed here
			xR = (x + 1) % this.width
			// odd
			return {
				bottomLeft: y + xL + this.size,
				bottom: index,
				bottomRight: index + this.size,
				topLeft: yT + x,
				top: yT + x + this.size,
				topRight: yT + xR
			}
		} else {
			// even
			return {
				bottomLeft: y + xL + this.size,
				bottom: index,
				bottomRight: index + this.size,
				topLeft: yT + xL,
				top: yT + xL + this.size,
				topRight: yT + x
			}
		}
	}.bind(this);

	this.isEachTextureSame = function(index, texture) {
		var nodes,
			textureBlocks = this.size,
			topLeft,
			top,
			topRight,
			bottomLeft,
			bottom,
			bottomRight;

		if(lastTextureIndex === index) {
			topLeft = lastTextureTopLeft;
			top = lastTextureTop;
			topRight = lastTextureTopRight;
			bottomLeft = lastTextureBottomLeft;
			bottom = lastTextureBottom;
			bottomRight = lastTextureBottomRight;
		} else {
			nodes = this.getTextureNodesByIndex(index);
			lastTextureIndex = index;
			lastTextureTopLeft     = topLeft     = this.block[textureBlocks + nodes.topLeft    ] & TEXTURE.TO_ID_VALUE;
			lastTextureTop         = top         = this.block[textureBlocks + nodes.top        ] & TEXTURE.TO_ID_VALUE;
			lastTextureTopRight    = topRight    = this.block[textureBlocks + nodes.topRight   ] & TEXTURE.TO_ID_VALUE;
			lastTextureBottomLeft  = bottomLeft  = this.block[textureBlocks + nodes.bottomLeft ] & TEXTURE.TO_ID_VALUE;
			lastTextureBottom      = bottom      = this.block[textureBlocks + nodes.bottom     ] & TEXTURE.TO_ID_VALUE;
			lastTextureBottomRight = bottomRight = this.block[textureBlocks + nodes.bottomRight] & TEXTURE.TO_ID_VALUE;
		}

		return (topLeft === texture)
			&& (top === texture)
			&& (topRight === texture)
			&& (bottomLeft === texture)
			&& (bottom === texture)
			&& (bottomRight === texture);
	}.bind(this);

	this.isEachTextureWithAnyOfFlags = function(index, flags) {
		var nodes,
			textureBlocks = this.size,
			topLeft,
			top,
			topRight,
			bottomLeft,
			bottom,
			bottomRight;

		if(lastTextureIndex === index) {
			topLeft = lastTextureTopLeft;
			top = lastTextureTop;
			topRight = lastTextureTopRight;
			bottomLeft = lastTextureBottomLeft;
			bottom = lastTextureBottom;
			bottomRight = lastTextureBottomRight;
		} else {
			nodes = this.getTextureNodesByIndex(index);
			lastTextureIndex = index;
			lastTextureTopLeft     = topLeft     = this.block[textureBlocks + nodes.topLeft    ] & TEXTURE.TO_ID_VALUE;
			lastTextureTop         = top         = this.block[textureBlocks + nodes.top        ] & TEXTURE.TO_ID_VALUE;
			lastTextureTopRight    = topRight    = this.block[textureBlocks + nodes.topRight   ] & TEXTURE.TO_ID_VALUE;
			lastTextureBottomLeft  = bottomLeft  = this.block[textureBlocks + nodes.bottomLeft ] & TEXTURE.TO_ID_VALUE;
			lastTextureBottom      = bottom      = this.block[textureBlocks + nodes.bottom     ] & TEXTURE.TO_ID_VALUE;
			lastTextureBottomRight = bottomRight = this.block[textureBlocks + nodes.bottomRight] & TEXTURE.TO_ID_VALUE;
		}

		return !!(textureInfo[topLeft    ].flag & flags)
			&& !!(textureInfo[top        ].flag & flags)
			&& !!(textureInfo[topRight   ].flag & flags)
			&& !!(textureInfo[bottomLeft ].flag & flags)
			&& !!(textureInfo[bottom     ].flag & flags)
			&& !!(textureInfo[bottomRight].flag & flags);
	}.bind(this);

	// will not maintain harbor flag
	this.getTexturesByIndex = function(index) {
		var nodes = this.getTextureNodesByIndex(index),
			textureBlocks = this.size;

		return {
			topLeft: this.block[textureBlocks + nodes.topLeft] & TEXTURE.TO_ID_VALUE,
			top: this.block[textureBlocks + nodes.top] & TEXTURE.TO_ID_VALUE,
			topRight: this.block[textureBlocks + nodes.topRight] & TEXTURE.TO_ID_VALUE,
			bottomLeft: this.block[textureBlocks + nodes.bottomLeft] & TEXTURE.TO_ID_VALUE,
			bottom: this.block[textureBlocks + nodes.bottom] & TEXTURE.TO_ID_VALUE,
			bottomRight: this.block[textureBlocks + nodes.bottomRight] & TEXTURE.TO_ID_VALUE
		}
	}.bind(this);

	this.setTexture = function(index, texture) {
		var nodes,
			textureBlocks = this.size;
		// sanitize
		texture = Math.abs(~~texture);
		// is this a known texture?
		if(textureInfo[texture]) {
			nodes = this.getTextureNodesByIndex(index);
			this.block[textureBlocks + nodes.bottomLeft] = texture;
			this.block[textureBlocks + nodes.bottom] = texture;
			this.block[textureBlocks + nodes.bottomRight] = texture;
			this.block[textureBlocks + nodes.topLeft] = texture;
			this.block[textureBlocks + nodes.top] = texture;
			this.block[textureBlocks + nodes.topRight] = texture;
		}
	}.bind(this);

	this.getRawData = function() {
		return this.block;
	}.bind(this);

	// return array of indexes for nearby points
	// outset = boolean, return only the outermost radius points
	this.getRadiusNodes = function(x, y, radius, outset, buffer) {
		var nodes,
			i,
			j,
			k = 0,
			l,
			m,
			first = 0,
			last = 0,
			removeLast = 0 === (y & 1),
			xCache,
			yCache,
			maxRadius;

		// sanitize input
		radius = Math.abs(~~radius);
		outset = !!outset;
		// see if we add the point itself to result blocks
		if(radius === 0) {
			nodes = new Uint32Array(buffer || 1);
			nodes[0] = y * this.width + x;
		// make sure the radius does not overlap itself
		} else {
			// some limits have to be in place
			maxRadius = ~~((Math.min(this.width, this.height) - 2) / 2);
			if(radius > maxRadius) radius = maxRadius;
			// cache X and Y values to avoid recalculating all the time
			xCache = new Uint32Array(radius * 2 + 1);
			yCache = new Uint32Array(radius * 2 + 1);
			// see if we need to care about borders
			if((x - radius) >= 0 && (y - radius) >= 0 && (x + radius) < this.width && (y + radius) < this.height) {
				// we are nowhere close
				for(j = 0, i = -radius; i <= radius; i++) {
					xCache[j] = x + i;
					yCache[j++] = y + i;
				}
			} else {
				// have to play it safe
				for(j = 0, i = -radius; i <= radius; i++) {
					xCache[j] = (this.width + x + i) % this.width;
					yCache[j++] = (this.height + y + i) % this.height;
				}
			}
			// last index in X
			last = radius * 2;
			// all nodes or only the edge nodes?
			if(!outset) {
				// calculate the total size of resulting array
				nodes = new Uint32Array(buffer || 1 + 6 * (radius * (radius + 1) >> 1));
				// start pushing out the results
				for(i = 0; i < xCache.length; i++) {
					nodes[k++] = yCache[radius] * this.width + xCache[i];
				}
				// then all the other Y rows
				for(j = 1; j <= radius; j++) {
					if(removeLast) {
						last--;
					} else {
						first++;
					}
					removeLast = !removeLast;
					l = yCache[radius - j] * this.width;
					m = yCache[radius + j] * this.width;
					for(i = first; i <= last; i++) {
						nodes[k++] = l + xCache[i];
						nodes[k++] = m + xCache[i];
					}
				}
			} else {
				// calculate the total size of resulting array
				nodes = new Uint32Array(buffer || 6 * radius);
				// current line first and last
				nodes[k++] = yCache[radius] * this.width + xCache[first];
				nodes[k++] = yCache[radius] * this.width + xCache[last];
				// first and last on all lines except the topmost and bottommost row
				for(j = 1; j < radius; j++) {
					if(removeLast) {
						last--;
					} else {
						first++;
					}
					removeLast = !removeLast;
					l = yCache[radius - j] * this.width;
					m = yCache[radius + j] * this.width;
					nodes[k++] = l + xCache[first];
					nodes[k++] = l + xCache[last];
					nodes[k++] = m + xCache[first];
					nodes[k++] = m + xCache[last];
				}
				// all nodes in topmost and bottommost row
				if(removeLast) {
					last--;
				} else {
					first++;
				}
				l = yCache[radius - j] * this.width;
				m = yCache[radius + j] * this.width;
				for(i = first; i <= last; i++) {
					nodes[k++] = l + xCache[i];
					nodes[k++] = m + xCache[i];
				}
			}
		}
		return nodes;
	}.bind(this);

	this.initialize = function(width, height) {
		var i,
			y,
			pos = 0;

		this.width = Math.abs(width | 0) & 0x0FF0;
		this.height = Math.abs(height | 0) & 0x0FF0;
		this.size = this.width * this.height;
		this.texture = 0;

		// memory clean up
		this.title = '';
		this.author = '';
		this.players = [];

		Object.keys(this.blocks).forEach(function(key) {
			this.blocks[key] = void 0;
		}.bind(this));

		if(this.size) {
			// we need this much memory to store data uncompressed / like the game
			this.blockBuffer = new ArrayBuffer(this.size * 14);
			// access to all blocks (useful when reading a file)
			this.block = new Uint8Array(this.blockBuffer);
			// cache for 32-bit values
			cache32bit = new Uint32Array(this.size);
			// prepare 2D array access to individual blocks
			/*Object.keys(this.blocks).forEach(function(key) {
				this.blocks[key] = [];
				for(y = 0; y < this.height; y++) {
					this.blocks[key][y] = new Uint8Array(this.blockBuffer, pos, this.width);
					pos += this.width;
				}
			}.bind(this));*/
			// buildable sites...
			pos = this.size * 8;
			for(i = 0; i < this.size; i++) {
				this.block[pos++] = 4;
			}
			// fill the odd block with what is expected of it
			pos = this.size * 9;
			for(i = 0; i < this.size; i++) {
				this.block[pos++] = 7;
			}
			// areas, just one thank you!
			pos = this.size * 13;
			for(i = 0; i < this.size; i++) {
				this.block[pos++] = 1;
			}
		} else {
			this.blockBuffer = void 0;
		}
		// nothing has changed
		this.resetDirty();

		return this;
	}.bind(this);

	// flats out the height map, doesn't do anything else
	this.initializeHeight = function(baseLevel) {
		var i;

		baseLevel = ~~baseLevel;

		if(baseLevel < 0) baseLevel = 0;
		else if(baseLevel > MAX_HEIGHT) baseLevel = MAX_HEIGHT;

		for(i = 0; i < this.size; i++) {
			this.block[i] = baseLevel;
		}
		// mark as dirty
		this.dirty.height = true;

		return this;
	}.bind(this);

	this.initializePlayer = function(x, y, leader) {
		var playerIndex = -1;

		x = ~~x;
		y = ~~y;
		leader = leader & 0xFF;

		if(x < 0) x = 0;
		else if(x >= this.width) x = this.width - 1;
		if(y < 0) y = 0;
		else if(y >= this.height) y = this.height - 1;

		if(x >= 0 && y >= 0) {
			this.players[playerIndex = this.players.length] = {
				x: x,
				y: y,
				leader: leader
			};
		}

		// mark as dirty
		this.dirty.players = true;

		return playerIndex;
	};

	this.initializeTexture = function(texture) {
		var i,
			doubleSize = this.size * 2,
			textureBlocks = this.size;
		// sanitize
		texture = Math.abs(~~texture);
		// is this a known texture?
		if(textureInfo[texture]) {
			for(i = 0; i < doubleSize; i++) {
				this.block[textureBlocks + i] = texture;
			}
		}
	}.bind(this);

	this.isDirty = function() {
		var output = [];

		Object.keys(this.dirty).forEach(function(name) {
			switch(name) {
			case 'blocks':
				Object.keys(this.dirty.blocks).forEach(function(block) {
					if(this.dirty.blocks[block]) output.push(name + '.' + block);
				}.bind(this));
				break;
			default:
				if(this.dirty[name]) output.push(name);
			}
		}.bind(this));

		return output;
	}.bind(this);

	this.resetDirty = function() {
		this.dirty = {
			author: false,
			blocks: {},
			players: false,
			terrain: false,
			title: false
		};

		Object.keys(this.blocks).forEach(function(name) {
			this.dirty.blocks[name] = false;
		}.bind(this));
	}.bind(this);

	// repeat less
	this.resetDirty();
/*
	return {
		changeHeight: this.changeHeight,
		getAllSitesOfType: this.getAllSitesOfType,
		getRadiusNodes: this.getRadiusNodes,
		getRawData: this.getRawData,
		getTexturesByIndex: this.getTexturesByIndex,
		initialize: this.initialize,
		initializeHeight: this.initializeHeight,
		initializePlayer: this.initializePlayer,
		initializeTexture: this.initializeTexture,
		isDirty: this.isDirty,
		resetDirty: this.resetDirty,
		setTexture: this.setTexture
	};
	*/
}