#!/usr/bin/env node

/**
 * detectAnimatedGifs.js
 * Search for animated GIF files used in JClic projects
 * 
 * Useful for updating old JClic projects, created before the inclusion of
 * an "animated" atribute in "media" tags.
 *
 * Useful commands:
 * Add `animated="false"` to all "media" of type GIF in a jclic file:
 * `sed '/<media name=".*\.gif" \/>/s/" \/>/" animated="false" \/>/g'  path/to/jclic/file.jclic
 * 
 * Modify only the projects listed in a text file where each line has format `relative/path/to/project/file.jclic`:
 * `cat projects-with-gif.txt | while read j; do sed -i.bak '/<media name=".*\.gif" \/>/s/" \/>/" animated="false" \/>/g' /projects/root/path/$j; done`
 *   
 */

'use strict';

var fs = require('fs')
var path = require('path')
var animated = require('animated-gif-detector')

const usage = [
  'Usage:',
  '  detectAnimatedGifs.js path_to_project_folder...',
  '',
  'Searches for animated GIF files located in the specified folder(s).',
  'Results are printed out to the console.'
].join('\n');

// Logs the file name only when it's an animated GIF
const checkGif = file => {
  if (animated(fs.readFileSync(file)))
    console.log(file);
}

// Iterates a directory lloking for animated GIF files
const iterateTree = dir => {
  fs.readdir(dir, (err, list) => {
    if (err)
      throw err
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (err)
          throw err
        if (stat && stat.isDirectory()) {
          iterateTree(file);
        }
        else if (file.toLowerCase().endsWith('.gif'))
          checkGif(file)
      })
    })
  })
}

// Main function
if (process.argv.length < 3)
  console.log(usage)
else
  process.argv.forEach((val, index) => {
    if (index > 1)
      iterateTree(val)
  })
