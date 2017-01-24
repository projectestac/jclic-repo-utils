'use strict';

define(
  [],
  function () {

    /**
     * Checks if the given expression is an absolute URL
     * @param {string} exp - The expression to be checked
     * @returns {boolean}
     */
    function isURL(exp) {
      var path = /^(filesystem:)?(https?|file|data|ftps?):/i;
      return path.test(exp);
    };
    /**
     * Gets the base path of the given file path (absolute or full URL). This base path always ends
     * with `/`, meaning it can be concatenated with relative paths without adding a separator.
     * @param {type} path - The full path to be parsed
     * @returns {string}
     */
    function getBasePath(path) {
      var result = '';
      var p = path.lastIndexOf('/');
      if (p >= 0)
        result = path.substring(0, p + 1);
      return result;
    };
    /**
     * Gets the full path of `file` relative to `basePath`
     * @param {string} file - The file name
     * @param {string=} path - The base path
     * @returns {string}
     */
    function getRelativePath(file, path) {
      if (!path || path === '' || file.indexOf(path) !== 0)
        return file;
      else
        return file.substr(path.length);
    };
    /**
     * Gets the complete path of a relative or absolute URL, using the provided `basePath`
     * @param {string} basePath - The base URL
     * @param {string} path - The filename
     * @returns {string}
     */
    function getPath(basePath, path) {
      return isURL(path) ? path : basePath + path;
    };

    return {
      isURL: isURL,
      getBasePath: getBasePath,
      getRelativePath: getRelativePath,
      getPath: getPath
    }
  });
