/* global define:true */

(function () {
  // Mock `define` when called from a JavaScript environment without native AMD support (like Node.js)
  if (typeof define === 'undefined') {
    define = (deps, callback) => {
      const argsArray = [];
      for (let p = 0; p < deps.length; p++)
        argsArray.push(require(deps[p]));
      return callback.apply(null, argsArray);
    };
  }

  const JClicRepoUtils = {};

  define(['./downloadJClicProject', './buildZip', './pathUtils', './assets'],
    function (downloadJClicProject, buildZip, pathUtils, assets) {
      JClicRepoUtils.downloadJClicProject = downloadJClicProject;
      JClicRepoUtils.buildZip = buildZip;
      JClicRepoUtils.pathUtils = pathUtils;
      JClicRepoUtils.assets = assets;
      return JClicRepoUtils;
    });

  // Export JClicRepoUtils as a result
  if (typeof module !== "undefined" && typeof module.exports !== 'undefined') {
    exports = module.exports = JClicRepoUtils;
  }
})();
