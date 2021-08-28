<?php

define('S2_EDITOR', TRUE);

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
			// Set the following option to 'POST', if your server does not support
			// DELETE requests. This is a parameter sent to the client:
			'delete_type' => 'DELETE',
			// The php.ini settings upload_max_filesize and post_max_size
			// take precedence over the following max_file_size setting:
			'max_file_size' => null,
			'min_file_size' => 1,
			'accept_file_types' => '/\.swd$|\.wld$|\.dat$|\.gz$/i',
			'max_number_of_files' => 15,
			// Image resolution restrictions:
			'max_width' => null,
			'max_height' => null,
			'min_width' => 1,
			'min_height' => 1,
			// Set the following option to false to enable resumable uploads:
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
			$WLD = new S2world();
			if( $WLD->load($file_path, true) )
			{
				$file->title = $WLD->get_title();
				$file->author = $WLD->get_author();
				$file->players = $WLD->count_players();
				$file->terrain = $WLD->get_type();
				$file->version = $WLD->get_version();
			}
			$file->thumbnail_url = ''; //'thumb.php?file='.rawurlencode($file->name).'&amp;format=jpg96';
			$file->url = 's2canvaspng.php?file='.rawurlencode($file->name); //'thumb.php?file='.rawurlencode($file->name).'&amp;format=jpg';
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
	
	private function handle_file_upload($uploaded_file, $name, $size, $type, $error, $index = null)
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
				$WLD = new S2world();
				if( $WLD->load($file_path, true) )
				{
					$file->title = $WLD->get_title();
					$file->author = $WLD->get_author();
					$file->players = $WLD->count_players();
					$file->terrain = $WLD->get_type();
					$file->version = $WLD->get_version();
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
			$file->thumbnail_url = ''; //'thumb.php?file='.rawurlencode($file->name).'&amp;format=jpg96';
			$file->url = 's2canvaspng.php?file='.rawurlencode($file->name); //'thumb.php?file='.rawurlencode($file->name).'&amp;format=jpg';
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
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Content-Disposition: inline; filename="files.json"');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: OPTIONS, HEAD, GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: X-File-Name, X-File-Type, X-File-Size');

// get Wordpress user information!
global $current_user;
get_currentuserinfo();

switch ( $_SERVER['REQUEST_METHOD'] )
{
	case 'OPTIONS':
		break;
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