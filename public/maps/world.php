<?php

if(!defined('WORLD_MAP_DATABASE')) exit;

// list of valid DOS 8.3 characters on FAT16
define('DOS83', '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&\'()-@^_`{}~'.
'\0x80\0x81\0x82\0x83\0x84\0x85\0x86\0x87\0x88\0x89\0x8A\0x8B\0x8C\0x8D\0x8E\0x8F'.
'\0x90\0x91\0x92\0x93\0x94\0x95\0x96\0x97\0x98\0x99\0x9A\0x9B\0x9C\0x9D\0x9E\0x9F'.
'\0xA0\0xA1\0xA2\0xA3\0xA4\0xA5\0xA6\0xA7\0xA8\0xA9\0xAA\0xAB\0xAC\0xAD\0xAE\0xAF'.
'\0xB0\0xB1\0xB2\0xB3\0xB4\0xB5\0xB6\0xB7\0xB8\0xB9\0xBA\0xBB\0xBC\0xBD\0xBE\0xBF'.
'\0xC0\0xC1\0xC2\0xC3\0xC4\0xC5\0xC6\0xC7\0xC8\0xC9\0xCA\0xCB\0xCC\0xCD\0xCE\0xCF'.
'\0xD0\0xD1\0xD2\0xD3\0xD4\0xD5\0xD6\0xD7\0xD8\0xD9\0xDA\0xDB\0xDC\0xDD\0xDE\0xDF'.
'\0xE0\0xE1\0xE2\0xE3\0xE4\0xE5\0xE6\0xE7\0xE8\0xE9\0xEA\0xEB\0xEC\0xED\0xEE\0xEF'.
'\0xF0\0xF1\0xF2\0xF3\0xF4\0xF5\0xF6\0xF7\0xF8\0xF9\0xFA\0xFB\0xFC\0xFD\0xFE\0xFF');

// create a DOS8.3 filename also known as map_id in the database
function new_id($title = '')
{
	global $wpdb;
	
	// safe lowercase to uppercase (DOS filenames are uppercase only)
	$dostitle = iconv(
		'UTF-8',
		'CP437',
		strtr($title, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
	);
	
	// always have padding with spaces
	$new_id = '       ';
	
	// validate characters to the ID (= DOS8.3 filename for the map)
	for($i = $j = 0, $maxi = strlen($dostitle); $i < $maxi || $j < 7; $i++)
	{
		if( strpos(DOS83, $c = substr($dostitle, $i, 1)) !== FALSE)
		{
			$new_id[$j++] = $c;
		}
	}
	// if after all that processing we got no character at all then advertise settlers2.net
	if($j == 0) $new_id = '{S2NET}';
	
	// we query the latest ID from database...
	$sql = $wpdb->prepare("
SELECT RIGHT(map_id, 1)
FROM settlers2_maps
WHERE LEFT(map_id, 7) = %s
ORDER BY map_uploaded DESC
LIMIT 1;", $new_id);
	
	// see if we got any results...
	if( $new_index = $wpdb->get_var($sql) !== NULL )
	{
		// database stuff is always UTF-8
		$new_index = iconv('UTF-8', 'CP437', $new_index);
		// figure out index represented by the character
		$new_index = ( strlen($new_index) == 1 ) ? strpos(DOS83, $new_index) + 1 : 0;
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

// creates a valid title
function map_title($title, $filename = '', $width = 0, $height = 0)
{
	// drop file extension
	if( ($p = strrpos($filename, '.')) !== FALSE && $p > 0 )
	{
		$filename = substr($filename, 0, $p);
	}
	// cut null character
	if( ($p = strpos($title, "\0")) !== FALSE )
	{
		$title = substr( $title, 0, $p );
	}
	// limit title length to theoretical max of a Campaign Map title length
	if( strlen($title) > 24 ) $title = substr($title, 0, 24);
	// check if last two bytes = height
	if( ($l = strlen($title)) > 22 )
	{
		$charcode = ( $l == 24 ? ord($title[23]) * 256 : 0 ) + ord($title[22]);
		if( $charcode == $height )
		{
			$title = substr($title, 0, 22);
		}
	}
	// check if width bytes = width
	if( ($l = strlen($title)) > 20 )
	{
		$charcode = ( $l >= 22 ? ord($title[21]) * 256 : 0 ) + ord($title[20]);
		if( $charcode == $width )
		{
			$title = substr($title, 0, 20);
		}
	}
	// ignore default map editor values
	switch( $title = iconv('CP437', 'UTF-8', $title) )
	{
		// Empty!
		case '':
		// English
		case 'No Name':
		// German
		case 'Ohne Namen':
		// French
		case 'Sans nom':
		// Finnish
		case 'Nimetön':
			// output in UTF-8
			return (mb_strtoupper($filename, 'UTF-8') === $filename) ? ucfirst(mb_strtolower($filename, 'UTF-8')) : $filename;
			break;
		default:
			// output in UTF-8
			return $title;
	}
}

// creates a valid author
function map_author($author)
{
	// cut null character
	if( ($p = strpos($author, "\0")) !== FALSE )
	{
		$author = substr( $author, 0, $p );
	}
	// ignore default map editor values
	switch( $author = iconv('CP437', 'UTF-8', $author) )
	{
		// Empty!
		case '':
		// English
		case 'Nobody':
		// German
		case 'Niemand':
		// French
		case 'Personne':
		// Finnish
		case 'Tuntematon':
			$author = 'Unknown';
	}
	// output in UTF-8
	return $author;
}

function validate_hq_pos($x = 0, $y = 0, $width = 32, $height = 32)
{
	// check for valid position
	if($x < 6) return FALSE;
	if($y < 5) return FALSE;
	if($x + 5 + ($y & 1) > $width) return FALSE;
	if($y + 5 > $height) return FALSE;
	// valid as far as I'm concerned!
	return TRUE;
}

