// The Settlers II: Online Editor
// by Vesa Piittinen
// License: undecided Open Source license

var CP437 = [0, 9786, 9787, 9829, 9830, 9827, 9824, 8226, 9688, 9675, 9689, 9794, 9792, 9834, 9835, 9788, 9658, 9668, 8597, 8252, 182, 167, 9644, 8616, 8593, 8595, 8594, 8592, 8735, 8596, 9650, 9660, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 8962, 199, 252, 233, 226, 228, 224, 229, 231, 234, 235, 232, 239, 238, 236, 196, 197, 201, 230, 198, 244, 246, 242, 251, 249, 255, 214, 220, 162, 163, 165, 8359, 402, 225, 237, 243, 250, 241, 209, 170, 186, 191, 8976, 172, 189, 188, 161, 171, 187, 9617, 9618, 9619, 9474, 9508, 9569, 9570, 9558, 9557, 9571, 9553, 9559, 9565, 9564, 9563, 9488, 9492, 9524, 9516, 9500, 37, 37, 9566, 9567, 9562, 9556, 9577, 9574, 9568, 9552, 9580, 9575, 9576, 9572, 9573, 9561, 9560, 9554, 9555, 9579, 9578, 9496, 9484, 9608, 9604, 9612, 9616, 9600, 945, 223, 915, 960, 931, 963, 181, 964, 934, 920, 937, 948, 8734, 966, 949, 8745, 8801, 177, 8805, 8804, 8992, 8993, 247, 8776, 176, 8729, 183, 8730, 8319, 178, 9632, 160];

