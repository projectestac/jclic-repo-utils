'use strict';

define([], () => ({

  /**
   * Checks if the given expression is an absolute URL
   * @param {string} exp - The expression to be checked
   * @returns {boolean}
   */
  isURL: (exp) => {
    var path = /^(filesystem:)?(https?|file|data|ftps?):/i;
    return path.test(exp);
  },

  /**
   * Gets the base path of the given file path (absolute or full URL). This base path always ends
   * with `/`, meaning it can be concatenated with relative paths without adding a separator.
   * @param {type} path - The full path to be parsed
   * @returns {string}
   */
  getBasePath: (path) => {
    var result = '';
    var p = path.lastIndexOf('/');
    if (p >= 0)
      result = path.substring(0, p + 1);
    return result;
  },

  /**
   * Gets the full path of `file` relative to `basePath`
   * @param {string} file - The file name
   * @param {string=} path - The base path
   * @returns {string}
   */
  getRelativePath: (file, path) => {
    if (!path || path === '' || file.indexOf(path) !== 0)
      return file;
    else
      return file.substr(path.length);
  },

  /**
   * Gets the complete path of a relative or absolute URL, using the provided `basePath`
   * @param {string} basePath - The base URL
   * @param {string} path - The filename
   * @returns {string}
   */
  getPath: (basePath, path) => {
    return isURL(path) ? path : basePath + path;
  },

  /** 
   * Converts some characters of the given string into HTML entities, in order to make it
   * usable as a value in XML files
   * @param {string} str - The string to be prepared
   * @returns {string}
   */
  xmlStr: (str) => {
    return str
      .replace(/\&/g, '&amp;')
      .replace(/\</g, '&lt;')
      .replace(/\>/g, '&gt;')
      .replace(/\"/g, '&quot;');
  }
}));
