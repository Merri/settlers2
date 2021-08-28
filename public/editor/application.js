$(function () {
	'use strict';
	// Initialize the jQuery File Upload widget:
	$('#fileupload').fileupload({
		acceptFileTypes: /(\.|\/)(swd|wld|dat|gz)$/i
	});
	// Load existing files:
	$.getJSON($('#fileupload form').prop('action'), function (files) {
		var fu = $('#fileupload').data('fileupload');
		fu._adjustMaxNumberOfFiles(-files.length);
		fu._renderDownload(files)
			.appendTo($('#fileupload .files'))
			.fadeIn(function () {
				// Fix for IE7 and lower:
				$(this).show();
			});
	});
	// Open download dialogs via iframes,
	// to prevent aborting current uploads:
	$('#fileupload .files a:not([target^=_blank])').live('click', function (e) {
		e.preventDefault();
		$('<iframe style="display:none;"></iframe>')
			.prop('src', this.href)
			.appendTo('body');
	});
	$( "#editor" ).dialog({
		autoOpen: false,
		height: 500,
		width: 750,
		modal: true,
		buttons: {
			'Download': function() {
				save_the_world(document.map);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
		
		},
		open: function() {
			$('#terrain').buttonset();
			DrawDebug(0);
		}
	});
	$('#tabs,#editor_tabs').tabs();
	$('fieldset button').button();
	document.gouraud = 0;
	document.PNG = new Image();
	document.PNG.onload = MapLoaded;
});