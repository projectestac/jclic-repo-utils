/* global requirejs */

requirejs.config({
  // baseURl is relative to the HTML file path
  baseUrl: '../app/',
  paths: {
    jquery: '../node_modules/jquery/dist/jquery',
    jszip: '../node_modules/jszip/dist/jszip',
    'jszip-utils': '../node_modules/jszip-utils/dist/jszip-utils',
    'file-saver': '../node_modules/file-saver/FileSaver'
  }
});

//require(['index']);

define(['jquery', 'index'],
  function ($, JClicRepoUtils) {

    var base = "https://clic.xtec.cat/projects/guixanet/project.json";
    var filename = "guixanet.jclic.zip";

    $(function () {
      var $downloadButton = $('#download');
      var $msg = $('#msg');

      $downloadButton.on('click', function () {
        var url = $('#projectPath').val();
        var name = 'test.scorm.zip';
        $downloadButton.prop('disabled', true);
        $msg.empty();
        JClicRepoUtils.downloadJSON(url, name, console).then(
          // Success
          function () {
            $msg.html('Project downloaded!');
            $downloadButton.prop('disabled', false);
          },
          // Error
          function (err) {
            $msg.html('ERROR: ' + err);
            $downloadButton.prop('disabled', false);
          });
      });
    });
  });
