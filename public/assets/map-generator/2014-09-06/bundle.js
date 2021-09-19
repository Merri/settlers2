require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Generator":[function(require,module,exports){
'use strict';

var Promise = require('promise'),
	Map = require('./map');

var constants = require('./constants'),
	AREA = constants.AREA,
	CP437 = constants.CP437,
	COLOR = constants.COLOR,
	OBJECT_TYPE = constants.OBJECT_TYPE,
	RESOURCE = constants.RESOURCE,
	SITE = constants.SITE,
	TERRAIN = constants.TERRAIN,
	TEXTURE = constants.TEXTURE,
	TEXTURE_INFO = constants.TEXTURE_INFO,
	TREE_INFO = constants.TREE_INFO;

var Generator = function() {
	var map,
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
		colorMap,
		colors = [],
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

	function expandTo(index, value, current) {
		aroundExpandTo = map.getNodesByIndex(index);

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

	var seed = function(options) {
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

		map = new Map(width, height);
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
						around = map.getNodesByIndex(index);

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
	};

	//options: baseLevel
	var createHeight = function(options) {
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
					around = map.getNodesByIndex(index);
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
		map.calculateLightMap();
		console.timeEnd('lightMap');
	};

	var createBaseTextures = function(options) {
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
		map.calculateSiteMap();
		
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
					siteNodes = map.getNodesByIndex(i);
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
					siteNodes = map.getNodesByIndex(i);
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
					siteNodes = map.getNodesByIndex(i);
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

		map.calculateSiteMap();
		console.timeEnd('Draw Mountains (requires x2 calculateSites)');

		console.timeEnd('Texture');
	};

	var getRandomPlayerPositions = function(maxPlayerCount, radius) {
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
	};

	var applyResources = function(options) {
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
			textureFlag = TEXTURE_INFO[textures.topLeft].FLAG & TEXTURE.DROP_SUPPORT;
			eachTextureIsSameKind = (
				textureFlag === (TEXTURE_INFO[textures.top].FLAG & TEXTURE.DROP_SUPPORT)
				&& textureFlag === (TEXTURE_INFO[textures.topRight].FLAG & TEXTURE.DROP_SUPPORT)
				&& textureFlag === (TEXTURE_INFO[textures.bottomLeft].FLAG & TEXTURE.DROP_SUPPORT)
				&& textureFlag === (TEXTURE_INFO[textures.bottom].FLAG & TEXTURE.DROP_SUPPORT)
				&& textureFlag === (TEXTURE_INFO[textures.bottomRight].FLAG & TEXTURE.DROP_SUPPORT)
			);
			if(eachTextureIsSameKind) {
				// water?
				if(textures.topLeft === 0x05) {
					nodes = map.getNodesByIndex(i);
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
		map.calculateSiteMap();

		console.timeEnd('applyResources')

		return resources;
	};

	var draw = function(options) {
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
				texture_color_merri = COLOR.MERRI[options.terrain],
				texture_color_original = COLOR.ORIGINAL[options.terrain],
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
				drawNodes = map.getNodesByIndex(i);
				leftNodes = map.getNodesByIndex(drawNodes.left);
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
				c1 = (g + 256 * texture_color_merri[ textures.topLeft ]) * 4;
				c2 = (g + 256 * texture_color_original[ textures.topLeft ]) * 4;
				c3 = (g + 256 * texture_color_merri[ textures.top ]) * 4;
				c4 = (g + 256 * texture_color_original[ textures.top ]) * 4;
				c5 = (g + 256 * texture_color_merri[ textures.topRight ]) * 4;
				c6 = (g + 256 * texture_color_original[ textures.topRight ]) * 4;
				c7 = (g + 256 * texture_color_merri[ textures.bottomLeft ]) * 4;
				c8 = (g + 256 * texture_color_original[ textures.bottomLeft ]) * 4;
				c9 = (g + 256 * texture_color_merri[ textures.bottom ]) * 4;
				cA = (g + 256 * texture_color_original[ textures.bottom ]) * 4;
				cB = (g + 256 * texture_color_merri[ textures.bottomRight ]) * 4;
				cC = (g + 256 * texture_color_original[ textures.bottomRight ]) * 4;
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
					g = TREE_INFO[options.terrain][treeIndex].ALPHA + (((data[objectIndexBlock + i] & 7) + 1) / 25) - 0.32;
					g2 = (1 - g);
					color1 = ~~(color1 * g2 + TREE_INFO[options.terrain][treeIndex].RED * g);
					color2 = ~~(color2 * g2 + TREE_INFO[options.terrain][treeIndex].GREEN * g);
					color3 = ~~(color3 * g2 + TREE_INFO[options.terrain][treeIndex].BLUE * g);
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

	var getFileBlob = function(options) {
		// 2577 => header 2352
		//		 + block headers 16 * 14 = 224
		//		 + footer 0xFF
		var areas,
			buffer = new ArrayBuffer(2577 + size * 14),
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
		areas = map.calculateAreaMap();

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

	var isReadyToDraw = function() {
		return colorMap;
	};

	var setColorMap = function(name) {
		return new Promise(function(resolve, reject) {
			colorMap = document.createElement('img');

			colorMap.onload = function(e) {
				// create a canvas where we can get our needs
				var buffer,
					canvas = document.createElement('canvas');

				try {
					canvas.width = 256;
					canvas.height = 768;
					// get drawing context
					buffer = canvas.getContext('2d');
					// and draw the image
					buffer.drawImage(e.target, 0, 0);
					// greenland
					colors[0] = buffer.getImageData(0, 0, 256, 256);
					// wasteland
					colors[1] = buffer.getImageData(0, 256, 256, 256);
					// winter world
					colors[2] = buffer.getImageData(0, 512, 256, 256);
					// mark as done
					colorMap = true;
					// resolve promise with colors array
					resolve(colors);
				} catch(err) {
					colorMap = false;
					// just pass the error
					reject(err);
				}
			};

			colorMap.onerror = reject;

			switch(name) {
				case 'alternative':
					colorMap.src = './lightmap_index_alternative.png';
					break;
				case 'high-contrast':
					colorMap.src = './lightmap_index_high-contrast.png';
					break;
				default:
					colorMap.src = './lightmap_index.png';
			}
		});
	};

	return {
		applyResources: applyResources,
		createBaseTextures: createBaseTextures,
		createHeight: createHeight,
		draw: draw,
		getFileBlob: getFileBlob,
		getRandomPlayerPositions: getRandomPlayerPositions,
		isReadyToDraw: isReadyToDraw,
		seed: seed,
		setColorMap: setColorMap
	};
};

module.exports = Generator;
},{"./constants":"c:\\Users\\Merri\\documents\\git\\map-generator\\src\\constants.js","./map":"c:\\Users\\Merri\\documents\\git\\map-generator\\src\\map.js","promise":"c:\\Users\\Merri\\documents\\git\\map-generator\\node_modules\\promise\\index.js"}],"c:\\Users\\Merri\\AppData\\Roaming\\npm\\node_modules\\watchify\\node_modules\\browserify\\node_modules\\process\\browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"c:\\Users\\Merri\\documents\\git\\map-generator\\node_modules\\promise\\core.js":[function(require,module,exports){
'use strict';

var asap = require('asap')

module.exports = Promise
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":"c:\\Users\\Merri\\documents\\git\\map-generator\\node_modules\\promise\\node_modules\\asap\\asap.js"}],"c:\\Users\\Merri\\documents\\git\\map-generator\\node_modules\\promise\\index.js":[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions to the core promise API

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Object.create(Promise.prototype)

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.from = Promise.cast = function (value) {
  var err = new Error('Promise.from and Promise.cast are deprecated, use Promise.resolve instead')
  err.name = 'Warning'
  console.warn(err.stack)
  return Promise.resolve(value)
}

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      fn.apply(self, args)
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    try {
      return fn.apply(this, arguments).nodeify(callback)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback(ex)
        })
      }
    }
  }
}

