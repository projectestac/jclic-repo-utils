'use strict';
if (typeof define !== 'function') { var define = require('amdefine')(module) }

(function () {

  const JClicRepoUtils = {};

  define(['./downloadJClicProject', './buildZip', './utils', './assets'],
    function (downloadJClicProject, buildZip, utils, assets) {
      JClicRepoUtils.downloadJClicProject = downloadJClicProject;
      JClicRepoUtils.buildZip = buildZip;
      JClicRepoUtils.utils = utils;
      JClicRepoUtils.assets = assets;
      return JClicRepoUtils;
    });

  // Export JClicRepoUtils as a result
  if (typeof module !== "undefined" && typeof module.exports !== 'undefined') {
    exports = module.exports = JClicRepoUtils;
  }
})();
