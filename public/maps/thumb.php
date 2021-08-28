<?php

define('WORLD_MAP_DATABASE', TRUE);

error_reporting(E_ALL | E_STRICT);

define('WP_USE_THEMES', false);
require_once('../wp-load.php');
require_once('./world.php');

// http://vikjavev.no/computing/ump.php?id=254
function UnsharpMask($img, $amount, $radius, $threshold)
{
////////////////////////////////////////////////////////////////////////////////////////////////
////
////                  Unsharp Mask for PHP - version 2.1.1
////
////    Unsharp mask algorithm by Torstein Hønsi 2003-07.
////             thoensi_at_netcom_dot_no.
////               Please leave this notice.
////
///////////////////////////////////////////////////////////////////////////////////////////////

	if ($amount > 500) $amount = 500;
	$amount = $amount * 0.016;
	if ($radius > 50) $radius = 50;
	$radius = $radius * 2;
	if ($threshold > 255) $threshold = 255;

	$radius = abs(round($radius));
	if ($radius == 0)
	{
		return $img;
		imagedestroy($img);
		break;
	}
	$w = imagesx($img); $h = imagesy($img);
	$imgCanvas = imagecreatetruecolor($w, $h);
	$imgBlur = imagecreatetruecolor($w, $h);

	if (function_exists('imageconvolution')) { // PHP >= 5.1
			$matrix = array(
			array( 1, 2, 1 ),
			array( 2, 4, 2 ),
			array( 1, 2, 1 )
		);
		imagecopy ($imgBlur, $img, 0, 0, 0, 0, $w, $h);
		imageconvolution($imgBlur, $matrix, 16, 0);
	}
	else
	{
		for ($i = 0; $i < $radius; $i++)
		{
			imagecopy ($imgBlur, $img, 0, 0, 1, 0, $w - 1, $h);
			imagecopymerge ($imgBlur, $img, 1, 0, 0, 0, $w, $h, 50);
			imagecopymerge ($imgBlur, $img, 0, 0, 0, 0, $w, $h, 50);
			imagecopy ($imgCanvas, $imgBlur, 0, 0, 0, 0, $w, $h);
			imagecopymerge ($imgBlur, $imgCanvas, 0, 0, 0, 1, $w, $h - 1, 33.33333 );
			imagecopymerge ($imgBlur, $imgCanvas, 0, 1, 0, 0, $w, $h, 25);
		}
	}

	if($threshold>0)
	{
		for ($x = 0; $x < $w-1; $x++)
		{
			for ($y = 0; $y < $h; $y++)
			{
				$rgbOrig = ImageColorAt($img, $x, $y);
				$rOrig = (($rgbOrig >> 16) & 0xFF);
				$gOrig = (($rgbOrig >> 8) & 0xFF);
				$bOrig = ($rgbOrig & 0xFF);

				$rgbBlur = ImageColorAt($imgBlur, $x, $y);

				$rBlur = (($rgbBlur >> 16) & 0xFF);
				$gBlur = (($rgbBlur >> 8) & 0xFF);
				$bBlur = ($rgbBlur & 0xFF);

				$rNew = (abs($rOrig - $rBlur) >= $threshold)
					? max(0, min(255, ($amount * ($rOrig - $rBlur)) + $rOrig))
					: $rOrig;
				$gNew = (abs($gOrig - $gBlur) >= $threshold)
					? max(0, min(255, ($amount * ($gOrig - $gBlur)) + $gOrig))
					: $gOrig;
				$bNew = (abs($bOrig - $bBlur) >= $threshold)
					? max(0, min(255, ($amount * ($bOrig - $bBlur)) + $bOrig))
					: $bOrig;

				if (($rOrig != $rNew) || ($gOrig != $gNew) || ($bOrig != $bNew))
				{
					$pixCol = ImageColorAllocate($img, $rNew, $gNew, $bNew);
					ImageSetPixel($img, $x, $y, $pixCol);
				}
			}
		}
	}
	else
	{
		for ($x = 0; $x < $w; $x++)
		{
			for ($y = 0; $y < $h; $y++)
			{
				$rgbOrig = ImageColorAt($img, $x, $y);
				$rOrig = (($rgbOrig >> 16) & 0xFF);
				$gOrig = (($rgbOrig >> 8) & 0xFF);
				$bOrig = ($rgbOrig & 0xFF);

				$rgbBlur = ImageColorAt($imgBlur, $x, $y);

				$rBlur = (($rgbBlur >> 16) & 0xFF);
				$gBlur = (($rgbBlur >> 8) & 0xFF);
				$bBlur = ($rgbBlur & 0xFF);

				$rNew = ($amount * ($rOrig - $rBlur)) + $rOrig;
					if($rNew>255){$rNew=255;}
					elseif($rNew<0){$rNew=0;}
				$gNew = ($amount * ($gOrig - $gBlur)) + $gOrig;
					if($gNew>255){$gNew=255;}
					elseif($gNew<0){$gNew=0;}
				$bNew = ($amount * ($bOrig - $bBlur)) + $bOrig;
					if($bNew>255){$bNew=255;}
					elseif($bNew<0){$bNew=0;}
				$rgbNew = ($rNew << 16) + ($gNew <<8) + $bNew;
					ImageSetPixel($img, $x, $y, $rgbNew);
			}
		}
	}
	imagedestroy($imgCanvas);
	imagedestroy($imgBlur);

	return $img;
}