Promise.all = function () {
  var calledWithArray = arguments.length === 1 && Array.isArray(arguments[0])
  var args = Array.prototype.slice.call(calledWithArray ? arguments[0] : arguments)

  if (!calledWithArray) {
    var err = new Error('Promise.all should be called with a single array, calling it with multiple arguments is deprecated')
    err.name = 'Warning'
    console.warn(err.stack)
  }

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}

Promise.prototype.nodeify = function (callback) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback(null, value)
    })
  }, function (err) {
    asap(function () {
      callback(err)
    })
  })
}

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":"c:\\Users\\Merri\\documents\\git\\map-generator\\node_modules\\promise\\core.js","asap":"c:\\Users\\Merri\\documents\\git\\map-generator\\node_modules\\promise\\node_modules\\asap\\asap.js"}],"c:\\Users\\Merri\\documents\\git\\map-generator\\node_modules\\promise\\node_modules\\asap\\asap.js":[function(require,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,require('_process'))
},{"_process":"c:\\Users\\Merri\\AppData\\Roaming\\npm\\node_modules\\watchify\\node_modules\\browserify\\node_modules\\process\\browser.js"}],"c:\\Users\\Merri\\documents\\git\\map-generator\\src\\constants.js":[function(require,module,exports){
'use strict';

var AREA = {
	UNUSED: 0,
	LAND: 1,
	WATER: 2,
	IMPASSABLE: 254
};

var COLOR = {
	ORIGINAL: [
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
	MERRI: [
		[236, 195, 124, 231, 199, 242, 242, 199, 233, 232, 231, 195, 194, 193, 217, 232, 249, 254, 169, 242, 249, 249, 249,0xFF,0xFF,0xFF,
		0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,195,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
		0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
		[98, 145, 23, 41, 85, 42, 42, 85, 32, 166, 33, 113, 245, 41, 34, 33, 251, 254, 97, 42, 251, 251, 251,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
		0xFF,0xFF,0xFF,0xFF,0xFF,113,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
		0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
		[122, 118, 179, 178, 182, 242, 242, 182, 122, 172, 101, 120, 144, 119, 171, 101, 249, 252, 123, 242, 249, 249, 249,0xFF,0xFF,0xFF,
		0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,120,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
		0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]
	]
};

var CP437 = [0, 9786, 9787, 9829, 9830, 9827, 9824, 8226, 9688, 9675, 9689, 9794, 9792, 9834, 9835, 9788, 9658, 9668, 8597, 8252, 182, 167,
	9644, 8616, 8593, 8595, 8594, 8592, 8735, 8596, 9650, 9660, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
	52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
	87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
	118, 119, 120, 121, 122, 123, 124, 125, 126, 8962, 199, 252, 233, 226, 228, 224, 229, 231, 234, 235, 232, 239, 238, 236, 196, 197, 201, 230,
	198, 244, 246, 242, 251, 249, 255, 214, 220, 162, 163, 165, 8359, 402, 225, 237, 243, 250, 241, 209, 170, 186, 191, 8976, 172, 189, 188, 161,
	171, 187, 9617, 9618, 9619, 9474, 9508, 9569, 9570, 9558, 9557, 9571, 9553, 9559, 9565, 9564, 9563, 9488, 9492, 9524, 9516, 9500, 37, 37,
	9566, 567, 9562, 9556, 9577, 9574, 9568, 9552, 9580, 9575, 9576, 9572, 9573, 9561, 9560, 9554, 9555, 9579, 9578, 9496, 9484, 9608, 9604,
	9612, 9616, 9600, 945, 223, 915, 960, 931, 963, 181, 964, 934, 920, 937, 948, 8734, 966, 949, 8745, 8801, 177, 8805, 8804, 8992, 8993, 247,
	8776, 176, 8729, 183, 8730, 8319, 178, 9632, 160];

var OBJECT_TYPE = {
	TREE: 0xC4,
	GRANITE: 0xCC,
	MATCH: 0xFC
};

var RESOURCE = {
	FRESH_WATER: 0x21,
	COAL: 0x40, // 0x40 - 0x47
	IRON_ORE: 0x48, // 0x48 - 0x4F
	GOLD: 0x50, // 0x50 - 0x57
	GRANITE: 0x58, // 0x58 - 0x5F
	FISH: 0x87
};

var SITE = {
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

var TERRAIN = {
	GREENLAND: 0,
	WASTELAND: 1,
	WINTERWORLD: 2
};

var TEXTURE = {
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

var TEXTURE_INFO = {
	0: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE,
		NAME: {
			0: 'Savannah',
			1: 'Dark Steppe',
			2: 'Taiga'
		}
	},
	1: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK,
		NAME: {
			0: 'Mountain #1',
			1: 'Mountain #1',
			2: 'Mountain #1'
		}
	},
	2: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.EXTREME,
		NAME: {
			0: 'Snow',
			1: 'Lava Stones',
			2: 'Pack Ice'
		}
	},
	3: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.WET,
		NAME: {
			0: 'Swamp',
			1: 'Lava Ground',
			2: 'Drift Ice'
		}
	},
	4: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARID,
		NAME: {
			0: 'Desert',
			1: 'Wasteland',
			2: 'Ice'
		}
	},
	5: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.WET,
		NAME: {
			0: 'Water',
			1: 'Moor',
			2: 'Water'
		}
	},
	6: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.HABITABLE,
		NAME: {
			0: 'Habitable Water',
			1: 'Habitable Moor',
			2: 'Habitable Water'
		}
	},
	7: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARID,
		NAME: {
			0: 'Clone Desert',
			1: 'Clone Wasteland',
			2: 'Clone Ice'
		}
	},
	8: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE,
		NAME: {
			0: 'Meadow #1',
			1: 'Pasture #1',
			2: 'Taiga / Tundra'
		}
	},
	9: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE,
		NAME: {
			0: 'Meadow #2',
			1: 'Pasture #2',
			2: 'Tundra #1'
		}
	},
	10: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE,
		NAME: {
			0: 'Meadow #3',
			1: 'Pasture #3',
			2: 'Tundra #2'
		}
	},
	11: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK,
		NAME: {
			0: 'Mountain #2',
			1: 'Mountain #2',
			2: 'Mountain #2'
		}
	},
	12: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK,
		NAME: {
			0: 'Mountain #3',
			1: 'Mountain #3',
			2: 'Mountain #3'
		}
	},
	13: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ROCK,
		NAME: {
			0: 'Mountain #4',
			1: 'Mountain #4',
			2: 'Mountain #4'
		}
	},
	14: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE,
		NAME: {
			0: 'Steppe',
			1: 'Light Steppe',
			2: 'Tundra #3'
		}
	},
	15: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.ARABLE | TEXTURE.HABITABLE,
		NAME: {
			0: 'Flower Meadow',
			1: 'Flower Pasture',
			2: 'Tundra #4'
		}
	},
	16: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.EXTREME,
		NAME: {
			0: 'Lava',
			1: 'Lava',
			2: 'Lava'
		}
	},
	17: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.ARID,
		NAME: {
			0: 'Solid Color (Magenta)',
			1: 'Solid Color (Dark Red)',
			2: 'Solid Color (Black)'
		}
	},
	18: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.SUPPORT_RTTR | TEXTURE.HABITABLE,
		NAME: {
			0: 'Mountain Meadow',
			1: 'Alpine Pasture',
			2: 'Snow'
		}
	},
	19: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME,
		NAME: {
			0: 'Border Water',
			1: 'Border Moor',
			2: 'Border Water'
		}
	},
	20: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME,
		NAME: {
			0: 'Solid Color Lava #1 (Magenta)',
			1: 'Solid Color Lava #1 (Dark Red)',
			2: 'Solid Color Lava #1 (Black)'
		}
	},
	21: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME,
		NAME: {
			0: 'Solid Color Lava #2 (Magenta)',
			1: 'Solid Color Lava #2 (Dark Red)',
			2: 'Solid Color Lava #2 (Black)'
		}
	},
	22: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.EXTREME,
		NAME: {
			0: 'Solid Color Lava #3 (Magenta)',
			1: 'Solid Color Lava #3 (Dark Red)',
			2: 'Solid Color Lava #3 (Black)'
		}
	},
	34: {
		FLAG: TEXTURE.SUPPORT_S2 | TEXTURE.HABITABLE,
		NAME: {
			0: 'Mountain #2 (Habitable)',
			1: 'Mountain #2 (Habitable)',
			2: 'Mountain #2 (Habitable)'
		}
	}
}

