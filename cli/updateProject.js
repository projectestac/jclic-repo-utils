
/**
 * updateProject.js
 * Updates `project.json` files, changing or adding specific settings and optionally removing specific properties
 */

const fs = require('fs')
const path = require('path')

const updateProject = function (root, folder, dataToMerge, elementsToKill) {

  const projectFile = path.join(root, folder, 'project.json')

  // Load project data
  const prj = JSON.parse(fs.readFileSync(projectFile))

  // Back up original file
  fs.copyFileSync(projectFile, `${projectFile}.bak`)

  // Merge data
  var merged = dataToMerge ? Object.assign(prj, dataToMerge) : prj

  // Remove specified items
  if (elementsToKill)
    elementsToKill.forEach(el => {
      if (merged[el])
        delete merged[el]
    })

  // Change the order of some fields
  if (dataToMerge.descriptors || dataToMerge.descCodes || dataToMerge.relatedTo) {
    const mrg = {}
    Object.keys(merged).forEach(key => {
      mrg[key] = merged[key]
      if (key === 'levelCodes') {
        // Put "descriptors" after levelCodes
        if (merged.descriptors)
          mrg.descriptors = merged.descriptors
        if (merged.descCodes)
          mrg.descCodes = merged.descCodes
      }
      else if (key === 'license') {
        // Put "relatedTo" after license
        if (merged.relatedTo)
          mrg.relatedTo = merged.relatedTo
      }
    })
    merged = mrg
  }

  // Write back the modified json file
  fs.writeFileSync(projectFile, JSON.stringify(merged, null, 2))

}

module.exports = updateProject
