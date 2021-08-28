(function($){
	var colors = [],
		gouraud = document.createElement('img');
	
	gouraud.onload = function(e) {
		// create a canvas where we can get our needs
		var canvas = $(document.createElement('canvas')).attr('width', 768).attr('height', 256);
		// get drawing context
		var buffer = canvas[0].getContext('2d');
		// and draw the image
		buffer.drawImage(e.target, 0, 0);
		// greenland
		colors[0] = buffer.getImageData(0, 0, 256, 256);
		// wasteland
		colors[1] = buffer.getImageData(256, 0, 256, 256);
		// winter world
		colors[2] = buffer.getImageData(512, 0, 256, 256);
	};
	gouraud.src = './type1.png';
	
	// Merri's custom index for gouraud shading (0xFF = invalid/unused texture)
	var COLOR_TYPE_M = [
		[236, 195, 124, 231, 199, 242, 242, 199, 233, 232, 231, 195, 194, 193, 217, 232, 249, 254, 169, 242, 249, 249, 249,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,195,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
		[98, 145, 23, 41, 85, 42, 42, 85, 32, 166, 33, 113, 245, 41, 34, 33, 251, 254, 97, 42, 251, 251, 251,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,113,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
		[122, 118, 179, 178, 182, 242, 242, 182, 122, 172, 101, 120, 144, 119, 171, 101, 249, 252, 123, 242, 249, 249, 249,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,120,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]
	];
	// Original game index for gouraud shading (0xFF = invalid/unused texture)
	var COLOR_TYPE_O = [
		[233, 216, 123, 233, 199, 240, 240, 199, 231, 233, 230, 216, 216, 215, 236, 231, 57, 254, 216, 240, 57, 57, 57,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,216,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
		[114, 167, 139, 160, 85, 42, 42, 85, 165, 166, 166, 33, 212, 212, 167, 114, 248, 254, 160, 42, 248, 248, 248,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,33,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
		[123, 116, 244, 244, 183, 240, 240, 183, 36, 102, 123, 117, 118, 118, 233, 120, 248, 254, 122, 240, 248, 248, 248,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,117,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]
	];
	
	var TREE_INFO = [[
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
	]];
	
	var drawMap = function(canvas, world) {
		var color = colors[world.type].data;
		var w = world.width, h = world.height;
		$(canvas).attr('width', w).attr('height', h);
		// create output buffer
		var buffer = canvas.getContext('2d');
		var imagedata = buffer.getImageData(0, 0, w, h);
		var image = imagedata.data;
		// row information so we can do some graphical adjustments
		var y = -1;
		var texture_color_merri = COLOR_TYPE_M[world.type], texture_color_original = COLOR_TYPE_O[world.type];
		
		var treeIndex, g, g2, t1, t2, t3, t4, t5, t6, c1, c2, c3, c4, c5, c6, c7, c8, c9, cA, cB, cC, j;
		
		// and then we just loop through!
		for(var i = 0; i < world.size; i++) {
			// keep track of current row
			if( i % w === 0) y++;
			// gouraud calculation (not like the one in the game!)
			g = 96, j = world.nodeHeight[i];
			g += 12 * (world.nodeHeight[ world.nodeTopRight(i) ] - j);
			g += 8 * (world.nodeHeight[ world.nodeTopLeft(i) ] - j);
			g -= 8 * (world.nodeHeight[ world.nodeLeft(i) ] - j);
			g -= 16 * (world.nodeHeight[ world.nodeBottomLeft( world.nodeLeft(i) ) ] - j);
			// keep value within valid range
			g = Math.max(Math.min(255, g), 0);
			// grab some textures
			t1 = world.nodeTexture1[i] & 0x3F;
			t2 = world.nodeTexture2[i] & 0x3F;
			t3 = world.nodeTexture1[world.nodeTopLeft(i)] & 0x3F;
			t4 = world.nodeTexture2[world.nodeTopLeft(i)] & 0x3F;
			t5 = world.nodeTexture1[world.nodeTopRight(i)] & 0x3F;
			t6 = world.nodeTexture2[world.nodeLeft(i)] & 0x3F;
			// get a few color indexes...
			c1 = (g * 256 + texture_color_merri[ t1 ]) * 4;
			c2 = (g * 256 + texture_color_original[ t1 ]) * 4;
			c3 = (g * 256 + texture_color_merri[ t2 ]) * 4;
			c4 = (g * 256 + texture_color_original[ t2 ]) * 4;
			c5 = (g * 256 + texture_color_merri[ t3 ]) * 4;
			c6 = (g * 256 + texture_color_original[ t3 ]) * 4;
			c7 = (g * 256 + texture_color_merri[ t4 ]) * 4;
			c8 = (g * 256 + texture_color_original[ t4 ]) * 4;
			c9 = (g * 256 + texture_color_merri[ t5 ]) * 4;
			cA = (g * 256 + texture_color_original[ t5 ]) * 4;
			cB = (g * 256 + texture_color_merri[ t6 ]) * 4;
			cC = (g * 256 + texture_color_original[ t6 ]) * 4;
			// then make a color mixture...
			image[i * 4] = ((color[c1++] + color[c2++] + color[c3++] + color[c4++] + color[c5++] + color[c6++] + color[c7++] + color[c8++] + color[c9++] + color[cA++] + color[cB++] + color[cC++] ) / 12) | 0;
			image[i * 4 + 1] = ((color[c1++] + color[c2++] + color[c3++] + color[c4++] + color[c5++] + color[c6++] + color[c7++] + color[c8++] + color[c9++] + color[cA++] + color[cB++] + color[cC++] ) / 12) | 0;
			image[i * 4 + 2] = ((color[c1++] + color[c2++] + color[c3++] + color[c4++] + color[c5++] + color[c6++] + color[c7++] + color[c8++] + color[c9++] + color[cA++] + color[cB++] + color[cC++] ) / 12) | 0;
			// water is almost transparent (water only node = 255 - 160)
			image[i * 4 + 3] = 255 - 30 * ((t1 === 5) + (t2 === 5) + (t3 === 5) + (t4 === 5) + (t5 === 5) + (t6 === 5));
			
			// not done yet! check for objects!
			switch(world.nodeObjectType[i]) {
				// trees
				case 196:
				case 197:
				case 198:
				case 199:
					treeIndex = ((world.nodeObjectType[i] & 2) << 2) | ((world.nodeObjectIndex[i] & 0xC0) >> 6);
					g = TREE_INFO[world.type][treeIndex].alpha + (((world.nodeObjectIndex[i] & 7) + 1) / 25) - 0.32;
					g2 = (1 - g);
					image[i * 4] = ~~(image[i * 4] * g2 + TREE_INFO[world.type][treeIndex].red * g);
					image[i * 4 + 1] = ~~(image[i * 4 + 1] * g2 + TREE_INFO[world.type][treeIndex].green * g);
					image[i * 4 + 2] = ~~(image[i * 4 + 2] * g2 + TREE_INFO[world.type][treeIndex].blue * g);
					//image[i * 4 + 1] = ((image[i * 4 + 1] / 4) | 0) + 64;
					//image[i * 4 + 2] = (image[i * 4 + 2] / 2) | 0;
					/*
					g = ((world.nodeObjectIndex[i] & 7) + 3) / 10;
					g2 = (image[i * 4] + image[i * 4 + 1] + image[i * 4 + 2]) / 5;
					image[i * 4] = Math.min(255, image[i * 4] * (1 - g) + (g2 + 12) * g);
					image[i * 4 + 1] = Math.min(255, image[i * 4 + 1] * (1 - g) + (g2 + 32) * g);
					image[i * 4 + 2] = Math.min(255, image[i * 4 + 2] * (1 - g) + (g2 + 8) * g);
					*/
					break;
				// granite
				case 204:
				case 205:
					g = world.nodeObjectIndex[i] / 10;
					g2 = ((image[i * 4] + image[i * 4 + 1] + image[i * 4 + 2]) / 3 + 64 ) * g;
					image[i * 4] = Math.min(255, image[i * 4] * (1 - g) + g2);
					image[i * 4 + 1] = Math.min(255, image[i * 4 + 1] * (1 - g) + g2);
					image[i * 4 + 2] = Math.min(255, image[i * 4 + 2] * (1 - g) + g2);
					break;
			}
		}
		// and finally after all this we can draw the final result
		buffer.putImageData(imagedata, 0, 0);
	}
	
	window.drawMap = drawMap;
	
})(window.jQuery);

(function(jQuery){
	'use strict';
	// We do not want some default actions to happen
	var stopEvent = function(e) {
		e.preventDefault();
		e.stopPropagation();
	};

	// Map module
	var map = angular.module('map', []);
	
	// World Service
	map.factory('World', ['$rootScope', function($rootScope) {
		$rootScope.maps = [];
		// User has selected local files
		$rootScope.$on('localFiles.add', function(event, files) {
			angular.forEach(files, function(file) {
				// Create file object
				var mapFile = {
					localFile: file,
					localWorld: undefined
				};
				// Create a file reader (or if not supported we just create an empty object)
				var reader = FileReader ? new FileReader() : { readAsArrayBuffer: function(){} };
				reader.onload = function(e) {
					// Minimum filesize is 400 bytes for smallest compressed savegame map file
					if(file.size && file.size >= 400 && e.target && e.target.result) {
						// Be patient
						setTimeout(function() {
							// Try to load the map
							console.log(file.name);
							mapFile.localWorld = loadWorld(e.target.result);
							// Is it a valid file?
							if(mapFile.localWorld && mapFile.localWorld.size > 0 && mapFile.localWorld.nodeHeight) {
								// We can let the view know there is stuff to see
								$rootScope.maps.push(mapFile);
								$rootScope.$digest();
							}
						}, 0);
					}
				};
				reader.readAsArrayBuffer(file);
			});
		});
		return {
			'test': function() {}
		}
	}]);
	
	map.directive('canvas', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				drawMap(element[0], scope.map.localWorld);
			}
		}
	});
	
	// Allows selection of local files 
	map.directive('localFileSelector', function() {
		// Prepare multifile selector
		var localFileSelector = jQuery('<input type="file" multiple />');
		// Patch jQuery drag'n'drop issue: http://weblog.bocoup.com/using-datatransfer-with-jquery-events/
		if(jQuery.event.props.indexOf('dataTransfer') === -1) {
			jQuery.event.props.push('dataTransfer');
		}
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				// Opera/Presto workaround
				if(window.opera) {
					// file selector click() won't work if element isn't "alive" and in DOM
					element.append(localFileSelector.css({visibility: 'hidden', position: 'absolute'}));
				}
				// Called when a file is selected in multifile selector or a file is drag'n'dropped
				function localFileSelect(e) {
					// Get the list of selected files
					var files = !e.dataTransfer ? this.files : e.dataTransfer.files;
					// Throw event to factory if we have files
					if(files && files.length && files.length > 0) {
						scope.$emit('localFiles.add', files);
					}
					// Some things should not happen
					stopEvent(e);
				}
				// File selected
				localFileSelector.bind('change', localFileSelect);
				// Enable drag'n'drop
				element.bind('drop', localFileSelect);
				element.bind('dragenter', stopEvent);
				element.bind('dragover', stopEvent);
				element.bind('submit', function(e) {
					localFileSelector.click();
					stopEvent(e);
				});

			}
		};
	});
	
	// https://gist.github.com/thomseddon/3511330
	map.filter('bytes', function() {
		return function(bytes, precision) {
			if (!isFinite(bytes) || ~~bytes === 0) return '-';
			if (typeof precision === 'undefined') precision = 1;
			var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(~~bytes) / Math.log(1024));
			return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
		}
	});
	
	map.filter('title', function() {
		return function(title) {
			if(!title || !title.length || title.length === 0) {
				return 'Untitled';
			} else {
				return title;
			}
		}
	});
	
	// Controller
	map.controller('MapListCtrl', ['$scope', 'World', function($scope, World) {
		0
	}]);
})(window.jQuery);