<?php

//if(!defined('S2_EDITOR')) exit;

// list of valid DOS 8.3 characters on FAT16
define('DOS83', '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&\'()-@^_`{}~'.
'\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F'.
'\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F'.
'\xA0\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC\xAD\xAE\xAF'.
'\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF'.
'\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF'.
'\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xDF'.
'\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF'.
'\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB\xFC\xFD\xFE\xFF');

// create a DOS8.3 filename also known as map_id in the database (but not for Return to the Roots!)
function new_id($title = '', $rttr = false)
{
	global $wpdb;
	$length = ($rttr === true) ? 24 : 7;
	
	// safe lowercase to uppercase (DOS filenames are uppercase only)
	$dostitle = iconv(
		'UTF-8',
		'CP437',
		strtr( (($rttr === true) ? str_replace(' ', '_', $title) : $title), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
	);
	
	// always have padding with spaces in DOS8.3
	$new_id = ($rttr === true) ? '_______________________' : '_______';
	
	// validate characters to the ID (= DOS8.3 filename for the map)
	for($i = $j = 0, $maxi = strlen($dostitle); $i < $maxi && $j < $length; $i++)
	{
		if( strpos(DOS83, $c = substr($dostitle, $i, 1)) !== false)
		{
			$new_id[$j++] = $c;
		}
	}
	// if after all that processing we got no character at all then advertise settlers2.net
	if($j === 0) $new_id = '{S2NET}';
	
	// we query the latest ID from database...
	if($rttr === true)
	{
		$sql = $wpdb->prepare("
SELECT RIGHT(map_id, 1)
FROM settlers2_maps
WHERE LEFT(map_id, 23) = %s
ORDER BY map_uploaded DESC
LIMIT 1;", $new_id);
	}
	else
	{
		$sql = $wpdb->prepare("
SELECT RIGHT(map_id, 1)
FROM settlers2_maps
WHERE LEFT(map_id, 7) = %s
ORDER BY map_uploaded DESC
LIMIT 1;", $new_id);
	}
	
	// see if we got any results...
	if( ($new_index = $wpdb->get_var($sql)) !== NULL )
	{
		// database stuff is always UTF-8
		$new_index = iconv('UTF-8', 'CP437', $new_index);
		// figure out index represented by the character
		$new_index = ( strlen($new_index) === 1 ) ? strpos(DOS83, $new_index) + 1 : 0;
	}
	else
	{
		$new_index = 0;
	}
	
	// output new ID in UTF-8
	return iconv(
		'CP437',
		'UTF-8',
		$new_id . substr(DOS83, $new_index, 1)
	);
}

function is_valid_id($id, $rttr = false) {
	// validate id to be compatible with DOS83 filenames
	if(isset($id) && is_string($id) && ($rttr === true ? mb_strlen($id, 'UTF-8') === 24 : mb_strlen($id, 'UTF-8') === 8) )
	{
		// convert to CP437 (at this point the ID should have already been validated once for valid UTF-8)
		$cp437 = iconv('UTF-8', 'CP437', $id);
		// then make sure each character is valid
		for($i = 0; $i < 8; $i++)
		{
			if( strpos(DOS83, $cp437[$i]) === false) break;
		}
		// return true if all characters passed
		return $i === 8;
	}
	return false;
}
