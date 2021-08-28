// Code Page 437 to Unicode
var CP437 = [0, 9786, 9787, 9829, 9830, 9827, 9824, 8226, 9688, 9675, 9689, 9794, 9792, 9834, 9835, 9788, 9658, 9668, 8597, 8252, 182, 167, 9644, 8616, 8593, 8595, 8594, 8592, 8735, 8596, 9650, 9660, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 8962, 199, 252, 233, 226, 228, 224, 229, 231, 234, 235, 232, 239, 238, 236, 196, 197, 201, 230, 198, 244, 246, 242, 251, 249, 255, 214, 220, 162, 163, 165, 8359, 402, 225, 237, 243, 250, 241, 209, 170, 186, 191, 8976, 172, 189, 188, 161, 171, 187, 9617, 9618, 9619, 9474, 9508, 9569, 9570, 9558, 9557, 9571, 9553, 9559, 9565, 9564, 9563, 9488, 9492, 9524, 9516, 9500, 37, 37, 9566, 9567, 9562, 9556, 9577, 9574, 9568, 9552, 9580, 9575, 9576, 9572, 9573, 9561, 9560, 9554, 9555, 9579, 9578, 9496, 9484, 9608, 9604, 9612, 9616, 9600, 945, 223, 915, 960, 931, 963, 181, 964, 934, 920, 937, 948, 8734, 966, 949, 8745, 8801, 177, 8805, 8804, 8992, 8993, 247, 8776, 176, 8729, 183, 8730, 8319, 178, 9632, 160];

// "Constants"
var LEADERS = ['Octavianus', 'Julius', 'Brutus', 'Erik', 'Knut', 'Olof', 'Yamauchi', 'Tsunami', 'Hakirawashi', 'Shaka', 'Todo', 'Mnga Tscha'];
var COLOR_TYPE_M = [ // Merri's custom index for gouraud shading
	[236, 195, 124, 231, 199, 242, 242, 199, 233, 232, 231, 195, 194, 193, 217, 232, 249, 254, 169, 242, 249, 249, 249],
	[98, 145, 23, 41, 85, 42, 42, 85, 32, 166, 33, 113, 245, 41, 34, 33, 251, 254, 97, 42, 251, 251, 251],
	[122, 118, 179, 178, 182, 242, 242, 182, 122, 172, 101, 120, 144, 119, 171, 101, 249, 252, 123, 242, 249, 249, 249]
];
var COLOR_TYPE_O = [ // Original game index for gouraud shading
	[233, 216, 123, 233, 199, 240, 240, 199, 231, 233, 230, 216, 216, 215, 236, 231, 57, 254, 216, 240, 57, 57, 57],
	[114, 167, 139, 160, 85, 42, 42, 85, 165, 166, 166, 33, 212, 212, 167, 114, 248, 254, 160, 42, 248, 248, 248],
	[123, 116, 244, 244, 183, 240, 240, 183, 36, 102, 123, 117, 118, 118, 233, 120, 248, 254, 122, 240, 248, 248, 248]
];

// ID, X, Y object (player & animals)
function IDXY(id, x, y)
{
	this.id = id;
	this.x = x;
	this.y = y;
}

function IDXYMASS(id, x, y, mass)
{
	this.id = id;
	this.x = x;
	this.y = y;
	this.mass = mass;
}

// headquarter location validator (simple mode)
function is_valid_hq_pos(x, y, width, height) {
	// check for valid position
	if(x < 6) return false;
	if(y < 5) return false;
	if(x + 5 + (y & 1) > width) return false;
	if(y + 5 > height) return false;
	return true;
}

