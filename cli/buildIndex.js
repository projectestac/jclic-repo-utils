#!/usr/bin/env node

/**
 * buildIndex.js
 * Scans the provided path for files with name "project.json"
 * and builds an index file named "projects.json"
 * 
 */


const fs = require('fs')
const path = require('path')

const projects = [];

const usage = [
  'Usage: node buildIndex.js path/to/projects ...',
  'Scans the provided folder for "project.json" files, building',
  'the index file "projects.json"'
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
    registerProject(dir)
  else
    files.forEach(f => {
      const file = path.resolve(absPath, f)
      const stat = fs.statSync(file)
      if (stat && stat.isDirectory())
        iterateTree(file.substr(basePath.length + 1))
    })
}

const registerProject = (dir) => {
  const prj = JSON.parse(fs.readFileSync(path.resolve(basePath, dir, 'project.json')))
  projects.push({
    path: dir,
    title: prj.title,
    author: prj.author,
    date: prj.date,
    langCodes: prj.langCodes,
    levelCodes: prj.levelCodes,
    areaCodes: prj.areaCodes,
    mainFile: prj.mainFile,
    cover: prj.cover,
    thumbnail: prj.thumbnail,
    id: prj.clicZoneId || prj.orderId || 0,
  })
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
          console.log(`Renaming ${prj.path}: "${title}" to "${prj.title}"`)
        })
      }
    }
  })
}

iterateTree('')
console.log(`${Object.keys(projects).length} projects detected`)
var maxId = projects.reduce((max, prj) => Math.max(max, prj.id), 0)
projects.map(prj => { if (prj.id === 0) prj.id = ++maxId })
projects.sort((a, b) => {
  var result = a.id > b.id ? -1 : a.id === b.id ? 0 : 1;
  if (result === 0)
    result = (a.langCodes.join('') + a.title) > (b.langCodes.join('') + b.title) ? -1 : 1
  return result
})
const ws = fs.createWriteStream('projects.json');
ws.write('[\n');
projects.forEach((prj, index) => {
  delete prj.id
  ws.write(`${JSON.stringify(prj)}${index === projects.length - 1 ? '' : ','}\n`)
})
ws.write(']');
ws.end();