var TREE_INFO = [
	[
		{
			RED: 21,
			GREEN: 73,
			BLUE: 15,
			ALPHA: 0.62352941176470588235294117647059,
			NAME: 'Pine'
		},
		{
			RED: 23,
			GREEN: 70,
			BLUE: 27,
			ALPHA: 0.55686274509803921568627450980392,
			NAME: 'Birch'
		},
		{
			RED: 21,
			GREEN: 65,
			BLUE: 16,
			ALPHA: 0.70196078431372549019607843137255,
			NAME: 'Oak'
		},
		{
			RED: 48,
			GREEN: 87,
			BLUE: 24,
			ALPHA: 0.32549019607843137254901960784314,
			NAME: 'Palm 1'
		},
		{
			RED: 42,
			GREEN: 78,
			BLUE: 19,
			ALPHA: 0.25490196078431372549019607843137,
			NAME: 'Palm 2'
		},
		{
			RED: 34,
			GREEN: 73,
			BLUE: 19,
			ALPHA: 0.36470588235294117647058823529412,
			NAME: 'Pine Apple'
		},
		{
			RED: 34,
			GREEN: 71,
			BLUE: 18,
			ALPHA: 0.45882352941176470588235294117647,
			NAME: 'Cypress'
		},
		{
			RED: 131,
			GREEN: 53,
			BLUE: 36,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Cherry'
		},
		{
			RED: 20,
			GREEN: 78,
			BLUE: 18,
			ALPHA: 0.46274509803921568627450980392157,
			NAME: 'Fir'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #1'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #2'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #3'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #4'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #5'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #6'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #7'
		}
	], [
		{
			RED: 117,
			GREEN: 80,
			BLUE: 62,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Spider'
		},
		{
			RED: 127,
			GREEN: 70,
			BLUE: 49,
			ALPHA: 0.45490196078431372549019607843137,
			NAME: 'Marley'
		},
		{
			RED: 117,
			GREEN: 80,
			BLUE: 62,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Clone Spider #1'
		},
		{
			RED: 127,
			GREEN: 70,
			BLUE: 49,
			ALPHA: 0.45490196078431372549019607843137,
			NAME: 'Clone Marley #1'
		},
		{
			RED: 117,
			GREEN: 80,
			BLUE: 62,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Clone Spider #2'
		},
		{
			RED: 34,
			GREEN: 73,
			BLUE: 19,
			ALPHA: 0.36470588235294117647058823529412,
			NAME: 'Pine Apple'
		},
		{
			RED: 117,
			GREEN: 80,
			BLUE: 62,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Clone Spider #3'
		},
		{
			RED: 131,
			GREEN: 53,
			BLUE: 36,
			ALPHA: 0.38431372549019607843137254901961,
			NAME: 'Cherry'
		},
		{
			RED: 127,
			GREEN: 70,
			BLUE: 49,
			ALPHA: 0.45490196078431372549019607843137,
			NAME: 'Clone Marley #2'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #1'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #2'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #3'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #4'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #5'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #6'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #7'
		}
	], [
		{
			RED: 88,
			GREEN: 99,
			BLUE: 77,
			ALPHA: 0.50196078431372549019607843137255,
			NAME: 'Pine'
		},
		{
			RED: 63,
			GREEN: 82,
			BLUE: 58,
			ALPHA: 0.49019607843137254901960784313725,
			NAME: 'Birch'
		},
		{
			RED: 77,
			GREEN: 94,
			BLUE: 60,
			ALPHA: 0.4078431372549019607843137254902,
			NAME: 'Fir'
		},
		{
			RED: 48,
			GREEN: 87,
			BLUE: 24,
			ALPHA: 0.32549019607843137254901960784314,
			NAME: 'Palm 1'
		},
		{
			RED: 42,
			GREEN: 78,
			BLUE: 19,
			ALPHA: 0.25490196078431372549019607843137,
			NAME: 'Palm 2'
		},
		{
			RED: 34,
			GREEN: 73,
			BLUE: 19,
			ALPHA: 0.36470588235294117647058823529412,
			NAME: 'Pine Apple'
		},
		{
			RED: 83,
			GREEN: 85,
			BLUE: 58,
			ALPHA: 0.41176470588235294117647058823529,
			NAME: 'Cypress'
		},
		{
			RED: 77,
			GREEN: 94,
			BLUE: 60,
			ALPHA: 0.4078431372549019607843137254902,
			NAME: 'Clone Fir #1'
		},
		{
			RED: 77,
			GREEN: 94,
			BLUE: 60,
			ALPHA: 0.4078431372549019607843137254902,
			NAME: 'Clone Fir #2'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #1'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #2'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #3'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #4'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #5'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #6'
		},
		{
			RED: 0,
			GREEN: 0,
			BLUE: 0,
			ALPHA: 0.1,
			NAME: 'Unused #7'
		}
	]
];

