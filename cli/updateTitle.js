
/**
 * updateTitle.js
 * Updates the 'title' field of `project.json`, 'jclic.js/index.html' and 'jclic.js/imsmanifest.xml'
 */

const fs = require('fs')
const path = require('path')

const updateProject = function (root, folder, title) {

  const projectFile = path.join(root, folder, 'project.json')
  const indexFile = path.join(root, folder, 'jclic.js/index.html')
  const manifestFile = path.join(root, folder, 'jclic.js/imsmanifest.xml')

  // Back up original files
  fs.copyFileSync(projectFile, `${projectFile}.bak`)
  fs.copyFileSync(indexFile, `${indexFile}.bak`)
  fs.copyFileSync(manifestFile, `${manifestFile}.bak`)

  // Load project data
  const prj = JSON.parse(fs.readFileSync(projectFile))
  prj.title = title
  
  const indx = fs.readFileSync(indexFile).toString().replace(/<title>.*<\/title>/, `<title>${title}</title>`)

  const manifest = fs.readFileSync(manifestFile).toString().replace(/<title>.*<\/title>/g, `<title>${title}</title>`)

  // Write back the modified files
  fs.writeFileSync(projectFile, JSON.stringify(prj, null, 2))
  fs.writeFileSync(indexFile, indx)
  fs.writeFileSync(manifestFile, manifest)
  
}

module.exports = updateProject
