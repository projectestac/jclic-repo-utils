#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const upd = require('./updateProject')
const related = JSON.parse(fs.readFileSync('related.json'))
const descriptors = JSON.parse(fs.readFileSync('descriptors.json'))
const diccionari = JSON.parse(fs.readFileSync('diccionari.json'))
const languages = ['ca', 'es', 'en']

const usage = [
  'Usage:',
  '  updateRelatedRefs.js path_to_projects',
  '',
  'Scans the provided folder for "project.json" files, updating',
  'the `related` field based on the contents of "related.json"'
].join('\n');

const args = process.argv;

if (args.length < 3) {
  console.error(usage)
  process.exit(1)
}

const basePath = args[2]

// Iterates a directory looking for 'project.json' files
const iterateTree = (dir) => {
  var absPath = path.resolve(basePath, dir)
  const files = fs.readdirSync(absPath);
  if (files.indexOf('project.json') >= 0)
    updateProject(dir)
  else
    files.forEach(f => {
      const file = path.resolve(absPath, f)
      const stat = fs.statSync(file)
      if (stat && stat.isDirectory())
        iterateTree(file.substr(basePath.length + 1))
    })
}


const updateProject = (dir) => {
  const projectFile = path.join(basePath, dir, 'project.json')
  const prj = JSON.parse(fs.readFileSync(projectFile))
  if (prj.clicZoneId) {
    const id = prj.clicZoneId
    const data = {}
    var modified = false
    if (related[id].length > 1) {
      data.relatedTo = related[id].filter(r => r.path !== dir).map(r => r.path)
      modified = true
    }
    if (descriptors[id]) {
      data.descriptors = {}
      languages.forEach(lang => {
        var desc = []
        descriptors[id].forEach(code => desc.push(diccionari[lang][code]))
        data.descriptors[lang] = desc.join(', ')
      })
      data.descCodes = descriptors[id]      
      modified = true
    }
    if (modified) {
      console.log(`Updating ${dir}`)
      upd(basePath, dir, data)
    }
  }
}

iterateTree('')
