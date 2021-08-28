<?php

define('WORLD_MAP_DATABASE', TRUE);

error_reporting(E_ALL | E_STRICT);

define('WP_USE_THEMES', false);
require_once('../wp-load.php');
require_once('./world.php');

class UploadHandler
{
	private $options;
	
	function __construct($options=null)
	{
		$this->options = array(
			'script_url' => $_SERVER['PHP_SELF'],
			'upload_dir' => dirname(__FILE__).'/world/',
			'upload_url' => dirname($_SERVER['PHP_SELF']).'/world/',
			'param_name' => 'files',
			// The php.ini settings upload_max_filesize and post_max_size
			// take precedence over the following max_file_size setting:
			'max_file_size' => null,
			'min_file_size' => 1,
			'accept_file_types' => '/\.swd$|\.wld$|\.dat$/i',
			'max_number_of_files' => null,
			'discard_aborted_uploads' => true
		);
		if ($options)
		{
			$this->options = array_replace_recursive($this->options, $options);
		}
	}
	
	private function get_file_object($file_name)
	{
		global $current_user;
		$file_id = $current_user->ID.'_';
		$file_path = $this->options['upload_dir'].$file_name;
		if (is_file($file_path)
			&& strlen($file_name) > ( $file_id_len = strlen($file_id) )
			&& substr($file_name, 0, $file_id_len) == $file_id)
		{
			$file = new stdClass();
			$file->name = substr($file_name, $file_id_len);
			$file->size = filesize($file_path);
			//$file->url = $this->options['upload_url'].$file_id.rawurlencode($file->name);
			$file->delete_url = $this->options['script_url'].'?file='.rawurlencode($file->name).'&amp;delete=delete';
			$file->delete_type = 'GET';
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
			fclose($WLD);
			$header['smallblock'] = isset($header['smallblock']);
			if( ($header['type'] < 3) && ($header['id'] == 4391) && ($header['idtype'] == 0)
				&& (($header['width'] & 15) == 0) && (($header['height'] & 15) == 0)
				&& ($header['width'] > 31) && ($header['height'] > 31)
				&& ($header['width'] < 257) && ($header['height'] < 257) )
			{
				$file->title = map_title($header['title'], $file->name, $header['width'], $header['height']);
				$file->author = map_author($header['author']);
				
				$players = 0;
				for($i = 1, $maxi = 7; $i <= $maxi; $i++)
				{
					if(TRUE === ( $valid = validate_hq_pos($header['playerx'.$i], $header['playery'.$i], $header['width'], $header['height']) ))
					{
						$players++;
					}
				}
				$file->players = $players;
				
				switch($header['type'])
				{
					case 1:
						$file->terrain = 'Wasteland';
						break;
					case 2:
						$file->terrain = 'Winter World';
						break;
					case 0:
						$file->terrain = 'Greenland';
				}
				
				$file->thumbnail_url = 'thumb.php?file='.rawurlencode($file->name).'&amp;format=jpg96';
				$file->url = 'thumb.php?file='.rawurlencode($file->name).'&amp;format=jpg';
			}
			return $file;
		}
		return null;
	}
	
	private function get_file_objects()
	{
		return array_values(array_filter(array_map(
			array($this, 'get_file_object'),
			scandir($this->options['upload_dir'])
		)));
	}

	private function has_error($uploaded_file, $file, $error)
	{
		if ($error) {
			return $error;
		}
		if (!preg_match($this->options['accept_file_types'], $file->name))
		{
			return 'acceptFileTypes';
		}
		if ($uploaded_file && is_uploaded_file($uploaded_file))
		{
			$file_size = filesize($uploaded_file);
		}
		else
		{
			$file_size = $_SERVER['CONTENT_LENGTH'];
		}
		if ($this->options['max_file_size'] && (
				$file_size > $this->options['max_file_size'] ||
				$file->size > $this->options['max_file_size']) )
		{
			return 'maxFileSize';
		}
		if ($this->options['min_file_size'] &&
			$file_size < $this->options['min_file_size']) {
			return 'minFileSize';
		}
		if (is_int($this->options['max_number_of_files']) && (
				count($this->get_file_objects()) >= $this->options['max_number_of_files'])
			) {
			return 'maxNumberOfFiles';
		}
		return $error;
	}
	
