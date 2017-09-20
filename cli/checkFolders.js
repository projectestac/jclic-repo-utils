#!/usr/bin/env node

/**
 * checkFolders.js
 * JClic repo utils command-line interface.
 * 
 * Scans the given folder for `project.json` files and creates missing 'index.html'
 * and 'imsmanifest.xml' files if needed.
 * 
 */

'use strict'

const fs = require('fs')
const path = require('path')
const app = require('../app')

const usage = [
  'Usage: node checkProjectFolders.js path/to/project/folder ...',
  'Scans the folders for "project.json" files, creating',
  '"index.html", "imsmanifest.xml" and icon files when needed.'
].join('\n');

const args = process.argv;

if (args.length < 3) {
  console.error(usage)
  process.exit(1)
}

const paths = args.slice(2)

const processProject = (fullPath) => {
  let prj = {}
  try {
    //prj = require(fullPath);
    prj = JSON.parse(fs.readFileSync(fullPath))
  } catch (err) {
    console.log(`----\nERROR: ${err}\nReading file: ${fullPath}\n----`)
    return;
  }
  console.log(`Processing "${prj.title}" (${fullPath})`)
  const prjBase = path.dirname(fullPath)
  const mainBase = path.dirname(prj.mainFile)
  const mainPrefix = mainBase === '' ? '' : mainBase + '/'
  const mainFile = path.parse(prj.mainFile).base
  let modified = false

  // Check if project has 'files'
  if (!prj.files) {
    prj.files = []
    listFiles(prjBase, '', prj.files, false)
    if (mainBase !== '')
      listFiles(prjBase, mainBase, prj.files, true)
    modified = true
  }

  // Check if project has 'index.html'
  const indexFile = path.join(prjBase, mainBase, 'index.html')
  if (!fs.existsSync(indexFile)) {
    writeFile(indexFile, app.assets.indexTemplate
      .replace(/%%TITLE%%/g, app.utils.xmlStr(prj.title))
      .replace(/%%MAINFILE%%/g, mainFile))
    app.utils.pushUnique(prj.files, path.join(mainBase, 'index.html'))
    modified = true
  }

  // Check if all '.jclic' files have an quivalent '.jclic.js' script
  prj.files.filter(f => f.endsWith('.jclic') && f.startsWith(mainPrefix)).forEach(file => {
    const prjFile = file.substring(mainPrefix.length)
    const prjFileJs = prjFile + '.js'
    const jsFile = path.join(prjBase, mainBase, prjFileJs)
    if (!fs.existsSync(jsFile)) {
      const jclicFile = fs.readFileSync(path.join(prjBase, mainBase, prjFile), 'utf8')
      writeFile(jsFile, app.assets.jsTemplate
        .replace(/%%JCLICFILE%%/, prjFile)
        .replace(/%%XMLPROJECT%%/, JSON.stringify(jclicFile)))
      app.utils.pushUnique(prj.files, path.join(mainBase, prjFileJs))
      modified = true
    }
  })

  // Check if project has stock icons
  const icons = ['favicon.ico', 'icon-72.png', 'icon-192.png']
  icons.forEach(icon => {
    const icoFile = path.join(prjBase, mainBase, icon)
    if (!fs.existsSync(icoFile)) {
      writeFile(icoFile, app.assets[icon], 'base64')
      app.utils.pushUnique(prj.files, path.join(mainBase, icon))
      modified = true
    }
  })

  // Check if project has 'imsmanifest.xml'
  const manifestFile = path.join(prjBase, mainBase, 'imsmanifest.xml')
  if (!fs.existsSync(manifestFile)) {
    app.utils.pushUnique(prj.files, path.join(mainBase, 'imsmanifest.xml'))
    const avoidDir = mainBase === '' ? '' : mainBase + '/'
    const files = prj.files.map(v => v.replace(avoidDir, ''))
    writeFile(manifestFile, app.assets.imsmanifestTemplate
      .replace(/%%ID%%/g, app.utils.getRandomHex())
      .replace(/%%TITLE%%/g, app.utils.xmlStr(prj.title))
      .replace(/%%FILES%%/g, files.map(v => `   <file href="${app.utils.xmlStr(v)}"/>`).join('\n')))
    modified = true
  }

  // Update 'project.json' if modified
  if (modified)
    writeFile(fullPath, JSON.stringify(prj, null, 2), 'utf8', true)
}

const writeFile = (fullPath, content, encoding, updated = false) => {
  try {
    fs.writeFileSync(fullPath, content, encoding || 'utf8')
  } catch (err) {
    console.log(`----\nERROR: ${err}\nWriting file: ${fullPath}\n----`)
    return
  }
  console.log(`${updated ? 'Updated' : 'Created'} file: ${fullPath}`)
}

const iterateDir = (dir) => {
  try {
    const list = fs.readdirSync(dir)
    if (list.includes('project.json'))
      processProject(path.join(dir, 'project.json'))
    else
      list.forEach(file => {
        const fullPath = path.join(dir, file)
        if (fs.lstatSync(fullPath).isDirectory())
          iterateDir(fullPath)
      })
  } catch (err) {
    console.log(`----\nERROR: ${err}\nScaning directory: ${dir}\n----`)
  }
}

const listFiles = (base, dir, files, recurse = false) => {
  try {
    const fullPath = path.join(base, dir)
    const list = fs.readdirSync(fullPath)
    list.forEach(file => {
      const fName = path.join(dir, file)
      const lstat = fs.lstatSync(path.join(base, fName))
      if (!lstat.isDirectory())
        files.push(fName)
      else if (recurse)
        listFiles(base, fName, files, recurse)
    });
  } catch (err) {
    console.log(`----\nERROR: ${err}\nScaning directory: ${dir}\n----`)
  }
}

// iterate over each path provided
paths.forEach(iterateDir)