// calculate block 8 based on blocks 0, 1, 2 & 5
// not a pretty one this is, needs a serious recode for performance and code length
// also there are some minor calculation differences to the original game,
//  ie. flag 0x09 instead of 0x01 when granite nearby but the flag should instead be caused by height difference to be 0x01
function calculate_sites(WLD) {
	// prepare some variables
	var p = []; while(p.length < 19) p[p.length] = 0;
	var waters = mines = flags = diff = 0;
	var i = j = x = x1 = x2 = x3 = x4 = y1 = y2 = y3 = y4 = 0;
	var w = WLD.width, h = WLD.height;
	// texture types
	var texture_mine = [1, 11, 12, 13]; // can only build mine here
	var texture_flag = [4, 7, 17]; // can only build roads here
	var texture_snowlava = [2, 16, 19, 20, 21, 22]; // nothing can be built on or to a point next to this texture
	var texture_swampwater = [3, 5]; // nothing can be built on this texture, but can build roads next to this texture
	// calculate building sites
	for(y = 0; y < h; y++)
	{
		// rows rows rows...
		y1 = (h + y - 2) % h;
		y2 = (h + y - 1) % h;
		y3 = (y + 1) % h;
		y4 = (y + 2) % h;
		for(x = 0; x < w; x++)
		{
			// columns columns columns...
			x1 = (w + x - 2) % w;
			x2 = (w + x - 1) % w;
			x3 = (x + 1) % w;
			x4 = (x + 2) % w;
			// calculate all 19 points that we are interested of...
			p[0] = y1 * w + x2;
			p[1] = y1 * w + x;
			p[2] = y1 * w + x3;
			p[7] = y * w + x1;
			p[8] = y * w + x2;
			p[9] = y * w + x;
			p[10] = y * w + x3;
			p[11] = y * w + x4;
			p[16] = y4 * w + x2;
			p[17] = y4 * w + x;
			p[18] = y4 * w + x3;
			if(y & 1)
			{
				p[3] = y2 * w + x2;
				p[4] = y2 * w + x;
				p[5] = y2 * w + x3;
				p[6] = y2 * w + x4;
				p[12] = y3 * w + x2;
				p[13] = y3 * w + x;
				p[14] = y3 * w + x3;
				p[15] = y3 * w + x4;
			}
			else
			{
				p[3] = y2 * w + x1;
				p[4] = y2 * w + x2;
				p[5] = y2 * w + x;
				p[6] = y2 * w + x3;
				p[12] = y3 * w + x1;
				p[13] = y3 * w + x2;
				p[14] = y3 * w + x;
				p[15] = y3 * w + x3;
			}
			// okay, we then check for textures, start with snow and lava
			if( texture_snowlava.indexOf(WLD.block[1][ p[4] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[1][ p[5] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[1][ p[9] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[2][ p[4] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[2][ p[8] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[2][ p[9] ] & 0x1F) > -1
				// water swamp
				|| 6 == ( waters = (texture_swampwater.indexOf(WLD.block[1][ p[4] ] & 0x1F) > -1)
				+ (texture_swampwater.indexOf(WLD.block[1][ p[5] ] & 0x1F) > -1)
				+ (texture_swampwater.indexOf(WLD.block[1][ p[9] ] & 0x1F) > -1)
				+ (texture_swampwater.indexOf(WLD.block[2][ p[4] ] & 0x1F) > -1)
				+ (texture_swampwater.indexOf(WLD.block[2][ p[8] ] & 0x1F) > -1)
				+ (texture_swampwater.indexOf(WLD.block[2][ p[9] ] & 0x1F) > -1) )
				// granite
				|| (WLD.block[5][p[9]] & 0xFE) == 204
			) {
				// any block with lava or snow texture is non-buildable
				// any block of only water and swamp textures is non-buildable
				// any block on or near granite is non-buildable
				WLD.block[8][p[9]] = 0x78;
			}
			else if( (WLD.block[5][p[9]] & 0xFC) == 196 )
			{
				// tree
				WLD.block[8][p[9]] = 0x68;
			}
			else if( waters > 0
				// granite
				|| (WLD.block[5][p[4]] & 0xFE) == 204
				|| (WLD.block[5][p[5]] & 0xFE) == 204
				|| (WLD.block[5][p[8]] & 0xFE) == 204
				|| (WLD.block[5][p[10]] & 0xFE) == 204
				|| (WLD.block[5][p[13]] & 0xFE) == 204
				|| (WLD.block[5][p[14]] & 0xFE) == 204
				// any texture that forces flags
				|| texture_flag.indexOf(WLD.block[1][ p[4] ] & 0x1F) > -1
				|| texture_flag.indexOf(WLD.block[1][ p[5] ] & 0x1F) > -1
				|| texture_flag.indexOf(WLD.block[1][ p[9] ] & 0x1F) > -1
				|| texture_flag.indexOf(WLD.block[2][ p[4] ] & 0x1F) > -1
				|| texture_flag.indexOf(WLD.block[2][ p[8] ] & 0x1F) > -1
				|| texture_flag.indexOf(WLD.block[2][ p[9] ] & 0x1F) > -1
			) {
				// point next to a swamp, water or there is a tree in bottom right point!
				WLD.block[8][p[9]] = 0x09; // type 9 flag
			}
			else if( 6 == (
				mines = (texture_mine.indexOf(WLD.block[1][ p[4] ] & 0x1F) > -1)
				+ (texture_mine.indexOf(WLD.block[1][ p[5] ] & 0x1F) > -1)
				+ (texture_mine.indexOf(WLD.block[1][ p[9] ] & 0x1F) > -1)
				+ (texture_mine.indexOf(WLD.block[2][ p[4] ] & 0x1F) > -1)
				+ (texture_mine.indexOf(WLD.block[2][ p[8] ] & 0x1F) > -1)
				+ (texture_mine.indexOf(WLD.block[2][ p[9] ] & 0x1F) > -1) )
				// but some rules apply to mines as well
				&& (WLD.block[0][p[9]] - WLD.block[0][p[14]]) >= -3
			) {
				if( texture_snowlava.indexOf(WLD.block[1][ p[10] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[1][ p[14] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[2][ p[13] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[2][ p[14] ] & 0x1F) > -1
				|| (WLD.block[5][p[14]] & 0xFC) == 196
				) {
					// snow or lava too close or a damn tree in the way
					WLD.block[8][p[9]] = 0x09;
				}
				else
				{
					// it is a mine!
					WLD.block[8][p[9]] = 0x0D;
				}
			}
			else if (mines > 0)
			{
				WLD.block[8][p[9]] = 0x09;
			}
			else if( (WLD.block[5][p[14]] & 0xFC) == 196 // tree
				// height differences
				|| (diff = WLD.block[0][p[9]] - WLD.block[0][p[14]]) > 3
				|| (WLD.block[0][p[14]] - WLD.block[0][p[9]]) > 1
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[4]]) > 3
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[5]]) > 3
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[8]]) > 3
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[10]]) > 3
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[13]]) > 3
			) {
				// can build a road, check for mountain meadow texture
				if( (WLD.block[1][ p[4] ] & 0x1F) == 18
					|| (WLD.block[1][ p[5] ] & 0x1F) == 18
					|| (WLD.block[1][ p[9] ] & 0x1F) == 18
					|| (WLD.block[2][ p[4] ] & 0x1F) == 18
					|| (WLD.block[2][ p[8] ] & 0x1F) == 18
					|| (WLD.block[2][ p[9] ] & 0x1F) == 18
				) {
					WLD.block[8][p[9]] = 0x09;
				}
				else
				{
					WLD.block[8][p[9]] = 0x01;
				}
			}
			else if( texture_snowlava.indexOf(WLD.block[1][ p[10] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[1][ p[14] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[2][ p[13] ] & 0x1F) > -1
				|| texture_snowlava.indexOf(WLD.block[2][ p[14] ] & 0x1F) > -1
			) {
				// snow or lava too close
				WLD.block[8][p[9]] = 0x09;
			}
			else if( (WLD.block[5][p[4]] & 0xFC) == 196 // tree
				|| (WLD.block[5][p[5]] & 0xFC) == 196
				|| (WLD.block[5][p[8]] & 0xFC) == 196
				|| (WLD.block[5][p[10]] & 0xFC) == 196
				|| (WLD.block[5][p[13]] & 0xFC) == 196
				// too big height difference further away
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[0]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[1]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[2]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[3]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[6]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[7]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[11]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[12]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[15]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[16]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[17]]) > 2
				|| Math.abs(WLD.block[0][p[9]] - WLD.block[0][p[18]]) > 2
			) {
				// can build a hut, check for mountain meadow texture
				if( (WLD.block[1][ p[4] ] & 0x1F) == 18
					|| (WLD.block[1][ p[5] ] & 0x1F) == 18
					|| (WLD.block[1][ p[9] ] & 0x1F) == 18
					|| (WLD.block[2][ p[4] ] & 0x1F) == 18
					|| (WLD.block[2][ p[8] ] & 0x1F) == 18
					|| (WLD.block[2][ p[9] ] & 0x1F) == 18
				) {
					WLD.block[8][p[9]] = 0x0A;
				}
				else
				{
					WLD.block[8][p[9]] = 0x02;
				}
			}
			else
			{
				// can build a castle, check for mountain meadow texture
				if( (WLD.block[1][ p[4] ] & 0x1F) == 18
					|| (WLD.block[1][ p[5] ] & 0x1F) == 18
					|| (WLD.block[1][ p[9] ] & 0x1F) == 18
					|| (WLD.block[2][ p[4] ] & 0x1F) == 18
					|| (WLD.block[2][ p[8] ] & 0x1F) == 18
					|| (WLD.block[2][ p[9] ] & 0x1F) == 18
				) {
					WLD.block[8][p[9]] = 0x0C;
				}
				else
				{
					WLD.block[8][p[9]] = 0x04;
				}
			}
		}
	}
}

