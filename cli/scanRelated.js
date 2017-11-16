#!/usr/bin/env node

/**
 * scanRelated.js
 * Scans the provided path for files with name "project.json"
 * and builds a list of related projects
 * 
 */


const fs = require('fs')
const path = require('path')

const projects = {};


const usage = [
  'Usage: node scanRelated.js path/to/projects ...',
  'Scans the provided folder for "project.json" files, detecting',
  'related projects.'
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
  if (files.indexOf('project.json')>=0)
    checkProject(dir)
  else
    files.forEach(f => {
      const file = path.resolve(absPath, f)
      const stat = fs.statSync(file)
      if (stat && stat.isDirectory())
        iterateTree(file.substr(basePath.length + 1))
    })
}

const checkProject = (dir) => {
  const prj = JSON.parse(fs.readFileSync(path.resolve(basePath, dir, 'project.json')))
  const id = prj.clicZoneId
  if (id) {
    const result = {
      path: dir,
      title: prj.title,
      lang: prj.langCodes.join(', ')
    }
    if (typeof (projects[id]) === 'undefined')
      projects[id] = []
    projects[id].push(result)
  }
}

const checkProjectNames = (projects) => {
  Object.keys(projects).forEach(key => {
    const related = projects[key]
    if (related.length > 1) {
      const identical = related.every(prj => prj.title === related[0].title)
      if (identical) {
        var k = 1
        related.forEach(prj => {
          const title = prj.title;
          prj.title = `${title} (${prj.lang || k++})`
          console.log(`Renaming "${title}" to "${prj.title}"`)
        })
      }
    }
  })
}

iterateTree('')
console.log(`${Object.keys(projects).length} projects scanned`)
checkProjectNames(projects)
fs.writeFileSync('related.json', JSON.stringify(projects))

