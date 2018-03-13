#!/usr/bin/env node

const Promise = require('promise')
const path = require('path')
const fs = require('fs')
const ncp = Promise.denodeify(require('ncp').ncp)
const rename = Promise.denodeify(fs.rename)
const readFile = Promise.denodeify(fs.readFile)
const writeFile = Promise.denodeify(fs.writeFile)
const glob = Promise.denodeify(require('glob'))
const parseXml = Promise.denodeify(require('xml2js').parseString)

let jclicPrjBase = null, jclicExportBase = null, exportBase = null, prjName = null, errMsg = ''

function errHandler(err) {
  console.log(err)
  process.exit(-1)
}

// Check parameters
if (process.argv && process.argv.length > 5) {
  jclicPrjBase = path.resolve(process.cwd(), process.argv[2])
  jclicExportBase = path.resolve(process.cwd(), process.argv[3])
  exportBase = path.resolve(process.cwd(), process.argv[4])
  prjName = process.argv[5]

  if (!fs.lstatSync(jclicPrjBase).isDirectory())
    errMsg = `ERROR: Directory ${jclicPrjBase} does not exist.`
  else if (!fs.lstatSync(jclicExportBase).isDirectory())
    errMsg = `ERROR: Directory ${jclicExportBase} does not exist.`
  else if (!fs.lstatSync(exportBase).isDirectory())
    errMsg = `ERROR: Directory ${exportBase} does not exist.`
  else {
    exportBase = path.resolve(exportBase, prjName)
    if (fs.existsSync(exportBase))
      errMsg = `ERROR: Directory ${exportBase} already exists!`
    else {
      fs.mkdirSync(exportBase)
      if (!fs.lstatSync(exportBase).isDirectory()) {
        errMsg = `ERROR: Unable to create directory ${exportBase}`
        exportBase = null
      }
    }
  }
  if (errMsg)
    errHandler(errMsg)
} else
  errHandler(`Usage:\nexport-project [jclicProjectPath] [jclicExportPath] [exportBasePath] [projectName]`)


console.log(`Copying files...`)
const jclicDir = path.resolve(exportBase, 'jclic')
const jclicJsDir = path.resolve(exportBase, 'jclic.js')
let project = {}
ncp(jclicPrjBase, jclicDir, errHandler)
  .then(() => ncp(jclicExportBase, jclicJsDir, errHandler))
  .then(() => rename(path.resolve(jclicJsDir, 'project.json'), path.resolve(exportBase, 'project.json')))
  .then(() => readFile(path.resolve(exportBase, 'project.json')))
  .then((data) => {
    project = JSON.parse(data)
    const moved = ['project.json']
    const promises = []
    if (project.cover) {
      promises.push(rename(path.resolve(jclicJsDir, project.cover), path.resolve(exportBase, project.cover)))
      moved.push(project.cover)
    }
    if (project.thumbnail) {
      promises.push(rename(path.resolve(jclicJsDir, project.thumbnail), path.resolve(exportBase, project.thumbnail)))
      moved.push(project.thumbnail)
    }
    project.files = project.files.map(file => moved.includes(file) ? file : `jclic.js/${file}`).sort()

    promises.push(
      glob(path.resolve(jclicDir, '*.jclic.inst'))
        .then(files => {
          if (!files || files.length === 0)
            console.log('WARNING: Project without JClic installer')
          else {
            project.instFile = path.relative(exportBase, files[0])
            return readFile(files[0], 'utf8')
              .then(str => parseXml(str))
              .then(data => {
                project.zipFile = path.relative(exportBase, path.resolve(jclicDir, data.JClicInstall.shortcut[0].$.project))
                const files = project.files
                delete project.files
                project.files = files
              })
          }
        })
    )

    return Promise.all(promises)
  })
  .then(() => writeFile(path.resolve(exportBase, 'project.json'), JSON.stringify(project, null, 2)))
  .then(() => console.log(`Done!`))
  .catch(errHandler)



