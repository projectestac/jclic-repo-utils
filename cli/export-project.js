#!/usr/bin/env node

const Promise = require('promise');
const path = require('path');
const fs = require('fs');
const ncp = Promise.denodeify(require('ncp').ncp);
const rename = Promise.denodeify(fs.rename);
const readFile = Promise.denodeify(fs.readFile);
const writeFile = Promise.denodeify(fs.writeFile);
// const glob = Promise.denodeify(require('glob'));
const { glob } = require('glob');
const parseXml = Promise.denodeify(require('xml2js').parseString);
const Inspector = require('./inspector-jquery.js');

const
  JCLIC_FOLDER = 'jclic',
  JS_FOLDER = 'jclic.js',
  ALLWORDS_FILE = 'all-words.txt',
  PROJECT_FILE = 'project.json',
  JCLIC_SRC_FOLDER = 'JClic/projects',
  JCLIC_EXPORT_FOLDER = 'JClic/export';

let
  jclicSrc = null,
  exportSrc = null,
  exportBase = null,
  prjName = null,
  errMsg = '';

function errHandler(err) {
  console.log(err);
  process.exit(-1);
}

// Single parameter mode
if (process.argv && process.argv.length === 3) {
  const name = process.argv[2];
  process.argv[2] = `${process.env.HOME}/${JCLIC_SRC_FOLDER}/${name}`;
  process.argv.push(`${process.env.HOME}/${JCLIC_EXPORT_FOLDER}/${name}`);
  process.argv.push('.');
  process.argv.push(name);
  console.log(`Single parameter expanded to: ${process.argv.filter((p, n)=>n>1).join(' ')}`);
}

// Check parameters
if (process.argv && process.argv.length > 5) {
  jclicSrc = path.resolve(process.cwd(), process.argv[2]);
  exportSrc = path.resolve(process.cwd(), process.argv[3]);
  exportBase = path.resolve(process.cwd(), process.argv[4]);
  prjName = process.argv[5];

  if (!fs.lstatSync(jclicSrc).isDirectory())
    errMsg = `ERROR: Directory ${jclicSrc} does not exist.`;
  else if (!fs.lstatSync(exportSrc).isDirectory())
    errMsg = `ERROR: Directory ${exportSrc} does not exist.`;
  else if (!fs.lstatSync(exportBase).isDirectory())
    errMsg = `ERROR: Directory ${exportBase} does not exist.`;
  else {
    exportBase = path.resolve(exportBase, prjName);
    if (fs.existsSync(exportBase))
      errMsg = `ERROR: Directory ${exportBase} already exists!`;
    else {
      fs.mkdirSync(exportBase);
      if (!fs.lstatSync(exportBase).isDirectory()) {
        errMsg = `ERROR: Unable to create directory ${exportBase}`;
        exportBase = null;
      }
    }
  }
  if (errMsg)
    errHandler(errMsg);
} else
  errHandler(`Usage:\n  export-project.js project_name | jclic_project_folder exported_folder output_folder project_name`);

const
  jclicDir = path.resolve(exportBase, JCLIC_FOLDER),
  jclicJsDir = path.resolve(exportBase, JS_FOLDER),
  projectFile = path.resolve(exportBase, PROJECT_FILE);

let project = {}

console.log(`Processing ${prjName}...`);

ncp(jclicSrc, jclicDir, errHandler)
  .then(() => ncp(exportSrc, jclicJsDir, errHandler))
  .then(() => rename(path.resolve(jclicJsDir, PROJECT_FILE), projectFile))
  .then(() => readFile(projectFile))
  .then((data) => {
    project = JSON.parse(data);
    const moved = [PROJECT_FILE];
    const promises = [];
    if (project.cover) {
      //promises.push(rename(path.resolve(jclicJsDir, project.cover), path.resolve(exportBase, project.cover)))
      promises.push(ncp(path.resolve(jclicJsDir, project.cover), path.resolve(exportBase, project.cover), errHandler));
      moved.push(project.cover);
    }
    if (project.thumbnail) {
      //promises.push(rename(path.resolve(jclicJsDir, project.thumbnail), path.resolve(exportBase, project.thumbnail)))
      promises.push(ncp(path.resolve(jclicJsDir, project.thumbnail), path.resolve(exportBase, project.thumbnail), errHandler));
      moved.push(project.thumbnail);
    }
    project.mainFile = `${JS_FOLDER}/${project.mainFile}`;
    project.files = project.files.map(file => moved.includes(file) ? file : `${JS_FOLDER}/${file}`).sort();

    const mainDir = path.dirname(path.resolve(exportBase, project.mainFile));
    const inspector = new Inspector();
    promises.push(
      glob(path.resolve(jclicDir, '*.jclic.inst'))
        .then(files => {
          if (!files || files.length === 0)
            console.log('WARNING: Project without JClic installer');
          else {
            project.instFile = path.relative(exportBase, files[0]);
            return readFile(files[0], 'utf8')
              .then(str => parseXml(str))
              .then(data => {
                project.zipFile = path.relative(exportBase, path.resolve(jclicDir, data.JClicInstall.shortcut[0].$.project));
                // Put `files` at the end of `project`
                const files = project.files;
                delete project.files;
                project.files = files;
              });
          }
        }),
      inspector.addProjectsFromPath(mainDir)
        .then(inspector => {
          const allWords = inspector.getAllWords().join(' ');
          return writeFile(path.resolve(exportBase, ALLWORDS_FILE), allWords);
        })
    )
    return Promise.all(promises);
  })
  .then(() => writeFile(projectFile, JSON.stringify(project, null, 2)))
  .then(() => console.log(`Done!`))
  .catch(errHandler);
