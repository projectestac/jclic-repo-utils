#!/usr/bin/env node

/**
 * Generates a [WebP](https://en.wikipedia.org/wiki/WebP) image for the project cover
 * NOTE: 'cwebp' and 'gif2webp' utilities should be installed in order to run this script
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { mainModule } = require('process');

// Quality factor of the generated Webp files (0-100, default is 75)
const WEPB_QUALITY = 75;

/**
 * Generates a cover webp file for a specific project, if not already created,
 * and updates `project.json` adding a `coverWebp` record.
 * @param {string} projectPath - Full path to the folder where the JClic project resides
 * @returns Promise
 */
async function generateWebp(projectPath) {

    const projectFile = path.join(projectPath, 'project.json');
    const project = JSON.parse(fs.readFileSync(projectFile));
    let { cover, coverWebp } = project;

    // Check if the project already has a webp file declaration
    if (coverWebp) {
        console.log(`Project ${projectPath} already has a webp cover`);
        return 0;
    }

    // Check if project has a cover
    if (!cover) {
        console.log(`ERROR: project ${projectPath} has no cover!`);
        return -1;
    }

    // Remove current cover extension and add '.webp'
    coverWebp = `${/(.+?)(\.[^.]*$|$)/.exec(cover)[1]}.webp`;

    // Check if source file exists
    const srcFile = path.join(projectPath, cover);
    if (!fs.existsSync(srcFile)) {
        console.log(`ERROR: El fitxer ${srcFile} no existeix!`);
        return -1;
    }

    const outFile = path.join(projectPath, coverWebp);

    // Check if the cover is a GIF file
    const isGif = srcFile.toLowerCase().endsWith('.gif');

    return new Promise((resolve, reject) => {
        // Perform conversion to webp and update  project.json
        exec(`${isGif ? 'gif2webp' : 'cwebp'} -q ${WEPB_QUALITY} ${srcFile} -o ${outFile}`, (error, stdout, stderr) => {
            if (error)
                reject(error.message);
            else {
                // Update project.json
                project.coverWebp = coverWebp;
                fs.renameSync(projectFile, `${projectFile}.bak`);
                try {
                    fs.writeFileSync(projectFile, JSON.stringify(project, null, 2));
                } catch (err) {
                    return reject(`Webp file created, but "project.json" can't be updated due to: ${err}`);
                }
                resolve(`${stderr} ${stdout}`);
            }
        });
    });
}

/**
 * Main function 
 */
async function main() {

    // Check params
    const base = process.argv.length > 2 && process.argv[2];
    const project = process.argv.length > 3 && process.argv[3];

    if (!base || !project) {
        console.log('USAGE: createWebpCover [repoPath] [projectName]');
        return;
    }

    // Check if the repository already exists
    const basePath = path.resolve(process.cwd(), base);
    if (!fs.existsSync(basePath) || !fs.statSync(basePath).isDirectory) {
        console.log(`ERROR: "${base}" is not a valid repo path`);
        return;
    }

    // Check if the project folder already exists
    const projectPath = path.join(basePath, project);
    if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory || !fs.existsSync(path.join(projectPath, 'project.json'))) {
        console.log(`ERROR: "${projectPath}" is not a valid project path!`);
        return;
    }

    // Perform conversion
    return await generateWebp(projectPath)
        .then(result => {
            console.log(`Webp file successfully created!`);
        })
        .catch(err => {
            console.log(`ERROR: "${err}"`);
        });

}

main();
