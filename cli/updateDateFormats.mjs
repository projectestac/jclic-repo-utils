#!/usr/bin/env node

/**
 * Export all projects metadata to CSV
 */

import fs from 'node:fs';
import path from 'node:path';

const usage = `Usage:\n
updateDateFormats.mjs root_path [numProjects]\n
Reverts the date format of all 'project.json' files to DD/MM/YY, from a base 'projects.json'`

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


function normalizeDate(str) {
  const dateMembers = str.split('/');
  if (dateMembers.length !== 3)
    throw new Error(`Bad date format: ${str}`);
  const year = parseInt(dateMembers[2]) % 100;
  // const year = 2000 + parseInt(dateMembers[2]);
  const month = parseInt(dateMembers[1]) - 1;
  const day = parseInt(dateMembers[0]);
  return `${day < 10 ? '0' : ''}${day}/${month < 9 ? '0' : ''}${month + 1}/${year < 10 ? '0' : ''}${year}`;
}

const projectsJsonFile = path.resolve(rootPath, 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsJsonFile));
if (!projects || projects.length < 1) {
  console.log(`File ${projectsJsonFile} does not exist or is an empty file!`);
  process.exit(1);
}

const maxProjects = numProjects >= 0 ? Math.min(numProjects, projects.length) : projects.length;

for (let i = 0; i < maxProjects; i++) {
  const { 'path': projectPath, title } = projects[i];
  const pathAbs = path.resolve(rootPath, projectPath);
  const projectFile = path.resolve(pathAbs, 'project.json');
  const project = JSON.parse(fs.readFileSync(projectFile));

  console.log(`Processing "${title}" (${projectPath}) - ${normalizeDate(project.date)}`)
  project.date = normalizeDate(project.date);
  fs.writeFileSync(projectFile, JSON.stringify(project, null, 2));
}

console.log('Done!');