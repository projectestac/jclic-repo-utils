'use strict';

define(['jquery', './FileSaver', './buildZip', './pathUtils', './assets'],
  ($, FileSaver, buildZip, pathUtils, assets) =>
    (jsonUrl, zipFileName, asScorm, logger) =>
      new Promise((resolve, reject) => {

        // Check URL
        if (!pathUtils.isURL(jsonUrl) || !jsonUrl.endsWith('/project.json')) {
          reject(logger.log('error', `Bad URL: ${jsonUrl}`));
          return;
        }

        if (!zipFileName) {
          const parts = jsonUrl.split('/');
          zipFileName = parts[parts.length - 2] + (asScorm ? '.scorm' : '') + '.zip';
        }

        // Download 'project.json'
        logger.log('info', `Downloading ${jsonUrl}`);
        $.ajax(jsonUrl, { dataType: 'json' })
          .done(function (project) {

            // Process 'project.json'
            logger.log('info', `Project "${project.title}" loaded`);

            const avoidDir = /jclic\.js\//g;
            let files = project.files;
            const objects = [];

            // Check if some important files must be added to the result in odre to have a valid SCORM file
            if (asScorm) {

              // Make a normalized copy of 'project'
              const prj = JSON.parse(JSON.stringify(project).replace(avoidDir, ''));
              // Remove 'project.json' from the list of files to be copied
              files = project.files.filter(f => f !== 'project.json');

              // Add index.html and icons if needed
              if (!prj.files.includes('index.html')) {
                objects.push({
                  name: 'index.html',
                  content: assets.indexTemplate
                    .replace(/%%TITLE%%/g, pathUtils.xmlStr(prj.title))
                    .replace(/%%MAINFILE%%/g, prj.mainFile)
                });
                prj.files.push('index.html');

                if (!prj.files.includes('favicon.ico')) {
                  objects.push({
                    name: 'favicon.ico',
                    content: Uint8Array.from(atob(assets.favicon), c => c.charCodeAt(0)),
                    options: { binary: true }
                  });
                  prj.files.push('favicon.ico');
                }

                if (!prj.files.includes('icon-72.png')) {
                  objects.push({
                    name: 'icon-72.png',
                    content: Uint8Array.from(atob(assets.icon72), c => c.charCodeAt(0)),
                    options: { binary: true }
                  });
                  prj.files.push('icon-72.png');
                }

                if (!prj.files.includes('icon-192.png')) {
                  objects.push({
                    name: 'icon-192.png',
                    content: Uint8Array.from(atob(assets.icon192), c => c.charCodeAt(0)),
                    options: { binary: true }
                  });
                  prj.files.push('icon-192.png');
                }
              }

              // Add imsmanifest.xml if needed
              if (!prj.files.includes('imsmanifest.xml')) {
                prj.files.push('imsmanifest.xml');
                objects.push({
                  name: 'imsmanifest.xml',
                  content: assets.imsmanifestTemplate
                    .replace(/%%ID%%/g, Math.round(0x10000 + Math.random() * 0x10000).toString(16).toUpperCase().substring(1))
                    .replace(/%%TITLE%%/g, pathUtils.xmlStr(prj.title))
                    .replace(/%%FILES%%/g, prj.files.map(v => `<file href="${pathUtils.xmlStr(v)}"/>`).join('\n'))
                });
              }

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
            buildZip(pathUtils.getBasePath(jsonUrl), files, objects, logger, avoidDir)
              .done(zip => {
                zip.generateAsync({ type: 'blob' }).then(
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
              })
              .fail(err => reject(logger.log('error', `Error collecting files: ${err}`)));
          })
          .fail((jqXHR, textStatus) => reject(logger.log('error', `Error reading main project file: ${jqXHR.statusText} ${textStatus}`)));
      })
);