// mainly for resource similar texture types
var TYPE_MEADOW = 0,
	TYPE_MOUNTAIN = 1,
	TYPE_SNOW = 2,
	TYPE_SWAMP = 3,
	TYPE_DESERT = 4,
	TYPE_WATER = 5,
	TYPE_LAVA = 6,
	TYPE_SEA = 7;

// mainly for resource similar texture types
function texture_type(id)
{
	switch(id & 0x1F)
	{
		case 1:
		case 11:
		case 12:
		case 13:
			return TYPE_MOUNTAIN;
		case 2:
			return TYPE_SNOW;
		case 3:
			return TYPE_SWAMP;
		case 4:
		case 7:
			return TYPE_DESERT;
		case 5:
			return TYPE_WATER;
		case 16:	// lava
		case 17:	// solid one color texture, allows building roads on it
		case 20:	// unused lava 1 (needs a supporting texture set)
		case 21:	// unused lava 2 (needs a supporting texture set)
		case 22:	// unused lava 3 (needs a supporting texture set)
			return TYPE_LAVA;
		case 19:	// water (one that is like snow and lava)
			return TYPE_SEA;
		case 0:	// savanna
		case 6:	// water (one that allows buildings on it)
		case 8:	// meadow 1
		case 9:	// meadow 2
		case 10:	// meadow 3
		case 14:	// steppe
		case 15:	// flower meadow
		case 18:	// mountain meadow
		default:	// all other textures have meadow-like features
			return TYPE_MEADOW;
	}
}

// mainly for resource similar textures
// returns number of similar texture types 
function count_texture(WLD, id, i)
{
	var count_c = 0, count_type = texture_type(id);
	// count textures on same row
	count_c += texture_type(WLD.block[1][ i ]) == count_type;
	count_c += texture_type(WLD.block[2][ i ]) == count_type;
	count_c += texture_type(WLD.block[2][ WLD.nodeindex[i][0] ]) == count_type;
	count_c += texture_type(WLD.block[1][ WLD.nodeindex[i][2] ]) == count_type;
	count_c += texture_type(WLD.block[2][ WLD.nodeindex[i][2] ]) == count_type;
	count_c += texture_type(WLD.block[1][ WLD.nodeindex[i][3] ]) == count_type;
	// return count_count
	return count_c;
}

// calculate block 11 based on block 1, 2, 5, 8
function calculate_resources(WLD) {
	var i = j = k = x = y = 0;
	var w = WLD.width, h = WLD.height;
	// reset all resources except for mining minerals (unless outside a mountain)
	for(i = 0; i < WLD.size; i++)
	{
		j = WLD.block[11][i];
		if(j >= 0x40 && j <= 0x5F)
		{
			// make sure this resource is on mountain
			if( count_texture(WLD, 1, i) < 6)
			{
				// is not
				WLD.block[11][i] = 0;
			}
		}
		else
		{
			// everything not a mineral is removed
			WLD.block[11][i] = 0;
		}
	}
	// now start on adding more!
	for(y = 0; y < h; y++)
	{
		for(x = 0; x < w; x++)
		{
			// current index
			i = y * w + x;
			// is it a flag pole or tree, maybe near water?
			if( WLD.block[8][i] == 0x09 )
			{
				// looping through all six surrounding nodes
				for(k = 0; k < 6; k++)
				{
					// try adding fishes
					if( count_texture(WLD, 5, j = WLD.nodeindex[i][k]) == 6) WLD.block[11][j] = 0x87;
				}
			}
			// all meadow?
			else if( count_texture(WLD, 0, i) == 6)
			{
				// water here
				WLD.block[11][i] = 0x21;
			}
		}
	}
}