// get Wordpress user information!
global $current_user;
get_currentuserinfo();
$file_id = $current_user->ID.'_';

$file_name = basename(stripslashes($_GET['file']));
$file_path = (isset($_GET['db']) ? './db/' . $file_name . '.SWD' : './world/' . $file_id.$file_name );

if( ($p = strpos($file_name, '.')) !== FALSE )
{
	$file_name = substr($file_name, 0, $p);
}

$png_file_name = './thumbnails/' . $file_name . '.png';
$jpg_file_name = './thumbnails/' . $file_name . '.jpg';

$jpg_file_name_48 = './thumbnails/' . $file_name . '_48.jpg';
$jpg_file_name_64 = './thumbnails/' . $file_name . '_64.jpg';
$jpg_file_name_96 = './thumbnails/' . $file_name . '_96.jpg';

if(!file_exists($png_file_name))
{
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
		$header['playery1'] = $header['playery2'] = $header['playery3'] = $header['playery4'] = $header['playery5'] = $header['playerxy'] = $header['playery7'] = 65535;
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
		// read actual data required for our graphics
		$mapdata = '';
		if( fseek($WLD, $block_fullsize, SEEK_CUR) === -1)
		{
			fclose($WLD);
			exit;
		}
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$mapdata .= fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$mapdata .= fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		if( fseek($WLD, $block_fullsize * 9, SEEK_CUR) === -1)
		{
			fclose($WLD);
			exit;
		}
		if( ($filechunk = fread($WLD, $blockheader_size)) == $blockheader )
		{
			$mapdata .= fread($WLD, $block_datasize);
		}
		else
		{
			fclose($WLD);
			exit;
		}
		fclose($WLD);
		
		$handlep = fopen('./type'.$header['type'].'.png', 'rb');
		if($handlep)
		{
			fseek($handlep, 97);
			$palette = fread($handlep, 768);
			fclose($handlep);

			$gouraud = imagecreatefrompng('./type'.$header['type'].'.png');
			if($gouraud)
			{
				$worldmap = imagecreatetruecolor($header['width'], $header['height']);
				$palindex = array();
				for($i = 0, $maxi = 256; $i < $maxi; $i++)
				{
					$palindex[$i] = unpack('C1red/C1green/C1blue', substr($palette, $i * 3, 3));
				}
				// gouraud X index per texture
				$goumap = array(
					// Greenland ORIGINAL
					array(233, 216, 123, 233, 199, 240, 240, 199, 231, 233, 230, 216, 216, 215, 236, 231, 57, 254, 216, 240),
					// Greenland CUSTOM
					array(236, 195, 124, 231, 199, 242, 242, 199, 233, 232, 231, 195, 194, 193, 217, 232, 249, 254, 169, 242),
					// Wasteland ORIGINAL
					array(114, 167, 139, 160, 85, 42, 42, 85, 165, 166, 166, 33, 212, 212, 167, 114, 248, 254, 160, 42),
					// Wasteland CUSTOM
					array(98, 145, 23, 41, 85, 42, 42, 85, 32, 166, 33, 113, 245, 41, 34, 33, 251, 254, 97, 42),
					// Winter World ORIGINAL
					array(123, 116, 244, 244, 183, 240, 240, 183, 36, 102, 123, 117, 118, 118, 233, 120, 248, 254, 122, 240),
					// Winter World CUSTOM
					array(122, 118, 179, 178, 182, 242, 242, 182, 122, 172, 101, 120, 144, 119, 171, 101, 249, 252, 123, 242),
				);
				// such an elegant move this one is!
				$goumap2 = $goumap[ ($header['type'] * 2) + 1 ];
				$goumap = $goumap[ $header['type'] * 2 ];
				// fill the rest with MAGENTA/DARK RED/BLACK
				for($i = 20, $maxi = 256; $i < $maxi; $i++)
				{
					$goumap[$i] = 254;
					$goumap2[$i] = 254;
				}

				// color calculation indexes
				$k = 0;
				$l = $header['height'] * $header['width'];
				$m = $l * 2;

				$lastrow = $header['width'] * ($header['height'] - 1);

				$ok = $k + $lastrow;
				$ol = $l + $lastrow;

				// draw colorful map
				$maxj = $header['width'] - 1;
				for($i = 0, $maxi = $header['height'] - 1; $i <= $maxi; $i++)
				{
					if($i & 1)
					{
						for($j = 0; $j <= $maxj; $j++)
						{
							$x = ($j == 0 ? $maxj : $j - 1);
							$kx = ($j == $maxj ? $ok : $ok + $j + 1);
							$x2 = ($j < 2 ? $maxj - (1 - $j) : $j - 2);

							$gou = floor((ord($mapdata[$j + $m]) * 2 + ord($mapdata[$x + $m])) / 3);

							$red = 0;
							$green = 0;
							$blue = 0;

							$pos = array(
								$goumap[ $p1 = ord($mapdata[$j + $ok]) & 63 ],
								$goumap[ $p2 = ord($mapdata[$j + $ol]) & 63 ],
								$goumap[ $p3 = ord($mapdata[$kx]) & 63 ],
								$goumap[ $p4 = ord($mapdata[$j + $k]) & 63 ],
								$goumap[ $p5 = ord($mapdata[$j + $l]) & 63 ],
								$goumap[ $p6 = ord($mapdata[$x + $l]) & 63 ],

								$goumap[ $p7 = ord($mapdata[$x + $ok]) & 63 ],
								$goumap[ $p8 = ord($mapdata[$x + $ol]) & 63 ],
								$goumap[ $p9 = ord($mapdata[$x + $k]) & 63 ],
								$goumap[ $p10 = ord($mapdata[$x2 + $l]) & 63 ],

								$goumap[ $p1 ],
								$goumap[ $p1 ],
								$goumap[ $p6 ],
								$goumap[ $p6 ],
								$goumap2[ $p1 ],
								$goumap2[ $p1 ],
								$goumap2[ $p6 ],
								$goumap2[ $p6 ],

								$goumap2[ $p1 ],
								$goumap2[ $p2 ],
								$goumap2[ $p3 ],
								$goumap2[ $p4 ],
								$goumap2[ $p5 ],
								$goumap2[ $p6 ],

								$goumap2[ $p7 ],
								$goumap2[ $p8 ],
								$goumap2[ $p9 ],
								$goumap2[ $p10 ],
							);

							for($p = 0; $p < 28; $p++)
							{
								$c = $palindex[ imagecolorat($gouraud, $pos[$p], $gou) ];
								$red += $c['red'];
								$green += $c['green'];
								$blue += $c['blue'];
							}

							if($red) $red = floor($red / 28);
							if($green) $green = floor($green / 28);
							if($blue) $blue = floor($blue / 28);

							imagesetpixel($worldmap, $j, $i, imagecolorallocate($worldmap, $red, $green, $blue) );
						}
					}
					else
					{
						for($j = 0; $j <= $maxj; $j++)
						{
							$x = ($j == 0 ? $maxj : $j - 1);
							$kx = $ok + $x;
							$lx = $ol + $x;
							$x2 = ($j == $maxj ? 0 : $j + 1);

							$gou = floor((ord($mapdata[$j + $m]) * 3 + ord($mapdata[$x2 + $m])) / 4);

							$red = 0;
							$green = 0;
							$blue = 0;

							$pos = array(
								$goumap[ $p1 = ord($mapdata[$kx]) & 63 ],
								$goumap[ $p2 = ord($mapdata[$lx]) & 63 ],
								$goumap[ $p3 = ord($mapdata[$j + $ok]) & 63 ],
								$goumap[ $p4 = ord($mapdata[$j + $k]) & 63 ],
								$goumap[ $p5 = ord($mapdata[$j + $l]) & 63 ],
								$goumap[ $p6 = ord($mapdata[$x + $l]) & 63 ],

								$goumap2[ $p1 ],
								$goumap2[ $p2 ],
								$goumap2[ $p3 ],
								$goumap2[ $p4 ],
								$goumap2[ $p5 ],
								$goumap2[ $p6 ],
							);

							for($p = 0; $p < 12; $p++)
							{
								$c = $palindex[ imagecolorat($gouraud, $pos[$p], $gou) ];
								$red += $c['red'];
								$green += $c['green'];
								$blue += $c['blue'];
							}

							if($red) $red = floor($red / 12);
							if($green) $green = floor($green / 12);
							if($blue) $blue = floor($blue / 12);

							imagesetpixel($worldmap, $j, $i, imagecolorallocate($worldmap, $red, $green, $blue) );
						}
					}
					// last row
					$ok = $k;
					$ol = $l;
					// go to next row
					$k += $header['width'];
					$l += $header['width'];
					$m += $header['width'];
				}
				@imagedestroy($gouraud);
				UnsharpMask($worldmap, 50, 1, 0);
				// save
				@imagepng($worldmap, $png_file_name, 9);
				@imagejpeg($worldmap, $jpg_file_name, 93);
				// generate thumbnails
				$thumb_width = $header['width'] * 1.5;
				// thumbnail 96px
				$scale = min(96 / $thumb_width, 96 / $header['height']);
				$new_width = $thumb_width * $scale;
				$new_height = $header['height'] * $scale;
				$new_img = @imagecreatetruecolor($new_width, $new_height);
				@imagecopyresampled($new_img, $worldmap, 0, 0, 0, 0, $new_width, $new_height, $header['width'], $header['height']);
				UnsharpMask($new_img, 50, 1, 0);
				@imagejpeg($new_img, $jpg_file_name_96, 94);
				@imagedestroy($new_img);
				// thumbnail 64px
				$scale = min(64 / $thumb_width, 64 / $header['height']);
				$new_width = $thumb_width * $scale;
				$new_height = $header['height'] * $scale;
				$new_img = @imagecreatetruecolor($new_width, $new_height);
				@imagecopyresampled($new_img, $worldmap, 0, 0, 0, 0, $new_width, $new_height, $header['width'], $header['height']);
				UnsharpMask($new_img, 50, 1, 0);
				@imagejpeg($new_img, $jpg_file_name_64, 94);
				@imagedestroy($new_img);
				// thumbnail 48px
				$scale = min(48 / $thumb_width, 48 / $header['height']);
				$new_width = $thumb_width * $scale;
				$new_height = $header['height'] * $scale;
				$new_img = @imagecreatetruecolor($new_width, $new_height);
				@imagecopyresampled($new_img, $worldmap, 0, 0, 0, 0, $new_width, $new_height, $header['width'], $header['height']);
				UnsharpMask($new_img, 50, 1, 0);
				@imagejpeg($new_img, $jpg_file_name_48, 94);
				@imagedestroy($new_img);
				// final cleanup
				@imagedestroy($worldmap);
			}
			else
			{
				exit;
			}
		}
		else
		{
			exit;
		}
	}
	else
	{
		exit;
	}
}

