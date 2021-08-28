// The Settlers II: Online Editor
// by Vesa Piittinen
// License: undecided Open Source license

// gouraud shading (this is required in drawing images that we see)
document.colors = [];
document.gouraud = document.createElement('img');
document.gouraud.onload = PrepareGouraud;
document.gouraud.src = './type1.png';
// water background textures for canvas elements (so we use JavaScript to cache these ready to memory)
document.water0 = document.createElement('img');
document.water0.src = './water0.png';
document.water1 = document.createElement('img');
document.water1.src = './water1.png';
document.water2 = document.createElement('img');
document.water2.src = './water2.png';

function PrepareGouraud(e) {
	// create a canvas where we can get our needs
	var canvas = $(document.createElement('canvas')).attr('width', 768).attr('height', 256);
	// get drawing context
	var buffer = canvas[0].getContext('2d');
	// and draw the image
	buffer.drawImage(e.target, 0, 0);
	// greenland
	document.colors[0] = buffer.getImageData(0, 0, 256, 256);
	// wasteland
	document.colors[1] = buffer.getImageData(256, 0, 256, 256);
	// winter world
	document.colors[2] = buffer.getImageData(512, 0, 256, 256);
}

// patch jQuery drag'n'drop issue: http://weblog.bocoup.com/using-datatransfer-with-jquery-events/
jQuery.event.props.push('dataTransfer');

// keep our UI responsive: http://www.kryogenix.org/days/2009/07/03/not-blocking-the-ui-in-tight-javascript-loops
jQuery.eachCallback = function(arr, process, callback) {
	var cnt = 0;
	function work() {
		var item = arr[cnt];
		process.apply(item);
		callback.apply(item, [cnt]);
		cnt += 1;
		if (cnt < arr.length) {
			setTimeout(work, 1);
		}
	}
	setTimeout(work, 1);
};
jQuery.fn.eachCallback = function(process, callback) {
	var cnt = 0;
	var jq = this;
	function work() {
		var item = jq.get(cnt);
		process.apply(item);
		callback.apply(item, [cnt]);
		cnt += 1;
		if (cnt < jq.length) {
			setTimeout(work, 1);
		}
	}
	setTimeout(work, 1);
};

// requestAnimationFrame support: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = 
			window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());

// CRC32
var TABLE_CRC32 = [
	0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
	0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
	0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
	0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
	0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
	0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
	0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
	0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
	0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
	0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
	0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
	0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
	0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
	0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
	0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
	0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
	0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683,
	0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
	0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
	0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
	0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
	0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
	0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
	0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
	0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
	0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
	0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
	0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
	0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
	0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
	0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
	0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
];

function crc32Uint8Array(arr, crc, length) {
	length = (length === window.undefined ? arr.length : length) | 0;
	crc = (crc === window.undefined ? 0 : crc) ^ (-1);
	for (var i = 0, maxi = length; i < maxi; i++) {
		crc = (crc >>> 8) ^ TABLE_CRC32[ (crc ^ arr[i]) & 0xFF ];
	}
	return crc ^ (-1);
}

