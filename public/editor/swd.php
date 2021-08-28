<?php
// TODO: optimize memory usage... biggest RttR map files can easily consume more than 30 MB when this is running!
set_time_limit(0);

define('WP_USE_THEMES', false);
require_once('../wp-load.php');

// get Wordpress user information!
global $current_user;
get_currentuserinfo();

if( !is_user_logged_in() ) exit;

function is_valid_hq_pos($x = 0, $y = 0, $width = 32, $height = 32)
{
	// check for valid position
	if($x < 6) return FALSE;
	if($y < 5) return FALSE;
	if($x + 5 + ($y & 1) > $width) return FALSE;
	if($y + 5 > $height) return FALSE;
	// valid as far as I'm concerned!
	return TRUE;
}

$CP437 = array(0, 9786, 9787, 9829, 9830, 9827, 9824, 8226, 9688, 9675, 9689, 9794, 9792, 9834, 9835, 9788, 9658, 9668, 8597, 8252, 182, 167, 9644, 8616, 8593, 8595, 8594, 8592, 8735, 8596, 9650, 9660, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 8962, 199, 252, 233, 226, 228, 224, 229, 231, 234, 235, 232, 239, 238, 236, 196, 197, 201, 230, 198, 244, 246, 242, 251, 249, 255, 214, 220, 162, 163, 165, 8359, 402, 225, 237, 243, 250, 241, 209, 170, 186, 191, 8976, 172, 189, 188, 161, 171, 187, 9617, 9618, 9619, 9474, 9508, 9569, 9570, 9558, 9557, 9571, 9553, 9559, 9565, 9564, 9563, 9488, 9492, 9524, 9516, 9500, 37, 37, 9566, 9567, 9562, 9556, 9577, 9574, 9568, 9552, 9580, 9575, 9576, 9572, 9573, 9561, 9560, 9554, 9555, 9579, 9578, 9496, 9484, 9608, 9604, 9612, 9616, 9600, 945, 223, 915, 960, 931, 963, 181, 964, 934, 920, 937, 948, 8734, 966, 949, 8745, 8801, 177, 8805, 8804, 8992, 8993, 247, 8776, 176, 8729, 183, 8730, 8319, 178, 9632, 160);