exports.AREA = AREA;
exports.CP437 = CP437;
exports.COLOR = COLOR;
exports.OBJECT_TYPE = OBJECT_TYPE;
exports.RESOURCE = RESOURCE;
exports.SITE = SITE;
exports.TERRAIN = TERRAIN;
exports.TEXTURE = TEXTURE;
exports.TEXTURE_INFO = TEXTURE_INFO;
exports.TREE_INFO = TREE_INFO;

},{}],"c:\\Users\\Merri\\documents\\git\\map-generator\\src\\map.js":[function(require,module,exports){
'use strict';

var constants = require('./constants'),
	AREA = constants.AREA,
	OBJECT_TYPE = constants.OBJECT_TYPE,
	RESOURCE = constants.RESOURCE,
	SITE = constants.SITE,
	TERRAIN = constants.TERRAIN,
	TEXTURE = constants.TEXTURE,
	TEXTURE_INFO = constants.TEXTURE_INFO;

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
	TOUCH_FROM_TOP_RIGHT = 0x40,
	// calculateAreaMap
	EXTREME_AND_WET = TEXTURE.EXTREME | TEXTURE.WET;

var Map = function(width, height) {
	var _width = Math.abs(~~width) & 0x0FFC,
		_height = Math.abs(~~height) & 0x0FFC,
		_size = _width * _height,
		// storage for raw map data
		_rawMapBuffer = new ArrayBuffer(_size * 14),
		_rawMap = new Uint8Array(_rawMapBuffer),
		// fast helper cache
		_cache32bit = new Uint32Array(_size),
		// other cache
		_lastTextureIndex,
		_lastTextureTopLeft,
		_lastTextureTop,
		_lastTextureTopRight,
		_lastTextureBottomLeft,
		_lastTextureBottom,
		_lastTextureBottomRight,
		// indexes to each block
		_blockHeight = 0,
		_blockTextures = _size,
		_blockTex1 = _size,
		_blockTex2 = _size * 2,
		_blockRoad = _size * 3,
		_blockObjIdx = _size * 4,
		_blockObjType = _size * 5,
		_blockAnimals = _size * 6,
		_blockEmpty = _size * 7,	// unknown; always empty in WLD/SWD
		_blockSites = _size * 8,
		_blockOfSeven = _size * 9,	// everything is always 7 in WLD/SWD
		_blockTouch = _size * 10,	// used here for temporary bitflagging and marking stuff
		_blockRes = _size * 11,
		_blockLight = _size * 12,
		_blockArea = _size * 13;

	// always seven
	for(var i = _blockOfSeven; i < _blockOfSeven + _size; i++) {
		_rawMap[i] = 7;
	}

	var calculateAreaMap = function() {
		var i,
			index = 0,
			areas = [],
			bitMask,
			current,
			nodes,
			mass,
			textures,
			total;

		for(i = 0; i < _size; i++) {
			if(_rawMap[_blockTouch + i] === 0x00) {
				// see if it is water
				if(index < 250 && isEachTextureSame(i, 0x05)) {
					// so we start looping water
					_rawMap[_blockArea + i] = index;
					_rawMap[_blockTouch + i] = 1;
					mass = 1;
					// add index and bitmask while also reseting a few variables
					_cache32bit[current = total = 0] = (i << 6) | 0x3F;
					// this loop here is unoptimal, but does the job
					while(current <= total) {
						// bitmask for nodes to follow (small optimization: always three bits active, one for each direction)
						bitMask = _cache32bit[current] & 0x3F;
						// get the nodes around
						nodes = getNodesByIndex((_cache32bit[current++] & 0xFFFFFFC0) >> 6);
						// check points for matching land/water
						if((bitMask & 0x01) === 0x01 && _rawMap[_blockTouch + nodes.left] === 0x00 && isEachTextureSame(nodes.left, 0x05)) {
							_cache32bit[++total] = (nodes.left << 6) | 0x23;
							_rawMap[_blockArea + nodes.left] = index;
							_rawMap[_blockTouch + nodes.left] = 1;
							mass++;
						}
						if((bitMask & 0x02) === 0x02 && _rawMap[_blockTouch + nodes.topLeft] === 0x00 && isEachTextureSame(nodes.topLeft, 0x05)) {
							_cache32bit[++total] = (nodes.topLeft << 6) | 0x07;
							_rawMap[_blockArea + nodes.topLeft] = index;
							_rawMap[_blockTouch + nodes.topLeft] = 1;
							mass++;
						}
						if((bitMask & 0x04) === 0x04 && _rawMap[_blockTouch + nodes.topRight] === 0x00 && isEachTextureSame(nodes.topRight, 0x05)) {
							_cache32bit[++total] = (nodes.topRight << 6) | 0x0E;
							_rawMap[_blockArea + nodes.topRight] = index;
							_rawMap[_blockTouch + nodes.topRight] = 1;
							mass++;
						}
						if((bitMask & 0x08) === 0x08 && _rawMap[_blockTouch + nodes.right] === 0x00 && isEachTextureSame(nodes.right, 0x05)) {
							_cache32bit[++total] = (nodes.right << 6) | 0x1C;
							_rawMap[_blockArea + nodes.right] = index;
							_rawMap[_blockTouch + nodes.right] = 1;
							mass++;
						}
						if((bitMask & 0x10) === 0x10 && _rawMap[_blockTouch + nodes.bottomRight] === 0x00 && isEachTextureSame(nodes.bottomRight, 0x05)) {
							_cache32bit[++total] = (nodes.bottomRight << 6) | 0x38;
							_rawMap[_blockArea + nodes.bottomRight] = index;
							_rawMap[_blockTouch + nodes.bottomRight] = 1;
							mass++;
						}
						if((bitMask & 0x20) === 0x20 && _rawMap[_blockTouch + nodes.bottomLeft] === 0x00 && isEachTextureSame(nodes.bottomLeft, 0x05)) {
							_cache32bit[++total] = (nodes.bottomLeft << 6) | 0x31;
							_rawMap[_blockArea + nodes.bottomLeft] = index;
							_rawMap[_blockTouch + nodes.bottomLeft] = 1;
							mass++;
						}
					}
					areas[index] = {
						mass: mass,
						type: AREA.WATER,
						x: i % _width,
						y: ~~((i - (i % _width)) / _width)
					};
					// next index
					index++;
				} else if(isEachTextureWithAnyOfFlags(i, EXTREME_AND_WET)) {
					_rawMap[_blockArea + i] = AREA.IMPASSABLE;
					_rawMap[_blockTouch + i] = 1;
				} else if(index < 250) {
					// so we start looping land
					_rawMap[_blockArea + i] = index;
					_rawMap[_blockTouch + i] = 1;
					mass = 1;
					// add index and bitmask while also reseting a few variables
					_cache32bit[current = total = 0] = (i << 6) | 0x3F;
					// this loop here is unoptimal, but does the job
					while(current <= total) {
						// bitmask for nodes to follow (small optimization: always three bits active, one for each direction)
						bitMask = _cache32bit[current] & 0x3F;
						// get the nodes around
						nodes = getNodesByIndex((_cache32bit[current++] & 0xFFFFFFC0) >> 6);
						// check points for matching land/water
						if((bitMask & 0x01) === 0x01 && _rawMap[_blockTouch + nodes.left] === 0x00 && !isEachTextureWithAnyOfFlags(nodes.left, EXTREME_AND_WET)) {
							_cache32bit[++total] = (nodes.left << 6) | 0x23; // topLeft, left, bottomLeft
							_rawMap[_blockArea + nodes.left] = index;
							_rawMap[_blockTouch + nodes.left] = 1;
							mass++;
						}
						if((bitMask & 0x02) === 0x02 && _rawMap[_blockTouch + nodes.topLeft] === 0x00 && !isEachTextureWithAnyOfFlags(nodes.topLeft, EXTREME_AND_WET)) {
							_cache32bit[++total] = (nodes.topLeft << 6) | 0x07; // left, topLeft, topRight
							_rawMap[_blockArea + nodes.topLeft] = index;
							_rawMap[_blockTouch + nodes.topLeft] = 1;
							mass++;
						}
						if((bitMask & 0x04) === 0x04 && _rawMap[_blockTouch + nodes.topRight] === 0x00 && !isEachTextureWithAnyOfFlags(nodes.topRight, EXTREME_AND_WET)) {
							_cache32bit[++total] = (nodes.topRight << 6) | 0x0E; // topLeft, topRight, right
							_rawMap[_blockArea + nodes.topRight] = index;
							_rawMap[_blockTouch + nodes.topRight] = 1;
							mass++;
						}
						if((bitMask & 0x08) === 0x08 && _rawMap[_blockTouch + nodes.right] === 0x00 && !isEachTextureWithAnyOfFlags(nodes.right, EXTREME_AND_WET)) {
							_cache32bit[++total] = (nodes.right << 6) | 0x1C; // topRight, right, bottomRight
							_rawMap[_blockArea + nodes.right] = index;
							_rawMap[_blockTouch + nodes.right] = 1;
							mass++;
						}
						if((bitMask & 0x10) === 0x10 && _rawMap[_blockTouch + nodes.bottomRight] === 0x00 && !isEachTextureWithAnyOfFlags(nodes.bottomRight, EXTREME_AND_WET)) {
							_cache32bit[++total] = (nodes.bottomRight << 6) | 0x38; // right, bottomRight, bottomLeft
							_rawMap[_blockArea + nodes.bottomRight] = index;
							_rawMap[_blockTouch + nodes.bottomRight] = 1;
							mass++;
						}
						if((bitMask & 0x20) === 0x20 && _rawMap[_blockTouch + nodes.bottomLeft] === 0x00 && !isEachTextureWithAnyOfFlags(nodes.bottomLeft, EXTREME_AND_WET)) {
							_cache32bit[++total] = (nodes.bottomLeft << 6) | 0x31; // bottomRight, bottomLeft, left
							_rawMap[_blockArea + nodes.bottomLeft] = index;
							_rawMap[_blockTouch + nodes.bottomLeft] = 1;
							mass++;
						}
					}
					areas[index] = {
						mass: mass,
						type: AREA.LAND,
						x: i % _width,
						y: ~~((i - (i % _width)) / _width)
					};
					// next index
					index++;
				} else {
					areas[index] = {
						mass: 0,
						type: AREA.UNUSED,
						x: i % _width,
						y: ~~((i - (i % _width)) / _width)
					}
					// next index
					index++;
				}
			}
		}

		//  cleanup
		for(i = 0; i < _size; i++) {
			_rawMap[_blockTouch + i] = 0;
		}

		return areas;
	};

	var calculateLightMap = function() {
		var around,
			aroundLeft,
			i,
			j,
			k;

		for(i = 0; i < _size; i++) {
			j = 64;
			k = _rawMap[_blockHeight + i];
			around = getNodesByIndex(i);
			aroundLeft = getNodesByIndex(around.left);
			j += 9 * (_rawMap[_blockHeight + around.topRight] - k);
			j -= 6 * (_rawMap[_blockHeight + around.left] - k);
			j -= 3 * (_rawMap[_blockHeight + aroundLeft.left] - k);
			j -= 9 * (_rawMap[_blockHeight + aroundLeft.bottomLeft] - k);
			_rawMap[_blockLight + i] = Math.max(Math.min(128, j), 0);
		}
	};

	var calculateSiteMap = function() {
		var i,
			mines = 0,
			node = 0,
			nodes,
			radiusNodes,
			tex1,
			tex2,
			tex3,
			tex4,
			tex5,
			tex6,
			tex7,
			tex8,
			tex9,
			texA,
			texNodes,
			waters = 0;

		// needs further investigation to the rules of original game; 99.9% correct for generated maps, but lacks information of ingame objects...
		for(i = 0; i < _size; i++) {
			// cache nearby nodes
			nodes = getNodesByIndex(i);
			// cache texture information
			texNodes = getTextureNodesByIndex(i);
			tex1 = _rawMap[_blockTextures + texNodes.topLeft] & TEXTURE.TO_ID_VALUE;
			tex2 = _rawMap[_blockTextures + texNodes.top] & TEXTURE.TO_ID_VALUE;
			tex3 = _rawMap[_blockTextures + texNodes.topRight] & TEXTURE.TO_ID_VALUE;
			tex4 = _rawMap[_blockTextures + texNodes.bottomLeft] & TEXTURE.TO_ID_VALUE;
			tex5 = _rawMap[_blockTextures + texNodes.bottom] & TEXTURE.TO_ID_VALUE;
			tex6 = _rawMap[_blockTextures + texNodes.bottomRight] & TEXTURE.TO_ID_VALUE;
			texNodes = getTextureNodesByIndex(nodes.bottomRight);
			tex7 = _rawMap[_blockTextures + texNodes.topRight] & TEXTURE.TO_ID_VALUE;
			tex8 = _rawMap[_blockTextures + texNodes.bottomLeft] & TEXTURE.TO_ID_VALUE;
			tex9 = _rawMap[_blockTextures + texNodes.bottom] & TEXTURE.TO_ID_VALUE;
			texA = _rawMap[_blockTextures + texNodes.bottomRight] & TEXTURE.TO_ID_VALUE;

			if ( ((TEXTURE_INFO[tex1].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((TEXTURE_INFO[tex2].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((TEXTURE_INFO[tex3].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((TEXTURE_INFO[tex4].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((TEXTURE_INFO[tex5].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((TEXTURE_INFO[tex6].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				// water or swamp
				|| 6 === (waters = ((TEXTURE_INFO[tex1].FLAG & TEXTURE.WET) === TEXTURE.WET)
				+ ((TEXTURE_INFO[tex2].FLAG & TEXTURE.WET) === TEXTURE.WET)
				+ ((TEXTURE_INFO[tex3].FLAG & TEXTURE.WET) === TEXTURE.WET)
				+ ((TEXTURE_INFO[tex4].FLAG & TEXTURE.WET) === TEXTURE.WET)
				+ ((TEXTURE_INFO[tex5].FLAG & TEXTURE.WET) === TEXTURE.WET)
				+ ((TEXTURE_INFO[tex6].FLAG & TEXTURE.WET) === TEXTURE.WET) )
				// granite
				|| ((_rawMap[_blockObjType + i] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE)
			) {

				_rawMap[_blockSites + i] = SITE.IMPASSABLE;

			} else if ( (_rawMap[_blockObjType + i] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE ) {

				_rawMap[_blockSites + i] = SITE.TREE;

			} else if (
				// water nearby?
				waters > 0
				// granite nearby?
				|| (_rawMap[_blockObjType + nodes.left] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (_rawMap[_blockObjType + nodes.right] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (_rawMap[_blockObjType + nodes.topLeft] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (_rawMap[_blockObjType + nodes.topRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (_rawMap[_blockObjType + nodes.bottomLeft] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				|| (_rawMap[_blockObjType + nodes.bottomRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.GRANITE
				// any texture that forces flags
				|| ((TEXTURE_INFO[tex1].FLAG & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((TEXTURE_INFO[tex2].FLAG & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((TEXTURE_INFO[tex3].FLAG & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((TEXTURE_INFO[tex4].FLAG & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((TEXTURE_INFO[tex5].FLAG & TEXTURE.ARID) === TEXTURE.ARID)
				|| ((TEXTURE_INFO[tex6].FLAG & TEXTURE.ARID) === TEXTURE.ARID)
			) {

				// point next to a swamp, water (outdated comment? "or there is a tree in bottom right point!")
				_rawMap[_blockSites + i] = SITE.FLAG_OCCUPIED;

			} else if ( 6 === (mines = ((TEXTURE_INFO[tex1].FLAG & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((TEXTURE_INFO[tex2].FLAG & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((TEXTURE_INFO[tex3].FLAG & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((TEXTURE_INFO[tex4].FLAG & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((TEXTURE_INFO[tex5].FLAG & TEXTURE.ROCK) === TEXTURE.ROCK)
				+ ((TEXTURE_INFO[tex6].FLAG & TEXTURE.ROCK) === TEXTURE.ROCK) )
				// but some height rules apply to mines as well
				&& (_rawMap[i] - _rawMap[nodes.bottomRight]) >= -3
			) {
				if ( ((TEXTURE_INFO[tex7].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
					|| ((TEXTURE_INFO[tex8].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
					|| ((TEXTURE_INFO[tex9].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
					|| ((TEXTURE_INFO[texA].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
					|| ((_rawMap[_blockObjType + nodes.bottomRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				) {
					// snow or lava too close or a tree
					_rawMap[_blockSites + i] = SITE.FLAG_OCCUPIED;
				} else {
					// woohoo, a mine!
					_rawMap[_blockSites + i] = SITE.MINE_OCCUPIED;
				}
			} else if ( mines > 0 ) {

				_rawMap[_blockSites + i] = SITE.FLAG_OCCUPIED;

			} else if (
				((_rawMap[_blockObjType + nodes.bottomRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				// height differences
				|| ((_rawMap[i] - _rawMap[nodes.bottomRight]) > 3)
				|| ((_rawMap[nodes.bottomRight] - _rawMap[i]) > 1)
				|| (Math.abs(_rawMap[i] - _rawMap[nodes.topLeft]) > 3)
				|| (Math.abs(_rawMap[i] - _rawMap[nodes.topRight]) > 3)
				|| (Math.abs(_rawMap[i] - _rawMap[nodes.left]) > 3)
				|| (Math.abs(_rawMap[i] - _rawMap[nodes.right]) > 3)
				|| (Math.abs(_rawMap[i] - _rawMap[nodes.bottomLeft]) > 3)
			) {
				// so we can build a road, check for mountain meadow
				if (tex1 === 0x12 || tex2 === 0x12 || tex3 === 0x12 || tex4 === 0x12 || tex5 === 0x12 || tex6 === 0x12) {

					_rawMap[_blockSites + i] = SITE.FLAG_OCCUPIED;

				} else {

					_rawMap[_blockSites + i] = SITE.FLAG;

				}
			} else if ( ((TEXTURE_INFO[tex7].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((TEXTURE_INFO[tex8].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((TEXTURE_INFO[tex9].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
				|| ((TEXTURE_INFO[texA].FLAG & TEXTURE.EXTREME) === TEXTURE.EXTREME)
			) {

				_rawMap[_blockSites + i] = SITE.FLAG_OCCUPIED;

			} else if ( ((_rawMap[_blockObjType + nodes.topLeft] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				|| ((_rawMap[_blockObjType + nodes.topRight] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				|| ((_rawMap[_blockObjType + nodes.left] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				|| ((_rawMap[_blockObjType + nodes.right] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				|| ((_rawMap[_blockObjType + nodes.bottomLeft] & OBJECT_TYPE.MATCH) === OBJECT_TYPE.TREE)
				// or a too big height difference further away, so first get some nodes for us to work with
				|| !(radiusNodes = getRadiusNodes(i % _width, ~~((i - (i % _width)) / _width), 2, true))
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[0]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[1]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[2]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[3]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[4]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[5]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[6]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[7]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[8]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[9]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[10]]) > 2)
				|| (Math.abs(_rawMap[i] - _rawMap[radiusNodes[11]]) > 2)
			) {
				// can build a hut, check for mountain meadow texture
				if (tex1 === 0x12 || tex2 === 0x12 || tex3 === 0x12 || tex4 === 0x12 || tex5 === 0x12 || tex6 === 0x12) {

					_rawMap[_blockSites + i] = SITE.HUT_OCCUPIED;

				} else {

					_rawMap[_blockSites + i] = SITE.HUT;

				}
			} else {
				// can build a castle, check for mountain meadow texture
				if (tex1 === 0x12 || tex2 === 0x12 || tex3 === 0x12 || tex4 === 0x12 || tex5 === 0x12 || tex6 === 0x12) {

					_rawMap[_blockSites + i] = SITE.CASTLE_OCCUPIED;

				} else {

					_rawMap[_blockSites + i] = SITE.CASTLE;

				}
			}
		}
	};

	// TODO: replace mark array with _cache32bit to improve performance
	var changeHeight = function(x, y, radius, strength) {
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
			marked;
		// sanitize
		strength = ~~strength;
		radius = Math.abs(~~radius);
		// optimize for speed by reducing unnecessary processing related to being positive or negative
		if(strength < 0) {
			if(strength < -MAX_ELEVATION) strength = -MAX_ELEVATION;
			nodes = getRadiusNodes(x, y, radius);
			for(i = 0; i < nodes.length; i++) {
				index = nodes[i];
				newHeight = _rawMap[index] + strength;
				if(newHeight < 0) newHeight = 0;
				// any change?
				if(_rawMap[index] !== newHeight) {
					_rawMap[index] = newHeight;
					// get nodes around the current index
					around = getNodesByIndex(index);
					// store in an array that we use to clean up the _blockTouch
					if(_rawMap[_blockTouch + index] === 0) mark.push(index);
					if(_rawMap[_blockTouch + around.left] === 0) mark.push(around.left);
					if(_rawMap[_blockTouch + around.right] === 0) mark.push(around.right);
					if(_rawMap[_blockTouch + around.topLeft] === 0) mark.push(around.topLeft);
					if(_rawMap[_blockTouch + around.topRight] === 0) mark.push(around.topRight);
					if(_rawMap[_blockTouch + around.bottomLeft] === 0) mark.push(around.bottomLeft);
					if(_rawMap[_blockTouch + around.bottomRight] === 0) mark.push(around.bottomRight);
					// mark the level of touch so we know how to avoid doing unnecessary work
					_rawMap[_blockTouch + index] |= TOUCH_MARKED;
					_rawMap[_blockTouch + around.left] |= TOUCH_FROM_RIGHT;
					_rawMap[_blockTouch + around.right] |= TOUCH_FROM_LEFT;
					_rawMap[_blockTouch + around.topLeft] |= TOUCH_FROM_BOTTOM_RIGHT;
					_rawMap[_blockTouch + around.bottomRight] |= TOUCH_FROM_TOP_LEFT;
					_rawMap[_blockTouch + around.topRight] |= TOUCH_FROM_BOTTOM_LEFT;
					_rawMap[_blockTouch + around.bottomLeft] |= TOUCH_FROM_TOP_RIGHT;
				}
			}
			marked = nodes.length;
		} else if(strength > 0) {
			if(strength > MAX_ELEVATION) strength = MAX_ELEVATION;
			nodes = getRadiusNodes(x, y, radius);
			for(i = 0; i < nodes.length; i++) {
				index = nodes[i];
				newHeight = _rawMap[index] + strength;
				if(newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT;
				// any change?
				if(_rawMap[index] !== newHeight) {
					_rawMap[index] = newHeight;
					// get nodes around the current index
					around = getNodesByIndex(index);
					// store in an array that we use to clean up the _blockTouch
					if(_rawMap[_blockTouch + index] === 0) mark.push(index);
					if(_rawMap[_blockTouch + around.left] === 0) mark.push(around.left);
					if(_rawMap[_blockTouch + around.right] === 0) mark.push(around.right);
					if(_rawMap[_blockTouch + around.topLeft] === 0) mark.push(around.topLeft);
					if(_rawMap[_blockTouch + around.topRight] === 0) mark.push(around.topRight);
					if(_rawMap[_blockTouch + around.bottomLeft] === 0) mark.push(around.bottomLeft);
					if(_rawMap[_blockTouch + around.bottomRight] === 0) mark.push(around.bottomRight);
					// mark the level of touch so we know how to avoid doing unnecessary work
					_rawMap[_blockTouch + index] |= TOUCH_MARKED;
					_rawMap[_blockTouch + around.left] |= TOUCH_FROM_RIGHT;
					_rawMap[_blockTouch + around.right] |= TOUCH_FROM_LEFT;
					_rawMap[_blockTouch + around.topLeft] |= TOUCH_FROM_BOTTOM_RIGHT;
					_rawMap[_blockTouch + around.bottomRight] |= TOUCH_FROM_TOP_LEFT;
					_rawMap[_blockTouch + around.topRight] |= TOUCH_FROM_BOTTOM_LEFT;
					_rawMap[_blockTouch + around.bottomLeft] |= TOUCH_FROM_TOP_RIGHT;
				}
			}
			marked = nodes.length;
		}
		while(mark.length > marked) {
			for(i = 0; i < mark.length; i++) {
				index = mark[i];
				j = _rawMap[_blockTouch + index];
				// are we done with this node already?
				if((j & TOUCH_MARKED) === 0) {
					// we have processed it now!
					_rawMap[_blockTouch + index] |= TOUCH_MARKED;
					marked++;
					// reset difference indicator
					maxDiff = 0;
					// cache the current value
					k = _rawMap[index];
					// get the surrounding nodes
					around = getNodesByIndex(index);
					// see if we need to adjust the elevation of this node
					if(j & TOUCH_FROM_RIGHT) {
						diff = k - _rawMap[around.right];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_LEFT) {
						diff = k - _rawMap[around.left];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_TOP_LEFT) {
						diff = k - _rawMap[around.topLeft];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_BOTTOM_RIGHT) {
						diff = k - _rawMap[around.bottomRight];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_TOP_RIGHT) {
						diff = k - _rawMap[around.topRight];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					if(j & TOUCH_FROM_BOTTOM_LEFT) {
						diff = k - _rawMap[around.bottomLeft];
						if(Math.abs(diff) > MAX_ELEVATION && Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
					}
					// okay, do we have anything to change in this node?
					if(maxDiff) {
						// calculate how much to change the height in this node
						if(maxDiff < 0) maxDiff += MAX_ELEVATION;
						else if(maxDiff > 0) maxDiff -= MAX_ELEVATION;
						// now we know how much change has to be done
						newHeight = k - maxDiff;
						// TODO: commented out because these two lines should never get executed anyway, so remove later?
						//if(newHeight < 0) { newHeight = 0; }
						//else if(newHeight > MAX_HEIGHT) { newHeight = MAX_HEIGHT; }
						// it is always a good idea to draw your changes
						_rawMap[index] = newHeight;
						// mark the level of touch so we know how to avoid doing unnecessary work
						if((j & TOUCH_FROM_LEFT) === 0) {
							if(_rawMap[_blockTouch + around.left] === 0) mark.push(around.left);
							_rawMap[_blockTouch + around.left] |= TOUCH_FROM_RIGHT;
						}
						if((j & TOUCH_FROM_RIGHT) === 0) {
							if(_rawMap[_blockTouch + around.right] === 0) mark.push(around.right);
							_rawMap[_blockTouch + around.right] |= TOUCH_FROM_LEFT;
						}
						if((j & TOUCH_FROM_TOP_LEFT) === 0) {
							if(_rawMap[_blockTouch + around.topLeft] === 0) mark.push(around.topLeft);
							_rawMap[_blockTouch + around.topLeft] |= TOUCH_FROM_BOTTOM_RIGHT;
						}
						if((j & TOUCH_FROM_BOTTOM_RIGHT) === 0) {
							if(_rawMap[_blockTouch + around.bottomRight] === 0) mark.push(around.bottomRight);
							_rawMap[_blockTouch + around.bottomRight] |= TOUCH_FROM_TOP_LEFT;
						}
						if((j & TOUCH_FROM_TOP_RIGHT) === 0) {
							if(_rawMap[_blockTouch + around.topRight] === 0) mark.push(around.topRight);
							_rawMap[_blockTouch + around.topRight] |= TOUCH_FROM_BOTTOM_LEFT;
						}
						if((j & TOUCH_FROM_BOTTOM_LEFT) === 0) {
							if(_rawMap[_blockTouch + around.bottomLeft] === 0) mark.push(around.bottomLeft);
							_rawMap[_blockTouch + around.bottomLeft] |= TOUCH_FROM_TOP_RIGHT;
						}
					}
				}
			}
		}
		// clean our changes in the touch block
		for(i = 0; i < mark.length; i++) {
			_rawMap[_blockTouch + mark[i]] = 0;
		}
	};

	var getAllSitesOfType = function(siteType, strictMode) {
		var i,
			mask = 0xFF,
			sites = [];

		if(!strictMode && (siteType & 0xF0) === 0) {
			mask = 0x0F;
			siteType &= mask;
		}

		for(i = 0; i < _size; i++) {
			if((_rawMap[_blockSites + i] & mask) === siteType) {
				sites.push(i);
			}
		}

		return sites;
	};

	var getBlock = function(index) {
		index = ~~index;
		if(index >= 0 && index <= 13) {
			return _rawMap.subarray(index * _size, ++index * _size);
		}
	};

	var getNodesByIndex = function(index) {
		var x = index % _width,
			y = (index - x) / _width,
			xL = (x > 0 ? x : _width) - 1,
			xR = (x + 1) % _width,
			yT = ((y > 0 ? y : _height) - 1) * _width,
			yB = ((y + 1) % _height) * _width,
			odd = (y & 1) === 1;

		y *= _width;

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
	};

	// return array of indexes for nearby points
	// outset = boolean, return only the outermost radius points
	var getRadiusNodes = function(x, y, radius, outset, buffer) {
		var nodes,
			i,
			j,
			k = 0,
			l,
			m,
			first = 0,
			last = 0,
			removeLast = 1 === (y & 1),
			xCache,
			yCache,
			maxRadius;

		// sanitize input
		radius = Math.abs(~~radius);
		outset = !!outset;
		// see if we add the point itself to result blocks
		if(radius === 0) {
			nodes = new Uint32Array(buffer || 1);
			nodes[0] = y * _width + x;
		// make sure the radius does not overlap itself
		} else {
			// some limits have to be in place
			maxRadius = ~~((Math.min(_width, _height) - 2) / 2);
			if(radius > maxRadius) radius = maxRadius;
			// cache X and Y values to avoid recalculating all the time
			xCache = new Uint32Array(radius * 2 + 1);
			yCache = new Uint32Array(radius * 2 + 1);
			// see if we need to care about borders
			if((x - radius) >= 0 && (y - radius) >= 0 && (x + radius) < _width && (y + radius) < _height) {
				// we are nowhere close
				for(j = 0, i = -radius; i <= radius; i++) {
					xCache[j] = x + i;
					yCache[j++] = y + i;
				}
			} else {
				// have to play it safe
				for(j = 0, i = -radius; i <= radius; i++) {
					xCache[j] = (_width + x + i) % _width;
					yCache[j++] = (_height + y + i) % _height;
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
					nodes[k++] = yCache[radius] * _width + xCache[i];
				}
				// then all the other Y rows
				for(j = 1; j <= radius; j++) {
					if(removeLast) {
						last--;
					} else {
						first++;
					}
					removeLast = !removeLast;
					l = yCache[radius - j] * _width;
					m = yCache[radius + j] * _width;
					for(i = first; i <= last; i++) {
						nodes[k++] = l + xCache[i];
						nodes[k++] = m + xCache[i];
					}
				}
			} else {
				// calculate the total size of resulting array
				nodes = new Uint32Array(buffer || 6 * radius);
				// current line first and last
				nodes[k++] = yCache[radius] * _width + xCache[first];
				nodes[k++] = yCache[radius] * _width + xCache[last];
				// first and last on all lines except the topmost and bottommost row
				for(j = 1; j < radius; j++) {
					if(removeLast) {
						last--;
					} else {
						first++;
					}
					removeLast = !removeLast;
					l = yCache[radius - j] * _width;
					m = yCache[radius + j] * _width;
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
				l = yCache[radius - j] * _width;
				m = yCache[radius + j] * _width;
				for(i = first; i <= last; i++) {
					nodes[k++] = l + xCache[i];
					nodes[k++] = m + xCache[i];
				}
			}
		}

		return nodes;
	};

	var getRawData = function() {
		return _rawMap;
	};

	var getTextureNodesByIndex = function(index) {
		var x = index % _width,
			y = (index - x) / _width,
			xL = (x > 0 ? x : _width) - 1,
			xR,
			yT = ((y > 0 ? y : _height) - 1) * _width,
			odd = (y & 1) === 1;

		y *= _width;

		if(odd) {
			// only needed here
			xR = (x + 1) % _width
			// odd
			return {
				bottomLeft: y + xL + _size,
				bottom: index,
				bottomRight: index + _size,
				topLeft: yT + x,
				top: yT + x + _size,
				topRight: yT + xR
			}
		} else {
			// even
			return {
				bottomLeft: y + xL + _size,
				bottom: index,
				bottomRight: index + _size,
				topLeft: yT + xL,
				top: yT + xL + _size,
				topRight: yT + x
			}
		}
	};

	// will not maintain harbor flag
	var getTexturesByIndex = function(index) {
		var nodes = getTextureNodesByIndex(index);

		return {
			topLeft: _rawMap[_blockTextures + nodes.topLeft] & TEXTURE.TO_ID_VALUE,
			top: _rawMap[_blockTextures + nodes.top] & TEXTURE.TO_ID_VALUE,
			topRight: _rawMap[_blockTextures + nodes.topRight] & TEXTURE.TO_ID_VALUE,
			bottomLeft: _rawMap[_blockTextures + nodes.bottomLeft] & TEXTURE.TO_ID_VALUE,
			bottom: _rawMap[_blockTextures + nodes.bottom] & TEXTURE.TO_ID_VALUE,
			bottomRight: _rawMap[_blockTextures + nodes.bottomRight] & TEXTURE.TO_ID_VALUE
		}
	};

	// flats out the height map, doesn't do anything else
	var initializeHeight = function(baseLevel) {
		var i;

		baseLevel = ~~baseLevel;

		if(baseLevel < 0) baseLevel = 0;
		else if(baseLevel > MAX_HEIGHT) baseLevel = MAX_HEIGHT;

		for(i = 0; i < _size; i++) {
			_rawMap[_blockHeight + i] = baseLevel;
		}
	};

	var initializeTexture = function(texture) {
		var i;
		// sanitize
		texture = Math.abs(~~texture) & TEXTURE.TO_ID_VALUE;
		// is this a known texture?
		if(TEXTURE_INFO[texture]) {
			for(i = 0; i < _size * 2; i++) {
				_rawMap[_blockTextures + i] = texture;
			}
		}
	};

	var isEachTextureSame = function(index, texture) {
		var nodes,
			topLeft,
			top,
			topRight,
			bottomLeft,
			bottom,
			bottomRight;

		if(_lastTextureIndex === index) {
			topLeft = _lastTextureTopLeft;
			top = _lastTextureTop;
			topRight = _lastTextureTopRight;
			bottomLeft = _lastTextureBottomLeft;
			bottom = _lastTextureBottom;
			bottomRight = _lastTextureBottomRight;
		} else {
			nodes = getTextureNodesByIndex(index);
			_lastTextureIndex = index;
			_lastTextureTopLeft     = topLeft     = _rawMap[_blockTextures + nodes.topLeft    ] & TEXTURE.TO_ID_VALUE;
			_lastTextureTop         = top         = _rawMap[_blockTextures + nodes.top        ] & TEXTURE.TO_ID_VALUE;
			_lastTextureTopRight    = topRight    = _rawMap[_blockTextures + nodes.topRight   ] & TEXTURE.TO_ID_VALUE;
			_lastTextureBottomLeft  = bottomLeft  = _rawMap[_blockTextures + nodes.bottomLeft ] & TEXTURE.TO_ID_VALUE;
			_lastTextureBottom      = bottom      = _rawMap[_blockTextures + nodes.bottom     ] & TEXTURE.TO_ID_VALUE;
			_lastTextureBottomRight = bottomRight = _rawMap[_blockTextures + nodes.bottomRight] & TEXTURE.TO_ID_VALUE;
		}

		return (topLeft === texture)
			&& (top === texture)
			&& (topRight === texture)
			&& (bottomLeft === texture)
			&& (bottom === texture)
			&& (bottomRight === texture);
	};

	var isEachTextureWithAnyOfFlags = function(index, flags) {
		var nodes,
			topLeft,
			top,
			topRight,
			bottomLeft,
			bottom,
			bottomRight;

		if(_lastTextureIndex === index) {
			topLeft = _lastTextureTopLeft;
			top = _lastTextureTop;
			topRight = _lastTextureTopRight;
			bottomLeft = _lastTextureBottomLeft;
			bottom = _lastTextureBottom;
			bottomRight = _lastTextureBottomRight;
		} else {
			nodes = getTextureNodesByIndex(index);
			_lastTextureIndex = index;
			_lastTextureTopLeft     = topLeft     = _rawMap[_blockTextures + nodes.topLeft    ] & TEXTURE.TO_ID_VALUE;
			_lastTextureTop         = top         = _rawMap[_blockTextures + nodes.top        ] & TEXTURE.TO_ID_VALUE;
			_lastTextureTopRight    = topRight    = _rawMap[_blockTextures + nodes.topRight   ] & TEXTURE.TO_ID_VALUE;
			_lastTextureBottomLeft  = bottomLeft  = _rawMap[_blockTextures + nodes.bottomLeft ] & TEXTURE.TO_ID_VALUE;
			_lastTextureBottom      = bottom      = _rawMap[_blockTextures + nodes.bottom     ] & TEXTURE.TO_ID_VALUE;
			_lastTextureBottomRight = bottomRight = _rawMap[_blockTextures + nodes.bottomRight] & TEXTURE.TO_ID_VALUE;
		}

		return !!(TEXTURE_INFO[topLeft    ].FLAG & flags)
			&& !!(TEXTURE_INFO[top        ].FLAG & flags)
			&& !!(TEXTURE_INFO[topRight   ].FLAG & flags)
			&& !!(TEXTURE_INFO[bottomLeft ].FLAG & flags)
			&& !!(TEXTURE_INFO[bottom     ].FLAG & flags)
			&& !!(TEXTURE_INFO[bottomRight].FLAG & flags);
	};

	var setTexture = function(index, texture) {
		var nodes;
		// sanitize
		texture = Math.abs(~~texture);
		// is this a known texture?
		if(TEXTURE_INFO[texture]) {
			nodes = getTextureNodesByIndex(index);
			_rawMap[_blockTextures + nodes.bottomLeft] = texture;
			_rawMap[_blockTextures + nodes.bottom] = texture;
			_rawMap[_blockTextures + nodes.bottomRight] = texture;
			_rawMap[_blockTextures + nodes.topLeft] = texture;
			_rawMap[_blockTextures + nodes.top] = texture;
			_rawMap[_blockTextures + nodes.topRight] = texture;
		}
	};

	return {
		calculateAreaMap: calculateAreaMap,
		calculateLightMap: calculateLightMap,
		calculateSiteMap: calculateSiteMap,
		changeHeight: changeHeight,
		getAllSitesOfType: getAllSitesOfType,
		getBlock: getBlock,
		getNodesByIndex: getNodesByIndex,
		getRadiusNodes: getRadiusNodes,
		getRawData: getRawData,
		getTextureNodesByIndex: getTextureNodesByIndex,
		getTexturesByIndex: getTexturesByIndex,
		initializeHeight: initializeHeight,
		initializeTexture: initializeTexture,
		isEachTextureSame: isEachTextureSame,
		isEachTextureWithAnyOfFlags: isEachTextureWithAnyOfFlags,
		setTexture: setTexture
	};
}

module.exports = Map;
},{"./constants":"c:\\Users\\Merri\\documents\\git\\map-generator\\src\\constants.js"}]},{},[]);
