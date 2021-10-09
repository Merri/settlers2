import { XORShift } from 'random-seedable'

import S2Map from './map'

import { CP437, COLOR, RESOURCE, SITE, TERRAIN, TEXTURE, TEXTURE_INFO, TREE_INFO } from './constants'

export default function Generator(random: XORShift) {
	let map,
		areas,
		baseLevel,
		colorMap,
		colors = [],
		data,
		deletedNodes,
		height,
		mass,
		nodes,
		players = [],
		size,
		seedMap,
		width

	function expandTo(index: number, value: number, current = null) {
		var aroundExpandTo = map.getNodesByIndex(index)

		seedMap[index] = value
		if (current != null) {
			delete nodes[current]
			deletedNodes.push(current)
		}
		mass++

		Object.keys(aroundExpandTo).forEach(function (key) {
			index = aroundExpandTo[key]
			if (seedMap[index] === 0) {
				seedMap[index] = 1
				if (deletedNodes.length) {
					nodes[deletedNodes.pop()] = index
				} else {
					nodes.push(index)
				}
			}
		})
	}

	function seed(options: Record<string, any> = {}) {
		// if (!options || !options.length) options = {};
		var likelyhood = options.likelyhood,
			givenStartingPoints = ~~options.startingPoints,
			givenMassRatio = ~~options.massRatio

		// width = 1024 || (~~(random.float() * 20) + 7) * 16,
		// height = 1024 || (~~(random.float() * 20) + 7) * 16,
		width = ~~options.width
		height = ~~options.height
		size = width * height
		var borderProtection = ~~options.borderProtection
		if (borderProtection) {
			borderProtection = ~~(Math.min(width, height) / borderProtection)
		}
		seedMap = new Uint8Array(size)

		// sanitize user input
		if (givenStartingPoints < 1) {
			givenStartingPoints = 1
		} else if (givenStartingPoints > 512) {
			givenStartingPoints = 512
		}
		if (givenStartingPoints > size >> 2) {
			givenStartingPoints = size >> 2
		}

		if (givenMassRatio < 1) {
			givenMassRatio = 1
		} else if (givenMassRatio > 99) {
			givenMassRatio = 99
		}

		nodes = []
		deletedNodes = []
		mass = 0
		var massRatio = ~~((size / 100) * givenMassRatio)
		var startingPoints = 0

		map = S2Map(width, height)
		data = map.getRawData()

		// randomize some starting points
		let value = 255
		while (startingPoints < givenStartingPoints) {
			const x = ~~(random.float() * (width - borderProtection * 2)) + borderProtection
			const y = ~~(random.float() * (height - borderProtection * 2)) + borderProtection
			const index = y * width + x

			if (seedMap[index] === 0) {
				expandTo(index, value)
				startingPoints++
			}
		}
		/*
        x = ~~(random.float() * (width - borderProtection * 2)) + borderProtection;
        y = ~~(random.float() * (height - borderProtection * 2)) + borderProtection;
        index = y * width + x;
        var direction = ~~(random.float() * 6),
            around;
        while (startingPoints < givenStartingPoints) {
            around = map.getNodesByIndex(index);
            switch (direction) {
                case 1:
                    index = around.topLeft;
                    break;
                case 2:
                    index = around.topRight;
                    break;
                case 3:
                    index = around.right;
                    break;
                case 4:
                    index = around.bottomRight;
                    break;
                case 5:
                    index = around.bottomLeft;
                    break;
                default:
                    index = around.left;
            }

            x = index % width;
            y = ~~((index - x) / width);

            if (x >= borderProtection && x < (width - borderProtection)
                && y >= borderProtection && y < (height - borderProtection)) {
                if (random.float() < 0.15 && seedMap[index] === 0) {
                    if ((startingPoints & 7) === 0) {
                        direction = (6 + (direction + ~~(random.float() * 3) - 1)) % 6;
                    }
                    expandTo(index, value);
                    startingPoints++;
                }
            }
        }
        */

		var expander = 7

		// do the land expansion
		if (mass > 0) {
			while (mass < massRatio) {
				value--
				for (let i = nodes.length; i > 0; --i) {
					const index = nodes[i]
					if (index != null) {
						const around = map.getNodesByIndex(index)

						const total =
							~~(seedMap[around.left] > 1) +
							~~(seedMap[around.right] > 1) +
							~~(seedMap[around.topLeft] > 1) +
							~~(seedMap[around.topRight] > 1) +
							~~(seedMap[around.bottomLeft] > 1) +
							~~(seedMap[around.bottomRight] > 1)

						if (random.float() <= likelyhood[total]) {
							if (expander > 0) {
								expandTo(index, ~~((value / expander) * total) + 2, i)
							} else {
								expandTo(index, ~~(value * (1 + -expander / 20) * total) + 2, i)
							}
						}
					}
				}
				if (value === 2) {
					expander--
					value = 3
				}
			}
		}
	}

	// options: baseLevel
	function createHeight(options) {
		// if (!options || !options.length) options = {};
		baseLevel = options.baseLevel = ~~options.baseLevel
		options.groundLevel = Math.abs(~~options.groundLevel)
		options.flatten = Math.abs(options.flatten)
		options.noiseOnWater = !!options.noiseOnWater

		if (options.groundLevel > 5) {
			options.groundLevel = 5
		}
		if (options.flatten < 1) {
			options.flatten = 1
		} else if (options.flatten > 100) {
			options.flatten = 100
		}

		map.initializeHeight(options.baseLevel)

		var x, y
		// push land up or down before we start!
		var i = options.baseLevel <= 30 ? options.groundLevel : -options.groundLevel
		var index = 0
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				if (seedMap[index] > 1) {
					map.changeHeight(x, y, 0, i)
				}
				index++
			}
		}

		var around
		var j, k
		var value
		// draw the final height map based on what we have
		index = 0
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				value = seedMap[index]
				if (value > 1) {
					around = map.getRadiusNodes(x, y, 5)
					for (k = j = i = 0; i < around.length; i++) {
						if (seedMap[around[i]] > 1) {
							k += seedMap[around[i]]
							j++
						} else {
							break
						}
					}
					/*
                    around = map.getNodesByIndex(index);
                    i1 = seedMap[around.left];
                    i2 = seedMap[around.right];
                    i3 = seedMap[around.topLeft];
                    i4 = seedMap[around.topRight];
                    i5 = seedMap[around.bottomLeft];
                    i6 = seedMap[around.bottomRight];
                    i7 = (i1 > 1) + (i2 > 1) + (i3 > 1) + (i4 > 1) + (i5 > 1) + (i6 > 1);
                    */
					if (i > around.length - 6) {
						// calculate avarage around node
						// i = Math.round((i1 + i2 + i3 + i4 + i5 + i6) / i7);
						i = Math.round(k / j)
						// go up or down
						// MOUNTAIN RANGES
						// map.changeHeight(x, y, ((value & 15) & (i & 15)) / 2, ~~((value - i) / 8));
						// ROUGH
						// map.changeHeight(x, y, ((value & 15) | (i & 15)) / 4, ~~((value - i) / 6));
						// HILLS
						// map.changeHeight(x, y, ((value & 3) | (i & 3)) / 1.25, ~~((value - i + 3) / 7));
						// HUGE MOUNTAINS
						// map.changeHeight(x, y, (value - i) / 32, (value - i) > 0 ? (value & i & 81) + 1 : -((value & i & 5) - 1) / 2);
						// GIGANTIC MOUNTAINS
						// map.changeHeight(x, y, (value - i) / 24, (value - i) > 0 ? (value & i & 81) + 1 : -((value & i & 5) - 1) / 2);
						// OUT OF THIS WORLD MOUNTAINS
						map.changeHeight(
							x,
							y,
							Math.min((value - i) / options.flatten, 1),
							value - i > 0 ? (value & i & 81) + 1 : -(value & i & 3) - 1
						)
					}
				}
				index++
			}
		}

		// some extra randomize
		if (options.randomize > 0) {
			if (!options.noiseOnWater) {
				index = 0
				for (y = 0; y < height; y++) {
					for (x = 0; x < width; x++) {
						if (seedMap[index] > 1 || data[index] !== baseLevel) {
							map.changeHeight(
								x,
								y,
								0,
								~~(random.float() * (options.randomize * 2 + 1) - options.randomize)
							)
						}
						index++
					}
				}
			} else {
				index = 0
				for (y = 0; y < height; y++) {
					for (x = 0; x < width; x++) {
						map.changeHeight(x, y, 0, ~~(random.float() * (options.randomize * 2 + 1) - options.randomize))
						index++
					}
				}
			}
		}

		map.calculateLightMap()
	}

	function createBaseTextures(options) {
		var i,
			j,
			heightTotal = new Uint32Array(60),
			smallestHeight = 60,
			biggestHeight = 0,
			mountainTextures = [1, 11, 12, 13],
			textureBlock1 = size * 1,
			textureBlock2 = size * 2,
			siteBlock = size * 8,
			siteNodes

		// sanitize
		options.mountainGenerate = ~~options.mountainGenerate
		options.seamless = !!~~options.seamless
		options.texture = ~~options.texture & TEXTURE.TO_ID_VALUE
		options.waterTexture = ~~options.waterTexture & TEXTURE.TO_ID_VALUE

		map.initializeTexture(options.texture)

		// find out where we have the most mass
		for (i = 0; i < size; i++) {
			heightTotal[data[i]]++
			if (smallestHeight > data[i]) {
				smallestHeight = data[i]
			}
			if (biggestHeight < data[i]) {
				biggestHeight = data[i]
			}
		}

		// draw water texture
		for (i = 0; i < size; i++) {
			j = seedMap[i] & 3
			if (data[i] >= baseLevel - 2 && data[i] <= baseLevel + 2) {
				if (seedMap[i] < 2) {
					map.setTexture(i, options.waterTexture)
				} else if (j > 1) {
					// Meadow / Pasture / Tundra
					map.setTexture(i, 0x07 + (seedMap[i] & 3))
				} else if (j === 0) {
					// Flower variant
					map.setTexture(i, 0x0f)
				}
			}
			// else if (/*j === 0 &&*/ smallestHeight > data[i] - 2) {
			//    // Swamp
			//    map.setTexture(i, 0x03);
			// }
		}

		map.initializeObjects()
		map.calculateSiteMap()

		// draw mountain texture
		if (options.mountainGenerate === 7) {
			for (i = 0; i < size; i++) {
				if (!map.isAnyTextureWithAnyOfFlags(i, TEXTURE.ARID | TEXTURE.IMPASSABLE)) {
					siteNodes = map.getNodesByIndex(i)
					if (
						(data[siteBlock + siteNodes.left] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.right] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.topLeft] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.topRight] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.bottomLeft] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.bottomRight] & 0xf7) === 0x01
					) {
						map.setTexture(i, mountainTextures[~~(random.float() * 4)])
					}
				}
			}
		} else if (options.mountainGenerate === 6) {
			for (i = 0; i < size; i++) {
				if (
					(data[siteBlock + i] & 0xf7) === 0x01 &&
					!map.isAnyTextureWithAnyOfFlags(i, TEXTURE.ARID | TEXTURE.IMPASSABLE)
				) {
					siteNodes = map.getNodesByIndex(i)
					if (
						(data[siteBlock + siteNodes.left] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.right] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.topLeft] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.topRight] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.bottomLeft] & 0xf7) === 0x01 &&
						(data[siteBlock + siteNodes.bottomRight] & 0xf7) === 0x01
					) {
						map.setTexture(i, mountainTextures[~~(random.float() * 4)])
					}
				}
			}
		} else {
			for (i = 0; i < size; i++) {
				if (
					(data[siteBlock + i] & 0xf7) === 0x01 &&
					!map.isAnyTextureWithAnyOfFlags(i, TEXTURE.ARID | TEXTURE.IMPASSABLE)
				) {
					siteNodes = map.getNodesByIndex(i)
					if (
						options.mountainGenerate <=
						~~((data[siteBlock + siteNodes.left] & 0xf7) === 0x01) +
							~~((data[siteBlock + siteNodes.right] & 0xf7) === 0x01) +
							~~((data[siteBlock + siteNodes.topLeft] & 0xf7) === 0x01) +
							~~((data[siteBlock + siteNodes.topRight] & 0xf7) === 0x01) +
							~~((data[siteBlock + siteNodes.bottomLeft] & 0xf7) === 0x01) +
							~~((data[siteBlock + siteNodes.bottomRight] & 0xf7) === 0x01)
					) {
						map.setTexture(i, mountainTextures[~~(random.float() * 4)])
					}
				}
			}
		}

		// draw snow tops
		for (i = 0; i < size; i++) {
			if (data[i] >= biggestHeight - 1) {
				// snow
				map.setTexture(i, 0x02)
			}
		}

		// seamless mode
		if (!options.seamless) {
			for (i = 0; i < width; i++) {
				switch (data[textureBlock1 + i]) {
					// savannah and steppe
					case 0x00:
					case 0x0e:
						// swamp
						map.setTexture(i, 0x03)
						break
					// meadow
					case 0x08:
					case 0x09:
					case 0x0a:
					case 0x0f:
						// swamp
						map.setTexture(i, 0x03)
						break
					// desert
					case 0x04:
					case 0x07:
						// snow
						map.setTexture(i, 0x02)
						break
					// magenta
					case 0x11:
						// lava
						map.setTexture(i, 0x10)
						break
					// mountain meadow
					case 0x12:
					case 0x22:
						// lava
						map.setTexture(i, 0x10)
						break
					// mountain
					case 0x01:
					case 0x0b:
					case 0x0c:
					case 0x0d:
						// snow
						map.setTexture(i, 0x02)
						break
					// water
					case 0x05:
					case 0x06:
						// water (no ships)
						map.setTexture(i, 0x13)
						break
					default:
						switch (data[textureBlock2 + i]) {
							// savannah and steppe
							case 0x00:
							case 0x0e:
								// swamp
								map.setTexture(i, 0x03)
								break
							// meadow
							case 0x08:
							case 0x09:
							case 0x0a:
							case 0x0f:
								// swamp
								map.setTexture(i, 0x03)
								break
							// desert
							case 0x04:
							case 0x07:
								// snow
								map.setTexture(i, 0x02)
								break
							// magenta
							case 0x11:
								// lava
								map.setTexture(i, 0x10)
								break
							// mountain meadow
							case 0x12:
							case 0x22:
								// lava
								map.setTexture(i, 0x10)
								break
							// mountain
							case 0x01:
							case 0x0b:
							case 0x0c:
							case 0x0d:
								// snow
								map.setTexture(i, 0x02)
								break
							// water
							case 0x05:
							case 0x06:
								// water (no ships)
								map.setTexture(i, 0x13)
								break
							default:
						}
				}
			}
			for (; i < size; i += width) {
				switch (data[textureBlock1 + i]) {
					// savannah and steppe
					case 0x00:
					case 0x0e:
						// swamp
						map.setTexture(i, 0x03)
						break
					// meadow
					case 0x08:
					case 0x09:
					case 0x0a:
					case 0x0f:
						// swamp
						map.setTexture(i, 0x03)
						break
					// desert
					case 0x04:
					case 0x07:
						// snow
						map.setTexture(i, 0x02)
						break
					// magenta
					case 0x11:
						// lava
						map.setTexture(i, 0x10)
						break
					// mountain meadow
					case 0x12:
					case 0x22:
						// lava
						map.setTexture(i, 0x10)
						break
					// mountain
					case 0x01:
					case 0x0b:
					case 0x0c:
					case 0x0d:
						// snow
						map.setTexture(i, 0x02)
						break
					// water
					case 0x05:
					case 0x06:
						// water (no ships)
						map.setTexture(i, 0x13)
						break
					default:
						switch (data[textureBlock2 + i]) {
							// savannah and steppe
							case 0x00:
							case 0x0e:
								// swamp
								map.setTexture(i, 0x03)
								break
							// meadow
							case 0x08:
							case 0x09:
							case 0x0a:
							case 0x0f:
								// swamp
								map.setTexture(i, 0x03)
								break
							// desert
							case 0x04:
							case 0x07:
								// snow
								map.setTexture(i, 0x02)
								break
							// magenta
							case 0x11:
								// lava
								map.setTexture(i, 0x10)
								break
							// mountain meadow
							case 0x12:
							case 0x22:
								// lava
								map.setTexture(i, 0x10)
								break
							// mountain
							case 0x01:
							case 0x0b:
							case 0x0c:
							case 0x0d:
								// snow
								map.setTexture(i, 0x02)
								break
							// water
							case 0x05:
							case 0x06:
								// water (no ships)
								map.setTexture(i, 0x13)
								break
							default:
						}
				}
			}
		}

		// post processing
		for (i = 0; i < size; i++) {
			if (map.isAnyTextureWithAnyOfFlags(i, TEXTURE.ROCK)) {
				map.replaceTextureAnyOfFlags(i, 0x12, TEXTURE.ARABLE)
			} else if (map.isMixedTextureWithAllOfFlags(i, TEXTURE.WATER | TEXTURE.HABITABLE)) {
				if (random.float() < 0.5) {
					map.replaceTextureAnyOfFlags(i, 0x04, TEXTURE.WATER | TEXTURE.HABITABLE)
				}
			} else if (map.isMixedTextureWithAllOfFlags(i, TEXTURE.WATER | TEXTURE.ROCK)) {
				map.replaceTextureAnyOfFlags(i, 0x12, TEXTURE.WATER | TEXTURE.ARID)
			} else if (map.isMixedTextureWithAllOfFlags(i, TEXTURE.WATER | TEXTURE.MOUNT_MEADOW)) {
				map.replaceTextureAnyOfFlags(i, 0x12, TEXTURE.WATER | TEXTURE.ARID | TEXTURE.HABITABLE)
			}
		}

		for (i = 0; i < size; i++) {
			if (map.isMixedTextureWithAllOfFlags(i, TEXTURE.ARID | TEXTURE.ARABLE)) {
				if (random.float() < 0.75) {
					map.replaceTextureAnyOfFlags(i, 0x0e, TEXTURE.ARABLE)
				}
			}
		}

		for (i = 0; i < size; i++) {
			if (map.isMixedTextureWithAllOfFlags(i, TEXTURE.STEPPE | TEXTURE.ARABLE)) {
				if (random.float() < 0.75) {
					map.replaceTextureAnyOfFlags(i, 0x00, TEXTURE.MEADOW)
				}
			} else if (map.isMixedTextureWithAllOfFlags(i, TEXTURE.WATER | TEXTURE.ARID)) {
				if (random.float() < 0.15) {
					map.setTexture(i, 0x0e)
				}
			} else if (map.isMixedTextureWithAllOfFlags(i, TEXTURE.STEPPE | TEXTURE.ARID)) {
				if (random.float() < 0.5) {
					map.setTexture(i, 0x0e)
				}
			} else if (map.isEachTextureSame(i, 0x03)) {
				if (random.float() < 0.05) {
					map.setTexture(i, 0x13)
				}
			}
		}

		const swampPositions = []

		for (i = 0; i < size; i++) {
			if (
				data[siteBlock + i] !== SITE.IMPASSABLE &&
				map.isMixedTextureWithAllOfFlags(i, TEXTURE.WATER | TEXTURE.MEADOW)
			) {
				swampPositions.push(i)
			}
		}

		while (swampPositions.length) {
			map.setTexture(swampPositions.shift(), 0x03)
		}

		/*
        var radiusNodes = map.getRadiusNodes(0, 1, 2, true);
        for (i = 0; i < 12; i++) {
            map.setTexture(radiusNodes[i], 0x10);
        }
        */

		map.calculateSiteMap()
		areas = map.calculateAreaMap()
	}

	function getAreas() {
		return areas
	}

	function getRandomPlayerPositions(maxPlayerCount, radius) {
		players = []

		// sanitize
		maxPlayerCount = ~~maxPlayerCount
		if (maxPlayerCount < 0) {
			maxPlayerCount = 0
		} else if (maxPlayerCount > 10) {
			maxPlayerCount = 10
		}

		radius = ~~radius

		function generateRandomPlayers(sites) {
			var nodesNearPlayer

			if (sites.length > 0 && players.length < maxPlayerCount) {
				// randomize a position from given plausible sites
				var index = sites[~~(random.float() * sites.length)]
				var x = index % width
				var y = ~~((index - x) / width)

				// getRadiusNodes returns a typed array; must convert it to regular array
				nodesNearPlayer = Array.apply([], map.getRadiusNodes(x, y, radius))

				// remove nodes near newly randomized player
				sites = sites.filter(function (nearbyIndex) {
					return nodesNearPlayer.indexOf(nearbyIndex) === -1
				})

				// add player to list of known players
				players.push({
					index: index,
					x: x,
					y: y,
				})

				// get the next player
				generateRandomPlayers(sites)
			}
		}

		// start the recursive call (if necessary)
		if (maxPlayerCount > 0) {
			generateRandomPlayers(map.getAllSitesOfType(SITE.CASTLE))
		}

		return players
	}

	function applyResources(options) {
		var i,
			j,
			k,
			treeIndex,
			eachTextureIsSameKind,
			usableLandmass = 0,
			newResource,
			nearbyNodes,
			resources = {
				freshWater: 0,
				mineCoal: 0,
				mineIronOre: 0,
				mineGold: 0,
				mineGranite: 0,
				fish: 0,
				granite: 0,
				tree: 0,
			},
			textureFlag,
			textures,
			objectIndexBlock = size * 4,
			objectTypeBlock = size * 5,
			siteBlock = size * 8,
			touchBlock = size * 10,
			resourceBlock = size * 11

		// clean up
		for (i = 0; i < size; i++) {
			data[objectIndexBlock + i] = 0
			data[objectTypeBlock + i] = 0
		}

		options = options || {}
		// sanitize values
		options.treeRatio = options.treeRatio != null ? ~~options.treeRatio : 33
		if (options.treeRatio < 0) {
			options.treeRatio = 0
		} else if (options.treeRatio > 50) {
			options.treeRatio = 0.5
		} else {
			options.treeRatio /= 100
		}

		options.graniteRatio = options.graniteRatio != null ? ~~options.graniteRatio : 15
		if (options.graniteRatio < 0) {
			options.graniteRatio = 0
		} else if (options.graniteRatio > 25) {
			options.graniteRatio = 0.25
		} else {
			options.graniteRatio /= 100
		}

		for (i = 0; i < size; i++) {
			newResource = 0
			textures = map.getTexturesByIndex(i)
			// we have to drop support flags so that ie. Mountain Meadow is comparable to the Habitable Mountain texture (essentially the same)
			textureFlag = TEXTURE_INFO[textures.topLeft].FLAG & TEXTURE.DROP_SUPPORT
			eachTextureIsSameKind =
				textureFlag === (TEXTURE_INFO[textures.top].FLAG & TEXTURE.DROP_SUPPORT) &&
				textureFlag === (TEXTURE_INFO[textures.topRight].FLAG & TEXTURE.DROP_SUPPORT) &&
				textureFlag === (TEXTURE_INFO[textures.bottomLeft].FLAG & TEXTURE.DROP_SUPPORT) &&
				textureFlag === (TEXTURE_INFO[textures.bottom].FLAG & TEXTURE.DROP_SUPPORT) &&
				textureFlag === (TEXTURE_INFO[textures.bottomRight].FLAG & TEXTURE.DROP_SUPPORT)
			if (eachTextureIsSameKind) {
				// water?
				if (textures.topLeft === 0x05) {
					nearbyNodes = map.getNodesByIndex(i)
					// can we find an accessible site around?
					if (
						data[siteBlock + nearbyNodes.left] !== SITE.IMPASSABLE ||
						data[siteBlock + nearbyNodes.right] !== SITE.IMPASSABLE ||
						data[siteBlock + nearbyNodes.topLeft] !== SITE.IMPASSABLE ||
						data[siteBlock + nearbyNodes.topRight] !== SITE.IMPASSABLE ||
						data[siteBlock + nearbyNodes.bottomLeft] !== SITE.IMPASSABLE ||
						data[siteBlock + nearbyNodes.bottomRight] !== SITE.IMPASSABLE
					) {
						// fish!
						newResource = RESOURCE.FISH
						resources.fish++
					}
				} else if (textureFlag & TEXTURE.ROCK) {
					// add coal / iron ore / gold / granite
					newResource = seedMap[i] & 0x3f
					const quantity = (((i & 0x07) / 7) * 5 + 2) | 0
					if (newResource < 0x1e) {
						newResource = RESOURCE.COAL | quantity
						resources.mineCoal += quantity
					} else if (newResource < 0x28) {
						newResource = RESOURCE.GOLD | quantity
						resources.mineGold += quantity
					} else if (newResource < 0x3e) {
						newResource = RESOURCE.IRON_ORE | quantity
						resources.mineIronOre += quantity
					} else {
						newResource = RESOURCE.GRANITE | quantity
						resources.mineGranite += quantity
					}
				} else if (textureFlag & TEXTURE.HABITABLE) {
					if (textureFlag & TEXTURE.ARABLE) {
						// fresh water!
						newResource = RESOURCE.FRESH_WATER
						resources.freshWater++
					}
				}
			}

			data[resourceBlock + i] = newResource
			// mark spot unfit for trees and granite
			if (data[siteBlock + i] === SITE.IMPASSABLE) {
				data[touchBlock + i] = 1
			} else {
				usableLandmass++
			}
		}

		// mark spots around headquarters unfir for trees and granite
		for (i = 0; i < players.length; i++) {
			nearbyNodes = map.getRadiusNodes(players[i].x, players[i].y, 5)
			for (j = 0; j < nearbyNodes.length; j++) {
				data[touchBlock + nearbyNodes[j]] = 1
			}
			usableLandmass -= j
		}

		// calculate target amounts for trees
		options.treeRatio *= usableLandmass

		// apply trees
		while (usableLandmass > 0 && resources.tree < options.treeRatio) {
			i = ~~(random.float() * size)
			if (data[touchBlock + i] === 0) {
				nearbyNodes = map.getRadiusNodes(i % width, ~~((i - (i % width)) / width), seedMap[i] & 0x07)
				for (j = 0; j < nearbyNodes.length; j++) {
					k = nearbyNodes[j]
					// see if we this location is free to use
					if (data[touchBlock + k] === 0) {
						// random here avoids getting stuck...
						if ((seedMap[k] & 0x03) < 2 || random.float() < 0.2) {
							const allowPalmTrees = map.isMixedTextureWithAllOfFlags(k, TEXTURE.WATER | TEXTURE.ARID)
							const treeCount = allowPalmTrees ? 9 : 6
							// mark done
							data[touchBlock + k] = 1
							treeIndex = ~~(random.float() * treeCount)
							// skip through palm trees
							if (!allowPalmTrees && treeIndex > 2) {
								treeIndex += 3
							}
							// type
							data[objectTypeBlock + k] = 0xc4 | (treeIndex >> 2)
							// Pine / Birch / Oak / Palm 1
							data[objectIndexBlock + k] = 0x30 | ((treeIndex & 3) * 0x40) | ~~(random.float() * 0x08)
							// increase counter
							resources.tree++
							usableLandmass--
						}
					}
				}
			}
		}

		// calculate target amounts for granite
		options.graniteRatio *= usableLandmass

		// apply granite
		while (usableLandmass > 0 && resources.granite < options.graniteRatio) {
			i = ~~(random.float() * size)
			if (data[touchBlock + i] === 0) {
				nearbyNodes = map.getRadiusNodes(i % width, ~~((i - (i % width)) / width), seedMap[i] & 0x07)
				for (j = 0; j < nearbyNodes.length; j++) {
					k = nearbyNodes[j]
					// see if we this location is free to use
					if (data[touchBlock + k] === 0) {
						// random here avoids getting stuck...
						if ((seedMap[k] & 0x03) < 2 || random.float() < 0.2) {
							// mark done
							data[touchBlock + k] = 1
							// type
							data[objectTypeBlock + k] = 0xcc | (seedMap[k] & 0x01)
							// quantity
							data[objectIndexBlock + k] = ~~(random.float() * 5) + 2
							// increase counter
							resources.granite++
							usableLandmass--
						}
					}
				}
			}
		}

		// clean up
		for (i = 0; i < size; i++) {
			data[touchBlock + i] = 0
		}

		// must do this again now
		map.calculateSiteMap()

		return resources
	}

	function draw(options) {
		// if (!options || !options.length) options = {};
		// draw the stuff so we can see stuff
		var canvas = options.canvas,
			buffer = canvas.getContext('2d'),
			image = buffer.getImageData(0, 0, width, height),
			view = image.data,
			lightMapBlock = size * 12

		canvas.width = width
		canvas.height = height

		var viewType = options.viewType
		options.terrain = ~~options.terrain || TERRAIN.GREENLAND

		switch (viewType) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14: {
				for (let i = size * viewType, j = 0, k = i + size; i < k; i++) {
					view[j++] = data[i]
					view[j++] = data[i]
					view[j++] = data[i]
					view[j++] = 255
				}
				break
			}
			case 'seed': {
				for (let i = 0, j = 0; i < size; i++) {
					view[j++] = 255 - seedMap[i]
					view[j++] = 255 - seedMap[i]
					view[j++] = 255 - seedMap[i]
					view[j++] = 255
				}

				nodes.forEach(function (nodeIndex) {
					view[nodeIndex << 2] = 96
					view[(nodeIndex << 2) + 1] = 176
					view[(nodeIndex << 2) + 2] = 255
				})
				break
			}
			case 'fast': {
				let color = colors[options.terrain].data,
					textureColorOriginal = COLOR.ORIGINAL[options.terrain],
					g,
					c1,
					color1,
					color2,
					color3,
					texturesBlock = size,
					objectIndexBlock = size * 4,
					objectTypeBlock = size * 5,
					drawPos = 0

				for (let i = 0; i < size; i++) {
					color1 = null
					switch (data[objectTypeBlock + i]) {
						// trees
						case 196:
						case 197:
						case 198:
						case 199: {
							const treeIndex =
								((data[objectTypeBlock + i] & 2) << 2) | ((data[objectIndexBlock + i] & 0xc0) >> 6)
							// these colors are from screenshot of Map Editor / S2EDIT.EXE
							// FYI: tree indexes with color are 0, 1, 2, 6, 7, 8, 12, 13, 14, 18, 19, 20
							// the other half are not painted on the map
							switch ((treeIndex % 6) + options.terrain * 6) {
								// GREENLAND
								case 0:
									color1 = 0
									color2 = 73
									color3 = 18
									break
								case 1:
									color1 = 6
									color2 = 93
									color3 = 15
									break
								case 2:
									color1 = 0
									color2 = 51
									color3 = 19
									break
								// WASTELAND
								case 6:
									color1 = 69
									color2 = 59
									color3 = 18
									break
								case 7:
									color1 = 69
									color2 = 67
									color3 = 42
									break
								case 8:
									color1 = 0
									color2 = 51
									color3 = 19
									break
								// WINTER WORLD
								case 12:
									color1 = 25
									color2 = 64
									color3 = 0
									break
								case 13:
									color1 = 41
									color2 = 86
									color3 = 0
									break
								case 14:
									color1 = 14
									color2 = 41
									color3 = 0
									break
								// NOTHING DRAWN ON MAP, these trees do not have a color
								default:
							}
							break
						}
						// granite
						case 204:
						case 205:
							// color1 = 134;
							// color2 = 122;
							// color3 = 103;
							break
						default:
					}

					if (color1 == null) {
						g = ~~((data[lightMapBlock + i] / 128) * 255)
						c1 = (g + 256 * textureColorOriginal[data[texturesBlock + i] & 0x3f]) * 4
						color1 = color[c1++]
						color2 = color[c1++]
						color3 = color[c1++]
					}

					view[drawPos++] = color1
					view[drawPos++] = color2
					view[drawPos++] = color3
					view[drawPos++] = 255
				}
				break
			}
			case 'pretty': {
				let color = colors[options.terrain].data,
					// row information so we can do some graphical adjustments
					y = -1,
					textureColorMerri = COLOR.MERRI[options.terrain],
					textureColorOriginal = COLOR.ORIGINAL[options.terrain],
					treeIndex,
					g,
					g2,
					c1,
					c2,
					c3,
					c4,
					c5,
					c6,
					c7,
					c8,
					c9,
					cA,
					cB,
					cC,
					color1,
					color2,
					color3,
					colorAlpha,
					drawNodes,
					leftNodes,
					textures,
					objectIndexBlock = size * 4,
					objectTypeBlock = size * 5,
					drawPos = 0

				// and then we just loop through!
				for (let i = 0; i < size; i++) {
					// keep track of current row
					if (i % width === 0) {
						y++
					}
					drawNodes = map.getNodesByIndex(i)
					leftNodes = map.getNodesByIndex(drawNodes.left)
					// light and shadow calculation (not like the one in the game!)
					const j = data[i]
					g = 96
					g += 12 * (data[drawNodes.topRight] - j)
					g += 8 * (data[drawNodes.topLeft] - j)
					g -= 8 * (data[drawNodes.left] - j)
					g -= 16 * (data[leftNodes.bottomLeft] - j)
					// keep value within valid range
					g = Math.max(Math.min(255, g), 0)
					// grab some textures
					textures = map.getTexturesByIndex(i)
					// get a few color indexes...
					c1 = (g + 256 * textureColorMerri[textures.topLeft]) * 4
					c2 = (g + 256 * textureColorOriginal[textures.topLeft]) * 4
					c3 = (g + 256 * textureColorMerri[textures.top]) * 4
					c4 = (g + 256 * textureColorOriginal[textures.top]) * 4
					c5 = (g + 256 * textureColorMerri[textures.topRight]) * 4
					c6 = (g + 256 * textureColorOriginal[textures.topRight]) * 4
					c7 = (g + 256 * textureColorMerri[textures.bottomLeft]) * 4
					c8 = (g + 256 * textureColorOriginal[textures.bottomLeft]) * 4
					c9 = (g + 256 * textureColorMerri[textures.bottom]) * 4
					cA = (g + 256 * textureColorOriginal[textures.bottom]) * 4
					cB = (g + 256 * textureColorMerri[textures.bottomRight]) * 4
					cC = (g + 256 * textureColorOriginal[textures.bottomRight]) * 4
					// then make a color mixture...
					color1 =
						((color[c1++] +
							color[c2++] +
							color[c3++] +
							color[c4++] +
							color[c5++] +
							color[c6++] +
							color[c7++] +
							color[c8++] +
							color[c9++] +
							color[cA++] +
							color[cB++] +
							color[cC++]) /
							12) |
						0
					color2 =
						((color[c1++] +
							color[c2++] +
							color[c3++] +
							color[c4++] +
							color[c5++] +
							color[c6++] +
							color[c7++] +
							color[c8++] +
							color[c9++] +
							color[cA++] +
							color[cB++] +
							color[cC++]) /
							12) |
						0
					color3 =
						((color[c1++] +
							color[c2++] +
							color[c3++] +
							color[c4++] +
							color[c5++] +
							color[c6++] +
							color[c7++] +
							color[c8++] +
							color[c9++] +
							color[cA++] +
							color[cB++] +
							color[cC++]) /
							12) |
						0
					// water is almost transparent (water only node = 255 - 160)
					colorAlpha =
						255 -
						30 *
							(~~(textures.topLeft === 5) +
								~~(textures.top === 5) +
								~~(textures.topRight === 5) +
								~~(textures.bottomLeft === 5) +
								~~(textures.bottom === 5) +
								~~(textures.bottomRight === 5))
					// not done yet! check for objects!
					switch (data[objectTypeBlock + i]) {
						// trees
						case 196:
						case 197:
						case 198:
						case 199:
							treeIndex =
								((data[objectTypeBlock + i] & 2) << 2) | ((data[objectIndexBlock + i] & 0xc0) >> 6)
							g =
								TREE_INFO[options.terrain][treeIndex].ALPHA +
								((data[objectIndexBlock + i] & 7) + 1) / 25 -
								0.32
							g2 = 1 - g
							color1 = ~~(color1 * g2 + TREE_INFO[options.terrain][treeIndex].RED * g)
							color2 = ~~(color2 * g2 + TREE_INFO[options.terrain][treeIndex].GREEN * g)
							color3 = ~~(color3 * g2 + TREE_INFO[options.terrain][treeIndex].BLUE * g)
							break
						// granite
						case 204:
						case 205:
							g = data[objectIndexBlock + i] / 10
							g2 = ((color1 + color2 + color3) / 3 + 64) * g
							color1 = Math.min(255, color1 * (1 - g) + g2)
							color2 = Math.min(255, color2 * (1 - g) + g2)
							color3 = Math.min(255, color3 * (1 - g) + g2)
							break
						default:
					}
					view[drawPos++] = color1
					view[drawPos++] = color2
					view[drawPos++] = color3
					view[drawPos++] = colorAlpha
				}
				break
			}
			default:
				throw new Error('Unknown viewType option ' + options.viewType)
		}

		buffer.putImageData(image, 0, 0)
	}

	function sanitizeStringAsCP437(text) {
		var output = '',
			code,
			i
		for (i = 0; i < text.length; i++) {
			code = CP437.indexOf(~~text.charCodeAt(i))
			if (code > -1) {
				output += text[i]
			} else {
				output += String.fromCharCode(CP437[0xdb])
			}
		}
		return output
	}

	function veryInefficientStringToCP437(text, length) {
		var output = [],
			code,
			i
		for (i = 0; i < length; i++) {
			code = CP437.indexOf(~~text.charCodeAt(i))
			if (code > -1) {
				output.push(code)
			} else {
				output.push(0xdb)
			}
		}
		return output
	}

	function getFileBlob(options) {
		// 2577 => header 2352
		//       + block headers 16 * 14 = 224
		//       + footer 0xFF
		var buffer = new ArrayBuffer(2577 + size * 14),
			view = new DataView(buffer),
			byteView,
			pos = 0,
			i,
			objectIndexBlock = size * 4,
			objectTypeBlock = size * 5

		options = options || {}

		options.title = options.title || 'Unknown map'
		options.author = options.author || "Merri'sMapGenerator"
		options.terrain = ~~options.terrain || TERRAIN.GREENLAND
		// WORLD_V1.0
		view.setUint8(pos++, 0x57)
		view.setUint8(pos++, 0x4f)
		view.setUint8(pos++, 0x52)
		view.setUint8(pos++, 0x4c)
		view.setUint8(pos++, 0x44)
		view.setUint8(pos++, 0x5f)
		view.setUint8(pos++, 0x56)
		view.setUint8(pos++, 0x31)
		view.setUint8(pos++, 0x2e)
		view.setUint8(pos++, 0x30)
		// TITLE
		veryInefficientStringToCP437(options.title, 19).forEach(function (character) {
			view.setUint8(pos++, character)
		})
		view.setUint8(pos++, 0)
		// WIDTH & HEIGHT
		view.setUint16(pos++, width, true)
		pos++
		view.setUint16(pos++, height, true)
		pos++
		// TERRAIN
		view.setUint8(pos++, options.terrain)
		// PLAYER COUNT
		view.setUint8(pos++, players.length)
		// AUTHOR
		veryInefficientStringToCP437(options.author, 19).forEach(function (character) {
			view.setUint8(pos++, character)
		})
		view.setUint8(pos++, 0)
		// HEADQUARTERS
		if (players.length > 0) {
			view.setUint16(pos, players[0].x, true)
			view.setUint16(pos + 14, players[0].y, true)
		} else {
			view.setUint16(pos, 0xffff, true)
			view.setUint16(pos + 14, 0xffff, true)
		}

		if (players.length > 1) {
			view.setUint16(pos + 2, players[1].x, true)
			view.setUint16(pos + 16, players[1].y, true)
		} else {
			view.setUint16(pos + 2, 0xffff, true)
			view.setUint16(pos + 16, 0xffff, true)
		}

		if (players.length > 2) {
			view.setUint16(pos + 4, players[2].x, true)
			view.setUint16(pos + 18, players[2].y, true)
		} else {
			view.setUint16(pos + 4, 0xffff, true)
			view.setUint16(pos + 18, 0xffff, true)
		}

		if (players.length > 3) {
			view.setUint16(pos + 6, players[3].x, true)
			view.setUint16(pos + 20, players[3].y, true)
		} else {
			view.setUint16(pos + 6, 0xffff, true)
			view.setUint16(pos + 20, 0xffff, true)
		}

		if (players.length > 4) {
			view.setUint16(pos + 8, players[4].x, true)
			view.setUint16(pos + 22, players[4].y, true)
		} else {
			view.setUint16(pos + 8, 0xffff, true)
			view.setUint16(pos + 22, 0xffff, true)
		}

		if (players.length > 5) {
			view.setUint16(pos + 10, players[5].x, true)
			view.setUint16(pos + 24, players[5].y, true)
		} else {
			view.setUint16(pos + 10, 0xffff, true)
			view.setUint16(pos + 24, 0xffff, true)
		}

		if (players.length > 6) {
			view.setUint16(pos + 12, players[6].x, true)
			view.setUint16(pos + 26, players[6].y, true)
		} else {
			view.setUint16(pos + 12, 0xffff, true)
			view.setUint16(pos + 26, 0xffff, true)
		}

		pos += 28

		// set object types and indexes for players
		for (i = 0; i < players.length; i++) {
			data[objectIndexBlock + players[i].index] = i
			data[objectTypeBlock + players[i].index] = 0x80
		}

		// UNPLAYABILITY INDICATOR
		view.setUint8(pos++, 0)
		// LEADER FACES
		view.setUint8(pos++, 0)
		view.setUint8(pos++, 3)
		view.setUint8(pos++, 6)
		view.setUint8(pos++, 9)
		view.setUint8(pos++, 1)
		view.setUint8(pos++, 4)
		view.setUint8(pos++, 7)

		// SET AREAS
		for (i = 0; i < Math.min(areas.length, 250); i++) {
			view.setUint8(pos++, areas[i].type)
			view.setUint16(pos++, areas[i].x, true)
			pos++
			view.setUint16(pos++, areas[i].y, true)
			pos++
			view.setUint32(pos, areas[i].mass, true)
			pos += 4
		}

		// SKIP UNUSED AREAS
		pos += (250 - i) * 9

		// MAP FILE IDENTIFICATION
		view.setUint8(pos++, 0x11)
		view.setUint8(pos++, 0x27)
		view.setUint32(pos, 0, true)
		pos += 4
		view.setUint16(pos++, width, true)
		pos++
		view.setUint16(pos++, height, true)
		pos++
		// MAP DATA
		for (i = 0; i < 14; i++) {
			view.setUint8(pos++, 0x10)
			view.setUint8(pos++, 0x27)
			view.setUint32(pos, 0)
			pos += 4
			view.setUint16(pos++, width, true)
			pos++
			view.setUint16(pos++, height, true)
			pos++
			view.setUint16(pos++, 1, true)
			pos++
			view.setUint32(pos, size, true)
			pos += 4
			byteView = new Uint8Array(buffer, pos, size)
			pos += size
			byteView.set(data.subarray(i * size, (i + 1) * size))
		}
		// END OF FILE
		view.setUint8(pos++, 0xff)

		// restore object types and indexes for players
		for (i = 0; i < players.length; i++) {
			data[objectIndexBlock + players[i].index] = 0
			data[objectTypeBlock + players[i].index] = 0
		}

		// we are done!
		return new Blob([new Uint8Array(buffer)], { type: 'application/octet-binary' })
	}

	function isReadyToDraw() {
		return colorMap
	}

	function setColorMap(name) {
		return new Promise(function (resolve, reject) {
			colorMap = document.createElement('img')

			colorMap.onload = function (e) {
				// create a canvas where we can get our needs
				var buffer,
					canvas = document.createElement('canvas')

				try {
					canvas.width = 256
					canvas.height = 768
					// get drawing context
					buffer = canvas.getContext('2d')
					// and draw the image
					buffer.drawImage(e.target, 0, 0)
					// greenland
					colors[0] = buffer.getImageData(0, 0, 256, 256)
					// wasteland
					colors[1] = buffer.getImageData(0, 256, 256, 256)
					// winter world
					colors[2] = buffer.getImageData(0, 512, 256, 256)
					// mark as done
					colorMap = true
					// resolve promise with colors array
					resolve(colors)
				} catch (err) {
					colorMap = false
					// just pass the error
					reject(err)
				}
			}

			colorMap.onerror = reject

			switch (name) {
				case 'alternative':
					colorMap.src = '/assets/map-generator/lightmap_index_alternative.png'
					break
				case 'high-contrast':
					colorMap.src = '/assets/map-generator/lightmap_index_high-contrast.png'
					break
				default:
					colorMap.src = '/assets/map-generator/lightmap_index.png'
			}
		})
	}

	return {
		applyResources,
		createBaseTextures,
		createHeight,
		draw,
		getAreas,
		getFileBlob,
		getRandomPlayerPositions,
		isReadyToDraw,
		seed,
		setColorMap,
		sanitizeStringAsCP437,
	}
}
