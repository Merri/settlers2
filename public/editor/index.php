<?php

define('WP_USE_THEMES', false);
require_once('../wp-load.php');
define('S2_EDITOR', true);

require_once('./world.php');

function get_world_file($file_name)
{
	$file_path = './world/' . $file_name;
	$world = new S2world();
	$p = strpos($file_name, '_');
	if( is_file($file_path) && $p !== false && $world->load($file_path, true) === true )
	{
		$file = new stdClass();
		$file->name = substr($file_name, $p + 1);
		$file->uploader_id = substr($file_name, 0, $p);
		$file->fullname = $file_path;
		$file->size = filesize($file_path);
		$file->title = $world->get_title();
		$file->author = $world->get_author();
		$file->players = $world->count_players();
		$file->terrain = $world->get_type();
		return $file;
	}
	return null;
}

$worlds = array_values(array_filter(array_map(
	'get_world_file',
	scandir('./world/')
)));

function world_name_cmp($a, $b)
{
	return strcasecmp($a->title, $b->title);
}

usort($worlds, 'world_name_cmp');


?><!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Online Editor by The Settlers II.net</title>
		<link href="/editor/ui/css/south-street/jquery-ui-1.8.22.custom.css" rel="stylesheet" id="theme">
		<link href="/editor/upload/jquery.fileupload-ui.css" rel="stylesheet">
		<style type="text/css">
html, body {
	margin: 0;
	padding: 0;
}
body {
	background: url("/design/rockwall.png") repeat 0 0 #3F4F2F;
	font-size: .725em;
}
fieldset {
	background: rgba(0, 96, 0, .1);
	border: 0;
	border-radius: 1em;
	margin: 10px 0;
	padding: 5px;
}
legend { display: none; }
fieldset h2,fieldset h3 {
	margin: 5px 0;
	padding: 2px 0;
}
fieldset > p {
	background: rgba(255, 255, 255, .3);
	margin: 1px 0;
	padding: 5px;
}
fieldset > p:first-child {
	border-top-left-radius: .6em;
	border-top-right-radius: .6em;
}
fieldset > p:last-child {
	border-bottom-left-radius: .6em;
	border-bottom-right-radius: .6em;
}
fieldset > p > label:first-child {
	display: inline-block;
	overflow: hidden;
	white-space: nowrap;
	width: 10em;
}
fieldset > p > button:first-child + * {
	display: block;
}
#header {
	background: url("http://settlers2.net/wp-content/uploads/2011/09/header_s2.jpg") 0 22%;
	margin: 0;
	padding: 2px;
}
#header img {
	display: inline-block;
	height: 94px;
	margin: 10px;
}

#tabs {
	margin: 0 10px 10px 10px;
}
#fileupload table {
	white-space: nowrap;
	width: 100%;
}
#fileupload .title {
	text-align: left;
	width: 60%;
}
#fileupload th {
	background: #060;
	color: #FFF;
	padding: 5px;
}
#fileupload td,#fileupload th {
	text-align: center;
}

/* pixel zoom */
#editor canvas {
	background-size: 18px;
	-ms-interpolation-mode: nearest-neighbor;
	image-rendering: optimizeSpeed;
	image-rendering: -moz-crisp-edges;
	image-rendering: -webkit-optimize-contrast;
	image-rendering: optimize-contrast;
}

#editor .water0 {
	background-image: url('water0.png');
}

#editor .water1 {
	background-image: url('water1.png');
}

#editor .water2 {
	background-image: url('water2.png');
}

#editor #gouraud {
	height: 256px;
	overflow: hidden;
	position: absolute;
	width: 256px;
}

#editor_tabs {
	margin-left: 270px;
}
		</style>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.22/jquery-ui.min.js"></script>
		<!--script src="//ajax.microsoft.com/ajax/jquery.templates/beta1/jquery.tmpl.min.js"></script-->
		<script src="//ajax.aspnetcdn.com/ajax/jquery.templates/beta1/jquery.tmpl.min.js"></script>
		<script id="template-upload" type="text/x-jquery-tmpl">
