#!/usr/bin/env node

/**
 * addFileList.js
 * Updates the `files` field of `project.json` with the full list of files currently existing
 * in its `jclic.js` directory
 * 
 */

const fs = require('fs')
const path = require('path')

const usage = [
  'Usage:',
  '  addFileList.js path_to_projects',
  '',
  'Search for "project.json" files on the specified path',
  'and updates its "files" field with the list of assets that are found in the folders: "." (root), "./jclic.js" and subfolders of "./jclic.js"',
].join('\n');

// Process a directory containing a `project.json` file
const processDirectory = (dir, done) => {
  const projectFile = dir + '/project.json'
  // Load project data
  const prj = JSON.parse(fs.readFileSync(projectFile))
  // `projectBase` usually will be "jclic.js" in the clicZone repository
  const projectBase = path.dirname(prj.mainFile)
  // Read all files inside the project root dir
  iterateDir(dir, dir, (err, results) => {
    if (err)
      throw err
    const files = results.filter(value => {
      const s = path.dirname(value)
      // Accept only files in root or projectBase
      return s === '.' || s.startsWith(projectBase)
    }).sort()

    // Update the `files` field of project.json:
    prj.files = files

    // Write back the modified json file
    fs.writeFile(projectFile, JSON.stringify(prj, null, 2), done)
  })
}

const iterateDir = (dir, base, done) => {
  let results = []
  fs.readdir(dir, (err, list) => {
    if (err)
      throw err
    let pending = list.length
    if (!pending)
      return done(null, results)

    list.forEach(file => {
      file = path.resolve(dir, file)
      fs.stat(file, (err, stat) => {
        if (err)
          throw err;
        if (stat && stat.isDirectory()) {
          iterateDir(file, base, (err, res) => {
            if (err)
              throw err
            results = results.concat(res)
            if (!--pending)
              done(null, results)
          })
        } else {
          results.push(path.relative(base, file))
          if (!--pending)
            done(null, results)
        }
      })
    })
  })
}

const iterateTree = (dir, done) => {
  const projectFile = dir + '/project.json'
  fs.stat(projectFile, err => {
    if (err === null) {
      // Directory with 'project.json'
      processDirectory(dir, err => {
        if (err)
          throw err
        console.log(`Processed file: ${projectFile}`)
        done(err)
      })
    } else if (err.code === 'ENOENT') {
      // Dir without 'project.json'
      fs.readdir(dir, (err, list) => {
        if (err)
          throw err
        let pending = list.length
        list.forEach(file => {
          file = path.resolve(dir, file)
          fs.stat(file, (err, stat) => {
            if (err)
              throw err
            if (stat && stat.isDirectory()) {
              iterateTree(file, err => {
                console.log(`Processed folder: ${file}`)
                if (!--pending)
                  done(err)
              })
            } else if (!--pending)
              done(err)
          })
        })
      })
    } else
      throw err
  })
}

// Main

//let dir = '/dades/zonaClic/projects';
//let dir = '/dades/zonaClic/trans';
let dir = null
if (process.argv && process.argv.length > 2)
  dir = process.argv[2]

if (dir === null)
  console.log(usage);
else if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory())
  console.log(`ERROR: Directory "${dir}" does not exist!`)
else
  iterateTree(dir, err => {
    if (err)
      throw err
    console.log(`Processed folder: ${dir}`);
  })