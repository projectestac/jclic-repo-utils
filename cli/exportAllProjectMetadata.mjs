#!/usr/bin/env node

/**
 * Export all projects metadata to CSV
 */

import fs from 'node:fs';
import path from 'node:path';
import { mkConfig, generateCsv, asString } from "export-to-csv";

const usage = `Usage:\n
exportAllProjectMetadata.js root_path [numProjects]\n
Parses all 'project.json' and 'all-words.txt' files from a base 'projects.json', exporting it to CSV`

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
  const allWordsFile = path.resolve(pathAbs, 'all-words.txt');
  const project = JSON.parse(fs.readFileSync(projectFile));
  const allWords = fs.readFileSync(allWordsFile).toString();

  console.log(`Processing "${title}" (${projectPath})`);
  data.push({ projectPath, ...project, allWords });
}

const csvFile = path.resolve(rootPath, 'projects.csv');
console.log(`Generating ${csvFile}`);

const csvConfig = mkConfig({
  columnHeaders: [
    'title', 'author', 'school', 'date',
    'langCodes', 'areaCodes', 'levelCodes',
    'descriptionCa', 'descriptionEs', 'descriptionEn',
    'descriptorsCa', 'descriptorsEs', 'descriptorsEn', 'descCodes',
    'relatedTo', 'clicZoneId', 'clicZoneURL',
    'cover', 'coverWebp', 'thumbnail',
    'mainFile', 'instFile', 'zipFile',
    'activities', 'mediaFiles', 'numFiles', 'totalSize',
    'files', 'allWords',
  ]
});
const preparedData = data.map(({
  projectPath,
  title, author = '', school = '', date,
  langCodes = [], areaCodes = [], levelCodes = [],
  description = {}, descriptors = {}, descCodes = [],
  relatedTo = [],
  clicZoneId = -1, clicZoneURL = '',
  cover = '', coverWebp = '', thumbnail = '',
  mainFile = '', instFile = '', zipFile = '',
  activities = 0, mediaFiles = 0, totalSize = 0, files = [],
  allWords = '' }) => {
  return {
    path: projectPath,
    title, author, school, date,
    langCodes: langCodes.join(','),
    areaCodes: areaCodes.join(','),
    levelCodes: levelCodes.join(','),
    descriptionCa: description.ca || '',
    descriptionEs: description.es || '',
    descriptionEn: description.en || '',
    descriptorsCa: descriptors.ca || '',
    descriptorsEs: descriptors.es || '',
    descriptorsEn: descriptors.en || '',
    descCodes: descCodes.join(','),
    relatedTo: relatedTo.join(','),
    clicZoneId, clicZoneURL,
    cover, coverWebp, thumbnail,
    mainFile, instFile, zipFile,
    activities, mediaFiles, totalSize,
    numFiles: files.length,
    files: files.join(','),
    allWords: allWords.includes('|') ? allWords.substring(0, allWords.indexOf('|')) : allWords,
  }
});
const csv = generateCsv(csvConfig)(preparedData);
const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
fs.writeFileSync(csvFile, csvBuffer);

console.log('Done!');