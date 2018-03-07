#!/usr/bin/env node

const path = require('path')
const Inspector = require('./inspector.js')

const file = (process.argv && process.argv.length > 2) ? path.resolve(process.cwd(), process.argv[2]) : path.resolve(__dirname, '../test/demo.jclic')

const inspector = Inspector.CreateInspector(file)

console.log(inspector.getProjectProperties())