<tr class="template-upload{{if error}} ui-state-error{{/if}}">
	<td class="preview"></td>
	{{if error}}
		<td class="name"><kbd>${name}</kbd>, ${sizef}</td>
		<td class="error" colspan="4">Error:
			{{if error === 'maxFileSize'}}File is too big
			{{else error === 'minFileSize'}}File is too small
			{{else error === 'acceptFileTypes'}}Filetype not allowed
			{{else error === 'maxNumberOfFiles'}}Max number of files exceeded
			{{else}}${error}
			{{/if}}
		</td>
	{{else}}
		<td class="name progress" colspan="2"><kbd>${name}</kbd>, ${sizef}<br /><div></div></td>
		<td class="start"><button>Start</button></td>
	{{/if}}
	<td class="cancel"><button>Cancel</button></td>
</tr>
		</script>
		<script id="template-download" type="text/x-jquery-tmpl">
<tr class="template-download{{if error}} ui-state-error{{/if}}">
	{{if error}}
		<!--td></td-->
		<td class="title"><kbd>${name}</kbd>, ${sizef}</td>
		<td class="error" colspan="5">Error:
			{{if error === 1}}File exceeds upload_max_filesize (php.ini directive)
			{{else error === 2}}File exceeds MAX_FILE_SIZE (HTML form directive)
			{{else error === 3}}File was only partially uploaded
			{{else error === 4}}No File was uploaded
			{{else error === 5}}Missing a temporary folder
			{{else error === 6}}Failed to write file to disk
			{{else error === 7}}File upload stopped by extension
			{{else error === 'maxFileSize'}}File is too big
			{{else error === 'minFileSize'}}File is too small
			{{else error === 'acceptFileTypes'}}Filetype not allowed
			{{else error === 'maxNumberOfFiles'}}Max number of files exceeded
			{{else error === 'uploadedBytes'}}Uploaded bytes exceed file size
			{{else error === 'emptyResult'}}Empty file upload result
			{{else}}${error}
			{{/if}}
		</td>
	{{else}}
		<!--td class="preview">
			{{if thumbnail_url}}
				<a href="${url}" target="_blank"><img src="${thumbnail_url}"></a>
			{{/if}}
		</td-->
		<td class="title"><button onclick="document.PNG.src='${url}'" style="font-size:1.4em">${title}</button><br><kbd>${name}, ${sizef}</kbd></td>
		<td class="author">${author}</td>
		<td class="type">${terrain}</td>
		<td class="players">${players}</td>
		<td class="format">${version}</td>
	{{/if}}
	<td class="delete">
		<button data-type="${delete_type}" data-url="${delete_url}">Delete</button>
	</td>
</tr>
		</script>
		<script src="/editor/upload/jquery.iframe-transport.js"></script>
		<script src="/editor/upload/jquery.fileupload.js"></script>
		<script src="/editor/upload/jquery.fileupload-ui.js"></script>
		<script src="/editor/world.js?date=<?php echo date('Ymd_His', filemtime('world.js')); ?>"></script>
		<script src="/editor/application.js?date=<?php echo date('Ymd_His', filemtime('application.js')); ?>"></script>
		<script type="text/javascript">//<![CDATA[
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-24741042-1']);
				_gaq.push(['_trackPageview']);