// calculate block 12 based on block 0
function calculate_gouraud(WLD) {
	// prepare some variables
	var x = y = i = j = p1y = p4y = p1x = p2x = p3x = p4x = 0;
	var w = WLD.width, h = WLD.height;
	// calculate gouraud shading
	for(y = 0; y < h; y++)
	{
		// calculate point 1 & 4 Y location
		p1y = (h + y - 1) % h;
		p4y = (y + 1) % h;
		for(x = 0; x < w; x++)
		{
			// calculate all four points X location
			p1x = (w + x + (y & 1)) % w;
			p2x = (w + x - 2) % w;
			p3x = (w + x - 1) % w;
			p4x = (w + p1x - 2) % w;
			// initialize shading
			i = 64;
			j = WLD.block[0][y * w + x];
			i += 9 * (WLD.block[0][p1y * w + p1x] - j);
			i -= 3 * (WLD.block[0][y * w + p2x] - j);
			i -= 6 * (WLD.block[0][y * w + p3x] - j);
			i -= 9 * (WLD.block[0][p4y * w + p4x] - j);
			WLD.block[12][y * w + x] = Math.max(Math.min(128, i), 0);
		}
	}
}

// calculate block 13 based on blocks 1 & 2
// TODO later: optimize for memory usage and speed (current implementation is memory hungry)
// this could be adapted: http://www.codeproject.com/Articles/6017/QuickFill-An-efficient-flood-fill-algorithm
// however it works in the regular 4-way direction ("tile based"), S2 maps are 6-way ("hex based")
function calculate_areas(WLD) {
	// prepare some variables
	var x = x1 = x2 = y = y1 = i = j = k = l = m = p1 = p2 = p3 = p4 = p5 = p6 = 0;
	var count = WLD.size;
	var w = WLD.width, h = WLD.height;
	// textures that cannot be passed by settlers
	var unpassable = [2, 3, 5, 16, 19, 20, 21, 22];
	// first of all mark unpassable areas
	for(y = 0; y < h; y++)
	{
		y1 = (h + y - 1) % h;
		for(x = 0; x < w; x++)
		{
			x1 = (w + x - 1) % w;
			x2 = (w + x + 1) % w;
			if(y & 1)
			{
				p1 = y1 * w + x;
				p2 = y1 * w + x2;
			}
			else
			{
				p1 = y1 * w + x1;
				p2 = y1 * w + x;
			}
			p3 = y * w + x1;
			p4 = y * w + x;
			// check for impassability
			if( unpassable.indexOf(WLD.block[1][p1] & 0x1F) > -1
				&& unpassable.indexOf(WLD.block[1][p2] & 0x1F) > -1
				&& unpassable.indexOf(WLD.block[1][p4] & 0x1F) > -1
				&& unpassable.indexOf(WLD.block[2][p1] & 0x1F) > -1
				&& unpassable.indexOf(WLD.block[2][p3] & 0x1F) > -1
				&& unpassable.indexOf(WLD.block[2][p4] & 0x1F) > -1
			) {
				// check for water!
				if( (WLD.block[1][p1] & 0x1F) == 5
					&& (WLD.block[1][p2] & 0x1F) == 5
					&& (WLD.block[1][p4] & 0x1F) == 5
					&& (WLD.block[2][p1] & 0x1F) == 5
					&& (WLD.block[2][p3] & 0x1F) == 5
					&& (WLD.block[2][p4] & 0x1F) == 5
				) {
					// mark as "water"
					WLD.block[13][p4] = 255;
				}
				else
				{
					// snow/lava/swamp/deadly water/ice floes/...
					WLD.block[13][p4] = 254;
					// counter of uncounted passable areas
					count--;
				}
			}
			else
			{
				// mark as "land"
				WLD.block[13][p4] = 253;
			}
		}
	}
	// first color to look at
	var list = [];
	// erase
	for(i = 0; i < 250; i++)
	{
		WLD.areas[i].id = 0;
		WLD.areas[i].x = 0;
		WLD.areas[i].y = 0;
		WLD.areas[i].mass = 0;
	}
	// I actually dislike this part of the code, not a very efficient flood fill, but it should get the job done
	while(count > 0 && k < 250)
	{
		for(i = 0; i < WLD.size; i++)
		{
			j = WLD.block[13][i];
			if(j == 253 || j == 255) break;
		}
		if(i == WLD.size) { alert('Virhe!'); break; }
		x = i % w;
		y = (i / w) | 0;
		// 253 -> 1 (land), 255 -> 2 (water)
		WLD.areas[k].id = i + (j == 255);
		WLD.areas[k].x = x;
		WLD.areas[k].y = y;
		WLD.areas[k].mass = 1;
		// mark index
		WLD.block[13][i] = k;
		list[m = l = 0] = i;
		while(m <= l)
		{
			i = list[m++];
			x = i % w;
			y = (i / w) | 0;
			x1 = (w + x - 1) % w;
			x2 = (x + 1) % w;
			y1 = (h + y - 1) % h;
			y2 = (y + 1) % h;
			if(y & 1)
			{
				p1 = y1 * w + x;
				p2 = y1 * w + x2;
				p5 = y2 * w + x;
				p6 = y2 * w + x2;
			}
			else
			{
				p1 = y1 * w + x1;
				p2 = y1 * w + x;
				p5 = y2 * w + x1;
				p6 = y2 * w + x;
			}
			p3 = y * w + x1;
			p4 = y * w + x2;
			// check points for matching land/water
			if(WLD.block[13][p1] == j)
			{
				list[++l] = p1;
				WLD.block[13][p1] = k;
				WLD.areas[k].mass++;
			}
			if(WLD.block[13][p2] == j)
			{
				list[++l] = p2;
				WLD.block[13][p2] = k;
				WLD.areas[k].mass++;
			}
			if(WLD.block[13][p3] == j)
			{
				list[++l] = p3;
				WLD.block[13][p3] = k;
				WLD.areas[k].mass++;
			}
			if(WLD.block[13][p4] == j)
			{
				list[++l] = p4;
				WLD.block[13][p4] = k;
				WLD.areas[k].mass++;
			}
			if(WLD.block[13][p5] == j)
			{
				list[++l] = p5;
				WLD.block[13][p5] = k;
				WLD.areas[k].mass++;
			}
			if(WLD.block[13][p6] == j)
			{
				list[++l] = p6;
				WLD.block[13][p6] = k;
				WLD.areas[k].mass++;
			}
		}
		count -= WLD.areas[k++].mass;
	}
}

