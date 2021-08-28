<?php

error_reporting(E_ALL ^ E_NOTICE);
ini_set('display_errors','On');

define('WP_USE_THEMES', false);
require_once('../wp-load.php');
require_once('./functions.php');
define('S2_EDITOR', true);
require_once('./functions_db.php');

// get Wordpress user information!
global $current_user;
get_currentuserinfo();

header('Pragma: no-cache');
header('Cache-Control: private, no-cache');
header('Content-Disposition: inline; filename="response.json"');
header('Vary: Accept');

if (isset($_SERVER['HTTP_ACCEPT']) &&
	(strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false))
{
	header('Content-type: application/json');
}
else
{
	header('Content-type: text/plain');
}

$strings = array( 'filename', 'id', 'title', 'author' );
$numbers = array( 'filesize', 'width', 'height', 'players', 'terrain', 'continents', 'islands', 'stone', 'tree', 'crc32_blocks', 'crc32_textures' );
$number_arrays = array( 'hqx', 'hqy', 'leader', 'resource' );
$booleans = array( 'campaign' );

foreach($strings as $string)
{
	$$string = merri_POST_text($string);
}

foreach($numbers as $number)
{
	$$number = merri_POST_number($number);
}

foreach($number_arrays as $number_array)
{
	$$number_array = merri_POST_number_array($number_array);
}

foreach($booleans as $boolean)
{
	$$boolean = merri_POST_boolean($boolean);
}

$areas = array();
if(isset($_POST['areas']) && is_array($_POST['areas']))
{
	foreach($_POST['areas'] as $area)
	{
		if( is_array($area) && isset($area['id']) && isset($area['x']) && isset($area['y']) && isset($area['mass'])
			&& isset($area['continent']) && isset($area['harbor']) )
		{
			$areas[] = array(
				'id' => intval($area['id']),
				'x' => intval($area['x']),
				'y' => intval($area['y']),
				'mass' => intval($area['mass']),
				'continent' => is_numeric($area['continent']) ? intval($area['continent']) : false,
				'harbor' => false	/*TODO*/
			);
		}
	}
}

// prepare some reporting features
$errors = array();
$notices = array();
$size = $width * $height;

// area validator and calculator
$landmass = 0;
$waterarea = 0;
$playable_area = 0;
$unplayable_area = 0;
$validate_continents = 0;
$validate_islands = 0;
$total_mass = 0;

if(count($areas) > 0)
{
	foreach($areas as $area)
	{
		$total_mass += $area['mass'];
		if($area['id'] === 1)
		{
			$landmass += $area['mass'];
			if($area['continent'] !== false)
			{
				$playable_area += $area['mass'];
				$validate_continents++;
			}
			else
			{
				$unplayable_area += $area['mass'];
				$validate_islands++;
			}
		}
		else
		{
			$watermass += $area['mass'];
		}
	}
}
else
{
	$errors[] = 'area_none';
}

// player validator
$validate_players = 0;

if(is_array($hqx) && is_array($hqy) && is_array($leader))
{
	if(count($hqx) === count($hqy) && count($hqy) === count($leader))
	{
		for($i = 0, $maxi = count($leader); $i < $maxi; $i++)
		{
			$x =$hqx[$i];
			$y = $hqy[$i];
			$l = $leader[$i];
			if( $x > 5 && $y > 4
				&& ($x + 5 + ($y & 1)) <= $width
				&& ($y + 5) <= $height )
			{
				$validate_players++;
			}
		}
	}
}

// errors: basic features validation...
if($width < 0 || $width > 256 || ($width & 0x0F) !== 0) $errors[] = 'width_invalid '.$width;
if($height < 0 || $height > 256 || ($height & 0x0F) !== 0) $errors[] = 'height_invalid '.$height;
if($terrain < 0 || $terrain > 2) $errors[] = 'terrain_invalid '.$terrain;
if($players < 0 || $players > 255) $errors[] = 'players_invalid '.$players;
if($stone < 0 || $stone > ($landmass * 6) ) $errors[] = 'stone_invalid '.$stone;
if($tree < 0 || $tree > $landmass) $errors[] = 'tree_invalid '.$tree;
if(count($resource) !== 32) $errors[] = 'resources_invalid_count '.count($resource);
if(count($areas) > 250) $errors[] = 'areas_too_many '.count($areas);
if($total_mass > $size) $errors[] = 'areas_impossible_mass '.$total_mass;

if(count($errors) > 0)
{
	echo json_encode(array(
		'errors' => $errors,
		'notices' => $notices
	));
	exit;
}

// no playable area: probably no players set!
if($playable_area === 0) $notices[] = 'area_playable_none';
// unplayable area is significant in size (more than 20% of playable)
if( ($playable_area * 0.2) < $unplayable_area ) $notices[] = 'area_unplayble_significant';
// reported player count does not validate with validated player count
if($players !== $validate_players) $notices[] = 'player_count_mismatch';
// there is no player
if($validate_players === 0) $notices[] = 'player_none';

$players = $validate_players;
$continents = $validate_continents;
$islands = $validate_islands;

// we start a very lengthy filename and map title processing here
if(strlen($filename) === 0)
{
	$filetitle = '';
	$filetype = 'swd';
}
elseif(strlen($filename) > 4)
{
	switch( strtoupper(substr($filename, -4)) )
	{
		case '.WLD':
			$filetitle = substr($filename, 0, -4);
			$filetype = 'wld';
			break;
		case '.SWD':
		case '.DAT':
			$filetitle = substr($filename, 0, -4);
			$filetype = 'swd';
			break;
		default:
			// try to see if there is some other file extension that we just do not know about
			if(substr($filename, -4, 1) === '.' && strpos(substr($filename, -3), '.') === false)
			{
				$filetitle = substr($filename, 0, -4);
			}
			else
			{
				$filetitle = $filename;
			}
			$filetype = 'swd';
	}
}
else
{
	// oddity here, but we can deal with it...
	$filetitle = $filename;
	$filetype = 'swd';
}

