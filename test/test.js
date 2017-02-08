/* global requirejs */

requirejs.config({
  // baseURl is relative to the HTML file path
  baseUrl: '../app/',
  paths: {
    jquery: '../node_modules/jquery/dist/jquery',
    //'file-saver': '../node_modules/file-saver/FileSaver',
    jszip: '../node_modules/jszip/dist/jszip',
    'jszip-utils': '../node_modules/jszip-utils/dist/jszip-utils'
  }
});

//require(['index']);

define(['jquery', 'index'],
  function ($, JClicRepoUtils) {

    var base = "https://clic.xtec.cat/projects/guixanet/project.json";
    var filename = "guixanet.jclic.zip";

    var logger = {
      log: function(msg){
        $('#msg').append($('<ul/>').html(msg));
        console.log(msg);
      },
      clear: function(){
        $('#msg').empty();
      }
    };

    $(function () {
      var $downloadButton = $('#download');

      $downloadButton.on('click', function () {
        var url = $('#projectPath').val();
        var name = 'test.scorm.zip';
        $downloadButton.prop('disabled', true);
        logger.clear();
        var downloader = JClicRepoUtils.downloadJSON(url, name, logger);
        downloader.then(
          // Success
          function () {
            logger.log('Project downloaded!');
            $downloadButton.prop('disabled', false);
          },
          // Error
          function (err) {
            logger.log('ERROR: ' + err);
            $downloadButton.prop('disabled', false);
          });
      });
    });
  });
