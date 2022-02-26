<?php

define('ERROR_HQ_INVALID_POSITION', 1);

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

$PLAYERNAME = array('Octavianus', 'Julius', 'Brutus', 'Erik', 'Knut', 'Olof', 'Yamauchi', 'Tsunami', 'Hakirawashi', 'Shaka', 'Todo', 'Mnga Tscha');

// returns FALSE if technically invalid position
// returns ERROR_HQ_INVALid_POSITION if invalid position according to map data
function validate_hq_pos($x = 0, $y = 0, $width = 32, $height = 32, $mapdata = FALSE)
{
	// check for valid position
	if($x < 6) return FALSE;
	if($y < 5) return FALSE;
	if($x + 5 + ($y & 1) > $width) return FALSE;
	if($y + 5 > $height) return FALSE;

	// check for invalid position (non castle building site)
	if( is_array($mapdata) && (count($mapdata) == ($width * $height)) )
	{

	}
	// valid as far as I'm concerned!
	return TRUE;
}

if(isset($_GET['file']))
{
	$justname = str_replace(array('.', '/', '\\', '"', "'"), '', $_GET['file']);
	$filename = './WLD/'.$justname.'.WLD';
	define('DAT', FALSE);
}
elseif(isset($_GET['dat']))
{
	$justname = str_pad(intval($_GET['dat']), 3, '0', STR_PAD_LEFT);
	$filename = './DAT/WORLD'.$justname.'.DAT';
	$fileconti = './DAT/CONTI'.$justname.'.DAT';
	$justname = 'WORLD'.$justname.'(DAT)';
	define('DAT', TRUE);
}
else
{
	$filename = './WLD/MISS200.WLD';
	define('DAT', FALSE);
}

