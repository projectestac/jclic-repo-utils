'use strict';
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['jquery', './FileSaver', './buildZip', './utils'],
  ($, FileSaver, buildZip, utils) =>
    (jsonUrl, zipFileName, asScorm, logger) =>
      new Promise((resolve, reject) => {

        // Check URL
        if (!utils.isURL(jsonUrl) || !jsonUrl.endsWith('/project.json')) {
          reject(logger.log('error', `Bad URL: ${jsonUrl}`));
          return;
        }

        if (!zipFileName) {
          const parts = jsonUrl.split('/');
          zipFileName = parts[parts.length - 2] + (asScorm ? '.scorm' : '.jclic') + '.zip';
        }

        // Download 'project.json'
        logger.log('info', `Downloading ${jsonUrl}`);
        $.ajax(jsonUrl, { dataType: 'json' })
          .done(project => {

            // Process 'project.json'
            logger.log('info', `Project "${project.title}" loaded`);
            if (!project.mainFile)
              return reject(logger.log('error', `Invalid project file: ${jsonUrl}`));

            //const avoidDir = /jclic\.js\//g;
            const avoidDir = utils.buildRegExp(utils.getBasePath(project.mainFile), 'g');
            let files = project.files;
            const objects = [];
            const promises = [];
            const basePath = utils.getBasePath(jsonUrl);

            // Check if some important files must be added to the result in odre to have a valid SCORM file
            if (asScorm) {

              // Make a normalized copy of 'project'
              const prj = JSON.parse(JSON.stringify(project).replace(avoidDir, ''));
              // Remove 'project.json' from the list of files to be copied
              files = project.files.filter(f => f !== 'project.json');

              // Add the modified 'project.json' to the array of objects to be placed into the ZIP file
              delete prj.zipFile;
              delete prj.instFile;
              delete prj.clicZoneId;
              delete prj.clicZoneURL;
              delete prj.clicZoneAppletURL;
              objects.push({
                name: 'project.json',
                content: JSON.stringify(prj, null, ' ')
              });
            }

            // The real work starts here: download files and add them to a 'zip' object
            buildZip(basePath, files, objects, promises, logger, avoidDir)
              .then(
              // resolve returns an array with the same "zip" object repeated multiple times
              zip => {
                zip[0].generateAsync({ type: 'blob' }).then(
                  // On success
                  blob => {
                    logger.log('info', 'ZIP file successfully generated!');
                    FileSaver.saveAs(blob, zipFileName);
                    logger.log('info', 'ZIP file sent to user');
                    resolve(true);
                  },
                  // On error
                  err => reject(logger.log('error', `Error generating ZIP file: ${err}`))
                );
              },
              // reject - returns an error code
              err => reject(logger.log('error', `Error collecting files: ${err}`)));
          })
          .fail((jqXHR, textStatus) => reject(logger.log('error', `Error reading main project file: ${jqXHR.statusText} ${textStatus}`)));
      })
);
