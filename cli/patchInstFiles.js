#!/usr/bin/env node

/**
 * patchInstFiles.js
 * Check JClic project installer files for integrity and self-reference
 * 
 * Scans the given folder for `*.jclic.inst` files, detecting missing references
 * 
 */

'use strict'

const fs = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk');

const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exists = util.promisify(fs.exists);
const stat = util.promisify(fs.stat);
const log = console.log;

const fileLineExp = /<file src="/;

const args = process.argv;

if (args.length < 3) {
  log(chalk`
{bold.blue patchInstFiles v 1.0}

Scans folder for {italic ".jclic.inst"} files, detecting missing references.

Usage:
  {bold node patchInstFiles.js [path_to_jclic_project]}

`);
  process.exit(1);
}

const pathToExplore = args[2];

function processInstFile(file) {

  log(chalk`{green INFO}: Processing ${file}`);
  const fileName = path.basename(file);
  const base = path.dirname(file);

  return readFile(file)
    .then(data => {
      const lines = data.toString().split(/[\n\r]/).filter(s => s.length > 0);
      const fileLines = lines.filter(l => fileLineExp.test(l));
      return Promise.all(fileLines.map(line => {
        const fName = line.match(/"(.*)"/)[1];
        return exists(path.resolve(base, fName))
          .then(result => {
            if (!result)
              log(chalk`{redBright.bold WARNING}: File ${fName} not found in ${file}`);
          });
      }))
        .then(() => {
          if (lines.findIndex(l => l.indexOf(fileName) > 0) < 0) {
            log(chalk`{yellowBright.bold WARNING}: File ${file} not auto-referenced. Correcting mistake.`);
            const firstFileIndex = lines.findIndex(l => fileLineExp.test(l));
            if (firstFileIndex < 0) {
              console.log(chalk`{redBright.bold ERROR}: No 'files' section in ${file}!`);
              throw ('Error!');
            }
            const newLine = lines[firstFileIndex].replace(/"[^"]*"/, `"${fileName}"`);
            lines.splice(firstFileIndex, 0, newLine);
            return writeFile(file, lines.join('\r\n'));
          }
        });
    });
}

function iterateDir(dir) {
  return readDir(dir)
    .then(list => {
      const instFile = list.find(f => f.match(/\.jclic\.inst$/));
      if (instFile)
        return processInstFile(path.join(dir, instFile));
      else
        return Promise.all(list.map(file => {
          const fp = path.join(dir, file);
          return stat(fp)
            .then(st => st.isDirectory() ? iterateDir(fp) : Promise.resolve(false));
        }));
    })
    .catch(err => {
      log(`{redBright.bold ERROR}: Error parsing "${dir}": ${err}`);
    });
}

iterateDir(pathToExplore)
  .then(() => log(chalk`{green INFO}: Done!`))
  .catch(err => log(`{redBright.bold ERROR}: ${err}`));

