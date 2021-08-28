<?php

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

$file_id = $current_user->ID.'_';

$file_name = basename(stripslashes($_GET['file']));
$file_path = './world/'.$file_id.$file_name;

if( file_exists($file_path) )
{
	$file_size = filesize($file_path);
	if( ($p = strpos($file_name, '.')) !== FALSE )
	{
		$file_name = substr($file_name, 0, $p);
	}
	
	$WLD = fopen($file_path, 'rb');
	$identifier = fread($WLD, 10);
	// TRUE = WLD/SWD, FALSE = DAT
	$version = ($identifier === 'WORLD_V1.0');
	if(!$version)
	{
		// DAT
		$header = unpack('n1id/V1idtype/v1width/v1height', $identifier);
		if($header['idtype'] == -1)
		{
			$header = unpack('n1id/V1smallblock/V1idtype/v1width/v1height', $identifier . fread($WLD, 4) );
		}
		$header['title'] = '';
		$header['type'] = 0;
		$header['players'] = 0;
		$header['author'] = 'Blue Byte';
		$header['playerx1'] = $header['playerx2'] = $header['playerx3'] = $header['playerx4'] = $header['playerx5'] = $header['playerx6'] = $header['playerx7'] = 65535;
		$header['playery1'] = $header['playery2'] = $header['playery3'] = $header['playery4'] = $header['playery5'] = $header['playery6'] = $header['playery7'] = 65535;
		$header['playerface1'] = $header['playerface2'] = $header['playerface3'] = $header['playerface4'] = $header['playerface5'] = $header['playerface6'] = $header['playerface7'] = 0;
	}
	else
	{
		// WLD/SWD
		$header = unpack('a23title/x/C1type/C1players/a19author/x/v7playerx/v7playery/x/C7playerface/a2250continent/n1id/V1idtype/v1width/v1height', fread($WLD, 2342));
	}

	if( ($header['type'] < 3) && ($header['id'] == 4391) && ($header['idtype'] == 0)
		&& (($header['width'] & 15) == 0) && (($header['height'] & 15) == 0)
		&& ($header['width'] > 31) && ($header['height'] > 31)
		&& ($header['width'] < 257) && ($header['height'] < 257) )
	{
		// make sure player starting locations are 0
		if( !is_valid_hq_pos($header['playerx1'], $header['playery1'], $header['width'], $header['height']) )
		{
			$header['playerface1'] = $header['playerx1'] = $header['playery1'] = 0;
		}
		if( !is_valid_hq_pos($header['playerx2'], $header['playery2'], $header['width'], $header['height']) )
		{
			$header['playerface2'] = $header['playerx2'] = $header['playery2'] = 0;
		}
		if( !is_valid_hq_pos($header['playerx3'], $header['playery3'], $header['width'], $header['height']) )
		{
			$header['playerface3'] = $header['playerx3'] = $header['playery3'] = 0;
		}
		if( !is_valid_hq_pos($header['playerx4'], $header['playery4'], $header['width'], $header['height']) )
		{
			$header['playerface4'] = $header['playerx4'] = $header['playery4'] = 0;
		}
		if( !is_valid_hq_pos($header['playerx5'], $header['playery5'], $header['width'], $header['height']) )
		{
			$header['playerface5'] = $header['playerx5'] = $header['playery5'] = 0;
		}
		if( !is_valid_hq_pos($header['playerx6'], $header['playery6'], $header['width'], $header['height']) )
		{
			$header['playerface6'] = $header['playerx6'] = $header['playery6'] = 0;
		}
		if( !is_valid_hq_pos($header['playerx7'], $header['playery7'], $header['width'], $header['height']) )
		{
			$header['playerface7'] = $header['playerx7'] = $header['playery7'] = 0;
		}
		// calculate block sizes
		$header['smallblock'] = isset($header['smallblock']);
		$block_datasize = $header['width'] * $header['height'];
		if( !$header['smallblock'] )
		{
			$blockheader = "\x10\x27\0\0\0\0".pack('vv', $header['width'], $header['height'])."\1\0". pack('V', $block_datasize);
		}
		else
		{
			$blockheader = pack('V', $block_datasize);
		}
		$blockheader_size = strlen($blockheader);
		$block_fullsize = $block_datasize + $blockheader_size;
		// BLOCK 1
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block1_height = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 2
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block2_texture = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 3
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block3_texture = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// SKIP: BLOCK 4
		if( fseek($WLD, $block_fullsize, SEEK_CUR) === -1)
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 5
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block5_object = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 6
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block6_object = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 7
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$animal = array();
			// read row by row
			for($y = 0, $maxy = $header['height']; $y < $maxy; $y++)
			{
				$block7_animal = fread($WLD, $header['width']);
				for($x = 0, $maxx = $header['width']; $x < $maxx; $x++)
				{
					// see if we have any animal here
					if( ($animal_id = ord($block7_animal[$x])) > 0)
					{
						$animal[] = array(
							'id' => $animal_id,
							'x' => $x,
							'y' => $y
						);
					}
				}
			}
			unset($block7_animal);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// SKIP: BLOCK 8
		if( fseek($WLD, $block_fullsize, SEEK_CUR) === -1)
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 9
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block9_sites = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// SKIP: BLOCK 10 & 11
		if( fseek($WLD, $block_fullsize * 2, SEEK_CUR) === -1)
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 12
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block12_resource = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 13
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block13_gouraud = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// BLOCK 14
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$block14_areas = fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		// FOOTER: ANIMALS
		$file_remaining = $file_size - ftell($WLD) - 1;
		if($file_remaining > 0 && ($file_remaining % 7) === 0)
		{
			$footer = fread($WLD, $file_remaining);
			for($i = 0; $i < $file_remaining; $i += 7)
			{
				$fa = unpack('C1id/S1x/S1y', substr($footer, $i, 7));
				// validate animal id and position
				if($fa['id'] > 0 && $fa['x'] > 0 && $fa['y'] > 0
				&& $fa['x'] < $header['width'] && $fa['y'] < $header['height'])
				{
					$animal[] = $fa;
				}
			}
		}
		fclose($WLD);
		// rearrange animal information
		$block_animal = str_pad('', $block_datasize * 2, "\0", STR_PAD_RIGHT);
		for($j = $i = 0, $maxi = count($animal); $i < $maxi; $i++)
		{
			$block_animal[$j++] = chr($animal[$i]['id'] & 0xFF);
			$block_animal[$j++] = chr($animal[$i]['x'] & 0xFF);
			$block_animal[$j++] = chr(($animal[$i]['x'] & 0xFF00) >> 8);
			$block_animal[$j++] = "\0";
			$block_animal[$j++] = chr($animal[$i]['y'] & 0xFF);
			$block_animal[$j++] = chr(($animal[$i]['y'] & 0xFF00) >> 8);
		}
		unset($animal);
		// 
		$block_header = str_pad(
			str_pad($header['title'], 23, "\0", STR_PAD_RIGHT)
			.str_pad($header['author'], 19, "\0", STR_PAD_RIGHT)
			.chr($header['type'] & 0xFF)
			.chr($header['playerface1'] & 0xFF)
			.chr($header['playerface2'] & 0xFF)
			.chr($header['playerface3'] & 0xFF)
			.chr($header['playerface4'] & 0xFF)
			.chr($header['playerface5'] & 0xFF)
			.chr($header['playerface6'] & 0xFF)
			.chr($header['playerface7'] & 0xFF)
			.chr($header['playerx1'] & 0xFF)
			.chr(($header['playerx1'] & 0xFF00) >> 8 )
			.chr($header['playerx2'] & 0xFF)
			.chr(($header['playerx2'] & 0xFF00) >> 8 )
			.chr($header['playerx3'] & 0xFF)
			.chr(($header['playerx3'] & 0xFF00) >> 8 )
			.chr($header['playerx4'] & 0xFF)
			.chr(($header['playerx4'] & 0xFF00) >> 8 )
			.chr($header['playerx5'] & 0xFF)
			.chr(($header['playerx5'] & 0xFF00) >> 8 )
			.chr($header['playerx6'] & 0xFF)
			.chr(($header['playerx6'] & 0xFF00) >> 8 )
			.chr($header['playerx7'] & 0xFF)
			.chr(($header['playerx7'] & 0xFF00) >> 8 )
			.chr($header['playery1'] & 0xFF)
			.chr(($header['playery1'] & 0xFF00) >> 8 )
			.chr($header['playery2'] & 0xFF)
			.chr(($header['playery2'] & 0xFF00) >> 8 )
			.chr($header['playery3'] & 0xFF)
			.chr(($header['playery3'] & 0xFF00) >> 8 )
			.chr($header['playery4'] & 0xFF)
			.chr(($header['playery4'] & 0xFF00) >> 8 )
			.chr($header['playery5'] & 0xFF)
			.chr(($header['playery5'] & 0xFF00) >> 8 )
			.chr($header['playery6'] & 0xFF)
			.chr(($header['playery6'] & 0xFF00) >> 8 )
			.chr($header['playery7'] & 0xFF)
			.chr(($header['playery7'] & 0xFF00) >> 8 )
		, $block_datasize, "\0", STR_PAD_RIGHT);
		// create the PNG image
		$PNG = imagecreatetruecolor($header['width'] * 4, $header['height']);
		// and then draw the pixels
		for($yx = 0, $y = 0, $maxy = $header['height']; $y < $maxy; $y++)
		{
			for($x = 0, $maxx = $header['width']; $x < $maxx; $x++, $yx++)
			{
				$part1 = imagecolorallocate(
					$PNG,
					ord($block1_height[$yx]),
					ord($block2_texture[$yx]),
					ord($block3_texture[$yx])
				);
				$part2 = imagecolorallocate(
					$PNG,
					ord($block5_object[$yx]),
					ord($block6_object[$yx]),
					ord($block12_resource[$yx])
				);
				$part3 = imagecolorallocate(
					$PNG,
					ord($block_animal[$yx * 2]),
					ord($block_animal[$yx * 2 + 1]),
					ord($block_header[$yx])
				);
				$part4 = imagecolorallocate(
					$PNG,
					ord($block9_sites[$yx]),
					ord($block13_gouraud[$yx]),
					ord($block14_areas[$yx])
				);
				imagesetpixel($PNG, $x, $y, $part1);
				imagesetpixel($PNG, $x + $header['width'], $y, $part2);
				imagesetpixel($PNG, $x + $header['width'] * 2, $y, $part3);
				imagesetpixel($PNG, $x + $header['width'] * 3, $y, $part4);
				imagecolordeallocate($PNG, $part1);
				imagecolordeallocate($PNG, $part2);
				imagecolordeallocate($PNG, $part3);
				imagecolordeallocate($PNG, $part4);
			}
		}
		header('Cache-Control: max-age=7776000, private');
		header('Content-type: image/png');
		header('Content-disposition: inline; filename="'.$file_name.'.png"');
		@imagepng($PNG, NULL, 9);
		@imagedestroy($PNG);
		exit();
	}
	else
	{
		header('Content-type: text/plain');
		echo "Header fail.\n\n";
		print_r($header);
		exit;
	}
}