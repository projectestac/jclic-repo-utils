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
const fileLineExp = /<file src="/;

const usage = [
  'Usage:',
  '  node patchInstFiles.js [path_to_jclic_inst_file]...',
  '',
  'Scans the folders for ".jclic.inst" files, detecting missing references.'
].join('\n');

const args = process.argv;

if (args.length < 3) {
  console.error(usage)
  process.exit(1)
}

const files = args.slice(2);

function processFile(file) {
  console.log(`Processing ${file}...`);
  const fileName = path.basename(file);
  const base = path.dirname(file);
  const lines = fs.readFileSync(file).toString().split(/[\n\r]/).filter(s => s.length > 0);

  const fileLines = lines.filter(l => fileLineExp.test(l));
  fileLines.forEach(line => {
    const fName = line.match(/"(.*)"/)[1];
    if (!fs.existsSync(path.resolve(base, fName)))
      console.log(`WARNING: File ${fName} not found in ${file}`);
  });

  if (lines.findIndex(l => l.indexOf(fileName) > 0) < 0) {
    console.log(`File ${file} not auto-referenced. Correcting mistake.`);
    const firstFileIndex = lines.findIndex(l => fileLineExp.test(l));
    if (firstFileIndex < 0) {
      console.log(`ERROR: No 'files' section in ${file}!`);
      throw ('Error!');
    }
    const newLine = lines[firstFileIndex].replace(/"[^"]*"/, `"${fileName}"`);
    lines.splice(firstFileIndex, 0, newLine);
    fs.writeFileSync(file, lines.join('\r\n'));
  }
}

files.forEach(processFile);

console.log(`Done!`);