function save_the_world(WLD) {
	var i = maxi = j = c = p = 0;
	var w = WLD.width, h = WLD.height;
	var s = w * h;
	var s4 = w * 4;
	var s8 = s4 * 2;
	var s12 = s4 * 3;
	// recalculate these
	calculate_areas(WLD);
	calculate_gouraud(WLD);
	calculate_sites(WLD);
	calculate_resources(WLD);
	// get title
	WLD.title = $('#title').val();
	WLD.author = $('#author').val();
	// go through animals
	for(i = j = 0, maxi = WLD.animal.length; i < maxi; i++)
	{
		WLD.block[3][j] = WLD.animal[i]['id'];
		WLD.block[6][j++] = WLD.animal[i]['x'] & 0xFF;
		WLD.block[3][j] = (WLD.animal[i]['x'] >> 8) & 0xFF;
		WLD.block[6][j++] = 0;
		WLD.block[3][j] = WLD.animal[i]['y'] & 0xFF;
		WLD.block[6][j++] = (WLD.animal[i]['y'] >> 8) & 0xFF;
	}
	// Unicode to Code Page 437
	for(i = j = 0; i < WLD.title.length; i++)
	{
		c = CP437.indexOf( WLD.title.charCodeAt(i) );
		if( c < 1 ) c = 255;
		WLD.block[7][j++] = c;
	}
	for(j = 23, i = 0; i < WLD.author.length; i++)
	{
		c = CP437.indexOf( WLD.author.charCodeAt(i) );
		if( c < 1 ) c = 255;
		WLD.block[7][j++] = c;
	}
	WLD.block[7][42] = WLD.type;
	for(i = 0; i < 7; i++)
	{
		WLD.block[7][43 + i] = WLD.player[i]['id'];
		WLD.block[7][50 + i * 2] = WLD.player[i]['x'] & 0xFF;
		WLD.block[7][51 + i * 2] = (WLD.player[i]['x'] >> 8) & 0xFF;
		WLD.block[7][64 + i * 2] = WLD.player[i]['y'] & 0xFF;
		WLD.block[7][65 + i * 2] = (WLD.player[i]['y'] >> 8) & 0xFF;
	}
	// create a canvas
	var canvas = $(document.createElement('canvas')).attr('width', w * 4).attr('height', h);
	var buffer = canvas[0].getContext('2d');
	// create image buffer
	var imagebuffer = buffer.getImageData(0, 0, w * 4, h);
	var image = imagebuffer.data;
	// and then we start drawing
	for(i = y = 0; y < h; y++)
	{
		for(j = y * w * 16, x = 0; x < w; x++, i++)
		{
			// red channel
			image[j] = WLD.block[0][i];
			image[s4 + j] = WLD.block[4][i];
			image[s8 + j] = WLD.block[3][i];
			image[s12 + j++] = WLD.block[8][i];
			// green channel
			image[j] = WLD.block[1][i];
			image[s4 + j] = WLD.block[5][i];
			image[s8 + j] = WLD.block[6][i];
			image[s12 + j++] = WLD.block[12][i];
			// blue channel
			image[j] = WLD.block[2][i];
			image[s4 + j] = WLD.block[11][i];
			image[s8 + j] = WLD.block[7][i];
			image[s12 + j++] = WLD.block[13][i];
			// alpha channel
			image[j] = 255;
			image[s4 + j] = 255;
			image[s8 + j] = 255;
			image[s12 + j++] = 255;
		}
	}
	// draw image to canvas
	buffer.putImageData(imagebuffer, 0, 0);
	// send AJAX request
	var data = canvas[0].toDataURL('image/png');
	$.ajax({
		type: 'POST',
		url: 'swd.php',
		contentType: 'canvas/upload',
		processData: false,
		data: data,
		success: function(file){window.location.href="swd.php?file=" + file;}
	});
}

