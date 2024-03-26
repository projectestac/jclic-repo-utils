#!/usr/bin/env node

/**
 * Download all 'project.json' and all-words.txt from a 'projects.json' file
 * 
 */


const fs = require('fs');
const path = require('path');
const https = require('https');

const usage = `Usage:\n
downloadAllProjectMetadata.js root_path base_url [numProjects]\n
Downloads all 'project.json' and 'all-words.txt' files from a base 'projects.json'`

const args = process.argv;

if (args.length < 4) {
    console.error(usage);
    process.exit(1);
}

const rootPath = path.resolve(args[2]);
if (!fs.existsSync(rootPath) || !fs.lstatSync(rootPath).isDirectory()) {
    console.log(`Path "${rootPath}" does not exist or isn't a directory`);
    process.exit(1);
}

const baseUrl = args[3];

const numProjects = args.length > 4 && parseInt(args[4]) || -1;
if (numProjects >= 0)
    console.log(`numProjects set to: ${numProjects}`);

async function downloadFile(url, dest) {
    const file = fs.createWriteStream(dest);
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(file);
            });
            res.on('error', reject);
        })
    })
}

async function main() {
    const projectsFile = path.resolve(rootPath, 'projects.json');
    if (!fs.existsSync(projectsFile)) {
        const projectsPath = `${baseUrl}/projects.json`;
        console.log(`Downloading ${projectsPath}`);
        await downloadFile(projectsPath, projectsFile);
        console.log(`projects.json successfully loaded!`);
    }

    const projects = require(projectsFile);
    console.log(`${projects.length} projects found`);

    const maxProjects = numProjects >= 0 ? Math.min(numProjects, projects.length) : projects.length;

    for (let i = 0; i < maxProjects; i++) {
        const { 'path': projectPath, title } = projects[i];
        const pathAbs = path.resolve(rootPath, projectPath);
        if (fs.existsSync(pathAbs)) {
            if (!fs.lstatSync(pathAbs).isDirectory())
                console.error(`ERROR: Path "${projectPath}" cannot be created because there is a file with same name!`);
            else
                console.log(`ERROR: Path "${projectPath}" already exists. Please remove it and start again.`);
            console.error(`Skipping project "${title}"`);
            continue;
        }

        console.log(`Processing "${title}" (${projectPath})`)
        fs.mkdirSync(pathAbs, { recursive: true });
        const projectSrc = `${baseUrl}/${projectPath}/project.json`;
        const projectDest = path.resolve(pathAbs, 'project.json');
        const allWordsSrc = `${baseUrl}/${projectPath}/all-words.txt`;
        const allWordsDest = path.resolve(pathAbs, 'all-words.txt');
        await downloadFile(projectSrc, projectDest);
        await downloadFile(allWordsSrc, allWordsDest);
    }

    console.log('Done!');
}

main();
