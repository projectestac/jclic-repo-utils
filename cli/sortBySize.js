#!/usr/bin/env node

const fs = require('fs')
const Promise = require('promise')
const recursive = require('recursive-readdir')
const path = require('path')
const stat = Promise.denodeify(fs.stat)
const readFile = Promise.denodeify(fs.readFile)
const JSZip = require('jszip')

const base = (process.argv && process.argv.length > 2) ? path.resolve(process.cwd(), process.argv[2]) : null

if (!base || !fs.statSync(base).isDirectory()) {
  console.log('Usage:\n sortBySize.js folder [extension]')
  process.exit(-1)
}

const bl = base.length + 1
const ext = (process.argv && process.argv.length > 3) ? path.resolve(process.cwd(), process.argv[3]) : '.jclic.zip'

recursive(base, [(file, stats) => !stats.isDirectory() && !file.endsWith(ext)])
  .then(files => Promise.all(files.map(
    file => stat(path.resolve(base, file))
      .then(stat => readFile(file)
        .then(data => JSZip.loadAsync(data))
        .then(zip => Promise.resolve({ file: file.substr(bl), size: stat.size, files: Object.keys(zip.files).length })))))
    .then(fileObjs => fileObjs.sort((fa, fb) => fa.size - fb.size)))
  .then(fileObjs => {
    // Write results to the console in CSV format:
    fileObjs.map(fo => console.log(`${fo.size},${fo.file},${fo.files}`))
  })