// The Settlers II PNG World Map object
function S2WLDSWDPNG(PNG) {
	// initialize variables we use
	var x = y = i = j = maxi = 0;
	// maybe there is use for this?
	this.raw = PNG;
	// header & footer information
	this.title = '';
	this.author = '';
	this.type = 0;
	this.players = 0;
	this.player = [
		new IDXY(0, 65535, 65535),
		new IDXY(0, 65535, 65535),
		new IDXY(0, 65535, 65535),
		new IDXY(0, 65535, 65535),
		new IDXY(0, 65535, 65535),
		new IDXY(0, 65535, 65535),
		new IDXY(0, 65535, 65535)
	];
	this.animal = [];
	this.areas = [];
	for(i = 0, maxi = 250; i < maxi; i++) this.areas[i] = new IDXYMASS(0, 0, 0, 0);
	this.width = PNG.width / 4;
	this.height = PNG.height;
	this.size = this.width * this.height;
	// make it easy to find nearby nodes (6 nodes * 4 bytes = 24)
	this.nodes = new ArrayBuffer(this.size * 24);
	this.nodeindex = new Array();
	for(i = 0, y = -1; i < this.size; i++)
	{
		// grab me some memory
		this.nodeindex[i] = new Uint32Array(this.nodes, i * 24, 6);
		// x and y
		x = i % this.width;
		if (x == 0)
		{
			y++;
			j = y & 1;
		}
		// left, right
		this.nodeindex[i][0] = y * this.width + ((this.width + x - 1) % this.width);
		this.nodeindex[i][1] = y * this.width + ((x + 1) % this.width);
		// top left, top right
		this.nodeindex[i][2] = ((this.height + y - 1) % this.height) * this.width + ((this.width + x - 1 + j) % this.width);
		this.nodeindex[i][3] = ((this.height + y - 1) % this.height) * this.width + ((x + j) % this.width);
		// bottom left, bottom right
		this.nodeindex[i][4] = ((y + 1) % this.height) * this.width + ((this.width + x - 1 + j) % this.width);
		this.nodeindex[i][5] = ((y + 1) % this.height) * this.width + ((x + j) % this.width);
	}
	// I love new JavaScript features! Typed Arrays FTW!
	this.blocks = new ArrayBuffer(this.size * 14);
	// 14 map data blocks
	this.block = [
		// 0: height
		new Uint8Array(this.blocks, 0, this.size),
		// 1: texture 1
		new Uint8Array(this.blocks, this.size, this.size),
		// 2: texture 2
		new Uint8Array(this.blocks, this.size * 2, this.size),
		// 3: roads
		new Uint8Array(this.blocks, this.size * 3, this.size),
		// 4: object index
		new Uint8Array(this.blocks, this.size * 4, this.size),
		// 5: object type
		new Uint8Array(this.blocks, this.size * 5, this.size),
		// 6: animals
		new Uint8Array(this.blocks, this.size * 6, this.size),
		// 7: unknown / null
		new Uint8Array(this.blocks, this.size * 7, this.size),
		// 8: build sites
		new Uint8Array(this.blocks, this.size * 8, this.size),
		// 9: unknown / 7
		new Uint8Array(this.blocks, this.size * 9, this.size),
		// 10: real time objects (cursor position etc.)
		new Uint8Array(this.blocks, this.size * 10, this.size),
		// 11: resources
		new Uint8Array(this.blocks, this.size * 11, this.size),
		// 12: gouraud shading
		new Uint8Array(this.blocks, this.size * 12, this.size),
		// 13: water/land/impassable index
		new Uint8Array(this.blocks, this.size * 13, this.size)
	];

	// create a canvas, get 2D buffer, jQuerify the element
	var canvas = document.createElement('canvas');
	var buffer = canvas.getContext('2d');
	$(canvas).attr('width', PNG.width).attr('height', PNG.height);
	buffer.drawImage(PNG, 0, 0);
	
	// get header and footer information
	var imagebuffer = buffer.getImageData(this.width * 2, 0, this.width, this.height);
	var image = imagebuffer.data;
	// start off with animals: keep reading until the end or until ID for animal is 0
	for(j = i = 0, maxi = this.size * 4 - 11; i < maxi, image[i] > 0; i+=12)
	{
		// extract red (0), green (1), skip, skip, red (4), green (5) EMPTY, skip, skip, red (8), green (9), skip, skip
		x = image[i + 1] | (image[i + 4]) << 8;
		y = image[i + 8] | (image[i + 9]) << 8;
		this.animal[j++] = new IDXY(image[i], x, y);
	}
	// title
	var text = new Uint8Array(new ArrayBuffer(23));
	for(i = 0; i < 23, image[i * 4 + 2] > 0; i++)
	{
		text[i] = image[i * 4 + 2];
	}
	// single call to fromCharCode, might be more efficient, might be not (also convert Code Page 437 to Unicode)
	if(i) this.title = String.fromCharCode(
		CP437[ text[0] ],
		CP437[ text[1] ],
		CP437[ text[2] ],
		CP437[ text[3] ],
		CP437[ text[4] ],
		CP437[ text[5] ],
		CP437[ text[6] ],
		CP437[ text[7] ],
		CP437[ text[8] ],
		CP437[ text[9] ],
		CP437[ text[10] ],
		CP437[ text[11] ],
		CP437[ text[12] ],
		CP437[ text[13] ],
		CP437[ text[14] ],
		CP437[ text[15] ],
		CP437[ text[16] ],
		CP437[ text[17] ],
		CP437[ text[18] ],
		CP437[ text[19] ],
		CP437[ text[20] ],
		CP437[ text[21] ],
		CP437[ text[22] ] ).substr(0, i);
	// author (23 * 4 + 2 = 94)
	for(i = 0; i < 19, image[i * 4 + 94] > 0; i++)
	{
		text[i] = image[i * 4 + 94];
	}
	// single call to fromCharCode, might be more efficient, might be not (also convert Code Page 437 to Unicode)
	if(i) this.author = String.fromCharCode(
		CP437[ text[0] ],
		CP437[ text[1] ],
		CP437[ text[2] ],
		CP437[ text[3] ],
		CP437[ text[4] ],
		CP437[ text[5] ],
		CP437[ text[6] ],
		CP437[ text[7] ],
		CP437[ text[8] ],
		CP437[ text[9] ],
		CP437[ text[10] ],
		CP437[ text[11] ],
		CP437[ text[12] ],
		CP437[ text[13] ],
		CP437[ text[14] ],
		CP437[ text[15] ],
		CP437[ text[16] ],
		CP437[ text[17] ],
		CP437[ text[18] ] ).substr(0, i);
	// terrain type (42 * 4 + 2 = 170)
	this.type = image[170];
	// player information (43 * 4 + 2 = 174)
	for(i = 0; i < 7; i++)
	{
		j = 174 + i * 4;
		// read x & y position
		x = image[202 + i * 8] | image[206 + i * 8] << 8;
		y = image[258 + i * 8] | image[262 + i * 8] << 8;
		// validate location
		if( is_valid_hq_pos(x, y, this.width, this.height) )
		{
			this.players++;
		}
		else
		{
			x = y = 65535;
		}
		// add player
		this.player[i].id = image[j];
		this.player[i].x = x;
		this.player[i].y = y;
	}
	
	// parse blocks: height, texture 1, texture 2
	var imagebuffer = buffer.getImageData(0, 0, this.width, this.height);
	var image = imagebuffer.data;
	for(i = 0; i < this.size; i++)
	{
		this.block[0][i] = image[i * 4];
		this.block[1][i] = image[i * 4 + 1];
		this.block[2][i] = image[i * 4 + 2];
	}
	
	// parse blocks: object index, object type, resources
	var imagebuffer = buffer.getImageData(this.width, 0, this.width, this.height);
	var image = imagebuffer.data;
	for(i = 0; i < this.size; i++)
	{
		this.block[4][i] = image[i * 4];
		this.block[5][i] = image[i * 4 + 1];
		this.block[11][i] = image[i * 4 + 2];
	}
	
	// parse blocks: building sites, gouraud, areas
	var imagebuffer = buffer.getImageData(this.width * 3, 0, this.width, this.height);
	var image = imagebuffer.data;
	for(i = 0; i < this.size; i++)
	{
		this.block[8][i] = image[i * 4];
		this.block[12][i] = image[i * 4 + 1];
		this.block[13][i] = image[i * 4 + 2];
	}

}