// World Object
function world(data, header_size, short_header) {
	// here be parameters
	this.width = 0;
	this.height = 0;
	this.size = 0;
	this.title = '';
	this.author = '';
	this.type = 0;
	this.players = 0;
	this.hqx = [];
	this.hqy = [];
	this.invalid = 0;
	this.leader = [];
	this.areas = [];
	this.animals = [];
	// custom information!
	this.continents = [];
	this.harbors = [];
	this.islands = [];
	this.resources = [];
	this.stone = 0;
	this.tree = 0;
	
	// file features detected as a Campaign mission?
	this.campaign = false;
	// file contains Return to the Roots features?
	this.rttr = false;
	
	// find out the closest node for a given index
	this.nodeLeft = function(index){
		var temp = index % this.width;
		return (index - temp) + ((this.width + temp - 1) % this.width);
	};
	this.nodeRight = function(index){
		var temp = index % this.width;
		return (index - temp) + ((temp + 1) % this.width);
	};
	this.nodeTopLeft = function(index){
		var temp = (this.size + index - this.width) % this.size;
		var y = (index / this.width) | 0;
		return (y & 1) ? temp : this.nodeLeft( temp );
	};
	this.nodeTopRight = function(index){
		var temp = (this.size + index - this.width) % this.size;
		var y = (index / this.width) | 0;
		return (y & 1) ? this.nodeRight(temp) : temp;
	};
	this.nodeBottomLeft = function(index){
		var temp = (index + this.width) % this.size;
		var y = (index / this.width) | 0;
		return (y & 1) ? temp : this.nodeLeft( temp );
	};
	this.nodeBottomRight = function(index){
		var temp = (index + this.width) % this.size;
		var y = (index / this.width) | 0;
		return (y & 1) ? this.nodeRight(temp) : temp;
	};
	
	// calculate areas (based on texture nodes)
	this.calculateAreas = function() {
		// counter validation
		var count = this.size;
		// textures that cannot be passed by settlers
		var unpassable = [2, 3, 5, 16, 19, 20, 21, 22];
		var t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0;
		// first separate unpassable, water and land
		for(var i = 0; i < this.size; i++)
		{
			if( unpassable.indexOf(t1 = (this.nodeTexture1[i] & 0x3F) ) > -1
				&& unpassable.indexOf(t2 = (this.nodeTexture2[i] & 0x3F) ) > -1
				&& unpassable.indexOf(t3 = (this.nodeTexture2[this.nodeLeft(i)] & 0x3F) ) > -1
				&& unpassable.indexOf(t4 = (this.nodeTexture1[this.nodeTopLeft(i)] & 0x3F) ) > -1
				&& unpassable.indexOf(t5 = (this.nodeTexture2[this.nodeTopLeft(i)] & 0x3F) ) > -1
				&& unpassable.indexOf(t6 = (this.nodeTexture1[this.nodeTopRight(i)] & 0x3F) ) > -1
			) {
				// check for water!
				if( t1 === 5 && t2 === 5 && t3 === 5 && t4 === 5 && t5 === 5 && t6 === 5 ) {
					// mark as "water"
					this.nodeArea[i] = 255;
				}
				else {
					// snow/lava/swamp/deadly water/ice floes/...
					this.nodeArea[i] = 254;
					// counter of uncounted passable areas
					count--;
				}
			}
			else {
				// mark as "land"
				this.nodeArea[i] = 253;
			}
		}
		var list = [], k = 0, l = 0, m = 0, p = 0;
		this.areas = [];
		// I actually dislike this part of the code, not a very efficient flood fill, but it should get the job done
		while(count > 0 && k < 250) {
			// find next unhandled land/water area
			for(var i = 0; i < this.size; i++) {
				var j = this.nodeArea[i];
				if(j === 253 || j === 255) break;
			}
			// hitting this would be an error!
			if(i === this.size) break;
			// 253 -> 1 (land), 255 -> 2 (water)
			this.areas[k] = {
				'id': 1 + (j == 255),
				'x': i % this.width,
				'y': (i / this.width) | 0,
				'mass': 1,
				'continent': false,
				'harbors': 0
			};
			// mark index
			this.nodeArea[i] = k;
			// add index and bitmask while also reseting a few variables
			list[m = l = 0] = [i, 0x3F];
			// this loop here is unoptimal, but does the job
			while(m <= l) {
				// bitmask for nodes to follow (small optimization: always three bits active, one for each direction)
				var b = list[m][1];
				// get the index
				i = list[m++][0];
				// check points for matching land/water
				if((b & 0x01) === 0x01 && this.nodeArea[p = this.nodeLeft(i)] === j) {
					list[++l] = [p, 0x23 ];
					this.nodeArea[p] = k;
					this.areas[k].mass++;
				}
				if((b & 0x02) === 0x02 && this.nodeArea[p = this.nodeTopLeft(i)] === j) {
					list[++l] = [p, 0x07 ];
					this.nodeArea[p] = k;
					this.areas[k].mass++;
				}
				if((b & 0x04) === 0x04 && this.nodeArea[p = this.nodeTopRight(i)] === j) {
					list[++l] = [p, 0x0E ];
					this.nodeArea[p] = k;
					this.areas[k].mass++;
				}
				if((b & 0x08) === 0x08 && this.nodeArea[p = this.nodeRight(i)] === j) {
					list[++l] = [p, 0x1C];
					this.nodeArea[p] = k;
					this.areas[k].mass++;
				}
				if((b & 0x10) === 0x10 && this.nodeArea[p = this.nodeBottomRight(i)] === j) {
					list[++l] = [p, 0x38];
					this.nodeArea[p] = k;
					this.areas[k].mass++;
				}
				if((b & 0x20) === 0x20 && this.nodeArea[p = this.nodeBottomLeft(i)] === j) {
					list[++l] = [p, 0x31];
					this.nodeArea[p] = k;
					this.areas[k].mass++;
				}
			}
			count -= this.areas[k++].mass;
		}
		// DEBUG
		// alert("Max depth: " + list.length + "\nAreas: " + k);
	} // calculateAreas
	
	this.calculateGouraud = function() {
		// calculate gouraud shading
		for(var i = node = 0; i < this.size; i++) {
			var j = 64;
			var k = this.nodeHeight[i];
			j += 9 * (this.nodeHeight[this.nodeTopRight(i)] - k);
			j -= 6 * (this.nodeHeight[node = this.nodeLeft(i)] - k);
			j -= 3 * (this.nodeHeight[this.nodeLeft(node)] - k);
			j -= 9 * (this.nodeHeight[this.nodeBottomLeft(node)] - k);
			this.nodeGouraud[i] = Math.max(Math.min(128, j), 0);
		}
	}
	
	// calculate building sites (requires height, textures and object types to work)
	this.calculateSites = function() {
		var mines = node = waters = 0;
		// can build mines (mountains)
		var texture_rock = [1, 11, 12, 13];
		// can build roads (desert, unused single solid color texture)
		var texture_sand = [4, 7, 17];
		// nothing can be built on node surrounded by these textures (swamp, water)
		var texture_wet = [3, 5];
		// nothing can be built near this texture (snow, lava)
		var texture_extreme = [2, 16, 19, 20, 21, 22];
		// needs optimization at some point + reorganizing to give perfect results
		for(var i = 0; i < this.size; i++) {
			if( texture_extreme.indexOf(this.nodeTexture1[i] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture2[i] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture2[this.nodeLeft(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture1[this.nodeTopLeft(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture2[this.nodeTopLeft(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture1[this.nodeTopRight(i)] & 0x3F) > -1
				// water or swamp
				|| 6 === (waters = (texture_wet.indexOf(this.nodeTexture1[i] & 0x3F) > -1)
				+ (texture_wet.indexOf(this.nodeTexture2[i] & 0x3F) > -1)
				+ (texture_wet.indexOf(this.nodeTexture2[this.nodeLeft(i)] & 0x3F) > -1)
				+ (texture_wet.indexOf(this.nodeTexture1[this.nodeTopLeft(i)] & 0x3F) > -1)
				+ (texture_wet.indexOf(this.nodeTexture2[this.nodeTopLeft(i)] & 0x3F) > -1)
				+ (texture_wet.indexOf(this.nodeTexture1[this.nodeTopRight(i)] & 0x3F) > -1) )
				// granite
				|| (this.nodeObjectType[i] & 0xFC) === 0xCC
			) {
				this.nodeSite[i] = 0x78;
			}
			else if( (this.nodeObjectType[i] & 0xFC) === 0xC4 )
			{
				// tree
				this.nodeSite[i] = 0x68;
			}
			else if( waters > 0
				// granite nearby
				|| (this.nodeObjectType[this.nodeLeft(i)] & 0xFC) === 0xCC
				|| (this.nodeObjectType[this.nodeRight(i)] & 0xFC) === 0xCC
				|| (this.nodeObjectType[this.nodeTopLeft(i)] & 0xFC) === 0xCC
				|| (this.nodeObjectType[this.nodeTopRight(i)] & 0xFC) === 0xCC
				|| (this.nodeObjectType[this.nodeBottomLeft(i)] & 0xFC) === 0xCC
				|| (this.nodeObjectType[this.nodeBottomRight(i)] & 0xFC) === 0xCC
				// any texture that forces flags
				|| texture_sand.indexOf(this.nodeTexture1[i] & 0x3F) > -1
				|| texture_sand.indexOf(this.nodeTexture2[i] & 0x3F) > -1
				|| texture_sand.indexOf(this.nodeTexture2[this.nodeLeft(i)] & 0x3F) > -1
				|| texture_sand.indexOf(this.nodeTexture1[this.nodeTopLeft(i)] & 0x3F) > -1
				|| texture_sand.indexOf(this.nodeTexture2[this.nodeTopLeft(i)] & 0x3F) > -1
				|| texture_sand.indexOf(this.nodeTexture1[this.nodeTopRight(i)] & 0x3F) > -1
			) {
				// point next to a swamp, water or there is a tree in bottom right point!
				this.nodeSite[i] = 0x09; // type 9 flag
			}
			else if( 6 === ( mines = (texture_rock.indexOf(this.nodeTexture1[i] & 0x3F) > -1)
				+ (texture_rock.indexOf(this.nodeTexture2[i] & 0x3F) > -1)
				+ (texture_rock.indexOf(this.nodeTexture2[this.nodeLeft(i)] & 0x3F) > -1)
				+ (texture_rock.indexOf(this.nodeTexture1[this.nodeTopLeft(i)] & 0x3F) > -1)
				+ (texture_rock.indexOf(this.nodeTexture2[this.nodeTopLeft(i)] & 0x3F) > -1)
				+ (texture_rock.indexOf(this.nodeTexture1[this.nodeTopRight(i)] & 0x3F) > -1) )
				// but some rules apply to mines as well
				&& (this.nodeHeight[i] - this.nodeHeight[this.nodeBottomRight(i)]) >= -3
			) {
				if( texture_extreme.indexOf(this.nodeTexture1[this.nodeRight(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture1[this.nodeBottomRight(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture2[this.nodeBottomLeft(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture2[this.nodeBottomRight(i)] & 0x3F) > -1
				|| (this.nodeObjectType[this.nodeBottomRight(i)] & 0xFC) === 0xC4
				) {
					// snow or lava too close or a damn tree in the way
					this.nodeSite[i] = 0x09;
				}
				else
				{
					// it is a mine!
					this.nodeSite[i] = 0x0D;
				}
			}
			else if(mines > 0)
			{
				this.nodeSite[i] = 0x09;
			}
			else if( (this.nodeObjectType[this.nodeBottomRight(i)] & 0xFC) === 0xC4 // tree
				// height differences
				|| (this.nodeHeight[i] - this.nodeHeight[this.nodeBottomRight(i)]) > 3
				|| (this.nodeHeight[this.nodeBottomRight(i)] - this.nodeHeight[i]) > 1
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[this.nodeTopLeft(i)]) > 3
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[this.nodeTopRight(i)]) > 3
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[this.nodeLeft(i)]) > 3
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[this.nodeRight(i)]) > 3
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[this.nodeBottomLeft(i)]) > 3
			) {
				// can build a road, check for mountain meadow texture
				if( (this.nodeTexture1[i] & 0x3F) === 0x12
				|| (this.nodeTexture2[i] & 0x3F) === 0x12
				|| (this.nodeTexture2[this.nodeLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture1[this.nodeTopLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture2[this.nodeTopLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture1[this.nodeTopRight(i)] & 0x3F) === 0x12
				) {
					this.nodeSite[i] = 0x09;
				}
				else
				{
					this.nodeSite[i] = 0x01;
				}
			}
			else if( texture_extreme.indexOf(this.nodeTexture1[this.nodeRight(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture1[this.nodeBottomRight(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture2[this.nodeBottomLeft(i)] & 0x3F) > -1
				|| texture_extreme.indexOf(this.nodeTexture2[this.nodeBottomRight(i)] & 0x3F) > -1
			) {
				this.nodeSite[i] = 0x09;
			}
			else if( (this.nodeObjectType[this.nodeTopLeft(i)] & 0xFC) === 0xC4 // tree
				|| (this.nodeObjectType[this.nodeTopRight(i)] & 0xFC) === 0xC4
				|| (this.nodeObjectType[node = this.nodeLeft(i)] & 0xFC) === 0xC4
				|| (this.nodeObjectType[this.nodeRight(i)] & 0xFC) === 0xC4
				|| (this.nodeObjectType[this.nodeBottomLeft(i)] & 0xFC) === 0xC4
				// too big height difference further away
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeLeft(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeTopRight(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeTopRight(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeRight(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeRight(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeBottomRight(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeBottomRight(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeBottomLeft(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeBottomLeft(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeLeft(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeLeft(node)]) > 2
				|| Math.abs(this.nodeHeight[i] - this.nodeHeight[node = this.nodeTopLeft(node)]) > 2
			) {
				// can build a hut, check for mountain meadow texture
				if( (this.nodeTexture1[i] & 0x3F) === 0x12
				|| (this.nodeTexture2[i] & 0x3F) === 0x12
				|| (this.nodeTexture2[this.nodeLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture1[this.nodeTopLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture2[this.nodeTopLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture1[this.nodeTopRight(i)] & 0x3F) === 0x12
				) {
					this.nodeSite[i] = 0x0A;
				}
				else
				{
					this.nodeSite[i] = 0x02;
				}
			}
			else
			{
				// can build a castle, check for mountain meadow texture
				if( (this.nodeTexture1[i] & 0x3F) === 0x12
				|| (this.nodeTexture2[i] & 0x3F) === 0x12
				|| (this.nodeTexture2[this.nodeLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture1[this.nodeTopLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture2[this.nodeTopLeft(i)] & 0x3F) === 0x12
				|| (this.nodeTexture1[this.nodeTopRight(i)] & 0x3F) === 0x12
				) {
					this.nodeSite[i] = 0x0C;
				}
				else
				{
					this.nodeSite[i] = 0x04;
				}
			}
		}
	}
	
	// indexes areas, used when no need to recalculate the whole area but we do not have any area information
	/* RttR and savegame maps have invalid information here!
	this.indexAreas = function() {
		this.areas = [];
		for(var i = 0; i < this.size; i++) {
			// we need this often
			var temp = this.nodeArea[i];
			// valid id = 0 - 259
			if(temp < 250) {
				if(!this.areas[temp]) {
					// missing, create object
					this.areas[temp] = {
						// land = 1, water = 2
						'type': ( this.nodeTexture1[i] === 5
							&& this.nodeTexture2[i] === 5
							&& this.nodeTexture2[this.nodeLeft(i)] === 5
							&& this.nodeTexture1[this.nodeTopLeft(i)] === 5
							&& this.nodeTexture2[this.nodeTopLeft(i)] === 5
							&& this.nodeTexture1[this.nodeTopRight(i)] === 5 ) ? 2 : 1,
						'x': i % this.width,
						'y': (i / this.width) | 0,
						'mass': 0,
						'continent': false,
						'harbors': 0
					};
				}
				// otherwise just keep adding mass
				this.areas[temp].mass++;
			}
		}
	}*/
	
	// playable/accessible areas = "continents"
	this.indexContinents = function() {
		// resets
		this.continents = [];
		this.harbors = [];
		for(var i = 0; i < this.areas.length; i++) {
			this.areas[i].continent = false;
			this.areas[i].harbors = 0;
		}
		// first we look for harbor positions
		for(var i = 0; i < this.size; i++) {
			// harbor indicator in texture or building site?
			if( ((this.nodeTexture1[i] & 0x40) === 0x40) && (this.nodeSite[i] & 0xF7) === 0x04) {
				var area = this.nodeArea[i];
				var link = [];
				var currentNode = 0, currentArea = 0;
				// look around to see if there are any areas different than this one
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeLeft( this.nodeLeft(i) ) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeTopRight(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeTopRight(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeRight(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeRight(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeBottomRight(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeBottomRight(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeBottomLeft(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeBottomLeft(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeLeft(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeLeft(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				if( ((currentArea = this.nodeArea[ currentNode = this.nodeTopLeft(currentNode) ]) !== area) && currentArea < 250 ) {
					link.push({'area': currentArea, 'node': currentNode});
				}
				// did we have any?
				if(link.length > 0) {
					// have we listed this continent yet?
					if(this.areas[area].continent === false) {
						this.areas[area].continent = this.continents.length;
						this.continents.push({
							'players': [],
							'harbors': []
						});
					}
					// harbor array index
					this.continents[ this.areas[area].continent ].harbors.push( this.areas[area].harbors.length );
					// add harbor of the above index
					this.harbors.push({
						'node': i,
						'x': i % this.width,
						'y': (i / this.width) | 0,
						'areas': link
					});
					// counter go up!
					this.areas[area].harbors++;
				}
			}
		}
		
		// TODO: check if all harbors are connected to each other by areas that surround them
		// if not then we cannot include continents that are not accessible by human player...
		// mostly useful validation feature for the Editor so implement later!
		// ---
		// replace count with an array, combine each array per continent and see if all are accessible, if not, see which ones are accessible by player 1
		
		// need to check for harbors in a player's continent?
		var checkHarbor = this.continents.length > 1;
		// next we index players to see which continents have players on them
		for(var i = 0; i < this.leader.length; i++) {
			if(this.hqx[i] > 0 && this.hqx[i] < this.width && this.hqy[i] > 0 && this.hqy[i] < this.height) {
				var area = this.nodeArea[ this.hqy[i] * this.width + this.hqx[i] ];
				if(checkHarbor === false) {
					if(this.areas[area].continent === false) {
						this.areas[area].continent = this.continents.length;
						this.continents.push({
							'players': [],
							'harbors': []
						});
					}
					this.continents[this.areas[area].continent].players.push(i);
				}
				else if(area < 250) {
					if(this.areas[area] === window.undefined) alert('UNEXPECTED ERROR: No area #' + area);
					if(this.areas[area].continent === false) {
						//DEBUG: alert('Player ' + (i + 1) + ' is in solitude!');
					}
					else {
						this.continents[this.areas[area].continent].players.push(i);
					}
				}
				else {
					//DEBUG: alert('Player ' + (i + 1) + ' is on invalid location!');
				}
			}
		}
	}
	
	// finds out players but does not know the order unless the file is a RttR map
	// MUST be called before indexing continents and harbors!
	this.indexPlayers = function() {
		// resets
		this.leader = [];
		this.hqx = [];
		this.hqy = [];
		this.players = 0;
		for(var i = 0; i < this.size; i++) {
			// is it a headquarters location?
			if(this.nodeObjectType[i] === 0x80) {
				// player id?
				var p = this.nodeObjectIndex[i];
				// Return to the Roots map if has this information!
				//this.rttr = this.rttr || p !== 0;
				// check if exists
				if(!this.leader[p]) {
					// did not, add!
					this.leader[p] = 0;
					this.hqx[p] = i % this.width;
					this.hqy[p] = (i / this.width) | 0;
				}
				else {
					// did, just add to the end
					this.leader.push(0);
					this.hqx.push(i % this.width);
					this.hqy.push((i / this.width) | 0);
				}
				this.players++;
			}
		}
	}
	
	// finds out information about all raw materials (trees, granite, mining)
	this.indexResources = function() {
		this.resources = [
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		];
		this.stone = 0;
		this.tree = 0;
		for(var i = 0; i < this.size; i++) {
			var objectType = this.nodeObjectType[i];
			// check by object type
			if( (objectType & 0xFC) === 0xC4) {
				this.tree++;
			}
			else if( (objectType & 0xFE) === 0xCC) {
				this.stone += this.nodeObjectIndex[i];
			}
			// resource map
			var resource = this.nodeResource[i];
			var count = resource & 0x07;
			// bitshifting here results in resource ID, I think the game supports up to 32 resource types but only 6 different are used
			// water = 4, coal = 8, iron ore = 9, gold = 10, granite = 11, fish = 16
			if(count > 0) this.resources[resource >> 3] += count;
		}
	}
	
	// validate input parameters
	if(!data || !data.byteLength || (header_size !== 0 && header_size !== 2342)) return false;
	
	short_header = !short_header ? 16 : 4;
	
	// figure out map measurements
	var temp = new Uint16Array(data, header_size + 6 + (short_header === 4) * 4, 2);
	// validate map size
	if( temp[0] < 32
		|| temp[1] < 32
		|| temp[0] > 1024
		|| temp[1] > 1024
		|| (temp[0] & 0x03) !== 0
		|| (temp[1] & 0x03) !== 0 )
			return false;
	this.width = temp[0];
	this.height = temp[1];
	// total size
	this.size = temp[0] * temp[1];
	var block_size = this.size + short_header;
	var blocks_start = header_size + 10 + (short_header === 4) * 4;
	// at this point we trust enough to do this
	this.data = data;
	// now prepare memory for all the 14 blocks
	this.nodes = new ArrayBuffer(this.size * 14);
	// SWD / WLD
	if(header_size === 2342) {
		// check what title has to offer
		var chars = new Uint8Array(data, 10, 24);
		// check for Campaign map feature
		this.campaign = ((chars[20] | (chars[21] << 8)) !== this.width || (chars[22] | (chars[23] << 8)) !== this.height);
		// okay, this very cool code recreates our title in Unicode
		for(var i = 0, maxi = (this.campaign ? 23 : 19); i < maxi && chars[i] > 0; i++) {
			// CP437 to Unicode
			this.title += String.fromCharCode(CP437[ chars[i] ]);
		}
		// and then we do the same with author, atleast we do not have to check for extra map file features!
		var chars = new Uint8Array(data, 36, 20);
		for(var i = 0; i < 19 && chars[i] > 0; i++) {
			// CP437 to Unicode
			this.author += String.fromCharCode(CP437[ chars[i] ]);
		}
		// world type and player count
		var temp = new Uint8Array(data, 34, 2);
		this.type = temp[0];
		this.players = temp[1];
		// player headquarters
		var temp = new Int16Array(data, 56, 14);
		this.hqx = [ temp[0], temp[1], temp[2], temp[3], temp[4], temp[5], temp[6] ];
		this.hqy = [ temp[7], temp[8], temp[9], temp[10], temp[11], temp[12], temp[13] ];
		// player leaders (World Campaign feature!)
		var temp = new Uint8Array(data, 84, 8);
		this.leader = [ temp[1], temp[2], temp[3], temp[4], temp[5], temp[6], temp[7] ];
		// should leader face information rank a map as Campaign or not?
		//this.campaign = this.campaign || (temp[1] | temp[2] | temp[3] | temp[4] | temp[5] | temp[6] | temp[7]) > 0;
		// Invalid Map (0 = Unlimited Play)
		this.invalid = temp[0];
		this.campaign = this.campaign || this.invalid !== 0;
		// areas
		var temp = new Uint8Array(data, 92, 2250);
		for(var i = 0; i < 2250; i+=9) {
			// read variables
			var areaType = temp[i];
			var areaX = (temp[i+1] | temp[i+2] << 8) >>> 0;
			var areaY = (temp[i+3] | temp[i+4] << 8) >>> 0;
			var areaMass = (temp[i+5] | temp[i+6] << 8 | temp[i+7] << 16 | temp[i+8] << 24) >>> 0;
			// end of area?
			if(areaType === 0 && areaX === 0 && areaY === 0 && areaMass === 0) break;
			// Return to the Roots garbage?
			if(areaType === 0 || areaType > 2
			|| areaX >= this.width
			|| areaY >= this.height
			|| areaMass > this.size) {
				// possibly saved in RttR Map Editor
				break;
			}
			this.areas.push({
				'type': areaType,
				'x': areaX,
				'y': areaY,
				'mass': areaMass,
				'continent': false,
				'harbors': 0
			});
		}
		// header is complete
	}
	// we can read blocks!
	var datapos = blocks_start;
	// prepare blocks
	this.nodeHeight = new Uint8Array(this.nodes, 0, this.size);
	this.nodeTexture1 = new Uint8Array(this.nodes, this.size, this.size);
	this.nodeTexture2 = new Uint8Array(this.nodes, this.size * 2, this.size);
	this.nodeRoad = new Uint8Array(this.nodes, this.size * 3, this.size);
	this.nodeObjectIndex = new Uint8Array(this.nodes, this.size * 4, this.size);
	this.nodeObjectType = new Uint8Array(this.nodes, this.size * 5, this.size);
	this.nodeAnimal = new Uint8Array(this.nodes, this.size * 6, this.size);
	this.nodeUnknown = new Uint8Array(this.nodes, this.size * 7, this.size);
	this.nodeSite = new Uint8Array(this.nodes, this.size * 8, this.size);
	this.nodeUnknown7 = new Uint8Array(this.nodes, this.size * 9, this.size);
	this.nodeUnknown1 = new Uint8Array(this.nodes, this.size * 10, this.size);
	this.nodeResource = new Uint8Array(this.nodes, this.size * 11, this.size);
	this.nodeGouraud = new Uint8Array(this.nodes, this.size * 12, this.size);
	this.nodeArea = new Uint8Array(this.nodes, this.size * 13, this.size);
	// the entire thing
	this.nodeBlock = new Uint8Array(this.nodes);
	// for block header validation
	var compare = false;
	if(short_header === 16) compare = [
		0x10, 0x27, 0x00, 0x00,
		0x00, 0x00, this.width & 0xFF, (this.width >> 8) & 0xFF,
		this.height & 0xFF, (this.height >> 8) & 0xFF, 0x01, 0x00
	];
	
	//var debughex = '';
	
	// read all 14 blocks
	for(var i = 0, k = 0; i < 14; i++) {
		//debughex += '10 27 00 00 00 00 00 00 00 00 01 00 00 00 00 00 '
		var datasize = 0;
		// see if we need to do block header validation
		if(compare !== false) {
			var temp = new Uint8Array(data, datapos, 16);
			// compare for a valid block header
			for(var j = 0; j < 12; j++) {
				if(temp[j] !== compare[j]) break;
			}
			datasize = (temp[12] | (temp[13] << 8) | (temp[14] << 16) | (temp[15] << 24)) >>> 0;
		}
		else {
			// just trust the value to indicate size
			var temp = new Uint8Array(data, datapos, 4);
			datasize = (temp[0] | (temp[1] << 8) | (temp[2] << 16) | (temp[3] << 24)) >>> 0;
		}
		// invalid file if this happens
		if(datapos + datasize + short_header > data.byteLength) break;
		var uncompressed = datasize === this.size;
		datapos += short_header;
		// prepare to read the block
		var block = new Uint8Array(data, datapos, datasize);
		// see if the block is compressed
		if(uncompressed) {
			// simple copy to block
			for(var j = 0; j < this.size; j++) {
				var copybyte = block[j];
				//var hexchar = copybyte.toString(16).toUpperCase();
				//debughex += (hexchar.length == 1 ? '0'  : '') + hexchar + ' ';
				this.nodeBlock[k++] = copybyte;
			}
		}
		else {
			// okay, not so simple copy to block
			var keybyte = block[0];
			for(var j = 1; j < datasize; j++) {
				// compressed block?
				if( block[j] === keybyte ) {
					var count = block[++j];
					var copybyte = block[++j];
					//var hexchar = copybyte.toString(16).toUpperCase();
					//hexchar = (hexchar.length == 1 ? '0'  : '') + hexchar + ' ';
					for(var l = 0; l < count; l++) {
						this.nodeBlock[k++] = copybyte;
						//debughex += hexchar;
					}
				}
				else {
					var copybyte = block[j];
					//var hexchar = copybyte.toString(16).toUpperCase();
					//debughex += (hexchar.length == 1 ? '0'  : '') + hexchar + ' ';
					this.nodeBlock[k++] = copybyte;
				}
			}
		}
		datapos += datasize;
	}
	//$('#upload_comment').val("Size: " + data.byteLength + "\nPosition: " + datapos);
	//$('#upload_comment').val(debughex);
	// did we read it all?
	if(i < 14) return false;
	
	// anything more to read? WORLD###.DAT files do not always have the ending 0xFF byte which is a standard in WLD and SWD files
	if(datapos < data.byteLength && header_size === 2342) {
		// footer
		var temp = new Uint8Array(data, datapos);
		for(i = 0; i < temp.length; i+=5) {
			if(temp[i] === 0 || temp[i] === 255) break;
			this.animals.push({
				'type': temp[i],
				'x': temp[i+1] | temp[i+2] << 8,
				'y': temp[i+3] | temp[i+4] << 8
			});
		}
	}
	// okay, then check for things that we need to parse from elsewhere
	if(this.animals.length === 0) {
		// animals go first
		for(var i = 0; i < this.size; i++) {
			var animal = this.nodeAnimal[i];
			if(animal !== 0 && animal < 255) {
				this.animals.push({
					'type': animal,
					'x': i % this.width,
					'y': (i / this.width) | 0
				});
			}
		}
	}
	// if we do not know is this map a campaign mission then try to find the Gate object
	if(!this.campaign) {
		for(var i = 0; i < this.size; i++) {
			// 0x16 = 22 = Gate
			// 0xC8 = 200 = landscape object
			if( this.nodeObjectIndex[i] === 0x16 && this.nodeObjectType[i] === 0xC8 ) {
				// Gate means this is certainly a mission
				this.campaign = true;
				break;
			}
		}
	}
	// only Return to the Roots can handle maps bigger than 256 x 256
	this.rttr = this.rttr || (this.width > 256) || (this.height > 256);
	// no player information or a RttR Map Editor map, WORLD###.DAT files have to be ignored (especially savegames)
	if(this.players > 7 || (this.leader.length === 0 && header_size === 2342)) this.indexPlayers();
	
	// calculate areas ourselves as this information is missing from RttR and DAT map files
	this.calculateAreas();
	// now we can get truthful results for our continental calculations
	this.indexContinents();
	// flag as campaign if ships are required to play or if no players are defined (in which case must edit RTX files)
	this.campaign = this.campaign || this.players === 0 || this.continents.length !== 1;
	// gather resource information
	this.indexResources();
	
	// THEN! Things we do not really need to do but which we do do
	
	// recalculate building sites (RttR maps do not provide exact correct values so we do this)
	this.calculateSites();
	// recalculate gouraud shading (Map Generator maps lack this one)
	this.calculateGouraud();
	
	// debug information!
	var debug = !!console && !!console.debug;
	if( debug ) {
		treedata = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	}
	
	// node cleanup (especially clear savegame maps of information that would crash original Settlers II)
	for(var x = y = i = 0; i < this.size; i++, x++) {
		if(debug && x === this.width) { x = 0; y++; }
		this.nodeTexture1[i] &= 0x7F;	// besides texture IDs remember Harbor locations 0x40
		this.nodeTexture2[i] &= 0x3F;	// only remember texture IDs
		// cleanup any possible savegame objects
		switch(this.nodeObjectType[i] & 0xFC) {
			case 0x00:	// also clean up index
				if( debug && this.nodeObjectIndex[i] > 0) console.debug('OBJECT: Type 0, GFX ' + this.nodeObjectIndex[i] + ' @ ' + x + ' x ' + y);
				this.nodeObjectIndex[i] = 0;
				break;
			case 0xC4:	// tree
				if( debug ) {
					var tree_id = (this.nodeObjectType[i] & 0x03) << 2 | (this.nodeObjectIndex[i] & 0xC0) >> 6;
					if( tree_id > 8) console.debug('OBJECT: Glitch tree ' + tree_id + ' @ ' + x + ' x ' + y);
					if( (this.nodeObjectIndex[i] & 0x08) === 0x08) console.debug('OBJECT: Falling tree GFX @ ' + x + ' x ' + y);
					if( (this.nodeObjectIndex[i] & 0xB7) < 0x30 ) console.debug('OBJECT: Planted tree @ ' + x + ' x ' + y);
					treedata[ tree_id ]++;
				}
				this.nodeObjectIndex[i] &= 0xF7;
				break;
			case 0xC8:	// landscape object
				if( debug && this.nodeObjectIndex[i] > 0x2C) console.debug('OBJECT: Unusual landscape GFX ' + this.nodeObjectIndex[i] + ' @ ' + x + ' x ' + y);
				break;
			case 0xCC:	// granite
				if( debug && this.nodeObjectType[i] > 0xCD ) console.debug('OBJECT: Unused granite GFX @ ' + x + ' x ' + y);
				this.nodeObjectIndex[i] &= 0x07;
				break;
			default:	// remove everything else
				if( debug ) console.debug('OBJECT: Unknown type ' + this.nodeObjectType[i].toString(16) + ' @ ' + x + ' x ' + y);
				this.nodeObjectType[i] = 0;
				this.nodeObjectIndex[i] = 0;
		}
		this.nodeRoad[i] = 0;
		this.nodeAnimal[i] = 0;
		this.nodeUnknown[i] = 0;
		this.nodeUnknown7[i] = 7;
		this.nodeUnknown1[i] = 0;
	}
	
	if( debug )
	{
		console.debug('TREE COUNT BY ID: ' + treedata.toString());
	}
}

// World Loader: make some file format validation
function loadWorld(data) {
	if(!data) return false;
	var header_size = 0;
	var header = new Uint8Array(data, 0, 2352);
	// read signature
	var signature = String.fromCharCode( header[0], header[1], header[2], header[3], header[4], header[5], header[6], header[7], header[8], header[9] );
	// check for Map Editor / Version 1.50+ Campaign file signature
	if( signature === 'WORLD_V1.0' ) {
		// SWD / WLD
		header_size = 2342;
	}
	// make sure the whole header seems like The Settlers II standard
	if( header[header_size] === 0x11 && header[header_size + 1] === 0x27
		&& header[header_size + 2] === 0x00 && header[header_size + 3] === 0x00 && header[header_size + 4] === 0x00 && header[header_size + 5] === 0x00 ) {
		// DAT / SWD / WLD - block headers are full size
		return new world(data, header_size, false);
	}
	else if( header[header_size] === 0x11 && header[header_size + 1] === 0x27
		&& header[header_size + 2] === 0xFF && header[header_size + 3] === 0xFF && header[header_size + 4] === 0xFF && header[header_size + 5] === 0xFF
		&& header[header_size + 6] === 0x00 && header[header_size + 7] === 0x00 && header[header_size + 8] === 0x00 && header[header_size + 9] === 0x00 ) {
		// DAT - block headers are short ie. just length of data to read
		return new world(data, header_size, true);
	}
}