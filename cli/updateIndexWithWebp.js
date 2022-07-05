#!/usr/bin/env node

/**
 * updateIndexWithWebp.js
 * Add the web file reference to 'projects.json'
 * 
 */


const fs = require('fs');
const path = require('path');

const usage = `Usage:\n
updateIndexWithWebp.js path_to_projects\n
Updates the index 'projects.json' with references to the associated webp cover file of each project, when present.`

const args = process.argv;

if (args.length < 3) {
    console.error(usage);
    process.exit(1);
}

const basePath = path.resolve(args[2]);
const projectsFile = path.resolve(basePath, 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsFile));
if (!projects || !projects.length) {
    console.log(`ERROR: No projects file in ${basePath}, or empty!`);
    process.exit(1);
}

projects.forEach(prj => {
    const prjdata = JSON.parse(fs.readFileSync(path.resolve(basePath, prj.path, 'project.json')));
    if (prjdata.coverWebp) {
        prj.coverWebp = prjdata.coverWebp;
        console.log(`Added reference to "${prj.coverWebp}" for "${prj.path}"`);
    }
});


const ws = fs.createWriteStream(projectsFile);
ws.write('[\n');
projects.forEach((prj, index) => {
    ws.write(`${JSON.stringify(prj)}${index === projects.length - 1 ? '' : ','}\n`)
})
ws.write(']');
ws.end();