if(!file_exists($jpg_file_name_48))
{
	
}

if(!file_exists($jpg_file_name_64))
{
	
}

if(!file_exists($jpg_file_name_96))
{
	
}

switch($_GET['format'])
{
	case 'png':
		header('Cache-Control: max-age=7776000, private');
		header('Content-type: image/png');
		header('Content-disposition: inline; filename="'.$file_name.'.png"');
		echo file_get_contents($png_file_name);
		break;
	case 'jpg48':
		header('Cache-Control: max-age=7776000, private');
		header('Content-type: image/jpeg');
		header('Content-disposition: inline; filename="'.$file_name.'_48.jpg"');
		echo file_get_contents($jpg_file_name_48);
		break;
	case 'jpg64':
		header('Cache-Control: max-age=7776000, private');
		header('Content-type: image/jpeg');
		header('Content-disposition: inline; filename="'.$file_name.'_64.jpg"');
		echo file_get_contents($jpg_file_name_64);
		break;
	case 'jpg96':
		header('Cache-Control: max-age=7776000, private');
		header('Content-type: image/jpeg');
		header('Content-disposition: inline; filename="'.$file_name.'_96.jpg"');
		echo file_get_contents($jpg_file_name_96);
		break;
	case 'jpg':
	default:
		header('Cache-Control: max-age=7776000, private');
		header('Content-type: image/jpeg');
		header('Content-disposition: inline; filename="'.$file_name.'.jpg"');
		echo file_get_contents($jpg_file_name);
}