// campaign autosets file extension as wld
if($campaign) $filetype = 'wld';

// we do not like full uppercase
if(strlen($filetitle) > 0 && $filetitle === mb_strtoupper($filetitle, 'UTF-8'))
{
	$filetitle = ucfirst(mb_strtolower($filetitle, 'UTF-8'));
}

switch($title)
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
		// try setting title from filename, otherwise Untitled
		$title = (strlen($filetitle) > 0) ? $filetitle : 'Untitled';
}

// no filetitle, use title...
if(strlen($filetitle) === 0) $filetitle = $title;

// put together the new filename
$filename_original = $filename;
$filename = $filetitle.'.'.$filetype;

// this code here checks WORLD###.DAT to be below 900, 900 and above are savegames
$worldnumber = null;
if(strlen($author) === 0 && strlen($filename) === 12
	&& strtoupper(substr($filename, 0, 5)) === 'WORLD' && strtoupper(substr($filename, -4)) === '.DAT'
	&& intval($worldnumber = substr($filename, 5, 3)) < 900
	&& (intval($worldnumber) > 0 || $worldnumber === '000') )
{
	$author = 'Blue Byte';
}
elseif(isset($worldnumber) && ($worldnumber = intval($worldnumber)) >= 900)
{
	// only change author if not set
	if(strlen($author) === 0) $author = 'Savegame slot #'.($worldnumber - 899);
	// always add notice that this is a savegame
	$notices[] = 'savegame_slot_'.($worldnumber-899);
}
// then we have a few author names that we simply standardize as "Unknown"
switch($author)
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

// check for exact duplicate
$maps = $wpdb->get_col( $wpdb->prepare(
"
	SELECT map_id FROM settlers2_maps
	WHERE map_width = %d AND map_height = %d
		AND map_crc32_textures = %d
		AND map_crc32_blocks = %d
",
	$width, $height,
	$crc32_textures,
	$crc32_blocks
) );

if(count($maps) > 0)
{
	// exact duplicate
	$errors[] = 'map_duplicate';
	$id = $maps[0];
}
else
{
	// check for feature similarity
	$maps = $wpdb->get_col( $wpdb->prepare(
	"
		SELECT map_id FROM settlers2_maps
		WHERE map_width = %d AND map_height = %d
			AND map_title = %s
			AND map_terrain = %d
			AND map_landmass = %d
			AND map_continents = %d
			AND map_islands = %d
	",
		$width, $height,
		$title,
		$terrain,
		$landmass,
		$continents,
		$islands
	) );
	
	if(count($maps) === 1)
	{
		$notices[] = 'map_revision';
		$id = $maps[0];
	}
	elseif(count($maps) > 1)
	{
		$notices[] = 'map_revision_count '.count($maps);
		$id = $maps[0];
		// check if there are other similar maps... shouldn't happen but you never know!
		for($i = 1; $i < count($maps); $i++)
		{
			if($maps[$i] !== $id)
			{
				$notices[] = 'map_similar '.$maps[$i];
			}
		}
	}
	elseif(strlen($id) === 0 || is_valid_id($id) === false)
	{
		// rank this as a new map, generate a new id
		$id = new_id($title);
	}
	else
	{
		// check if we know the existing id, order by revision
		$maps = $wpdb->get_results( $wpdb->prepare(
		"
			SELECT ID, map_width, map_height, map_landmass, map_resource, map_stones, map_trees, map_continents, map_islands, map_harbors, map_players, map_playerdata, map_uploader
			FROM settlers2_maps
			WHERE map_id = %s
			ORDER BY map_uploaded DESC
		",
			$id
		) );
		
		if(count($maps) === 0)
		{
			$errors[] = 'map_unknown_id';
		}
		else
		{
			// check for other errors: size cannot change!
			if($width !== $maps[0]['map_width']) $errors[] = 'map_width_mismatch '.$maps[0]['map_width'];
			if($height !== $maps[0]['map_height']) $errors[] = 'map_height_mismatch '.$maps[0]['map_height'];
			// check features
			if($landmass !== $maps[0]['map_landmass']) $notices[] = 'map_landmass_change '.$maps[0]['map_landmass'];
			if($players !== $maps[0]['map_players']) $notices[] = 'map_players_change '.$maps[0]['map_players'];
			if($stone !== $maps[0]['map_stones']) $notices[] = 'map_stones_change '.$maps[0]['map_stones'];
			if($tree !== $maps[0]['map_trees']) $notices[] = 'map_trees_change '.$maps[0]['map_trees'];
			if($continents !== $maps[0]['map_continents']) $notices[] = 'map_continents_change '.$maps[0]['map_continents'];
			if($islands !== $maps[0]['map_islands']) $notices[] = 'map_islands_change '.$maps[0]['map_islands'];
			if($harbors !== $maps[0]['map_harbors']) $notices[] = 'map_harbors_change '.$maps[0]['map_harbors'];
		}
	}
}

// debug readibility
echo str_replace(array(',', '}'), array("\n,\n", "\n}\n"), json_encode(array(
	'errors' => $errors,
	'notices' => $notices,
	'id' => $id,
	'filename' => $filename,
	'title' => $title,
	'author' => $author,
	'players' => $players,
	'continents' => $continents,
	'islands' => $islands,
	'maps' => $maps
)));