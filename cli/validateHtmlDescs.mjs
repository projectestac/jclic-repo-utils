#!/usr/bin/env node

/**
 * Validate HTML fragments in project descriptions
 */

import fs from 'node:fs';
import path from 'node:path';
import HtmlValidator from 'html-validator';

const usage = `Usage:\n
ValidateHtmlDescs.js root_path [numProjects]\n
Parses all 'project.json' files from a base 'projects.json', warning about HTML errors in 'description' fields`

const args = process.argv;

if (args.length < 3) {
  console.error(usage);
  process.exit(1);
}

const rootPath = path.resolve(args[2]);
if (!fs.existsSync(rootPath) || !fs.lstatSync(rootPath).isDirectory()) {
  console.log(`Path "${rootPath}" does not exist or isn't a directory`);
  process.exit(1);
}

const numProjects = args.length > 3 && parseInt(args[3]) || -1;
if (numProjects >= 0)
  console.log(`numProjects set to: ${numProjects}`);


const projectsJsonFile = path.resolve(rootPath, 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsJsonFile));
if (!projects || projects.length < 1) {
  console.log(`File ${projectsJsonFile} does not exist or is an empty file!`);
  process.exit(1);
}

const maxProjects = numProjects >= 0 ? Math.min(numProjects, projects.length) : projects.length;

const data = [];

for (let i = 0; i < maxProjects; i++) {
  const { 'path': projectPath, title } = projects[i];
  const pathAbs = path.resolve(rootPath, projectPath);
  const projectFile = path.resolve(pathAbs, 'project.json');
  const project = JSON.parse(fs.readFileSync(projectFile));

  console.log(`Processing "${title}" (${projectPath})`);

  const { ca = '', es = '', en = '' } = project.description;

  const textToValidate = `<div id="ca">${ca}</div><div id="es">${es}</div><div id="en">${en}</div>`;

  const response = await HtmlValidator({
    format: 'text',
    isFragment: true,
    // validator: validatorAPI,
    validator: 'WHATWG',
    data: textToValidate,
    ignore: []
  });

  if (!response.isValid) {
    const { errors, warnings } = response;
    let result = { path: projectPath };
    if (errors?.length)
      result = { ...result, errors };
    if (warnings?.length)
      result = { ...result, warnings };
    data.push(result);
  }
}

console.log(`Found ${data.length} project${data.length === 1 ? '' : 's'} with errors or warnings`);
const resultsFile = path.resolve(rootPath, 'htmlValidation.json');
console.log(`Generating ${resultsFile}`);
fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));

console.log('Done!');
