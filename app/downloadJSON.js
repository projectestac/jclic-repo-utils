'use strict';

var $ = require('jquery'),
  FileSaver = require('file-saver'),
  buildZip = require('./buildZip'),
  pathUtils = require('/pathUtils');


function downloadJSON(url, name, logger) {
  return new Promise(function (resolve, reject) {

    // TODO: revise conditions
    if (!isURL(url) || !url.endsWith('/project.json')) {
      reject('Bad URL: ' + url);
      return;
    }

    // TODO: implement flexible logger and verbosity level 
    logger.log('Download of "' + url + '" started');

    $.ajax({
      dataType: "json",
      url: url,
      done: function (project) {
        logger.log('Project file loaded!');
        buildZip(pathUtils.getBasePath(url), project, logger).done(function (zip) {
          zip.generateAsync({ type: 'blob' }).then(
            // On success
            function (blob) {
              logger.log('ZIP file successfully generated!');
              // TODO: Move FileSaver out of this module
              FileSaver.saveAs(blob, name);
              logger.log('ZIP file sent to user');
              resolve(true);
            },
            // On error
            function (err) {
              logger.log('Error generating ZIP file');
              logger.log(err);
              reject(err);
            });

        }).fail(function (err) {
          logger.log('Error');
          logger.log(err);
          reject(err);
        });

      },
      fail: function (jqXHR, exception) {
        logger.log('Error reading project.json');
        logger.log(jqXHR);
        reject(err);
      }
    });
  });
}

module.exports = downloadJSON;
