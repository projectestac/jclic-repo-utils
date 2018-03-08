#!/usr/bin/env node

const path = require('path')
const Inspector = require('./inspector-jquery.js')

const file = (process.argv && process.argv.length > 2) ? path.resolve(process.cwd(), process.argv[2]) : null

if (!file) {
  console.log('Usage: extractWords [filename.jclic]')
} else {
  const inspector = new Inspector()
  inspector.addProjectFromFile(file)
    .then(inspector => console.log(inspector.getAllWords().join(' ')))
    .catch(err => console.log(`ERROR: ${err}`))
}