// Merri's custom index for gouraud shading (0xFF = invalid/unused texture)
var COLOR_TYPE_M = [
	[236, 195, 124, 231, 199, 242, 242, 199, 233, 232, 231, 195, 194, 193, 217, 232, 249, 254, 169, 242, 249, 249, 249,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,195,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
	[98, 145, 23, 41, 85, 42, 42, 85, 32, 166, 33, 113, 245, 41, 34, 33, 251, 254, 97, 42, 251, 251, 251,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,113,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
	[122, 118, 179, 178, 182, 242, 242, 182, 122, 172, 101, 120, 144, 119, 171, 101, 249, 252, 123, 242, 249, 249, 249,,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,120,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]
];
// Original game index for gouraud shading (0xFF = invalid/unused texture)
var COLOR_TYPE_O = [
	[233, 216, 123, 233, 199, 240, 240, 199, 231, 233, 230, 216, 216, 215, 236, 231, 57, 254, 216, 240, 57, 57, 57,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,216,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
	[114, 167, 139, 160, 85, 42, 42, 85, 165, 166, 166, 33, 212, 212, 167, 114, 248, 254, 160, 42, 248, 248, 248,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,33,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF],
	[123, 116, 244, 244, 183, 240, 240, 183, 36, 102, 123, 117, 118, 118, 233, 120, 248, 254, 122, 240, 248, 248, 248,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,117,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]
];

function drawMap(canvas) {
	// get the world
	var world = canvas.world;
	$(canvas).attr('class', 'water' + world.type);
	var color = document.colors[world.type].data;
	var w = world.width, h = world.height;
	// create output buffer
	var buffer = canvas.getContext('2d');
	var imagedata = buffer.getImageData(0, 0, w, h);
	var image = imagedata.data;
	// row information so we can do some graphical adjustments
	var y = -1;
	var texture_color_merri = COLOR_TYPE_M[world.type], texture_color_original = COLOR_TYPE_O[world.type];
	// and then we just loop through!
	for(var i = 0; i < world.size; i++) {
		// keep track of current row
		if( i % w === 0) y++;
		// gouraud calculation (not like the one in the game!)
		var g = 96, j = world.nodeHeight[i];
		g += 12 * (world.nodeHeight[ world.nodeTopRight(i) ] - j);
		g += 8 * (world.nodeHeight[ world.nodeTopLeft(i) ] - j);
		g -= 8 * (world.nodeHeight[ world.nodeLeft(i) ] - j);
		g -= 16 * (world.nodeHeight[ world.nodeBottomLeft( world.nodeLeft(i) ) ] - j);
		// keep value within valid range
		g = Math.max(Math.min(255, g), 0);
		// grab some textures
		var t1 = world.nodeTexture1[i] & 0x3F;
		var t2 = world.nodeTexture2[i] & 0x3F;
		var t3 = world.nodeTexture1[world.nodeTopLeft(i)] & 0x3F;
		var t4 = world.nodeTexture2[world.nodeTopLeft(i)] & 0x3F;
		var t5 = world.nodeTexture1[world.nodeTopRight(i)] & 0x3F;
		var t6 = world.nodeTexture2[world.nodeLeft(i)] & 0x3F;
		// get a few color indexes...
		var c1 = (g * 256 + texture_color_merri[ t1 ]) * 4;
		var c2 = (g * 256 + texture_color_original[ t1 ]) * 4;
		var c3 = (g * 256 + texture_color_merri[ t2 ]) * 4;
		var c4 = (g * 256 + texture_color_original[ t2 ]) * 4;
		var c5 = (g * 256 + texture_color_merri[ t3 ]) * 4;
		var c6 = (g * 256 + texture_color_original[ t3 ]) * 4;
		var c7 = (g * 256 + texture_color_merri[ t4 ]) * 4;
		var c8 = (g * 256 + texture_color_original[ t4 ]) * 4;
		var c9 = (g * 256 + texture_color_merri[ t5 ]) * 4;
		var cA = (g * 256 + texture_color_original[ t5 ]) * 4;
		var cB = (g * 256 + texture_color_merri[ t6 ]) * 4;
		var cC = (g * 256 + texture_color_original[ t6 ]) * 4;
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
				image[i * 4] = (image[i * 4] / 3) | 0;
				image[i * 4 + 1] = ((image[i * 4 + 1] / 3) | 0) + 64;
				image[i * 4 + 2] = (image[i * 4 + 2] / 3) | 0;
				break;
			// granite
			case 204:
			case 205:
				var g = world.nodeObjectIndex[i] / 10;
				image[i * 4] = Math.min(255, image[i * 4] * (1 - g) + 160 * g);
				image[i * 4 + 1] = Math.min(255, image[i * 4 + 1] * (1 - g) + 160 * g);
				image[i * 4 + 2] = Math.min(255, image[i * 4 + 2] * (1 - g) + 160 * g);
				break;
		}
	}
	// and finally after all this we can draw the final result
	buffer.putImageData(imagedata, 0, 0);
}

function uploadMap(canvas) {
	var world = canvas.world;
	var file = canvas.file;
	$.ajax({
		type: 'POST',
		url: 'submit.php',
		data: {
			'filename': file.name,
			'filesize': file.size,
			'id': '',
			'width': world.width,
			'height': world.height,
			'title': world.title,
			'author': world.author,
			'campaign': world.campaign,
			'rttr': world.rttr,
			'players': world.players,
			'terrain': world.type,
			'continents': world.continents.length,
			'islands': world.islands.length,
			'harbors': world.harbors,
			'resource': world.resources,
			'stone': world.stone,
			'tree': world.tree,
			'areas': world.areas,
			'hqx': world.hqx,
			'hqy': world.hqy,
			'leader': world.leader,
			'crc32_blocks': crc32Uint8Array(world.nodeBlock),
			'crc32_textures': crc32Uint8Array(world.nodeBlock, window.undefined, world.size * 3)
		}
	}).done(function(msg){
		var response = $.parseJSON(msg);
		alert(
			response.id + "\n" +
			response.title + "\n" +
			response.author + "\n" +
			response.filename + "\n" +
			response.errors + "\n" +
			response.notices + "\n"
		);
	});
	return false;
}

// go through given FileList
function selectFiles(e) {
	e.stopPropagation();
	e.preventDefault();
	// get our files
	var files = !e.dataTransfer ? this.files : e.dataTransfer.files;
	// check if we got what we wanted
	if(!!files && !!files.length && files.length > 0) {
		// see what we got
		var drawList = [];
		for( var i = 0; i < files.length; i++) {
			var file = files[i];
			// minimum known size for a DAT/WLD/SWD file... was 16913 bytes, now best compressed savefile 400 bytes
			if( !!file.size && file.size >= 400 ) {
				// throw an effort at reading the file
				var reader = new FileReader();
				reader.onload = (function(file){return function(e){
					var world = loadWorld(e.target.result);
					if(!!world && world.size > 0 && !!world.nodeHeight) {
						// create a canvas element for representing our new world
						var html = $('<tr class="file">'
							+ '<td class="map"></td>'
							+ '<td class="title"></td>'
							+ '<td class="author"></td>'
							+ '<td class="size"></td>'
							+ '<td class="players"></td>'
							+ '<td class="continents"></td>'
							+ '<td class="format"></td>'
							+ '<td class="tools"><button onclick="$(this).parents(\'tr.file\').remove();return false;">Remove</button></td>'
							+ '</tr>');
						var canvas = document.createElement('canvas');
						canvas.file = file;
						canvas.world = world;
						html.children('td.map').append( $(canvas).attr('width', world.width).attr('height', world.height) );
						html.children('td.title').text( world.title );
						html.children('td.author').text( world.author );
						html.children('td.size').text( world.width + " x " + world.height );
						html.children('td.players').text( world.players );
						html.children('td.continents').text( world.continents.length );
						html.children('td.format').text( (world.campaign ? (world.rttr ? 'RttR single player' : 'Single player') : (world.rttr ? 'RttR multiplayer' : 'Unlimited Play')) );
						var upload = document.createElement('button');
						$(upload).text('Upload').attr('class', 'upload').click(function(e){
							uploadMap(canvas);
							e.preventDefault();
							e.stopPropagation();
							return false;
						});
						html.children('td.tools').prepend(upload);
						html.children('td.tools').children('button').button();
						$('#worlds').append( html );
						//drawList.push(canvas);
						
						canvas.draw = function(){drawMap(canvas);};
						requestAnimationFrame(canvas.draw);
						
					}
				}})(file);
				reader.readAsArrayBuffer(file);
			}
		}
		if(drawList.length > 0) $('#dropbox').progressbar({'value': 0});
		$.eachCallback(drawList, function() {
			drawMap(this);
		}, function(loopcount) {
			if(loopcount + 1 === drawList.length) {
				$("#dropbox").progressbar('destroy');
			}
			else
			{
				$("#dropbox").progressbar('value', ((loopcount + 1) / drawList.length * 100) | 0);
			}
		});
	}
}

function enterFile(e) {
	$('#dropbox').addClass("files");
}

function leaveFile(e) {
	$('#dropbox').removeClass("files");
}

function stopEvent(e) {
	e.stopPropagation();
	e.preventDefault();
}

$(function(){
	// create a multifile selector
	document.world = document.createElement('input');
	$(document.world).attr({type: 'file', multiple: 'multiple'}).change(selectFiles);
	// link file selection button to our multifile selector
	$('#selectfiles').button().click(function(e){
		document.world.click();
		e.stopPropagation();
		e.preventDefault();
	});
	// file selection dropbox
	$('#dropbox')
		//.bind('mouseenter', enterFile)
		//.bind('mouseleave', leaveFile)
		.bind('dragenter', stopEvent)
		.bind('dragover', stopEvent)
		.bind('drop', selectFiles);
	// upload dialog
	$('#uploader').dialog({
		autoOpen: false,
		height: 500,
		width: 750,
		modal: true,
		buttons: {
			'Upload': function() {
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			
		},
		open: function() {
			
		}
	});
});