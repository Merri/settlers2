<?php

header('Content-type: text/plain; charset=UTF-8');

$files = array(
	'./de/TXT/MISS_001.ENG',
	'./de/TXT/MISS_002.ENG',
	'./de/TXT/MISS_003.ENG',
	'./de/TXT/MISS_004.ENG',
	'./de/TXT/MISS_005.ENG',
	'./de/TXT/MISS_006.ENG',
	'./de/TXT/MISS_007.ENG',
	'./de/TXT/MISS_008.ENG',
	'./de/TXT/MISS_009.ENG',
	'./de/TXT/MISS_010.ENG',
	'./de/TXT/NAMES.ENG',
	'./de/TXT/ONGAME.ENG',
	'./de/TXT3/ONGAME.ENG',
	'./en/TXT/MISS_001.ENG',
	'./en/TXT/MISS_002.ENG',
	'./en/TXT/MISS_003.ENG',
	'./en/TXT/MISS_004.ENG',
	'./en/TXT/MISS_005.ENG',
	'./en/TXT/MISS_006.ENG',
	'./en/TXT/MISS_007.ENG',
	'./en/TXT/MISS_008.ENG',
	'./en/TXT/MISS_009.ENG',
	'./en/TXT/MISS_010.ENG',
	'./en/TXT/NAMES.ENG',
	'./en/TXT/ONGAME.ENG',
	'./en/TXT3/ONGAME.ENG',
	'./fi/TXT/MISS_001.ENG',
	'./fi/TXT/MISS_002.ENG',
	'./fi/TXT/MISS_003.ENG',
	'./fi/TXT/MISS_004.ENG',
	'./fi/TXT/MISS_005.ENG',
	'./fi/TXT/MISS_006.ENG',
	'./fi/TXT/MISS_007.ENG',
	'./fi/TXT/MISS_008.ENG',
	'./fi/TXT/MISS_009.ENG',
	'./fi/TXT/MISS_010.ENG',
	'./fi/TXT/NAMES.ENG',
	'./fi/TXT/ONGAME.ENG',
	'./fi/TXT3/ONGAME.ENG',
	'./fr/TXT/MISS_001.ENG',
	'./fr/TXT/MISS_002.ENG',
	'./fr/TXT/MISS_003.ENG',
	'./fr/TXT/MISS_004.ENG',
	'./fr/TXT/MISS_005.ENG',
	'./fr/TXT/MISS_006.ENG',
	'./fr/TXT/MISS_007.ENG',
	'./fr/TXT/MISS_008.ENG',
	'./fr/TXT/MISS_009.ENG',
	'./fr/TXT/MISS_010.ENG',
	'./fr/TXT/NAMES.ENG',
	'./fr/TXT/ONGAME.ENG',
	'./fr/TXT3/ONGAME.ENG'
);

foreach($files as $filename)
{
	$filepath = explode('/', substr($filename, 2));
	if( is_file($filename) )
	{
		$filesize = filesize($filename);

		// the theoretical minimal size for a valid file of Settlers II strings file is 10 bytes (= no strings)
		// 
		if($filesize > 9)
		{
			$handle = fopen($filename, 'rb');
			$header = unpack('v3', fread($handle, 6));
			// validate header and at least one string
			if ($header[1] == 64999 && $header[3] == 1 && $header[2] > 0)
			{
				// make sure the filesize matches with what the file itself tells
				$contentsize = unpack('V', fread($handle, 4));
				if ($filesize == ($contentsize[1] + 10) )
				{
					// read string location table
					$loc = unpack('V*', fread($handle, intval($header[2]) * 4));
					// prepare strings array
					$txt = array();
					$txtlen = $loc[1];
					// read all strings
					$alltxt = explode("\x00", trim(fread($handle, $contentsize[1] - $txtlen), "\x00"));
					// fill strings array
					foreach($alltxt AS $value)
					{
						$txt['loc'.$txtlen] = iconv('CP437', 'UTF-8', str_replace('@@', "\n", $value));
						$txtlen += strlen($value) + 1;
					}
					// output all strings
					$i = 0;
					echo 'INSERT INTO settlers2_strings (`iso639-1`, `filename`, `str_author`, `str_id`, `str_text`) VALUES';
					foreach($loc AS $value)
					{
						echo ($i++ == 0) ? "\n\t" : "\n,\n\t";
						
						echo '("'.$filepath[0].'","'.$filepath[1].'/'.$filepath[2].'","Blue Byte",'.$i.',';
						if($value > 0)
						{
							echo '"'.str_replace("\n", '\n', addslashes($txt['loc'.$value])).'"';
						}
						else
						{
							echo 'NULL';
						}
						echo ')';
					}
					echo ";\n\n";
				}
				else
				{
					echo 'Filesize does not match!';
				}
			}
			else
			{
				echo 'Header checksums do not match';
			}
			
			fclose($handle);
		}
	}
}