if( is_file($filename) )
{
	$filesize = filesize($filename);
	// smallest possible WLD/SWD file ((32 * 32 + 16) * 14 + 2352 = 16912 bytes)
	// smallest possible DAT file ((32 * 32 + 4) * 15 + 14 = 15434 bytes)
	if( (!DAT && ($filesize > 16911)) || (DAT && ($filesize > 15433)) )
	{
		$handle = fopen($filename, 'rb');
		if(!DAT)
		{
			$header = unpack('a10version/a23title/x/C1type/C1players/a19author/x/v7playerx/v7playery/x/C7playerface/a2250continent/n1id/V1idtype/v1width/v1height', fread($handle, 2352));
			define('DEV', FALSE);
		}
		else
		{
			$header = unpack('n1id/V1idtype/v1width/v1height', $head = fread($handle, 10));
			if($header['idtype'] == -1)
			{
				$header = unpack('n1id/V1version/V1idtype/v1width/v1height', $head . fread($handle, 4) );
				define('DEV', TRUE);
			}
			else
			{
				define('DEV', FALSE);
			}
			$header['version'] = 'WORLD_V1.0';
			$header['title'] = 'WORLD'.str_replace(array('.', '/', '\\'), '', $_GET['dat']).'.DAT';
			$header['type'] = 0;
			$header['players'] = 0;
			$header['author'] = 'Blue Byte';
			$header['playerx1'] = $header['playerx2'] = $header['playerx3'] = $header['playerx4'] = $header['playerx5'] = $header['playerx6'] = $header['playerx7'] = 65535;
			$header['playery1'] = $header['playery2'] = $header['playery3'] = $header['playery4'] = $header['playery5'] = $header['playerxy'] = $header['playery7'] = 65535;
			$header['playerface1'] = $header['playerface2'] = $header['playerface3'] = $header['playerface4'] = $header['playerface5'] = $header['playerface6'] = $header['playerface7'] = 0;
			$header['continent'] = file_get_contents($fileconti);
		}

		// super validate! never too much!
		if( ($header['version'] == 'WORLD_V1.0') && ($header['type'] < 3)
			&& ($header['id'] == 4391) && ($header['idtype'] == 0)
			&& (($header['width'] & 15) == 0) && (($header['height'] & 15) == 0)
			&& ($header['width'] > 31) && ($header['height'] > 31)
			&& ($header['width'] < 257) && ($header['height'] < 257) )
		{
			// remove anything after a NULL byte (some files have garbage, and we drop width & height for longer titles!)
			if(strpos($header['title'], "\0") !== FALSE)
			{
				$header['title'] = explode("\0", $header['title']);
				$header['title'] = $header['title'][0];
			}
			if(strpos($header['author'], "\0") !== FALSE)
			{
				$header['author'] = explode("\0", $header['author']);
				$header['author'] = $header['author'][0];
			}
			// some PHP features can be annoying... this time around we restore null bytes!
			$header['continent'] = str_pad($header['continent'], 2250, "\0", STR_PAD_RIGHT);
			// we always have each of these
			$continent = array();
			for($i = 0, $maxi = 2250; $i < $maxi; $i += 9)
			{
				$continent[] = unpack('C1type/v1x/v1y/V1size', substr($header['continent'], $i, 9));
			}
			unset($header['continent']);

			// validate map title & author
			if(strlen($header['title']) == 0) $header['title'] = 'Unknown';
			if(strlen($header['author']) == 0) $header['author'] = 'Unknown';

			// validate number of players
			$players = 0;
			for($i = 1, $maxi = 7; $i <= $maxi; $i++)
			{
				if(TRUE === ( $valid = validate_hq_pos($header['playerx'.$i], $header['playery'.$i], $header['width'], $header['height']) ))
				{
					$players++;
				} elseif( $valid === ERROR_HQ_INVALid_POSITION ) {
					$players++;
					echo "ERROR: Player {$i} position is invalid!\n\n";
				}
			}
			if($header['players'] != $players)
			{
				if($players == 0)
				{
					echo "ERROR: There are {$header[players]} players set on the map, but all positions are invalid!\n\n";
				}
				else
				{
					//echo "CORRECTED: Player count {$header[players]} in map header is invalid, true player count is {$players}!\n\n";
					$header['players'] = $players;
				}
			}
			elseif( $players == 0 )
			{
				//echo "ERROR: No players!\n\n";
			}

			$header['title'] = iconv('CP437', 'UTF-8', $header['title']);
			$header['author'] = iconv('CP437', 'UTF-8', $header['author']);

			$chunksize = $header['width'] * $header['height'];
			if(!DEV)
			{
				$chunk = "\x10\x27\0\0\0\0".pack('vv', $header['width'], $header['height'])."\1\0". pack('V', $chunksize);
			}
			else
			{
				$chunk = pack('V', $chunksize);
			}

			$mapdata = '';

			for($i = 1, $maxi = 14; $i <= $maxi; $i++)
			{
				if( ($filechunk = fread($handle, strlen($chunk))) == $chunk )
				{
					$mapdata .= fread($handle, $chunksize);
				}
				else
				{
					echo "CRITICAL: map data {$i} has invalid chunk header!\n\n";
					print_r( unpack('H*', $chunk) );
					print_r( unpack('H*', $filechunk) );
					exit;
				}
			}

			//$mapdata = unpack('C*', $mapdata);

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
						//imagecolorset($worldmap, $i, $c['r'], $c['g'], $c['b']);
						//$palindex[$i] = imagecolorallocate($worldmap, $c['r'], $c['g'], $c['b']);
					}
					// gouraud X index per texture
					$goumap = array(
						// Greenland ORIGINAL
						array(
							233,
							216,
							123,
							233,
							199,
							//61,
							240,
							//61,
							240,
							199,
							231,
							233,
							230,
							216,
							216,
							215,
							236,
							231,
							57,
							254,
							216,
							//61,
							240,
						),
						// Greenland CUSTOM
						array(
							236,
							195,
							124,
							231,
							199,
							242,
							242,
							199,
							233,
							232,
							231,
							195,
							194,
							193,
							217,
							232,
							249,
							254,
							169,
							242,
						),
						// Wasteland ORIGINAL
						array(
							114,
							167,
							139,
							160,
							85,
							42,
							42,
							85,
							165,
							166,
							166,
							33,
							212,
							212,
							167,
							114,
							248,
							254,
							160,
							42,
						),
						// Wasteland CUSTOM
						array(
							98,
							145,
							23,
							41,
							85,
							42,
							42,
							85,
							32,
							166,
							33,
							113,
							245,
							41,
							34,
							33,
							251,
							254,
							97,
							42,
						),
						// Winter World ORIGINAL
						array(
							123,
							116,
							244,
							244,
							183,
							240,
							240,
							183,
							36,
							102,
							123,
							117,
							118,
							118,
							233,
							120,
							248,
							254,
							122,
							240,
						),
						// Winter World CUSTOM
						array(
							122,
							118,
							179,
							178,
							182,
							242,
							242,
							182,
							122,
							172,
							101,
							120,
							144,
							119,
							171,
							101,
							249,
							252,
							123,
							242,
						),
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
					$k = $header['height'] * 1 * $header['width'];
					$l = $header['height'] * 2 * $header['width'];
					$m = $header['height'] * 12 * $header['width'];

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
								//$kx2 = $ok + $x2;

								//$gou = ord($mapdata[$j + $m]);
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

									//$goumap[ $p7 = ord($mapdata[$j + $ol]) & 127 ],
									//$goumap[ $p8 = ord($mapdata[$kx2]) & 127 ],
									//$goumap[ $p9 = ord($mapdata[$x2 + $k]) & 127 ],
									//$goumap[ $p10 = ord($mapdata[$x2 + $l]) & 127 ],

									$goumap2[ $p1 ],
									$goumap2[ $p2 ],
									$goumap2[ $p3 ],
									$goumap2[ $p4 ],
									$goumap2[ $p5 ],
									$goumap2[ $p6 ],

									//$goumap2[ $p7 ],
									//$goumap2[ $p8 ],
									//$goumap2[ $p9 ],
									//$goumap2[ $p10 ],
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
					UnsharpMask($worldmap, 50, 1, 0);

					// output
					if( isset($_GET['png']) )
					{
						header('Content-type: image/png');
						header('Content-disposition: inline; filename="'.$justname.'.PNG"');
						imagepng($worldmap, NULL, 9);
					}
					else
					{
						header('Content-type: image/jpeg');
						header('Content-disposition: inline; filename="'.$justname.'.JPG"');
						imagejpeg($worldmap, NULL, 93);
					}
					imagedestroy($worldmap);
					exit;
				}
				else
				{
					echo "CRITICAL: Could not open gouraud file.\n\n";
					exit;
				}
			}
			else
			{
				echo "CRITICAL: Could not open palette file.\n\n";
			}

			// player faces
			//for($i = 1, $maxi = 7; $i <= $maxi; $i++)
			//{
			//	$header['playerface'.$i] = $PLAYERNAME[ $header['playerface'.$i] ];
			//}
			header('Content-type: text/plain; charset=UTF-8');

			// debug
			print_r($header);
			//print_r($continent);

		}
		else
		{
			echo "CRITICAL: not a valid The Settlers II World File!\n\n";
		}
		// and we are done
		fclose($handle);
	}
	else
	{
		echo "CRITICAL: invalid filesize (too small!)\n\n";
	}
}
else
{
	echo "CRITICAL: file not found!\n\n";
}