	private function handle_file_upload($uploaded_file, $name, $size, $type, $error)
	{
		global $current_user;
		$file_id = $current_user->ID.'_';
		$file = new stdClass();
		$file->name = basename(stripslashes($name));
		$file->size = intval($size);
		$file->type = $type;
		$error = $this->has_error($uploaded_file, $file, $error);
		if (!$error && $file->name)
		{
			$file_path = $this->options['upload_dir'].$file_id.$file->name;
			$append_file = is_file($file_path) && $file->size > filesize($file_path);
			clearstatcache();
			if ($uploaded_file && is_uploaded_file($uploaded_file))
			{
				// multipart/formdata uploads (POST method uploads)
				if ($append_file)
				{
					file_put_contents(
						$file_path,
						fopen($uploaded_file, 'r'),
						FILE_APPEND
					);
				} else {
					move_uploaded_file($uploaded_file, $file_path);
				}
			}
			else
			{
				// Non-multipart uploads (PUT method support)
				file_put_contents(
					$file_path,
					fopen('php://input', 'r'),
					$append_file ? FILE_APPEND : 0
				);
			}
			$file_size = filesize($file_path);
			if ($file_size === $file->size)
			{
				//$file->url = $this->options['upload_url'].$file_id.rawurlencode($file->name);
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
				fclose($WLD);
				$header['smallblock'] = isset($header['smallblock']);
				if( ($header['type'] < 3) && ($header['id'] == 4391) && ($header['idtype'] == 0)
					&& (($header['width'] & 15) == 0) && (($header['height'] & 15) == 0)
					&& ($header['width'] > 31) && ($header['height'] > 31)
					&& ($header['width'] < 257) && ($header['height'] < 257) )
				{
					$file->title = map_title($header['title'], $file->name, $header['width'], $header['height']);
					$file->author = map_author($header['author']);
					
					$players = 0;
					for($i = 1, $maxi = 7; $i <= $maxi; $i++)
					{
						if(TRUE === ( $valid = validate_hq_pos($header['playerx'.$i], $header['playery'.$i], $header['width'], $header['height']) ))
						{
							$players++;
						}
					}
					$file->players = $players;
					
					switch($header['type'])
					{
						case 1:
							$file->terrain = 'Wasteland';
							break;
						case 2:
							$file->terrain = 'Winter World';
							break;
						case 0:
							$file->terrain = 'Greenland';
					}
				}
				else
				{
					unlink($file_path);
					$file->error = 'acceptFileTypes';
				}
			}
			elseif ($this->options['discard_aborted_uploads'])
			{
				unlink($file_path);
				$file->error = 'abort';
			}
			$file->size = $file_size;
			$file->delete_url = $this->options['script_url'].'?file='.rawurlencode($file->name).'&amp;delete=delete';
			$file->delete_type = 'GET';
			$file->thumbnail_url = 'thumb.php?file='.rawurlencode($file->name).'&amp;format=jpg96';
			$file->url = 'thumb.php?file='.rawurlencode($file->name).'&amp;format=jpg';
		}
		else
		{
			$file->error = $error;
		}
		return $file;
	}
	
	public function get()
	{
		global $current_user;
		$file_id = $current_user->ID.'_';
		$file_name = isset($_REQUEST['file']) ?
			$file_id.basename(stripslashes($_REQUEST['file'])) : null; 
		if ($file_name)
		{
			$info = $this->get_file_object($file_name);
		}
		else
		{
			$info = $this->get_file_objects();
		}
		header('Content-type: application/json');
		echo json_encode($info);
	}
	
	public function post()
	{
		$upload = isset($_FILES[$this->options['param_name']]) ?
			$_FILES[$this->options['param_name']] : array(
				'tmp_name' => null,
				'name' => null,
				'size' => null,
				'type' => null,
				'error' => null
			);
		$info = array();
		if (is_array($upload['tmp_name']))
		{
			foreach ($upload['tmp_name'] as $index => $value)
			{
				$info[] = $this->handle_file_upload(
					$upload['tmp_name'][$index],
					isset($_SERVER['HTTP_X_FILE_NAME']) ?
						$_SERVER['HTTP_X_FILE_NAME'] : $upload['name'][$index],
					isset($_SERVER['HTTP_X_FILE_SIZE']) ?
						$_SERVER['HTTP_X_FILE_SIZE'] : $upload['size'][$index],
					isset($_SERVER['HTTP_X_FILE_TYPE']) ?
						$_SERVER['HTTP_X_FILE_TYPE'] : $upload['type'][$index],
					$upload['error'][$index]
				);
			}
		}
		else
		{
			$info[] = $this->handle_file_upload(
				$upload['tmp_name'],
				isset($_SERVER['HTTP_X_FILE_NAME']) ?
					$_SERVER['HTTP_X_FILE_NAME'] : $upload['name'],
				isset($_SERVER['HTTP_X_FILE_SIZE']) ?
					$_SERVER['HTTP_X_FILE_SIZE'] : $upload['size'],
				isset($_SERVER['HTTP_X_FILE_TYPE']) ?
					$_SERVER['HTTP_X_FILE_TYPE'] : $upload['type'],
				$upload['error']
			);
		}
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
		echo json_encode($info);
	}
	
	public function delete()
	{
		global $current_user;
		$file_id = $current_user->ID.'_';
		$file_name = isset($_REQUEST['file']) ? $file_id.basename(stripslashes($_REQUEST['file'])) : null;
		$file_path = $this->options['upload_dir'].$file_name;
		$success = is_file($file_path) && unlink($file_path);
		if ($success)
		{
/*
			foreach($this->options['image_versions'] as $version => $options)
			{
				$file = $options['upload_dir'].$file_name;
				if (is_file($file))
				{
					unlink($file);
				}
			}
*/
		}
		header('Content-type: application/json');
		echo json_encode($success);
	}
}

$upload_handler = new UploadHandler();

header('Pragma: no-cache');
header('Cache-Control: private, no-cache');
header('Content-Disposition: inline; filename="files.json"');

// get Wordpress user information!
global $current_user;
get_currentuserinfo();

switch ( $_SERVER['REQUEST_METHOD'] )
{
	case 'HEAD':
	case 'GET':
		if( is_user_logged_in() )
		{
			if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_REQUEST['delete']) && $_REQUEST['delete'] == 'delete' )
			{
				$upload_handler->delete();
			}
			else
			{
				$upload_handler->get();
			}
			break;
		}
	case 'POST':
		if( is_user_logged_in() )
		{
			$upload_handler->post();
			break;
		}
	case 'DELETE':
		if( is_user_logged_in() )
		{
			$upload_handler->delete();
			break;
		}
	default:
		header('HTTP/1.0 405 Method Not Allowed');
}
