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

define(['jquery', 'index'], ($, JClicRepoUtils) => {
  const logger = {
    LOG_LEVELS: ['none', 'error', 'warn', 'info', 'debug', 'trace', 'all'],
    LOG_LEVEL: 3, // info
    log: (level, msg) => {
      if (logger.LOG_LEVELS.indexOf(level) <= logger.LOG_LEVEL) {
        $('#msg').append($('<ul/>').html(msg));
        console.log(level + ': ' + msg);
      }
      return msg;
    },
    clear: () => $('#msg').empty()
  };

  $(() => {
    const $downloadButton = $('#download');
    $downloadButton.on('click', function () {
      const url = $('#projectPath').val();
      $downloadButton.prop('disabled', true);
      logger.clear();
      JClicRepoUtils.downloadJClicProject(url, '', true, logger).then(
        () => { // Success
          logger.log('info', 'Project downloaded!');
          $downloadButton.prop('disabled', false);
        },
        (err) => { // Error
          logger.log('error', err);
          $downloadButton.prop('disabled', false);
        });
    });
  });
});