(function () {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();
		//]]></script>
	</head>
	<body>
		<h1 id="header"><a href="/"><img alt="The Settlers II.net" src="http://settlers2.net/wp-content/uploads/2011/09/The-Settlers-II-net-810x320-300x118.png"></a></h1>
		<div id="editor" title="Editor">
			<div id="gouraud"><canvas width="256" height="256" class="water0"></canvas></div>
			<div id="editor_tabs">
				<ul>
					<li><a href="#editor_info">Information</a></li>
					<li><a href="#editor_players">Players</a></li>
					<li><a href="#editor_animals">Animals</a></li>
					<li><a href="#editor_tools">Tools</a></li>
					<li><a href="#editor_debug">Debug</a></li>
				</ul>
				<div id="editor_info">
					<form>
						<fieldset><legend></legend>
							<p>
								<label for="title">Title:</label>
								<input id="title" maxlength="23" type="text" value="">
							</p>
							<p>
								<label for="author">Author:</label>
								<input id="author" maxlength="19" type="text" value="">
							</p>
							<p>
								<label for="terrain">World type:</label>
								<small id="terrain">
									<input id="terrain0" name="terrain" type="radio" value="0" checked="checked" onchange="document.map.type=this.value;DrawGouraud(MerrisGouraud, document.gouraud)"><label for="terrain0">Greenland</label>
									<input id="terrain1" name="terrain" type="radio" value="1" onchange="document.map.type=this.value;DrawGouraud(MerrisGouraud, document.gouraud)"><label for="terrain1">Wasteland</label>
									<input id="terrain2" name="terrain" type="radio" value="2" onchange="document.map.type=this.value;DrawGouraud(MerrisGouraud, document.gouraud)"><label for="terrain2">Winter World</label>
								</small>
							</p>
						</fieldset>
					</form>
					<h3>Notes</h3>
					<ul>
						<li>Changing world type here makes a direct texture mode change. This may give odd results such as "floating ice on water" tile appearing on top of mountains that used to have snow there.</li>
					</ul>
				</div>
				<div id="editor_players">
					<ul>
						<li>Players: <span id="players">0</span></li>
						<li>Player 1: <span id="hq0x">-</span> x <span id="hq0y">-</span> <select id="leader0"><option value="0">Octavianus</option><option value="1">Julius</option><option value="2">Brutus</option><option value="3">Erik</option><option value="4">Knut</option><option value="5">Olof</option><option value="6">Yamauchi</option><option value="7">Tsunami</option><option value="8">Hakirawashi</option><option value="9">Shaka</option><option value="10">Todo</option><option value="11">Mnga Tscha</option></select></li>
						<li>Player 2: <span id="hq1x">-</span> x <span id="hq1y">-</span> <select id="leader1"><option value="0">Octavianus</option><option value="1">Julius</option><option value="2">Brutus</option><option value="3">Erik</option><option value="4">Knut</option><option value="5">Olof</option><option value="6">Yamauchi</option><option value="7">Tsunami</option><option value="8">Hakirawashi</option><option value="9">Shaka</option><option value="10">Todo</option><option value="11">Mnga Tscha</option></select></li>
						<li>Player 3: <span id="hq2x">-</span> x <span id="hq2y">-</span> <select id="leader2"><option value="0">Octavianus</option><option value="1">Julius</option><option value="2">Brutus</option><option value="3">Erik</option><option value="4">Knut</option><option value="5">Olof</option><option value="6">Yamauchi</option><option value="7">Tsunami</option><option value="8">Hakirawashi</option><option value="9">Shaka</option><option value="10">Todo</option><option value="11">Mnga Tscha</option></select></li>
						<li>Player 4: <span id="hq3x">-</span> x <span id="hq3y">-</span> <select id="leader3"><option value="0">Octavianus</option><option value="1">Julius</option><option value="2">Brutus</option><option value="3">Erik</option><option value="4">Knut</option><option value="5">Olof</option><option value="6">Yamauchi</option><option value="7">Tsunami</option><option value="8">Hakirawashi</option><option value="9">Shaka</option><option value="10">Todo</option><option value="11">Mnga Tscha</option></select></li>
						<li>Player 5: <span id="hq4x">-</span> x <span id="hq4y">-</span> <select id="leader4"><option value="0">Octavianus</option><option value="1">Julius</option><option value="2">Brutus</option><option value="3">Erik</option><option value="4">Knut</option><option value="5">Olof</option><option value="6">Yamauchi</option><option value="7">Tsunami</option><option value="8">Hakirawashi</option><option value="9">Shaka</option><option value="10">Todo</option><option value="11">Mnga Tscha</option></select></li>
						<li>Player 6: <span id="hq5x">-</span> x <span id="hq5y">-</span> <select id="leader5"><option value="0">Octavianus</option><option value="1">Julius</option><option value="2">Brutus</option><option value="3">Erik</option><option value="4">Knut</option><option value="5">Olof</option><option value="6">Yamauchi</option><option value="7">Tsunami</option><option value="8">Hakirawashi</option><option value="9">Shaka</option><option value="10">Todo</option><option value="11">Mnga Tscha</option></select></li>
						<li>Player 7: <span id="hq6x">-</span> x <span id="hq6y">-</span> <select id="leader6"><option value="0">Octavianus</option><option value="1">Julius</option><option value="2">Brutus</option><option value="3">Erik</option><option value="4">Knut</option><option value="5">Olof</option><option value="6">Yamauchi</option><option value="7">Tsunami</option><option value="8">Hakirawashi</option><option value="9">Shaka</option><option value="10">Todo</option><option value="11">Mnga Tscha</option></select></li>
					</ul>
				</div>
				<div id="editor_animals">
					<ul>
						<li>Animals: <span id="animals">0</span></li>
					</ul>
					<h3>Note</h3>
					<p>Oh, there is really nothing here...</p>
				</div>
				<div id="editor_tools">
					<fieldset><legend></legend>
						<h2>Height randomization</h2>
						<p>
							<button onclick="Height_Variety(1, 0, 2);DrawGouraud(MerrisGouraud, document.gouraud)">Gentle</button>
							<small>Minor changes to the heights, safe for castles.</small>
						</p>
						<p>
							<button onclick="Height_Variety(2, 0, 3);DrawGouraud(MerrisGouraud, document.gouraud)">Medium</button>
							<small>Stronger changes to the heights, you may lose castle sites.</small>
						</p>
						<p>
							<button onclick="Height_Variety(3, 1, 4);DrawGouraud(MerrisGouraud, document.gouraud)">Strong</button>
							<small>Quite strong changes to the heights, it is likely to lose castle sites.</small>
						</p>
						<p>
							<button onclick="Height_Variety(5, 2, 5);DrawGouraud(MerrisGouraud, document.gouraud)">Dangerous</button>
							<small>It is unlikely any castle site can handle this processing!</small>
						</p>
					</fieldset>
					<fieldset><legend></legend>
						<h2>Information</h2>
						<p>
							<button onclick=""></button>
							<small></small>
						</p>
					</fieldset>
				</div>
				<div id="editor_debug">
					<p>You can see raw map data here.</p>
					<p><select onchange="DrawDebug($(this).val())" onclick="this.onchange()">
						<option value="0">Block 0: Height map</option>
						<option value="1">Block 1: Texture ▲</option>
						<option value="2">Block 2: Texture ▼</option>
						<!--option value="3">Block 3: Roads</option-->
						<option value="4">Block 4: Object Index</option>
						<option value="5">Block 5: Object Type</option>
						<!--option value="6">Block 6: Animals</option>
						<option value="7">Block 7: Unknown</option-->
						<option value="8">Block 8: Building sites</option>
						<!--option value="9">Block 9: Unknown</option>
						<option value="10">Block 10: Unknown</option-->
						<option value="11">Block 11: Resources</option>
						<option value="12">Block 12: Gouraud shading</option>
						<option value="13">Block 13: Areas</option>
					</select></p>
					<p><canvas id="debug" width="256" height="256"></canvas></p>
				</div>
			</div>
			<p>
				<button onclick="DrawGouraud(MerrisGouraud, 0)">Original palette</button>
				<button onclick="DrawGouraud(MerrisGouraud, 1)">High contrast palette</button>
			</p>
		</div>
		<div id="tabs">
			<ul>
				<li><a href="#mapdb">Map Database</a></li>
				<li><a href="#fileupload">Upload</a></li>
				<li><a href="#roadmap">Roadmap</a></li>
				<li><a href="#about">About</a></li>
			</ul>
			<div id="mapdb">
				<p>Unfortunatenaly the Map Database has not yet been implemented. As a temporary solution here you can see snapshot of any uploaded files.</p>
				<table>
					<thead>
						<tr>
							<th>Download</th>
							<th>Title</th>
							<th>Author</th>
							<th>Players</th>
							<th>Terrain</th>
						</tr>
					</thead>
<?php for($i = 0, $maxi = count($worlds); $i < $maxi; $i++ ) { ?>
					<tr>
						<td><a href="<?php echo htmlspecialchars($worlds[$i]->fullname); ?>"><?php echo htmlspecialchars($worlds[$i]->name); ?></a></td>
						<td><b><?php echo htmlspecialchars($worlds[$i]->title); ?></b></td>
						<td><?php echo htmlspecialchars($worlds[$i]->author); ?></td>
						<td><?php echo htmlspecialchars($worlds[$i]->players); ?></td>
						<td><?php echo htmlspecialchars($worlds[$i]->terrain); ?></td>
					</tr>
<?php } ?>
				</table>
			</div>
			<div id="fileupload">
				<p>You may upload maps here. Any upload is shown in the Map DB.</p>
<?php if( is_user_logged_in() ) { ?>
				<div class="fileupload-content">
					<table class="files">
						<thead>
							<tr>
								<th class="title">Title</th>
								<th class="author">Author</th>
								<th class="type">Terrain</th>
								<th class="players">Players</th>
								<th class="format">Format</th>
								<th class="delete">Delete</th>
							</tr>
						</thead>
					</table>
					<div class="fileupload-progressbar"></div>
				</div>
				<form action="upload.php" method="POST" enctype="multipart/form-data">
					<div class="fileupload-buttonbar">
						<label class="fileinput-button">
							<span>Add files...</span>
							<input type="file" name="files[]" multiple="multiple" />
						</label>
						<!--button type="submit" class="start">Start upload</button-->
						<button type="reset" class="cancel">Cancel upload</button>
						<button type="button" class="delete">Delete files</button>
					</div>
				</form>
				<h3>File format information</h3>
				<ul>
					<li>Campaign Map (.WLD) features are detected from file contents, not by extension.</li>
					<li>Map Editor (.SWD) is any map made for Unlimited Play mode.</li>
					<li>Veni Vidi Vici (WORLD###.DAT) is any map available in early version of S2.</li>
					<li><a href="http://www.rttr.info/">Return to the Roots</a> maps are most likely to only work in RttR.</li>
				</ul>
<?php } else { ?>
				<h3>Login required</h3>
				<p>As there is a danger of abuse of this service we ask you to <?php wp_register('', ''); ?> or login:</p>
				<?php wp_login_form(); ?>
<?php } ?>
			</div>
			<div id="roadmap">
				<h2>Online Editor Roadmap</h2>
				<p>This service was released on August 12th 2012. We are still on the early phase of development so there is a lot of features to add. At the moment highest priority is on the basics to make it easier to develop new features (currently there isn't enough "supporting" code to make it fast enough to add new features).</p>
				<h3>Done</h3>
				<ul>
					<li>Upload multiple maps at the same time</li>
					<li>Open maps for viewing</li>
					<li>Edit some map information (title, author, world type)</li>
					<li>Download edited map</li>
				</ul>
				<h3>Highest priority</h3>
				<ul>
					<li>Cleanup PHP code, integrate multiple files into one</li>
					<li>Organize and recode JavaScript for cleaner and faster code</li>
					<li>Allow adding maps to the Map Database</li>
				</ul>
				<h3>Medium priority</h3>
				<ul>
					<li>Add more editing features</li>
					<li>Improve user interface</li>
					<li>Improve map validation</li>
				</ul>
				<h3>Low priority</h3>
				<ul>
					<li>Visual editor like the original Map Editor</li>
					<li>Allow conversion from/to <a href="http://wl.widelands.org/">Widelands</a> maps?</li>
					<li>Support for Internet Explorer?</li>
				</ul>
			</div>
			<div id="about">
				<h2>What is Online Editor?</h2>
				<p>This service is for the players of <a href="http://www.gog.com/en/gamecard/the_settlers_2_gold_edition">The Settlers II: Gold Edition</a> (and Mission CD, and Veni Vidi Vici) or <a href="http://www.rttr.info/">Return to the Roots</a>. We allow people to upload, edit and download <b>world maps</b> that are in the WLD and SWD format.</p>
				<h3>Upload screen</h3>
				<p style="position:relative"><img alt="" src="http://settlers2.net/wp-content/uploads/2012/08/editor_upload.png" style="max-width:100%"></p>
				<h3>Editor &amp; download</h3>
				<p style="position:relative"><img alt="" src="http://settlers2.net/wp-content/uploads/2012/08/editor_download.png" style="max-width:100%"></p>
			</div>
		</div>
	</body>
</html>