function MerrisGouraud(ev) {
	// ev.target = PNG image
	var WLD = ev.target.map;
	// prepare some variables
	var x = y = i = j = k = l = p1y = p4y = p1x = p2x = p3x = p4x = 0;
	var w = WLD.width, h = WLD.height;
	var tk = WLD.type * 256;
	// rip color information table
	var gouraud = $('#gouraud canvas');
	gouraud.attr('width', 768).attr('height', 256);
	var buffer = gouraud[0].getContext('2d');
	buffer.drawImage(ev.target, 0, 0);
	var colorshade = buffer.getImageData(0, 0, 768, 256);
	var color = colorshade.data;
	// create output buffer as well
	var imagedata = buffer.getImageData(0, 0, w, h);
	var image = imagedata.data;
	// calculate gouraud shading
	for(y = 0; y < h; y++) {
		// calculate point 1 & 4 Y location
		p1y = (h + y - 1) % h;
		p4y = (y + 1) % h;
		for(x = 0; x < w; x++) {
			// calculate all four points X location
			p1x = (x + (y & 1)) % w;
			p2x = (w + x - 1 + (y & 1)) % w;
			p3x = (w + x - 1) % w;
			p4x = (w + p1x - 2) % w;
			// initialize shading
			i = 96;
			k = (y * w + x);
			kp1 = (p1y * w + p1x);
			kp2 = (p1y * w + p2x);
			kp3 = (y * w + p3x);
			kp4 = (p4y * w + p4x);
			j = WLD.block[0][k];
			i += 12 * (WLD.block[0][kp1] - j);
			i += 8 * (WLD.block[0][kp2] - j);
			i -= 8 * (WLD.block[0][kp3] - j);
			i -= 16 * (WLD.block[0][kp4] - j);
			i = Math.max(Math.min(255, i), 0);
			// color mix between two index systems
			j = (i * 768 + COLOR_TYPE_M[WLD.type][ WLD.block[1][k] & 0x1F ] + tk) * 4;
			j2 = (i * 768 + COLOR_TYPE_O[WLD.type][ WLD.block[1][kp1] & 0x1F ] + tk) * 4;
			l = (i * 768 + COLOR_TYPE_O[WLD.type][ WLD.block[2][k] & 0x1F ] + tk) * 4;
			l2 = (i * 768 + COLOR_TYPE_M[WLD.type][ WLD.block[2][kp1] & 0x1F ] + tk) * 4;
			// blend the colors together
			image[k * 4] = (color[j] + color[l] + color[j2] + color[l2]) / 4 | 0;
			image[k * 4 + 1] = (color[j + 1] + color[l + 1] + color[j2 + 1] + color[l2 + 1]) / 4 | 0;
			image[k * 4 + 2] = (color[j + 2] + color[l + 2] + color[j2 + 2] + color[l2 + 2]) / 4 | 0;
			image[k * 4 + 3] = 255 - ( WLD.block[1][k] == 5) * 128 - ( WLD.block[2][k] == 5) * 64;
			
			// check object types
			switch(WLD.block[5][k])
			{
				// trees
				case 196:
				case 197:
				case 198:
					image[k * 4] = (image[k * 4 + 1] / 3) | 0;
					image[k * 4 + 1] = ((image[k * 4 + 1] / 2) | 0) + 48;
					image[k * 4 + 2] = (image[k * 4 + 1] / 3) | 0;
					break;
				// granite
				case 204:
				case 205:
					j = WLD.block[4][k] / 10;
					image[k * 4] = Math.min(255, image[k * 4] * (1 - j) + 160 * j);
					image[k * 4 + 1] = Math.min(255, image[k * 4 + 1] * (1 - j) + 160 * j);
					image[k * 4 + 2] = Math.min(255, image[k * 4 + 2] * (1 - j) + 160 * j);
					break;
			}
		}
	}
	// draw gouraud shading
	gouraud.attr('width', w).attr('height', h).attr('class', 'water' + WLD.type);
	buffer.putImageData(imagedata, 0, 0);
}

function DrawDebug(block_id) {
	var debug = $('#debug');
	debug.attr('width', document.map.width).attr('height', document.map.height);
	var buffer = debug[0].getContext('2d');
	var imagebuffer = buffer.getImageData(0, 0, document.map.width, document.map.height);
	var image = imagebuffer.data;
	
	for(var i = 0; i < document.map.size; i++)
	{
		image[i * 4] = 255 - document.map.block[block_id][i];
		image[i * 4 + 1] = 255 - document.map.block[block_id][i];
		image[i * 4 + 2] = 255 - document.map.block[block_id][i];
		image[i * 4 + 3] = 255;
	}
	
	buffer.putImageData(imagebuffer, 0, 0);
}

