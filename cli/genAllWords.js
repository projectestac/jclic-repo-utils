#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const recursive = require('recursive-readdir')
const Inspector = require('./inspector-jquery.js')

const FILE_NAME = "all-words.txt"

const base = (process.argv && process.argv.length > 2) ? path.resolve(process.cwd(), process.argv[2]) : null

if (!base || !fs.statSync(base).isDirectory()) {
  console.log('Usage:\n  extractWords path_to_projects')
} else {
  recursive(base,
    [(file, stats) => !stats.isDirectory() && !(path.basename(file) === 'project.json')])
    .then(projects => projects.forEach(project => {
      console.log(`Processing "${project}"...`)
      const prjBase = path.dirname(project)
      const prj = JSON.parse(fs.readFileSync(project))
      if (prj.mainFile) {
        const pathToScan = path.dirname(path.resolve(prjBase, prj.mainFile))
        const inspector = new Inspector()
        inspector.addProjectsFromPath(pathToScan).then(inspector => {
          const allWords = inspector.getAllWords().join(' ')
          fs.writeFileSync(path.resolve(prjBase, FILE_NAME), allWords)
        })
      } else {
        console.log(`ERROR: Project without mainFile: ${project}`)
      }
    }))
    .catch(err => console.log(`ERROR: ${err}`))
}