if( isset($HTTP_RAW_POST_DATA) )
{
	@ini_set('max_execution_time', 60);
	set_time_limit(60);
	$PNG = explode('data:image/png;base64,', $HTTP_RAW_POST_DATA);
	if(count($PNG) == 2 && strlen($PNG[0]) == 0 )
	{
		if( !($PNG = @imagecreatefromstring( base64_decode($PNG[1]) )) ) exit();
		$w = imagesx($PNG) / 4;
		$h = imagesy($PNG);
		$size = $w * $h;
		// 14 blocks
		$block = array(
			array(), array(), array(), array(), array(), 
			array(), array(), array(), array(), array(), 
			array(), array(), array(), array()
		);
		// initialize blocks
		for($i = 0; $i < $size; $i++)
		{
			// empty
			$block[0][] = 0;
			// always 7
			$block[9][] = 7;
		}
		$data_animal = array();
		$data_header = '';
		// copy first empty block to other blocks
		for($i = 1; $i < 14; $i++) { if($i !== 9) $block[$i] = $block[0]; }
		// extract block data
		for($y = 0, $i = 0; $y < $h; $y++)
		{
			for($x = 0; $x < $w; $x++, $i++)
			{
				// height, texture 1, texture 2
				$data = imagecolorat($PNG, $x, $y);
				$block[0][$i] = ($data >> 16) & 0xFF;
				$block[1][$i] = ($data >> 8) & 0xFF;
				$block[2][$i] = $data & 0xFF;
				// object index, object type, resources
				$data = imagecolorat($PNG, $x + $w, $y);
				$block[4][$i] = ($data >> 16) & 0xFF;
				$block[5][$i] = ($data >> 8) & 0xFF;
				$block[11][$i] = $data & 0xFF;
				// animals & header information
				$data = imagecolorat($PNG, $x + $w * 2, $y);
				$data_animal[] = ($data >> 16) & 0xFF;
				$data_animal[] = ($data >> 8) & 0xFF;
				if($i < 78) $data_header .= chr($data & 0xFF);
				// building sites, gouraud, areas
				$data = imagecolorat($PNG, $x + $w * 3, $y);
				$block[8][$i] = ($data >> 16) & 0xFF;
				$block[12][$i] = ($data >> 8) & 0xFF;
				$block[13][$i] = $data & 0xFF;
			}
		}
		// cleanup!
		//imagepng($PNG, './cache/test.png');
		imagedestroy($PNG);
		// extract the minimal header information from PNG
		$header = unpack('a23title/a19author/C1type/C7playerface/v7playerx/v7playery', $data_header);
		
		// calculate the number of players
		$players = 0;
		$player = array();
		for($i = 1; $i <= 7; $i++)
		{
			if( is_valid_hq_pos($header['playerx'.$i], $header['playery'.$i], $w, $h) ) $players++;
		}
		// initialize areas
		$areas = array();
		for($i = 0; $i < 250; $i++)
		{
			$areas[$i] = array(
				'id' => 0,
				'x' => 0,
				'y' => 0,
				'mass' => 0
			);
		}
		// calculate area masses
		for($i = 0; $i < $size; $i++)
		{
			$id = $block[13][$i];
			// only 0 - 249 are valid
			if($id < 250)
			{
				if($areas[$id]['id'] == 0)
				{
					// check for water or land texture
					$areas[$id]['id'] = ($block[1][$i] == 5 && $block[2][$i] == 5) ? 2 : 1;
					$areas[$id]['x'] = $i % $w;
					$areas[$id]['y'] = ($i / $w) | 0;
				}
				$areas[$id]['mass']++;
			}
		}
		// build WLD/SWD header
		$file_content = 'WORLD_V1.0'.substr($data_header, 0, 19)."\0"
			.chr($w & 0xFF).chr(($w >> 8) & 0xFF).chr($h & 0xFF).chr(($h >> 8) & 0xFF)
			.substr($data_header, 42, 1).chr($players)
			.substr($data_header, 23, 19)."\0"
			.substr($data_header, 50, 28)."\0"
			.substr($data_header, 43, 7);
		// add area masses to the header
		for($i = 0; $i < 250; $i++)
		{
			$file_content .= pack('CvvV', $areas[$i]['id'], $areas[$i]['x'], $areas[$i]['y'], $areas[$i]['mass']);
		}
		unset($areas);
		$file_content .= pack('nVvv', 0x1127, 0, $x, $y);
		
		// header is complete, map data follows!
		for($i = 0; $i < 14; $i++)
		{
			$file_content .= pack('nVvvvV', 0x1027, 0, $x, $y, 1, $size);
			// I don't know about you, but to me this seems like PHP's achilles heel...
			for($j = 0; $j < $size; $j++)
			{
				// to convert one byte to string at a time
				$file_content .= chr($block[$i][$j]);
			}
		}
		// animals to the file footer
		for($i = 0; $data_animal[$i] > 0; $i+=6)
		{
			$file_content .= chr($data_animal[$i]).chr($data_animal[$i + 1]).chr($data_animal[$i + 2]).chr($data_animal[$i + 4]).chr($data_animal[$i + 5]);
		}
		// end of file!
		$file_content .= chr(0xFF);
		$file_id = $current_user->ID.'_';
		$file_name = str_replace(array(' ', '/', '.', "\0"), '_', iconv('CP437', 'Windows-1252', $header['title']));
		$file_path = './world/'.$file_id.$file_name.'.swd.gz';
		// GZIP WLD/SWD file
		@file_put_contents($file_path, gzencode($file_content, 9));
		header('Content-Type: text/plain; charset=utf8');
		echo utf8_encode($file_name);
	}
	else
	{
		echo 'INVALID DATA';
		exit();
	}
}
elseif( isset($_GET['file']) )
{
	$file_id = $current_user->ID.'_';
	$file_name = utf8_decode(str_replace(array(' ', '.', '/'), '', $_GET['file']));
	$file_path = './world/'.$file_id.$file_name.'.swd.gz';
	if( file_exists($file_path) )
	{
		// disable ZLIB
		ini_set('zlib.output_compression', 'Off');
		$file_content = file_get_contents($file_path);
		header('Content-Type: application/binary');
		header('Content-Encoding: gzip');
		header('Content-Length: '.strlen($file_content));
		header('Content-Disposition: attachment; filename="'.$file_name.'.swd"');
		header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
		header('Pragma: no-cache');
		echo $file_content;
	}
	else
	{
		echo 'FILE NOT FOUND';
	}
}
else
{
	echo 'ERROR';
	exit();
}