(function(global) {
	var colors = [],
		colorMap = document.createElement('img'),
		// Merri's custom index for light map texture shading (0xFF = invalid/unused texture)
		COLOR_TYPE_M = [
			[236, 195, 124, 231, 199, 242, 242, 199, 233, 232, 231, 195, 194, 193, 217, 232, 249, 254, 169, 242, 249, 249, 249,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,195,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
			[98, 145, 23, 41, 85, 42, 42, 85, 32, 166, 33, 113, 245, 41, 34, 33, 251, 254, 97, 42, 251, 251, 251,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,113,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
			[122, 118, 179, 178, 182, 242, 242, 182, 122, 172, 101, 120, 144, 119, 171, 101, 249, 252, 123, 242, 249, 249, 249,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,120,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]
		],
		// Original game index for light map texture shading (0xFF = invalid/unused texture)
		COLOR_TYPE_O = [
			[233, 216, 123, 233, 199, 240, 240, 199, 231, 233, 230, 216, 216, 215, 236, 231, 57, 254, 216, 240, 57, 57, 57,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,216,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
			[114, 167, 139, 160, 85, 42, 42, 85, 165, 166, 166, 33, 212, 212, 167, 114, 248, 254, 160, 42, 248, 248, 248,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,33,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
			[123, 116, 244, 244, 183, 240, 240, 183, 36, 102, 123, 117, 118, 118, 233, 120, 248, 254, 122, 240, 248, 248, 248,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,117,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
			0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]
		],
		TREE_INFO = [[
			{red: 21, green: 73, blue: 15, alpha: 0.62352941176470588235294117647059, name: 'Pine'},
			{red: 23, green: 70, blue: 27, alpha: 0.55686274509803921568627450980392, name: 'Birch'},
			{red: 21, green: 65, blue: 16, alpha: 0.70196078431372549019607843137255, name: 'Oak'},
			{red: 48, green: 87, blue: 24, alpha: 0.32549019607843137254901960784314, name: 'Palm 1'},
			{red: 42, green: 78, blue: 19, alpha: 0.25490196078431372549019607843137, name: 'Palm 2'},
			{red: 34, green: 73, blue: 19, alpha: 0.36470588235294117647058823529412, name: 'Pine Apple'},
			{red: 34, green: 71, blue: 18, alpha: 0.45882352941176470588235294117647, name: 'Cypress'},
			{red: 131, green: 53, blue: 36, alpha: 0.38431372549019607843137254901961, name: 'Cherry'},
			{red: 20, green: 78, blue: 18, alpha: 0.46274509803921568627450980392157, name: 'Fir'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 1'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 2'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 3'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 4'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 5'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 6'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 7'}
		], [
			{red: 117, green: 80, blue: 62, alpha: 0.38431372549019607843137254901961, name: 'Spider'},
			{red: 127, green: 70, blue: 49, alpha: 0.45490196078431372549019607843137, name: 'Marley'},
			{red: 117, green: 80, blue: 62, alpha: 0.38431372549019607843137254901961, name: 'Spider'},
			{red: 127, green: 70, blue: 49, alpha: 0.45490196078431372549019607843137, name: 'Marley'},
			{red: 117, green: 80, blue: 62, alpha: 0.38431372549019607843137254901961, name: 'Spider'},
			{red: 34, green: 73, blue: 19, alpha: 0.36470588235294117647058823529412, name: 'Pine Apple'},
			{red: 117, green: 80, blue: 62, alpha: 0.38431372549019607843137254901961, name: 'Spider'},
			{red: 131, green: 53, blue: 36, alpha: 0.38431372549019607843137254901961, name: 'Cherry'},
			{red: 127, green: 70, blue: 49, alpha: 0.45490196078431372549019607843137, name: 'Marley'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 1'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 2'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 3'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 4'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 5'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 6'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 7'}
		], [
			{red: 88, green: 99, blue: 77, alpha: 0.50196078431372549019607843137255, name: 'Pine'},
			{red: 63, green: 82, blue: 58, alpha: 0.49019607843137254901960784313725, name: 'Birch'},
			{red: 77, green: 94, blue: 60, alpha: 0.4078431372549019607843137254902, name: 'Fir'},
			{red: 48, green: 87, blue: 24, alpha: 0.32549019607843137254901960784314, name: 'Palm 1'},
			{red: 42, green: 78, blue: 19, alpha: 0.25490196078431372549019607843137, name: 'Palm 2'},
			{red: 34, green: 73, blue: 19, alpha: 0.36470588235294117647058823529412, name: 'Pine Apple'},
			{red: 83, green: 85, blue: 58, alpha: 0.41176470588235294117647058823529, name: 'Cypress'},
			{red: 77, green: 94, blue: 60, alpha: 0.4078431372549019607843137254902, name: 'Fir'},
			{red: 77, green: 94, blue: 60, alpha: 0.4078431372549019607843137254902, name: 'Fir'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 1'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 2'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 3'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 4'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 5'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 6'},
			{red: 0, green: 0, blue: 0, alpha: 0.1, name: 'Unused 7'}
		]],
		CP437 = [0, 9786, 9787, 9829, 9830, 9827, 9824, 8226, 9688, 9675, 9689, 9794, 9792, 9834, 9835, 9788, 9658, 9668, 8597, 8252, 182, 167,
	9644, 8616, 8593, 8595, 8594, 8592, 8735, 8596, 9650, 9660, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
	52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
	87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
	118, 119, 120, 121, 122, 123, 124, 125, 126, 8962, 199, 252, 233, 226, 228, 224, 229, 231, 234, 235, 232, 239, 238, 236, 196, 197, 201, 230,
	198, 244, 246, 242, 251, 249, 255, 214, 220, 162, 163, 165, 8359, 402, 225, 237, 243, 250, 241, 209, 170, 186, 191, 8976, 172, 189, 188, 161,
	171, 187, 9617, 9618, 9619, 9474, 9508, 9569, 9570, 9558, 9557, 9571, 9553, 9559, 9565, 9564, 9563, 9488, 9492, 9524, 9516, 9500, 37, 37,
	9566, 567, 9562, 9556, 9577, 9574, 9568, 9552, 9580, 9575, 9576, 9572, 9573, 9561, 9560, 9554, 9555, 9579, 9578, 9496, 9484, 9608, 9604,
	9612, 9616, 9600, 945, 223, 915, 960, 931, 963, 181, 964, 934, 920, 937, 948, 8734, 966, 949, 8745, 8801, 177, 8805, 8804, 8992, 8993, 247,
	8776, 176, 8729, 183, 8730, 8319, 178, 9632, 160],
		map = new Map(),
		x,
		y,
		i,
		j,
		k,
		l,
		around,
		aroundExpandTo,
		baseLevel,
		borderProtection,
		data,
		deletedNodes,
		height,
		index,
		mass,
		massRatio,
		nodes,
		players = [],
		size,
		seedMap,
		startingPoints,
		total,
		value,
		viewType,
		width;

	function getNodesByIndex(index) {
		var x = index % width,
			y = (index - x) / width,
			xL = (x > 0 ? x : width) - 1,
			xR = (x + 1) % width,
			yT = ((y > 0 ? y : height) - 1) * width,
			yB = ((y + 1) % height) * width,
			odd = (y & 1) === 1;

		y *= width;

		if(odd) {
			// odd
			return {
				left: y + xL,
				right: y + xR,
				topLeft: yT + x,
				topRight: yT + xR,
				bottomLeft: yB + x,
				bottomRight: yB + xR
			}
		} else {
			// even
			return {
				left: y + xL,
				right: y + xR,
				topLeft: yT + xL,
				topRight: yT + x,
				bottomLeft: yB + xL,
				bottomRight: yB + x
			}
		}
	}

	function expandTo(index, value, current) {
		aroundExpandTo = getNodesByIndex(index);

		seedMap[index] = value;
		if(current !== void 0) {
			delete nodes[current];
			deletedNodes.push(current);
		}
		mass++;

		Object.keys(aroundExpandTo).forEach(function(key) {
			index = aroundExpandTo[key];
			if(seedMap[index] === 0) {
				seedMap[index] = 1;
				if(deletedNodes.length) {
					nodes[deletedNodes.pop()] = index
				} else {
					nodes.push(index);
				}
			}
		});
	}

	function seed(options) {
		//if(!options || !options.length) options = {};
		console.time('Generate');

		var likelyhood = options.likelyhood,
			givenStartingPoints = ~~options.startingPoints,
			givenMassRatio = ~~options.massRatio

		//width = 1024 || (~~(Math.random() * 20) + 7) * 16,
		//height = 1024 || (~~(Math.random() * 20) + 7) * 16,
		width = ~~options.width;
		height = ~~options.height;
		size = width * height;
		borderProtection = ~~options.borderProtection;
		if(borderProtection) borderProtection = ~~(Math.min(width, height) / borderProtection);
		seedMap = new Uint8Array(size);

		// sanitize user input
		if(givenStartingPoints < 1) givenStartingPoints = 1;
		else if(givenStartingPoints > 512) givenStartingPoints = 512;
		if(givenStartingPoints > size >> 2) givenStartingPoints = size >> 2;
		
		if(givenMassRatio < 1) givenMassRatio = 1;
		else if(givenMassRatio > 99) givenMassRatio = 99;

		nodes = [];
		deletedNodes = [];
		mass = 0;
		massRatio = ~~(size / 100 * givenMassRatio);
		startingPoints = 0;

		map = map.initialize(width, height);
		data = map.getRawData();

		// randomize some starting points
		value = 255;
		while(startingPoints < givenStartingPoints) {
			x = ~~(Math.random() * (width - borderProtection * 2)) + borderProtection;
			y = ~~(Math.random() * (height - borderProtection * 2)) + borderProtection;
			index = y * width + x;

			if(seedMap[index] === 0) {
				expandTo(index, value);
				startingPoints++;
			}
		}

		// do the land expansion
		if(mass > 0) {
			while(mass < massRatio) {
				value--;
				for(i = nodes.length; i > 0; --i) {
					index = nodes[i];
					if(index !== void 0) {
						total = 0;
						around = getNodesByIndex(index);

						if(seedMap[around.left] > 1) total++;
						if(seedMap[around.right] > 1) total++;
						if(seedMap[around.topLeft] > 1) total++;
						if(seedMap[around.topRight] > 1) total++;
						if(seedMap[around.bottomLeft] > 1) total++;
						if(seedMap[around.bottomRight] > 1) total++;

						if(Math.random() <= likelyhood[total]) expandTo(index, ~~(value / 7 * total) + 2, i);
					}
				}
				if(value > 8) {}
				else if(value === 8 && Math.random() <= likelyhood[1]) value = 256;
				else if(value === 7 && Math.random() <= likelyhood[2]) value = 56;
				else if(value === 6 && Math.random() <= likelyhood[3]) value = 64;
				else if(value === 5 && Math.random() <= likelyhood[4]) value = 72;
				else if(value === 4 && Math.random() <= likelyhood[5]) value = 80;
				else if(value === 3 && Math.random() <= likelyhood[6]) value = 96;
				else /*if(value === 2) */value = 128;
			}
		}

		console.timeEnd('Generate');
	}

	//options: baseLevel
	function createHeight(options) {
		//if(!options || !options.length) options = {};
		console.time('Height map');

		baseLevel = options.baseLevel = ~~options.baseLevel;
		options.groundLevel = Math.abs(~~options.groundLevel);
		options.flatten = Math.abs(options.flatten);
		options.noiseOnWater = !!options.noiseOnWater;

		if(options.groundLevel > 5) options.groundLevel = 5;
		if(options.flatten < 1) options.flatten = 1;
		else if(options.flatten > 30) options.flatten = 30;

		map.initializeHeight(options.baseLevel);

		// push land up or down before we start!
		i = options.baseLevel <= 30 ? options.groundLevel : -options.groundLevel;
		index = 0;
		for(y = 0; y < height; y++) {
			for(x = 0; x < width; x++) {
				if(seedMap[index] > 1) {
					map.changeHeight(x, y, 0, i);
				}
				index++;
			}
		}

		// draw the final height map based on what we have
		index = 0;
		for(y = 0; y < height; y++) {
			for(x = 0; x < width; x++) {
				value = seedMap[index];
				if(value > 1) {
					around = getNodesByIndex(index);
					// calculate avarage around node
					i = Math.round((seedMap[around.left] +
						seedMap[around.right] +
						seedMap[around.topLeft] +
						seedMap[around.topRight] +
						seedMap[around.bottomLeft] +
						seedMap[around.bottomRight]) / 6);
					// go up or down
					map.changeHeight(x, y, ((value & 15) & (i & 15)) / 2, ~~((value - i) / 8));
				}
				index++;
			}
		}

		// flatten
		if(options.flatten > 1) {
			baseLevel = ~~(baseLevel / options.flatten);
			for(i = 0; i < size; i++) {
				data[i] = ~~(data[i] / options.flatten);
			}
		}

		// some extra randomize
		if(options.randomize > 0) {
			if(!options.noiseOnWater) {
				index = 0;
				for(y = 0; y < height; y++) {
					for(x = 0; x < width; x++) {
						if(seedMap[index] > 1 || data[index] !== baseLevel) {
							map.changeHeight(x, y, 0, ~~(Math.random() * ((options.randomize * 2) + 1) - options.randomize));
						}
						index++;
					}
				}
			} else {
				index = 0;
				for(y = 0; y < height; y++) {
					for(x = 0; x < width; x++) {
						map.changeHeight(x, y, 0, ~~(Math.random() * ((options.randomize * 2) + 1) - options.randomize));
						index++;
					}
				}
			}
		}

		console.timeEnd('Height map');

		console.time('lightMap');
		map.calculateGouraud();
		console.timeEnd('lightMap');
	}

	function createBaseTextures(options) {
		var changed = false,
			i,
			mountainTextures = [1, 11, 12, 13],
			textureBlock1 = size * 1,
			textureBlock2 = size * 2,
			siteBlock = size * 8,
			siteNodes;

		console.time('Texture');

		// sanitize
		options.mountainGenerate = ~~options.mountainGenerate;
		options.seamless = !!~~options.seamless;
		options.texture = ~~options.texture & TEXTURE.TO_ID_VALUE;
		options.waterTexture = ~~options.waterTexture & TEXTURE.TO_ID_VALUE;

		map.initializeTexture(options.texture);

		// draw water texture
		for(i = 0; i < size; i++) {
			if(data[i] >= (baseLevel - 2) && data[i] <= (baseLevel + 2) && seedMap[i] < 2) {
				map.setTexture(i, options.waterTexture);
			}
		}

		console.time('Draw Mountains (requires x2 calculateSites)');
		map.calculateSites();
		
		// draw mountain texture
		if(options.mountainGenerate === 7) {
			for(i = 0; i < size; i++) {
				if(
					data[textureBlock1 + i] !== 0x04
					&& data[textureBlock1 + i] !== 0x07
					&& data[textureBlock1 + i] !== 0x11
					&& data[textureBlock2 + i] !== 0x04
					&& data[textureBlock2 + i] !== 0x07
					&& data[textureBlock2 + i] !== 0x11
				) {
					siteNodes = getNodesByIndex(i);
					if(
						(data[siteBlock + siteNodes.left] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.right] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.topLeft] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.topRight] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.bottomLeft] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.bottomRight] & 0xF7) === 0x01
					) {
						map.setTexture(i, mountainTextures[~~(Math.random() * 4)]);
					}
				}
			}
		} else if(options.mountainGenerate === 6) {
			for(i = 0; i < size; i++) {
				if(
					(data[siteBlock + i] & 0xF7) === 0x01
					&& data[textureBlock1 + i] !== 0x04
					&& data[textureBlock1 + i] !== 0x07
					&& data[textureBlock1 + i] !== 0x11
					&& data[textureBlock2 + i] !== 0x04
					&& data[textureBlock2 + i] !== 0x07
					&& data[textureBlock2 + i] !== 0x11
				) {
					siteNodes = getNodesByIndex(i);
					if(
						(data[siteBlock + siteNodes.left] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.right] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.topLeft] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.topRight] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.bottomLeft] & 0xF7) === 0x01
						&& (data[siteBlock + siteNodes.bottomRight] & 0xF7) === 0x01
					) {
						map.setTexture(i, mountainTextures[~~(Math.random() * 4)]);
					}
				}
			}
		} else {
			for(i = 0; i < size; i++) {
				if(
					(data[siteBlock + i] & 0xF7) === 0x01
					&& data[textureBlock1 + i] !== 0x04
					&& data[textureBlock1 + i] !== 0x07
					&& data[textureBlock1 + i] !== 0x11
					&& data[textureBlock2 + i] !== 0x04
					&& data[textureBlock2 + i] !== 0x07
					&& data[textureBlock2 + i] !== 0x11
				) {
					siteNodes = getNodesByIndex(i);
					if(
						options.mountainGenerate <= (((data[siteBlock + siteNodes.left] & 0xF7) === 0x01)
						+ ((data[siteBlock + siteNodes.right] & 0xF7) === 0x01)
						+ ((data[siteBlock + siteNodes.topLeft] & 0xF7) === 0x01)
						+ ((data[siteBlock + siteNodes.topRight] & 0xF7) === 0x01)
						+ ((data[siteBlock + siteNodes.bottomLeft] & 0xF7) === 0x01)
						+ ((data[siteBlock + siteNodes.bottomRight] & 0xF7) === 0x01))
					) {
						map.setTexture(i, mountainTextures[~~(Math.random() * 4)]);
					}
				}
			}
		}

		// seamless mode
		if(!options.seamless) {
			for(i = 0; i < width; i++) {
				switch(data[textureBlock1 + i]) {
				// savannah and steppe
				case 0x00:
				case 0x0E:
					map.setTexture(i, 0x03); // swamp
					break;
				// meadow
				case 0x08:
				case 0x09:
				case 0x0A:
				case 0x0F:
					map.setTexture(i, 0x03); // swamp
					break;
				// desert
				case 0x04:
				case 0x07:
					map.setTexture(i, 0x02); // snow
					break;
				// magenta
				case 0x11:
					map.setTexture(i, 0x10); // lava
					break;
				// mountain meadow
				case 0x12:
				case 0x22:
					map.setTexture(i, 0x10); // lava
					break;
				// mountain
				case 0x01:
				case 0x0B:
				case 0x0C:
				case 0x0D:
					map.setTexture(i, 0x02); // snow
					break;
				// water
				case 0x05:
				case 0x06:
					map.setTexture(i, 0x13); // water (no ships)
					break;
				default:
					switch(data[textureBlock2 + i]) {
					// savannah and steppe
					case 0x00:
					case 0x0E:
						map.setTexture(i, 0x03); // swamp
						break;
					// meadow
					case 0x08:
					case 0x09:
					case 0x0A:
					case 0x0F:
						map.setTexture(i, 0x03); // swamp
						break;
					// desert
					case 0x04:
					case 0x07:
						map.setTexture(i, 0x02); // snow
						break;
					// magenta
					case 0x11:
						map.setTexture(i, 0x10); // lava
						break;
					// mountain meadow
					case 0x12:
					case 0x22:
						map.setTexture(i, 0x10); // lava
						break;
					// mountain
					case 0x01:
					case 0x0B:
					case 0x0C:
					case 0x0D:
						map.setTexture(i, 0x02); // snow
						break;
					// water
					case 0x05:
					case 0x06:
						map.setTexture(i, 0x13); // water (no ships)
						break;
					}
				}
			}
			for(; i < size; i += width) {
				switch(data[textureBlock1 + i]) {
				// savannah and steppe
				case 0x00:
				case 0x0E:
					map.setTexture(i, 0x03); // swamp
					break;
				// meadow
				case 0x08:
				case 0x09:
				case 0x0A:
				case 0x0F:
					map.setTexture(i, 0x03); // swamp
					break;
				// desert
				case 0x04:
				case 0x07:
					map.setTexture(i, 0x02); // snow
					break;
				// magenta
				case 0x11:
					map.setTexture(i, 0x10); // lava
					break;
				// mountain meadow
				case 0x12:
				case 0x22:
					map.setTexture(i, 0x10); // lava
					break;
				// mountain
				case 0x01:
				case 0x0B:
				case 0x0C:
				case 0x0D:
					map.setTexture(i, 0x02); // snow
					break;
				// water
				case 0x05:
				case 0x06:
					map.setTexture(i, 0x13); // water (no ships)
					break;
				default:
					switch(data[textureBlock2 + i]) {
					// savannah and steppe
					case 0x00:
					case 0x0E:
						map.setTexture(i, 0x03); // swamp
						break;
					// meadow
					case 0x08:
					case 0x09:
					case 0x0A:
					case 0x0F:
						map.setTexture(i, 0x03); // swamp
						break;
					// desert
					case 0x04:
					case 0x07:
						map.setTexture(i, 0x02); // snow
						break;
					// magenta
					case 0x11:
						map.setTexture(i, 0x10); // lava
						break;
					// mountain meadow
					case 0x12:
					case 0x22:
						map.setTexture(i, 0x10); // lava
						break;
					// mountain
					case 0x01:
					case 0x0B:
					case 0x0C:
					case 0x0D:
						map.setTexture(i, 0x02); // snow
						break;
					// water
					case 0x05:
					case 0x06:
						map.setTexture(i, 0x13); // water (no ships)
						break;
					default:
					}
				}
			}
		}

		map.calculateSites();
		console.timeEnd('Draw Mountains (requires x2 calculateSites)');

		console.timeEnd('Texture');
	}

	function getRandomPlayerPositions(maxPlayerCount, radius) {
		players = [];

		console.time('getRandomPlayerPositions');

		// sanitize
		maxPlayerCount = ~~maxPlayerCount;
		if(maxPlayerCount < 0) maxPlayerCount = 0;
		else if(maxPlayerCount > 10) maxPlayerCount = 10;

		radius = ~~radius;

		function generateRandomPlayers(sites) {
			var index,
				nodes,
				x,
				y;

			if(sites.length > 0 && players.length < maxPlayerCount) {
				// randomize a position from given plausible sites
				index = sites[~~(Math.random() * sites.length)];
				x = index % width;
				y = ~~((index - x) / width);

				// getRadiusNodes returns a typed array; must convert it to regular array
				nodes = Array.apply([], map.getRadiusNodes(x, y, radius));

				// remove nodes near newly randomized player
				sites = sites.filter(function(index) {
					return nodes.indexOf(index) === -1;
				});

				// add player to list of known players
				players.push({
					index: index,
					x: x,
					y: y
				});

				// get the next player
				generateRandomPlayers(sites, radius);
			}
		}

		// start the recursive call (if necessary)
		if(maxPlayerCount > 0) generateRandomPlayers(map.getAllSitesOfType(SITE.CASTLE));

		console.timeEnd('getRandomPlayerPositions');

		return players;
	}

	function applyResources(options) {
		var i,
			j,
			k,
			eachTextureIsSameKind,
			usableLandmass = 0,
			newResource,
			nodes,
			resources = {
				freshWater: 0,
				mineCoal: 0,
				mineIronOre: 0,
				mineGold: 0,
				mineGranite: 0,
				fish: 0,
				granite: 0,
				tree: 0
			},
			texture,
			textureFlag,
			textures,
			textureBlocks = size,
			objectIndexBlock = size * 4,
			objectTypeBlock = size * 5,
			siteBlock = size * 8,
			touchBlock = size * 10,
			resourceBlock = size * 11;

		console.time('applyResources');

		// clean up
		for(i = 0; i < size; i++) {
			data[objectIndexBlock + i] = 0;
			data[objectTypeBlock + i] = 0;
		}

		options = options || {};
		// sanitize values
		options.treeRatio = (options.treeRatio !== void 0) ? ~~options.treeRatio : 33;
		if(options.treeRatio < 0) options.treeRatio = 0;
		else if(options.treeRatio > 50) options.treeRatio = 0.5;
		else options.treeRatio = options.treeRatio / 100;

		options.graniteRatio = (options.graniteRatio !== void 0) ? ~~options.graniteRatio : 15;
		if(options.graniteRatio < 0) options.graniteRatio = 0;
		else if(options.graniteRatio > 25) options.graniteRatio = 0.25;
		else options.graniteRatio = options.graniteRatio / 100;

		for(i = 0; i < size; i++) {
			newResource = 0;
			textures = map.getTexturesByIndex(i);
			// we have to drop support flags so that ie. Mountain Meadow is comparable to the Habitable Mountain texture (essentially the same)
			textureFlag = textureInfo[textures.topLeft].flag & TEXTURE.DROP_SUPPORT;
			eachTextureIsSameKind = (
				textureFlag === (textureInfo[textures.top].flag & TEXTURE.DROP_SUPPORT)
				&& textureFlag === (textureInfo[textures.topRight].flag & TEXTURE.DROP_SUPPORT)
				&& textureFlag === (textureInfo[textures.bottomLeft].flag & TEXTURE.DROP_SUPPORT)
				&& textureFlag === (textureInfo[textures.bottom].flag & TEXTURE.DROP_SUPPORT)
				&& textureFlag === (textureInfo[textures.bottomRight].flag & TEXTURE.DROP_SUPPORT)
			);
			if(eachTextureIsSameKind) {
				// water?
				if(textures.topLeft === 0x05) {
					nodes = getNodesByIndex(i);
					// can we find an accessible site around?
					if(
						(data[siteBlock + nodes.left] !== SITE.IMPASSABLE)
						|| (data[siteBlock + nodes.right] !== SITE.IMPASSABLE)
						|| (data[siteBlock + nodes.topLeft] !== SITE.IMPASSABLE)
						|| (data[siteBlock + nodes.topRight] !== SITE.IMPASSABLE)
						|| (data[siteBlock + nodes.bottomLeft] !== SITE.IMPASSABLE)
						|| (data[siteBlock + nodes.bottomRight] !== SITE.IMPASSABLE)
					) {
						// fish!
						newResource = RESOURCE.FISH;
						resources.fish++;
					}
				} else if (textureFlag & TEXTURE.ROCK) {
					// add coal / iron ore / gold / granite
					newResource = seedMap[i] & 0x3F;
					if(newResource < 0x20) {
						newResource = RESOURCE.COAL | 0x07;
						resources.mineCoal++;
					} else if (newResource < 0x2E) {
						newResource = RESOURCE.GOLD | 0x07;
						resources.mineGold++;
					} else if (newResource < 0x3C) {
						newResource = RESOURCE.IRON_ORE | 0x07;
						resources.mineIronOre++;
					} else {
						newResource = RESOURCE.GRANITE | 0x07;
						resources.mineGranite++;
					}
				} else if (textureFlag & TEXTURE.HABITABLE) {
					if(textureFlag & TEXTURE.ARABLE) {
						// fresh water!
						newResource = RESOURCE.FRESH_WATER;
						resources.freshWater++;
					}
				}
			}

			data[resourceBlock + i] = newResource;
			// mark spot unfit for trees and granite
			if(data[siteBlock + i] === SITE.IMPASSABLE) {
				data[touchBlock + i] = 1;
			} else {
				usableLandmass++;
			}
		}

		// mark spots around headquarters unfir for trees and granite
		for(i = 0; i < players.length; i++) {
			nodes = map.getRadiusNodes(players[i].x, players[i].y, 5);
			for(j = 0; j < nodes.length; j++) {
				data[touchBlock + nodes[j]] = 1;
			}
			usableLandmass -= j;
		}

		// calculate target amounts for trees
		options.treeRatio = usableLandmass * options.treeRatio;

		// apply trees
		while(usableLandmass > 0 && resources.tree < options.treeRatio) {
			i = ~~(Math.random() * size);
			if(data[touchBlock + i] === 0) {
				nodes = map.getRadiusNodes(i % width, ~~((i - (i % width)) / width), seedMap[i] & 0x07);
				for(j = 0; j < nodes.length; j++) {
					k = nodes[j];
					// see if we this location is free to use
					if(data[touchBlock + k] === 0) {
						// random here avoids getting stuck...
						if( (seedMap[k] & 0x03) || Math.random() < 0.2 ) {
							// mark done
							data[touchBlock + k] = 1;
							// type
							data[objectTypeBlock + k] = 0xC4;
							// Pine / Birch / Oak / Palm 1
							data[objectIndexBlock + k] = 0x30 + (~~(Math.random() * 4) * 0x40) + (~~(Math.random() * 0x08));
							// increase counter
							resources.tree++;
							usableLandmass--;
						}
					}
				}
			}
		}

		// calculate target amounts for granite
		options.graniteRatio = usableLandmass * options.graniteRatio;

		// apply granite
		while(usableLandmass > 0 && resources.granite < options.graniteRatio) {
			i = ~~(Math.random() * size);
			if(data[touchBlock + i] === 0) {
				nodes = map.getRadiusNodes(i % width, ~~((i - (i % width)) / width), seedMap[i] & 0x07);
				for(j = 0; j < nodes.length; j++) {
					k = nodes[j];
					// see if we this location is free to use
					if(data[touchBlock + k] === 0) {
						// random here avoids getting stuck...
						if( (seedMap[k] & 0x03) || Math.random() < 0.2 ) {
							// mark done
							data[touchBlock + k] = 1;
							// type
							data[objectTypeBlock + k] = 0xCC | (seedMap[k] & 0x01);
							// quantity
							data[objectIndexBlock + k] = ~~(Math.random() * 5) + 2;
							// increase counter
							resources.granite++;
							usableLandmass--;
						}
					}
				}
			}
		}

		// clean up
		for(i = 0; i < size; i++) {
			data[touchBlock + i] = 0;
		}

		// must do this again now
		map.calculateSites();

		console.timeEnd('applyResources')

		return resources;
	}

	function draw(options) {
		//if(!options || !options.length) options = {};
		// draw the stuff so we can see stuff
		var canvas = options.canvas,
			buffer = canvas.getContext('2d'),
			image = buffer.getImageData(0, 0, width, height),
			view = image.data,
			lightMapBlock = size * 12;

		canvas.width = width;
		canvas.height = height;

		viewType = options.viewType;
		options.terrain = ~~options.terrain || TERRAIN.GREENLAND;

		switch(viewType) {
		case 'seed':
			for(i = 0, j = 0; i < size; i++) {
				view[j++] = seedMap[i];
				view[j++] = seedMap[i];
				view[j++] = seedMap[i];
				view[j++] = 255;
			}

			nodes.forEach(function(i) {
				view[(i << 2)] = 96;
				view[(i << 2) + 1] = 176;
				view[(i << 2) + 2] = 255;
			});
			break;
		case 'height':
			for(i = 0, j = 0; i < size; i++) {
				if(data[i] === baseLevel && seedMap[i] < 2) {
					view[j++] = 80;
					view[j++] = 160;
					view[j++] = 192;
				} else {
					view[j++] = data[i] << 2;
					view[j++] = data[i] << 2;
					view[j++] = data[i] << 2;
				}
				view[j++] = 255;
			}
			break;
		case 'light':
			for(i = 0, j = 0; i < size; i++) {
				if(data[i] === baseLevel && seedMap[i] < 2) {
					view[j++] = data[lightMapBlock + i] * 0.25 + 40;
					view[j++] = data[lightMapBlock + i] * 0.75 + 80;
					view[j++] = data[lightMapBlock + i] * 0.85 + 96;
				} else {
					view[j++] = data[lightMapBlock + i] * 0.9 + 48;
					view[j++] = data[lightMapBlock + i] * 1.1 + 32;
					view[j++] = data[lightMapBlock + i] * 0.5 + 32;
				}
				view[j++] = 255;
			}
			break;
		case 'pretty':
			var color = colors[options.terrain].data,
				// row information so we can do some graphical adjustments
				y = -1,
				texture_color_merri = COLOR_TYPE_M[options.terrain],
				texture_color_original = COLOR_TYPE_O[options.terrain],
				treeIndex, g, g2, c1, c2, c3, c4, c5, c6, c7, c8, c9, cA, cB, cC, j,
				color1, color2, color3, colorAlpha,
				drawNodes,
				leftNodes,
				textures,
				objectIndexBlock = size * 4,
				objectTypeBlock = size * 5,
				drawPos = 0;
	
			// and then we just loop through!
			for(i = 0; i < size; i++) {
				// keep track of current row
				if( i % width === 0) y++;
				drawNodes = getNodesByIndex(i);
				leftNodes = getNodesByIndex(drawNodes.left);
				// light and shadow calculation (not like the one in the game!)
				g = 96, j = data[i];
				g += 12 * (data[ drawNodes.topRight ] - j);
				g += 8 * (data[ drawNodes.topLeft ] - j);
				g -= 8 * (data[ drawNodes.left ] - j);
				g -= 16 * (data[ leftNodes.bottomLeft ] - j);
				// keep value within valid range
				g = Math.max(Math.min(255, g), 0);
				// grab some textures
				textures = map.getTexturesByIndex(i);
				// get a few color indexes...
				c1 = (g * 256 + texture_color_merri[ textures.topLeft ]) * 4;
				c2 = (g * 256 + texture_color_original[ textures.topLeft ]) * 4;
				c3 = (g * 256 + texture_color_merri[ textures.top ]) * 4;
				c4 = (g * 256 + texture_color_original[ textures.top ]) * 4;
				c5 = (g * 256 + texture_color_merri[ textures.topRight ]) * 4;
				c6 = (g * 256 + texture_color_original[ textures.topRight ]) * 4;
				c7 = (g * 256 + texture_color_merri[ textures.bottomLeft ]) * 4;
				c8 = (g * 256 + texture_color_original[ textures.bottomLeft ]) * 4;
				c9 = (g * 256 + texture_color_merri[ textures.bottom ]) * 4;
				cA = (g * 256 + texture_color_original[ textures.bottom ]) * 4;
				cB = (g * 256 + texture_color_merri[ textures.bottomRight ]) * 4;
				cC = (g * 256 + texture_color_original[ textures.bottomRight ]) * 4;
				// then make a color mixture...
				color1 = ((color[c1++] + color[c2++] + color[c3++] + color[c4++] + color[c5++] + color[c6++] + color[c7++] + color[c8++] + color[c9++] + color[cA++] + color[cB++] + color[cC++] ) / 12) | 0;
				color2 = ((color[c1++] + color[c2++] + color[c3++] + color[c4++] + color[c5++] + color[c6++] + color[c7++] + color[c8++] + color[c9++] + color[cA++] + color[cB++] + color[cC++] ) / 12) | 0;
				color3 = ((color[c1++] + color[c2++] + color[c3++] + color[c4++] + color[c5++] + color[c6++] + color[c7++] + color[c8++] + color[c9++] + color[cA++] + color[cB++] + color[cC++] ) / 12) | 0;
				// water is almost transparent (water only node = 255 - 160)
				colorAlpha = 255 - 30 * ((textures.topLeft === 5) + (textures.top === 5) + (textures.topRight === 5) + 
					(textures.bottomLeft === 5) + (textures.bottom === 5) + (textures.bottomRight === 5));
				
				// not done yet! check for objects!
				switch(data[objectTypeBlock + i]) {
				// trees
				case 196:
				case 197:
				case 198:
				case 199:
					treeIndex = ((data[objectTypeBlock + i] & 2) << 2) | ((data[objectIndexBlock + i] & 0xC0) >> 6);
					g = TREE_INFO[options.terrain][treeIndex].alpha + (((data[objectIndexBlock + i] & 7) + 1) / 25) - 0.32;
					g2 = (1 - g);
					color1 = ~~(color1 * g2 + TREE_INFO[options.terrain][treeIndex].red * g);
					color2 = ~~(color2 * g2 + TREE_INFO[options.terrain][treeIndex].green * g);
					color3 = ~~(color3 * g2 + TREE_INFO[options.terrain][treeIndex].blue * g);
					break;
				// granite
				case 204:
				case 205:
					g = data[objectIndexBlock + i] / 10;
					g2 = ((color1 + color2 + color3) / 3 + 64 ) * g;
					color1 = Math.min(255, color1 * (1 - g) + g2);
					color2 = Math.min(255, color2 * (1 - g) + g2);
					color3 = Math.min(255, color3 * (1 - g) + g2);
					break;
				}
				view[drawPos++] = color1;
				view[drawPos++] = color2;
				view[drawPos++] = color3;
				view[drawPos++] = colorAlpha;
			}
			break;
		default:
			console.log('WTF');
		}
		
		buffer.putImageData(image, 0, 0);
	}

	function veryInefficientStringToCP437(text, length) {
		var output = [],
			code;
		for(i = 0; i < length; i++) {
			code = CP437.indexOf(~~text.charCodeAt(i));
			if(code > -1) output.push(code);
			else output.push(0xDB);
		}
		return output;
	}

	function getFileBlob(options) {
		// 2577 => header 2352
		//		 + block headers 16 * 14 = 224
		//		 + footer 0xFF
		var areas,
			buffer = new ArrayBuffer(2577 + size * 14)
			view = new DataView(buffer),
			byteView = void 0,
			pos = 0,
			i,
			objectIndexBlock = size * 4,
			objectTypeBlock = size * 5;

		options = options || {};

		options.title = options.title || 'Unknown map'
		options.author = options.author || 'Merri\'sMapGenerator';
		options.terrain = ~~options.terrain || TERRAIN.GREENLAND;
		// WORLD_V1.0
		view.setUint8(pos++, 0x57);
		view.setUint8(pos++, 0x4F);
		view.setUint8(pos++, 0x52);
		view.setUint8(pos++, 0x4C);
		view.setUint8(pos++, 0x44);
		view.setUint8(pos++, 0x5F);
		view.setUint8(pos++, 0x56);
		view.setUint8(pos++, 0x31);
		view.setUint8(pos++, 0x2E);
		view.setUint8(pos++, 0x30);
		// TITLE
		veryInefficientStringToCP437(options.title, 19).forEach(function(character) {
			view.setUint8(pos++, character);
		});
		view.setUint8(pos++, 0);
		// WIDTH & HEIGHT
		view.setUint16(pos++, width, true);
		pos++;
		view.setUint16(pos++, height, true);
		pos++;
		// TERRAIN
		view.setUint8(pos++, options.terrain);
		// PLAYER COUNT
		view.setUint8(pos++, players.length);
		// AUTHOR
		veryInefficientStringToCP437(options.author, 19).forEach(function(character) {
			view.setUint8(pos++, character);
		});
		view.setUint8(pos++, 0);
		// HEADQUARTERS
		if(players.length > 0) {
			view.setUint16(pos, players[0].x, true);
			view.setUint16(pos + 14, players[0].y, true);
		} else {
			view.setUint16(pos, 0xFFFF, true);
			view.setUint16(pos + 14, 0xFFFF, true);
		}
		
		if(players.length > 1) {
			view.setUint16(pos + 2, players[1].x, true);
			view.setUint16(pos + 16, players[1].y, true);
		} else {
			view.setUint16(pos + 2, 0xFFFF, true);
			view.setUint16(pos + 16, 0xFFFF, true);
		}
		
		if(players.length > 2) {
			view.setUint16(pos + 4, players[2].x, true);
			view.setUint16(pos + 18, players[2].y, true);
		} else {
			view.setUint16(pos + 4, 0xFFFF, true);
			view.setUint16(pos + 18, 0xFFFF, true);
		}
		
		if(players.length > 3) {
			view.setUint16(pos + 6, players[3].x, true);
			view.setUint16(pos + 20, players[3].y, true);
		} else {
			view.setUint16(pos + 6, 0xFFFF, true);
			view.setUint16(pos + 20, 0xFFFF, true);
		}
		
		if(players.length > 4) {
			view.setUint16(pos + 8, players[4].x, true);
			view.setUint16(pos + 22, players[4].y, true);
		} else {
			view.setUint16(pos + 8, 0xFFFF, true);
			view.setUint16(pos + 22, 0xFFFF, true);
		}
		
		if(players.length > 5) {
			view.setUint16(pos + 10, players[5].x, true);
			view.setUint16(pos + 24, players[5].y, true);
		} else {
			view.setUint16(pos + 10, 0xFFFF, true);
			view.setUint16(pos + 24, 0xFFFF, true);
		}
		
		if(players.length > 6) {
			view.setUint16(pos + 12, players[6].x, true);
			view.setUint16(pos + 26, players[6].y, true);
		} else {
			view.setUint16(pos + 12, 0xFFFF, true);
			view.setUint16(pos + 26, 0xFFFF, true);
		}

		pos += 28;

		// set object types and indexes for players
		for(i = 0; i < players.length; i++) {
			data[objectIndexBlock + players[i].index] = i;
			data[objectTypeBlock + players[i].index] = 0x80;
		}

		// UNPLAYABILITY INDICATOR
		view.setUint8(pos++, 0, true);
		// LEADER FACES
		view.setUint8(pos++, 0);
		view.setUint8(pos++, 3);
		view.setUint8(pos++, 6);
		view.setUint8(pos++, 9);
		view.setUint8(pos++, 1);
		view.setUint8(pos++, 4);
		view.setUint8(pos++, 7);

		// GET AREAS
		areas = map.calculateAreas();

		// SET AREAS
		for(i = 0; i < Math.min(areas.length, 250); i++) {
			view.setUint8(pos++, areas[i].type);
			view.setUint16(pos++, areas[i].x, true);
			pos++;
			view.setUint16(pos++, areas[i].y, true);
			pos++;
			view.setUint32(pos, areas[i].mass, true);
			pos+=4;
		}

		// SKIP UNUSED AREAS
		pos += (250 - i) * 9;

		// MAP FILE IDENTIFICATION
		view.setUint8(pos++, 0x11);
		view.setUint8(pos++, 0x27);
		view.setUint32(pos, 0, true);
		pos += 4;
		view.setUint16(pos++, width, true);
		pos++;
		view.setUint16(pos++, height, true);
		pos++;
		console.log('HEADER:', pos);
		// MAP DATA
		for(i = 0; i < 14; i++) {
			view.setUint8(pos++, 0x10);
			view.setUint8(pos++, 0x27);
			view.setUint32(pos, 0);
			pos += 4;
			view.setUint16(pos++, width, true);
			pos++;
			view.setUint16(pos++, height, true);
			pos++;
			view.setUint16(pos++, 1, true);
			pos++;
			view.setUint32(pos, size, true);
			pos += 4;
			console.log('BLOCK:', i, pos, pos + size, buffer.byteLength);
			byteView = new Uint8Array(buffer, pos, size);
			pos += size;
			byteView.set(data.subarray(i * size, (i + 1) * size));
		}
		// END OF FILE
		view.setUint8(pos++, 0xFF);

		// restore object types and indexes for players
		for(i = 0; i < players.length; i++) {
			data[objectIndexBlock + players[i].index] = 0;
			data[objectTypeBlock + players[i].index] = 0;
		}

		// we are done!
		return new Blob([new Uint8Array(buffer)], {type: 'application/octet-binary'});
	}

	colorMap.onload = function(e) {
		// create a canvas where we can get our needs
		var buffer,
			canvas = document.createElement('canvas');

		try {
			canvas.width = 768;
			canvas.height = 256;
			// get drawing context
			buffer = canvas.getContext('2d');
			// and draw the image
			buffer.drawImage(e.target, 0, 0);
			// greenland
			colors[0] = buffer.getImageData(0, 0, 256, 256);
			// wasteland
			colors[1] = buffer.getImageData(256, 0, 256, 256);
			// winter world
			colors[2] = buffer.getImageData(512, 0, 256, 256);
			// mark as done
			colorMap = true;
			console.log('Success!');
		} catch(e) {
			colorMap = false;
			console.log('FAIL!');
		}
	};
	colorMap.src = './type1.png';

	function isPrettyReady() {
		return colorMap;
	}

	global.Generator = {
		applyResources: applyResources,
		createBaseTextures: createBaseTextures,
		createHeight: createHeight,
		draw: draw,
		getFileBlob: getFileBlob,
		getRandomPlayerPositions: getRandomPlayerPositions,
		isPrettyReady: isPrettyReady,
		seed: seed
	};
})(this);