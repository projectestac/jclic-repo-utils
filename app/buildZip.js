'use strict';

define(
  ['jszip', 'jszip-utils', 'jquery'],
  function (JSZip, JSZipUtils, $) {
    var buildZip = function (baseURL, project, logger) {
      // TODO: implement flexible logger and verbosity level
      var zip = new JSZip();
      var handlers = [];
      project.files.forEach(function (file) {
        handlers.push(new Promise(function (resolve, reject) {
          logger.log('Loading ' + file);
          JSZipUtils.getBinaryContent(baseURL + file, function (err, data) {
            if (err)
              reject(err);
            else {
              logger.log(file + ' has been loaded!');
              zip.file(file, data, { binary: true });
              resolve(zip);
            }
          });
        }));
      });
      // Returns a promise
      return $.when.apply($, handlers);
    }

    return buildZip;
  });
