<?php

header('Location: http://settlers2.net/editor/');
exit;


require_once('../settlers2.php');

page_doctype();
?>The Settlers II World Map Database<?php
page_title();
?>The Settlers II <small>World Map Database</small><?php
page_header();
?>From here you can find a huge collection of SWD &amp; WLD maps. The latest version 1.51 is a requirement. If you only have Mission CD or original Veni Vidi Vici CD you can find <a href="/downloads-and-languages/">update patch from the download page</a>. GOG.com version &amp; Gold Edition are always version 1.51.<br /><small lang="de" style="opacity:.01">Die Siedler 2 Weltkarte Datenbank</small><?php
page_description();
?>
				<div class="box">
					<h1>Welcome to World Map Database!</h1>
					<p><b style="color:red">WARNING!</b><br />This service is under development. Things may be broken or not work at all.</p>
				</div>
<?php
if( is_user_logged_in() )
{
?>
<div class="box">
	<h2>Upload maps</h2>
	<p>Below you can see a list of uploaded maps by you. These files have not yet been added to the database. See link below the upload list to give further details about the maps.</p>
	<p>You can drag and drop map files from your folders (Firefox, Chrome, Safari &amp; Opera) or just click Add files to add one file to the upload queue at a time (Internet Explorer) or multiple files (other browsers).</p>
<div id="fileupload">
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
	<div class="fileupload-content">
		<table class="files"></table>
		<div class="fileupload-progressbar"></div>
	</div>
</div>
	<h2>New maps to the Database</h2>
	<p>We want to give as much credit to the original sources as possible. For this reason we wish you to give information about the original site the map was taken from, if possible.</p>
	<p><a href="">Enter map details</a></p>
</div>
<?php
}
else
{
?>
				<div class="box">
					<h2>Upload maps</h2>
					<p>You must have a Settlers II.net account to upload maps, please <?php wp_register('', ''); ?> or login:</p>
					<?php wp_login_form(); ?>
				</div>
<?php
}
page_footer();