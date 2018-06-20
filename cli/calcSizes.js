#!/usr/bin/env node

const Promise = require('promise')
const path = require('path')
const fs = require('fs')
const readFile = Promise.denodeify(fs.readFile)
const writeFile = Promise.denodeify(fs.writeFile)
const recursive = require('recursive-readdir')
const Inspector = require('./inspector-jquery.js')
const getSize = Promise.denodeify(require('get-folder-size'))
const getThisFolderSize = require('./getThisFolderSize.js')

const base = (process.argv && process.argv.length > 2) ? path.resolve(process.cwd(), process.argv[2]) : null

if (!base || !fs.statSync(base).isDirectory()) {
  console.log('Usage:\n  calcSizes.js path_to_projects')
  process.exit(-1)
}

let totalSize = 0, totalMedia = 0, totalActivities = 0, numProjects = 0

recursive(base, [(file, stats) => !stats.isDirectory() && !file.endsWith('project.json')])
  .then(projectFiles => Promise.all(
    projectFiles.map(projectFile => readFile(projectFile)
      .then(data => JSON.parse(data))
      .then(project => {
        console.log(`Processing ${projectFile} ...`)
        const currentData = { activities: project.activities, mediaFiles: project.mediaFiles, totalSize: project.totalSize }
        const prjBase = path.dirname(projectFile)
        const pathToScan = path.dirname(path.resolve(prjBase, project.mainFile))
        const inspector = new Inspector()
        return inspector.addProjectsFromPath(pathToScan)
          .then(inspector => {
            project.activities = inspector.getAllActivities()
            project.mediaFiles = inspector.getAllMedia()
            return getSize(pathToScan)
          })
          .then(size => {
            project.totalSize = size
            return getThisFolderSize(prjBase)
          })
          .then(size => {
            project.totalSize += size
            // Needed to put `files` at the end of project.json:
            const files = project.files
            delete project.files
            project.files = files
            // Accumulate totals
            numProjects++
            totalSize += project.totalSize
            totalActivities += project.activities
            totalMedia += project.mediaFiles
            // Write project.json
            if (project.activities !== currentData.activities || project.mediaFiles !== currentData.mediaFiles || project.totalSize !== currentData.totalSize)
              return writeFile(projectFile, JSON.stringify(project, null, 2))
                .then(() => console.log(`File ${projectFile} successfully updated!`))
                .catch(err => `Error updating "${projectFile}": ${err}`)
            else
              console.log(`No changes in ${projectFile}`)
          })
      })
      .catch(err => `Error processing file "${projectFile}": ${err}`)
    )))
  .then(() => console.log(`done!\n${numProjects} projects processed\n${totalActivities} activities\n${totalMedia} media files\n${(totalSize / (1024 * 1024)).toFixed(2)} MB`))
  .catch(err => console.log(`ERROR: ${err}`))
