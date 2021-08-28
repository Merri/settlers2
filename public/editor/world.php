<?php

if(!defined('S2_EDITOR')) exit;

define('CP437', ' ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ');

define('DOS83', "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&\'()-@^_`{}~'.
'\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F'.
'\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F'.
'\xA0\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC\xAD\xAE\xAF'.
'\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF'.
'\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF'.
'\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xDF'.
'\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF'.
'\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB\xFC\xFD\xFE\xFF");

// internal knowledge of map version
const VERSION_DAT = 0x00;		// The Settlers II Beta and V1.0 maps
const VERSION_WLD = 0x01;		// The Settlers II Campaign Maps
const VERSION_SWD = 0x02;		// The Settlers II Map Editor Maps
const VERSION_RTTR = 0x03;		// Return to the Roots Maps
const VERSION_GZIP = 0x80;		// bitflag: file was compressed with GZIP
const VERSION_FLAGS = 0xF0;		// bits reserved for flags
const VERSION_TYPE = 0x0F;		// bits reserved for version information
const VERSION = 'WORLD_V1.0';	// anything better than a DAT
const SIGNATURE_GZIP = "\x1F\x8B\x08";	// GZIP signature
// world type
const WORLD_GREENLAND = 0x00;
const WORLD_WASTELAND = 0x01;
const WORLD_WINTER = 0x02;
const WORLD_NEWGREEN = 0x03;	// Merri's New Greenland
// block signatures
const SIGNATURE_HEADER = 0x1127;
const SIGNATURE_BLOCK = 0x1027;
// default fill value for each block
const BLOCK_DEFAULTS = "\x0A\x05\x05\0\0\0\0\0\0\x07\0\0\x40\0";
// ignore blocks 3, 7, 9, 10
const IGNORE_BLOCK = '...Y...Y.YY...';

mb_internal_encoding('UTF-8');

class S2animal
{
	const RABBIT = 0x01;
	const FOX = 0x02;
	const STAG = 0x03;
	const DEER = 0x04;
	const DUCK = 0x05;
	const SHEEP = 0x06;
	const DEER2 = 0x07;
	const DUCK2 = 0x08;
	const PACKDONKEY = 0x09;
	
	public $id;
	public $x;
	public $y;
	
	function __construct($id = RABBIT, $x = 0, $y = 0)
	{
		$this->id = $id;
		$this->x = $x;
		$this->y = $y;
	}
}

class S2player
{
	const OCTAVIANUS = 0x00;
	const JULIUS = 0x01;
	const BRUTUS = 0x02;
	const ERIK = 0x03;
	const KNUT = 0x04;
	const OLOF = 0x05;
	const YAMAUCHI = 0x06;
	const TSUNAMI = 0x07;
	const HAKIRAWASHI = 0x08;
	const SHAKA = 0x09;
	const TODO = 0x0A;
	const MNGA_TSCHA = 0x0B;
	
	public $id;
	public $x;
	public $y;
	
	function __construct($id = OCTAVIANUS, $x = 0, $y = 0)
	{
		$this->id = $id;
		$this->x = $x;
		$this->y = $y;
	}
}

class S2world
{
	private $title;
	private $author;
	private $type;
	private $animal;
	private $area;
	private $block;
	private $filename;
	private $player;
	private $version;
	private $width;
	private $height;
	private $size;
	
	function __construct($file = null)
	{
		if( $file )
		{
			load($file);
		}
		else
		{
			$this->cleanup();
		}
	}
	
	// erase all information to defaults
	private function cleanup()
	{
		$this->title = 'Untitled';
		$this->author = 'Unknown';
		$this->type = WORLD_GREENLAND;
		$this->animal = array();
		$this->area = array();
		$this->filename = '';
		$this->player = array();
		$this->block = array();
		$this->version = VERSION_RTTR;
		$this->width = $this->height = $this->size = 0;
	}
	
	// return number of animals
	function count_animals()
	{
		return count($this->animal);
	}
	
	// return total available playfield (no snow, water, swamp, lava)
	function count_landmass()
	{
		$mass = 0;
		for($i = 0, $maxi = count($this->areas); $i < $maxi; $i++)
		{
			if($this->areas[$i]['id'] === 1)
			{
				$mass += $this->areas[$i]['mass'];
			}
		}
		return $mass;
	}
	
	// number of active players on this map
	function count_players()
	{
		$count = 0;
		// yeah, the best we can do is to loop
		for($i = 0, $maxi = count($this->player); $i < $maxi; $i++)
		{
			if($this->player[$i]->x > -1) $count++;
		}
		return $count;
	}
	
	// start a new map
	function create($width = 32, $height = 32, $texture = 0x05)
	{
		$this->cleanup();
		$this->size = $width * $height;
		$this->width = $width;
		$this->height = $height;
		// default values to use for filling
		$fill = BLOCK_DEFAULTS;
		$fill[1] = chr($texture);
		$fill[2] = chr($texture);
		// loop through
		for($i = 0; $i < 14; $i++)
		{
			$this->block[] = str_pad('', $this->size, $fill[$i], STR_PAD_RIGHT);
		}
	}
	
	function get_author()
	{
		$author = '';
		for($i = 0, $maxi = strlen($this->author); $i < $maxi; $i++)
		{
			$j = ord($this->author[$i]);
			if($j === 0) break;
			// convert CP437 to UTF-8 (custom style)
			$author .= mb_substr(CP437, $j, 1);
		}
		switch($author)
		{
			case '':
			// English
			case 'Nobody':
			// German
			case 'Niemand':
			// French
			case 'Personne':
			// Finnish
			case 'Tuntematon':
				return 'Unknown';
				break;
			default:
				return $author;
		}
	}
	
	function get_title()
	{
		$title = '';
		for($i = 0, $maxi = strlen($this->title); $i < $maxi; $i++)
		{
			$j = ord($this->title[$i]);
			if($j === 0) break;
			// convert CP437 to UTF-8 (custom style)
			$title .= mb_substr(CP437, $j, 1);
		}
		switch($title)
		{
			case '':
			// English
			case 'No Name':
			// German
			case 'Ohne Namen':
			// French
			case 'Sans nom':
			// Finnish
			case 'Nimetön':
			// Map Generator
			case 'New Map':
				return 'Untitled';
			default:
				return $title;
		}
	}
	
	function get_type()
	{
		switch($this->type)
		{
			case WORLD_GREENLAND:
				return 'Greenland';
			case WORLD_WASTELAND:
				return 'Wasteland';
			case WORLD_WINTER:
				return 'Winter World';
			case WORLD_NEWGREEN:
				return 'New Greenland';
			default:
				return 'Unknown type';
		}
	}
	
	// DAT, WLD, SWD or RttR map?
	function get_version()
	{
		switch ($this->version & VERSION_TYPE)
		{
			case VERSION_DAT:
				return 'Veni Vidi Vici';
			case VERSION_SWD:
				return 'Map Editor';
			case VERSION_WLD:
				return 'Campaign';
			case VERSION_RTTR:
				return 'Return to the Roots';
			default:
				return 'Unknown';
		}
	}
	
	// tells if any surrounding texture is a 
	function is_texture_water($i)
	{
		if($this->block[1][$i] !== 0x05) return false;
		if($this->block[2][$i] !== 0x05) return false;
		$x = $i % $this->width;
		$y = ($i / $this->width) | 0;
		$x1 = ($this->width + $x - 1) % $this->width;
		if($this->block[2][$y * $this->width + $x1] !== 0x05) return false;
		$y1 = ($this->height + $y - 1) % $this->height;
		if($y & 1)
		{
			if($this->block[1][$y1 * $this->width + $x] !== 0x05) return false;
			if($this->block[2][$y1 * $this->width + $x] !== 0x05) return false;
			$x2 = ($x + 1) % $this->width;
			if($this->block[1][$y1 * $this->width + $x2] !== 0x05) return false;
		}
		else
		{
			if($this->block[1][$y1 * $this->width + $x1] !== 0x05) return false;
			if($this->block[2][$y1 * $this->width + $x1] !== 0x05) return false;
			if($this->block[1][$y1 * $this->width + $x] !== 0x05) return false;
		}
		return true;
	}
	
	// returns false if no HQ in given position, otherwise returns player id found in object index (RttR feature!)
	function is_valid_hq($x, $y)
	{
		// check for valid position
		if($x < 6) return false;
		if($y < 5) return false;
		if($x + 5 + ($y & 1) > $this->width) return false;
		if($y + 5 > $this->height) return false;
		// TODO: fix below
		return true;
		// calculate index position
		$i = $y * $this->width + $x;
		// check for HQ object identifier
		if( ord($this->block[5][$i]) === 0x80)
		{
			return ord($this->block[4][$i]);
		}
		else
		{
			return false;
		}
	}
	
	// load a DAT, WLD, SWD, or GZIP variant of those three
	function load($file, $quickload = false)
	{
		if( !is_file($file) ) return false;
		$this->cleanup();
		// oh just read the entire file
		$content = file_get_contents($file);
		// check for compression
		if( substr($content, 0, strlen(SIGNATURE_GZIP)) === SIGNATURE_GZIP )
		{
			//$content = gzdecode($content);
			$content = gzinflate(substr($content, 10, -8));
			$this->version = ($this->version & VERSION_TYPE) | VERSION_GZIP;
		}
		// check for file version
		if(substr($content, 0, strlen(VERSION)) === VERSION)
		{
			$this->version = ($this->version & VERSION_FLAGS) | VERSION_SWD;
			$header = unpack('a24title/C1type/C1players/a20author/v7hqx/v7hqy/x/C7leader/a2250areas/n1id/V1idtype/v1width/v1height', substr($content, strlen(VERSION), 2342));
			$pos = 2342 + strlen(VERSION);
		}
		else
		{
			$this->version = ($this->version & VERSION_FLAGS) | VERSION_DAT;
			$header = unpack('n1id/V1idtype/v1width/v1height', substr($content, 0, 10));
			$pos = 10;
			if($header['idtype'] === -1)
			{
				$header = unpack('n1id/V1smallblock/V1idtype/v1width/v1height', substr($content, 0, 14) );
				$pos = 14;
			}
			$header['title'] = '';
			$header['type'] = WORLD_GREENLAND;
			$header['players'] = 0;
			$header['author'] = 'Blue Byte';
			$header['hqx1'] = $header['hqx2'] = $header['hqx3'] = $header['hqx4'] = $header['hqx5'] = $header['hqx6'] = $header['hqx7'] = $header['hqy1'] = $header['hqy2'] = $header['hqy3'] = $header['hqy4'] = $header['hqy5'] = $header['hqxy'] = $header['hqy7'] = 65535;
			$header['leader1'] = $header['leader2'] = $header['leader3'] = $header['leader4'] = $header['leader5'] = $header['leader6'] = $header['leader7'] = 0;
		}
		$header['smallblock'] = isset($header['smallblock']);
		if( $header['id'] === SIGNATURE_HEADER
			&& $header['idtype'] === 0
			&& ($header['width'] & 1) === 0
			&& ($header['height'] & 1) === 0
			&& ($header['width']) >= 32
			&& ($header['height']) >= 32
		) {
			$this->width = $header['width'];
			$this->height = $header['height'];
			$this->size = $this->width * $this->height;
			$this->type = $header['type'];
			// check for Return to the Roots version file
			if($header['width'] > 256 || $header['height'] > 256
				|| $header['players'] > 7
				|| $header['leader1'] > S2player::MNGA_TSCHA
				|| $header['leader2'] > S2player::MNGA_TSCHA
				|| $header['leader3'] > S2player::MNGA_TSCHA
				|| $header['leader4'] > S2player::MNGA_TSCHA
				|| $header['leader5'] > S2player::MNGA_TSCHA
				|| $header['leader6'] > S2player::MNGA_TSCHA
				|| $header['leader7'] > S2player::MNGA_TSCHA
			) {
				$this->version = ($this->version & VERSION_FLAGS) | VERSION_RTTR;
			}
			elseif( strlen($header['title']) > 19)
			{
				$header['title'] = str_pad($header['title'], 24, "\n", STR_PAD_RIGHT);
				// check for Campaign Map
				if( ( $header['width'] === (ord($header['title'][20]) | (ord($header['title'][21]) << 8))
						|| $header['height'] === (ord($header['title'][22]) | (ord($header['title'][23]) << 8))
					)
					&& !($header['leader1']
						|| $header['leader2']
						|| $header['leader3']
						|| $header['leader4']
						|| $header['leader5']
						|| $header['leader6']
						|| $header['leader7']
					)
				) {
					// Map Editor Map
					$header['title'] = substr($header['title'], 0, 19);
					$this->version = ($this->version & VERSION_FLAGS) | VERSION_SWD;
				}
				else
				{
					// Campaign Map
					$header['title'] = substr($header['title'], 0, 23);
					$this->version = ($this->version & VERSION_FLAGS) | VERSION_WLD;
				}
			}
			elseif( $header['leader1']
				|| $header['leader2']
				|| $header['leader3']
				|| $header['leader4']
				|| $header['leader5']
				|| $header['leader6']
				|| $header['leader7']
			) {
				// World Campaign Map
				$this->version = ($this->version & VERSION_FLAGS) | VERSION_WLD;
			}
			// other information from header
			$this->title = $header['title'];
			$this->author = $header['author'];
			// okay, do we have to bother with something more?
			if($quickload === false)
			{
				// prepare block header
				if( !$header['smallblock'] )
				{
					$block_header = "\x10\x27\0\0\0\0".pack('vv', $header['width'], $header['height'])."\1\0". pack('V', $this->size);
				}
				else
				{
					$block_header = pack('V', $this->size);
				}
				$block_header_size = strlen($block_header);
				$block_size = $this->size + $block_header_size;
				// read blocks
				for($i = 0; $i < 14; $i++)
				{
					// make sure the block header is the same
					if(substr($content, $pos, $block_header_size) === $block_header)
					{
						// ignore block?
						if( substr(IGNORE_BLOCK, $i, 1) === '.' )
						{
							// read the block
							$this->block[$i] = substr($content, $pos + $block_header_size, $this->size);
						}
						else
						{
							// mark block as unused
							$this->block[$i] = false;
						}
						$pos += $block_size;
					}
					else
					{
						// fail exit
						return false;
					}
				}
				// remove everything except animal data
				$content = substr($content, $pos);
				if( $eof = strpos($content, '\xFF') )
				{
					$content = substr($content, 0, $eof);
					// see if length matches with animal data
					if( ($eof = strlen($content)) % 5 === 0 )
					{
						for($i = 0; $i < $eof; $i+=5)
						{
							// parse animal information
							$animal = unpack('C1id/v1x/v1y', substr($content, $i, 5));
							// make sure the animal is inside borders
							if($animal['id'] < 255
								&& $animal['x'] >= 0
								&& $animal['y'] >= 0
								&& $animal['x'] < $this->width
								&& $animal['y'] < $this->height
							) {
								// create an animal object
								$this->animal[] = new S2animal($animal['id'], $animal['x'], $animal['y']);
							}
						}
					}
				}
				// no need for this anymore
				unset($content);
				// do we have any animals?
				if( count($this->animal) === 0)
				{
					// darn... ignorance... loop through the entire animal block!
					for($i = 0; $i < $this->size; $i++)
					{
						if( ($animal = ord($this->block[6][$i])) < 255)
						{
							// create an animal object
							$this->animal[] = new S2animal($animal, $i % $this->width, ($i / $this->width) | 0);
						}
					}
				}
				// we can remove the animal block
				$this->block[6] = false;
				// no need for this
				unset($animal);
			}
			// add players... RttR or not?
			if( $quickload === true || ($this->version & VERSION_TYPE) !== VERSION_RTTR )
			{
				// we trust header information if not a RttR map
				for($i = 1; $i <= 7; $i++)
				{
					$x = $header['hqx'.$i];
					$y = $header['hqy'.$i];
					$j = $this->is_valid_hq($x, $y);
					if( $j !== false )
					{
						// check result... anything not a 0 means a RttR map!
						//if($j > 0)
						//{
						//	// this feature is only available in Return to the Roots
						//	$this->version = ($this->version & VERSION_FLAGS) | VERSION_RTTR;
						//	// cleanup player array
						//	$this->player = array();
						//	// exit loop
						//	break;
						//}
						//else
						//{
							$this->player[$i - 1] = new S2player($header['leader'.$i], $x, $y);
						//}
					}
					else
					{
						$this->player[$i - 1] = new S2player(S2player::OCTAVIANUS, -1, -1);
					}
				}
			}
			// I dislike that I have to do this with RttR maps!
			elseif($quickload === false) //if( ($this->version & VERSION_TYPE) === VERSION_RTTR )
			{
				$x = array();
				$y = array();
				$p = array();
				$m = -1;
				for($i = 0; $i < $this->size; $i++)
				{
					// see if HQ found here
					if( ord($block[5][$i]) === 0x80)
					{
						// store player position
						$p[] = $j = ord($block[4][$i]);
						$x[] = $i % $this->width;
						$y[] = ($i / $this-width) | 0;
						// see if this is the biggest player id
						if($m < $j) $m = $j;
					}
				}
				// add players
				for($i = 0; $i <= $m; $i++)
				{
					$this->player[$i] = new S2player(S2player::OCTAVIANUS, -1, -1);
				}
				// now add the active players
				for($i = 0, $maxi = count($p); $i < $maxi; $i++)
				{
					// TODO: RttR does not support leaders... yet
					$this->player[ $p[$i] ]->x = $x[$i];
					$this->player[ $p[$i] ]->y = $y[$i];
				}
			}
			// then we do areas
			if( isset($header['areas']) )
			{
				// make sure it is big enough
				$header['areas'] = str_pad($header['areas'], 2250, "\0", STR_PAD_RIGHT);
				// and then we parse...
				for($i = 0; $i < 2250; $i+=9)
				{
					$area = unpack('C1id/v1x/v1y/V1mass', substr($header['areas'], $i, 9));
					// validate to be land or water
					if($area['id'] === 1 || $area['id'] === 2 )
					{
						$this->areas[] = $area;
					}
					else
					{
						break;
					}
				}
			}
			// any areas?
			if( $quickload === false && count($this->areas) === 0 )
			{
				// darn, we must loop... welcome to the world of PHP performance killers!
				for($i = 0; $i < $this->size; $i++)
				{
					$id = ord($this->block[13][$i]);
					// only 0 - 249 are valid
					if($id < 250)
					{
						if( !isset($areas[$id]) )
						{
							// check for water or land texture
							$this->areas[$id]['id'] = is_texture_water($i) ? 2 : 1;
							$this->areas[$id]['x'] = $i % $w;
							$this->areas[$id]['y'] = ($i / $w) | 0;
						}
						$areas[$id]['mass']++;
					}
				}
			}
			// we need header no more!
			unset($header);
			// success
			return true;
		}
		return false;
	}
	
	function save($file, $gzip = true)
	{
		// no support for saving DAT
		if( ($this->version & VERSION_TYPE) === VERSION_DAT) return false;
		
	}
	
	// set as DAT, WLD, SWD or RttR
	function set_version($version)
	{
		$this->version = $version & VERSION_TYPE;
	}
}