function Height_Variety(raise, lower, maxdifference)
{
	var WLD = document.map;
	var i = i1 = i2 = i3 = i4 = i5 = i6 = n = 0, count = 0;
	var w = WLD.width, h = WLD.height, s = WLD.size;
	var badtextures = [2, 3, 5, 6, 16, 17, 19, 20, 21, 22];
	
	raise = Math.min(Math.max(raise, 0), 3);
	lower = Math.min(Math.max(lower, 0), 2);
	maxdifference = Math.min(Math.max(maxdifference, 1), 5);
	
	for(i = 0; i < s; i++)
	{
		// check texture vertexes
		i1 = WLD.nodeindex[i][0];
		i3 = WLD.nodeindex[i][2];
		i4 = WLD.nodeindex[i][3];
		// see if any texture close by is one that we do not want to touch
		if( badtextures.indexOf(WLD.block[1][i] & 0x1F) == -1
			&& badtextures.indexOf(WLD.block[2][i] & 0x1F) == -1
			&& badtextures.indexOf(WLD.block[2][i1] & 0x1F) == -1
			&& badtextures.indexOf(WLD.block[1][i3] & 0x1F) == -1
			&& badtextures.indexOf(WLD.block[2][i3] & 0x1F) == -1
			&& badtextures.indexOf(WLD.block[1][i4] & 0x1F) == -1
		) {
			// do the randomizing
			n = Math.min(60, Math.max(0, WLD.block[0][i] + ((Math.random() * (raise + 1)) | 0) - lower));
			i2 = WLD.nodeindex[i][1];
			i5 = WLD.nodeindex[i][4];
			i6 = WLD.nodeindex[i][5];
			// make sure the height difference is not too big
			if( WLD.block[0][i] !== n
				&& Math.abs(WLD.block[0][i1] - n) <= maxdifference
				&& Math.abs(WLD.block[0][i2] - n) <= maxdifference
				&& Math.abs(WLD.block[0][i3] - n) <= maxdifference
				&& Math.abs(WLD.block[0][i4] - n) <= maxdifference
				&& Math.abs(WLD.block[0][i5] - n) <= maxdifference
				&& Math.abs(WLD.block[0][i6] - n) <= maxdifference
			) {
				// yay, the new value is ok!
				WLD.block[0][i] = n;
				count++;
			}
		}
	}
	//alert('Changed ' + ((count / s * 100) | 0) + '%!');
}

/*
function HeightVariety() {
	var WLD = document.map;
	var w = WLD.width, h = WLD.height;
	var x = x1 = x2 = y = y1 = y2 = 0;
	var n = p1 = p2 = p3 = p4 = p5 = p6 = p7 = 0;
	// we do not touch these textures
	var badtextures = [2, 3, 5, 6, 16, 17, 19, 20, 21, 22];
	// loop through everything
	for(y = 0; y < h; y++)
	{
		y1 = (h + y - 1) % h;
		y2 = (h + y + 1) % h;
		for(x = 0; x < w; x++)
		{
			x1 = (w + x - 1) % w;
			x2 = (w + x + 1) % w;
			// find out location of each six textures we want to check
			if(y & 1) {
				p1 = y1 * w + x;
				p2 = y1 * w + x2;
			}
			else
			{
				p1 = y1 * w + x1;
				p2 = y1 * w + x;
			}
			p3 = y * w + x1;
			p4 = y * w + x;
			// see if any texture close by is one that we do not want to touch
			if( badtextures.indexOf(WLD.block[1][p1] & 0x1F) == -1
				&& badtextures.indexOf(WLD.block[1][p2] & 0x1F) == -1
				&& badtextures.indexOf(WLD.block[1][p4] & 0x1F) == -1
				&& badtextures.indexOf(WLD.block[2][p1] & 0x1F) == -1
				&& badtextures.indexOf(WLD.block[2][p3] & 0x1F) == -1
				&& badtextures.indexOf(WLD.block[2][p4] & 0x1F) == -1
			) {
				// ok, we can randomize stuff!
				n = Math.min(60, Math.max(0, WLD.block[0][p4] + ((Math.random() * 3) | 0) - 1));
				// need more location checks...
				p5 = y * w + x2;
				if(y & 1)
				{
					p6 = y2 * w + x;
					p7 = y2 * w + x2;
				}
				else
				{
					p6 = y2 * w + x1;
					p7 = y2 * w + x;
				}
				// make sure the height difference is not too big
				if( (WLD.block[0][p1] - n) < 6
					&& (WLD.block[0][p2] - n) < 6
					&& (WLD.block[0][p3] - n) < 6
					&& (WLD.block[0][p5] - n) < 6
					&& (WLD.block[0][p6] - n) < 6
					&& (WLD.block[0][p7] - n) < 6
				) {
					// yay, the new value is ok!
					WLD.block[0][p4] = n;
				}
			}
		}
	}
}
*/

function DrawGouraud(drawfunction, id) {
	document.gouraud = id;
	var gouraud = new Image();
	gouraud.onload = drawfunction;
	gouraud.map = document.map;
	gouraud.src = 'type' + id + '.png';
}

function MapLoaded(ev) {
	// create map object which parses the received PNG image
	var WLD = document.map = new S2WLDSWDPNG(ev.target);
	// output information
	$('#title').val(WLD.title);
	$('#author').val(WLD.author);
	$('#terrain' + WLD.type).attr('checked', 'checked');
	$('#players').text(WLD.players);
	$('#animals').text(WLD.animal.length);
	for(i = 0, maxi = 7; i < maxi; i++)
	{
		$('#hq' + i + 'x').text(WLD.player[i].x);
		$('#hq' + i + 'y').text(WLD.player[i].y);
		$('#leader' + i).val(WLD.player[i].id);
	}
	// draw a custom gouraud
	DrawGouraud(MerrisGouraud, document.gouraud);
	// open editor window
	$("#editor").dialog("open");
}