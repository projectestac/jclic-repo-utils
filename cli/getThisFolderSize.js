

const Promise = require('promise')
const fs = require('fs')
const path = require('path')
const readdir = Promise.denodeify(fs.readdir)
const stat = Promise.denodeify(fs.stat)

module.exports = function (dir) {
  return readdir(dir)
  .then(files => Promise.all(files.map(file => stat(path.resolve(dir, file)))))
  .then(fstats => fstats.reduce((t, fstat) => t + fstat.isFile() ? fstat.size : 0, 0))
}