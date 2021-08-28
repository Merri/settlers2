<?php

define('ERROR_HQ_INVALid_POSITION', 1);

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
	$filename = './WLD/'.str_replace(array('.', '/', '\\'), '', $_GET['file']).'.WLD';
	define('DAT', FALSE);
}
elseif(isset($_GET['dat']))
{
	$filename = './DAT/WORLD'.str_pad(intval($_GET['dat']), 3, '0', STR_PAD_LEFT).'.DAT';
	$fileconti = './DAT/CONTI'.str_pad(intval($_GET['dat']), 3, '0', STR_PAD_LEFT).'.DAT';
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
					$worldmap = imagecreate($header['width'], $header['height'] * 15);
					$palindex = array();
					for($i = 0, $maxi = 256; $i < $maxi; $i++)
					{
						$c = unpack('C1r/C1g/C1b', substr($palette, $i * 3, 3));
						imagecolorset($worldmap, $i, $c['r'], $c['g'], $c['b']);
						$palindex[$i] = imagecolorallocate($worldmap, $c['r'], $c['g'], $c['b']);
					}
					for($i = 0, $maxi = $header['height'] * 14; $i < $maxi; $i++)
					{
						$k = $i * $header['width'];
						for($j = 0, $maxj = $header['width']; $j < $maxj; $j++)
						{
							imagesetpixel($worldmap, $j, $i, $palindex[ ord($mapdata[$j + $k]) ]);
						}
					}
					// gouraud X index per texture
					$goumap = array(
						// Greenland
						/*array(
							233,
							1,
							216,
							123,
							233,
							199,
							61,
							61,
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
							61
						),*/
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
						// Wasteland
						/*array(
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
						),*/
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
						// Winter
						/*array(
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
						),*/
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
					$goumap = $goumap[ $header['type'] ];
					// fill the rest with MAGENTA/DARK RED/BLACK
					for($i = 20, $maxi = 256; $i < $maxi; $i++) $goumap[$i] = 254;
					// color calculation indexes
					$k = $header['height'] * 2 * $header['width'];
					$l = $header['height'] * 12 * $header['width'];
					// draw colorful map
					for($i = $header['height'] * 14, $maxi = $header['height'] * 15; $i < $maxi; $i++)
					{
						for($j = 0, $maxj = $header['width']; $j < $maxj; $j++)
						{
							imagesetpixel($worldmap, $j, $i, $palindex[ imagecolorat($gouraud, $goumap[ ord($mapdata[$j + $k]) & 127 ], ord($mapdata[$j + $l])) ]);
						}
						$k += $j;
						$l += $j;
					}
					header('Content-type: image/png');
					imagepng($worldmap, NULL, 9);
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