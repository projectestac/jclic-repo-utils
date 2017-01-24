'use strict';

(function () {
  // Mock `define` when called from a JavaScript environment without native AMD support (like Node.js)
  if (typeof define === 'undefined') {
    define = function (deps, callback) {
      var argsArray = [];
      for (var p = 0; p < deps.length; p++)
        argsArray.push(require(deps[p]));
      return callback.apply(null, argsArray);
    };
  }

  var JClicRepoUtils = {};

  define(['./downloadJSON', './buildZip', './pathUtils'],
    function (downloadJSON, buildZip, pathUtils) {
      JClicRepoUtils = {
        downloadJSON: downloadJSON,
        buildZip: buildZip,
        pathUtils: pathUtils
      }
      return JClicRepoUtils;
    });

  // Export JClicRepoUtils as a result
  if (typeof module !== "undefined" && typeof module.exports !== 'undefined') {
    module.exports = JClicRepoUtils;
  }
})();
