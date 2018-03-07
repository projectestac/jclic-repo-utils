#!/usr/bin/env node

const path = require('path')
const Inspector = require('./inspector.js')

const file = (process.argv && process.argv.length > 2) ? path.resolve(process.cwd(), process.argv[2]) : null

if (!file) {
  console.log('Usage: extractWords [filename.jclic]')
} else {
  const inspector = Inspector.CreateInspector(file)
  console.log(inspector.getAllWords().join(' '))
}

