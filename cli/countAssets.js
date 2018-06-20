#!/usr/bin/env node

/**
 * countAssets.js
 * Scans the provided path for JClic project files (XML files with extension ".jclic")
 * and counts its number of activities, sequences and media files.
 * 
 */

const fs = require('fs')
const path = require('path')
const xmldom = require('xmldom')

const usage = [
  'Usage:',
  '  countAssets.js path_to_projects',
  '',
  'Scans the provided path for JClic project files (XML files with extension ".jclic")',
  'counting the number of activities, sequences and media files used in each project.',
].join('\n');

const domParser = new xmldom.DOMParser()

const checkProject = (file, results) => {
  const doc = domParser.parseFromString(fs.readFileSync(file, 'utf8'))
  const result = { file }
  result.title = doc.getElementsByTagName('settings')[0].getElementsByTagName('title')[0].childNodes[0].data
  result.numActs = doc.getElementsByTagName('activities')[0].getElementsByTagName('activity').length
  result.numSequences = doc.getElementsByTagName('sequence')[0].getElementsByTagName('item').length
  const medias = doc.getElementsByTagName('mediaBag')[0].getElementsByTagName('media')
  result.numMedias = medias.length
  result.mediaTypes = {}

  Object.keys(medias).slice(0, medias.length).forEach(m => {
    const f = medias[m].getAttribute('file')
    const type = f.substring(f.lastIndexOf('.') + 1) || f
    if (!result.mediaTypes[type])
      result.mediaTypes[type] = 0
    result.mediaTypes[type]++
  })
  results.push(result)
}

// Iterates a directory looking for .jclic files
const iterateTree = (dir, results) => {
  fs.readdirSync(dir).forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory())
      iterateTree(file, results)
    else if (file.toLowerCase().endsWith('.jclic'))
      checkProject(file, results)
  })
}

// Main function
if (process.argv.length < 3)
  console.log(usage)
else {
  const results = []
  process.argv.forEach((val, index) => {
    if (index > 1)
      iterateTree(val, results)
  })
  console.log(`file|title|activities|sequences|medias`)
  results.forEach(r => {
    console.log(`${r.file}|${r.title}|${r.numActs}|${r.numSequences}|${r.numMedias}`)
  })
}

