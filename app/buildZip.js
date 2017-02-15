'use strict';
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(
  ['jszip', 'jszip-utils', 'jquery'],
  (JSZip, JSZipUtils, $) => {
    return (baseURL, files, objects, promises, logger, avoidDir) => {
      const zip = new JSZip();
      avoidDir = avoidDir || '';
      const handlers = [];

      if (promises)
        promises.forEach(promise => {
          handlers.push(new Promise((resolve, reject) => {
            promise.then(
              obj => { // success
                logger.log('info', `Adding ${obj.name} to zip file`);
                zip.file(obj.name.replace(avoidDir, ''), obj.content, obj.options || {});
                resolve(zip);
              },
              err => reject(err)
            );
          }));
        });

      if (files)
        files.forEach(file => {
          handlers.push(new Promise((resolve, reject) => {
            logger.log('info', `Loading ${file}`);
            JSZipUtils.getBinaryContent(baseURL + file, (err, data) => {
              if (err)
                reject(err);
              else {
                logger.log('info', `File "${file}" has been loaded`);
                zip.file(file.replace(avoidDir, ''), data, { binary: true });
                resolve(zip);
              }
            });
          }));
        });

      if (objects)
        objects.forEach(obj => handlers.push(new Promise((resolve /*, reject*/) => {
          logger.log('info', `Adding ${obj.name} to zip file`);
          zip.file(obj.name.replace(avoidDir, ''), obj.content, obj.options || {});
          resolve(zip);
        })));

      // Returns a promise
      return $.when.apply($, handlers);
    };
  });
