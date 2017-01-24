/* global requirejs */

requirejs.config({
  // baseURl is relative to the HTML file path
  baseUrl: '../app/',
  paths: {
    jquery: '../node_modules/jquery/dist/jquery'
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
