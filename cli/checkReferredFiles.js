#!/usr/bin/env node

/**
 * checkReferredFiles.js
 * JClic repo utils command-line interface.
 * 
 * Scans the given folder for `project.json` files, detecting missing references
 * 
 */

'use strict'

const fs = require('fs');
const path = require('path');
const util = require('util');

const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);

const usage = [
  'Usage:',
  '  node checkReferredFiles.js path_to_projects...',
  '',
  'Scans the folders for "project.json" files, detecting missing references.'
].join('\n');

const args = process.argv;

if (args.length < 3) {
  console.error(usage)
  process.exit(1)
}

const paths = args.slice(2)

function processProject(fullPath) {
  return readFile(fullPath)
    .then(data => {
      const prj = JSON.parse(data);
      const prjBase = path.dirname(fullPath);
      //console.log(`${prjBase}`);
      const filesToCheck = (prj.files || []).map(file => file);
      if (prj.cover)
        filesToCheck.push(prj.cover);
      if (prj.thumbnail)
        filesToCheck.push(prj.thumbnail);
      if (prj.mainFile)
        filesToCheck.push(prj.mainFile);
      if (prj.instFile)
        filesToCheck.push(prj.instFile);
      if (prj.zipFile)
        filesToCheck.push(prj.zipFile);

      return Promise.all(filesToCheck.map(file => {
        return stat(path.join(prjBase, file))
          .then(st => {
            if (!st.isFile())
              throw `"${file}" is not a file!`;
            return Promise.resolve(true);
          })
          .catch(() => console.log(`${prjBase} - Missing file: "${file}"`));
      }))
        .catch(err => console.log(`ERROR: ${err} - Reading file ${fullPath}`));
    });
}

function iterateDir(dir) {
  return readDir(dir)
    .then(list => {
      if (list.includes('project.json'))
        return processProject(path.join(dir, 'project.json'));
      else
        return Promise.all(list.map(file => {
          const fp = path.join(dir, file);
          return stat(fp)
            .then(st => st.isDirectory() ? iterateDir(fp) : Promise.resolve(false));
        }));
    })
    .catch(err => {
      console.log(`Error parsing "${dir}": ${err}`);
    });
}

// iterate over each path provided
Promise.all(paths.map(iterateDir))
  .then(() => console.log('Done!'))
  .catch(err => console.log(`ERROR: ${err}`));
