<?php

function merri_POST_boolean($field)
{
	if( isset($_POST[$field]) && !is_array($_POST[$field]) )
	{
		return $_POST[$field] === 'true';
	}
	return null;
}

function merri_POST_number($field)
{
	if( isset($_POST[$field]) && !is_array($_POST[$field]) )
	{
		return intval($_POST[$field]);
	}
	return null;
}

function merri_POST_number_array($field)
{
	if( isset($_POST[$field]) && is_array($_POST[$field]) )
	{
		$posts = array();
		foreach($_POST[$field] as $post)
		{
			$posts[] = intval($post);
		}
		return $posts;
	}
	return null;
}

// Return POST fields as UTF-8 validated text or array of text
function merri_POST_text($field)
{
	if( isset($_POST[$field]) && !is_array($_POST[$field]) )
	{
		return merri_utf8(get_magic_quotes_gpc() ? stripslashes($_POST[$field]) : $_POST[$field]);
	}
	return null;
}

function merri_POST_text_array($field)
{
	if( isset($_POST[$field]) && is_array($_POST[$field]) )
	{
		$posts = array();
		foreach($_POST[$field] as $post)
		{
			$posts[] = merri_utf8(get_magic_quotes_gpc() ? stripslashes($post) : $post);
		}
		return $posts;
	}
	return null;
}

// Validates UTF-8
function merri_utf8($str, $invalid_char = '?')
{
	$out = '';
	$remaining = 0;
	$utf32 = 0;
	$total = 1;
	for($i = 0, $maxi = strlen($str); $i < $maxi; $i++)
	{
		$utf8 = ord( $str{$i} );
		if (0 == $remaining)
		{
			if (0 == (0x80 & ($utf8)))
			{
				$out .= $str{$i};
				$total = 1;
			}
			elseif( 0xC0 == (0xE0 & ($utf8)) )
			{
				$utf32 = ($utf8 & 0x1F) << 6;
				$remaining = 1;
				$total = 2;
			}
			elseif( 0xE0 == (0xF0 & ($utf8)) )
			{
				$utf32 = ($utf8 & 0x0F) << 12;
				$remaining = 2;
				$total = 3;
			}
			elseif( 0xF0 == (0xF8 & ($utf8)) )
			{
				$utf32 = ($utf8 & 0x07) << 18;
				$remaining = 3;
				$total = 4;
			}
			elseif( 0xF8 == (0xFC & ($utf8)) )
			{
				$utf32 = ($utf8 & 0x03) << 24;
				$remaining = 4;
				$total = 5;
			}
			elseif (0xFC == (0xFE & ($utf8)))
			{
				$utf32 = ($utf8 & 1) << 30;
				$remaining = 5;
				$total = 6;
			}
			else
			{
				$out .= $invalid_char;
				$utf32 = 0;
				$total = 1;
			}
		}
		else
		{
			if( 0x80 == (0xC0 & ($utf8)) )
			{
				$utf32 |= ( ($utf8 & 0x0000003F) << (($remaining - 1) * 6) );
				if( 0 == --$remaining )
				{
					if( ((2 == $total) && ($utf32 < 0x0080))
						|| ((3 == $total) && ($utf32 < 0x0800))
						|| ((4 == $total) && ($utf32 < 0x10000))
						|| (4 < $total)
						|| (($utf32 & 0xFFFFF800) == 0xD800)
						|| ($utf32 > 0x10FFFF) )
					{
						$out .= $invalid_char;
					}
					elseif( 0xFEFF != $utf32 )
					{
						$out .= substr($str, $i - $total + 1, $total);
					}
					$utf32 = 0;
					$total = 1;
				}
			}
			else
			{
				$out .= $invalid_char;
				$remaining = 0;
				$utf32 = 0;
				$total = 1;
			}
		}
	}
	return $out;
}