/* global module:true */

const fs = require('fs')
const recursive = require('recursive-readdir')
const JSZip = require('jszip')

// Build the stop words list
const SortedArray = require('sorted-array')
const stopWords = new SortedArray(Object.values(require('./stopwords.json')).reduce((acc, val) => acc.concat(val), []))

// Use `jsdom` for providing global 'document' and 'window' to jQuery
const jsdom = require('jsdom')
global.document = new jsdom.JSDOM()
const $ = require('jquery')(global.document.window)

class Inspector {

  constructor() {
    this.$docs = []
  }

  addProject(doc) {
    this.$docs.push($(doc).children('JClicProject'))
    return this
  }

  addProjectFromFile(path) {
    return fs.statSync(path).isDirectory() ? this.addProjectsFromPath(path) :
      path.toLowerCase().endsWith('.zip') ? this.addProjectFromZipFile(path) :
        new Promise((resolve, reject) => {
          fs.readFile(path, 'utf8', (err, data) => {
            if (err)
              reject(err)
            else
              resolve(this.addProjectFromString(data))
          })
        })
  }

  addProjectFromZipFile(path) {
    return new Promise((resolve, reject) => {
      const zip = new JSZip()
      fs.readFile(path, (err, data) => {
        if (err)
          reject(err)
        else
          zip.loadAsync(data).then(zipFile => {
            const fileName = Object.keys(zipFile.files).find(fn => fn.endsWith('.jclic'))
            if (fileName)
              zipFile.file(fileName).async("string")
                .then(data => resolve(this.addProjectFromString(data)))
                .catch(err => reject(err))
            else
              reject(`File "${path}" don\'t has any JClic project!`)
          })
      })
    })
  }

  addProjectsFromPath(path) {
    return recursive(path,
      [(file, stats) => !stats.isDirectory() && !file.endsWith('.jclic') && !file.endsWith('.jclic.zip')])
      .then(files => Promise.all(files.map(file => this.addProjectFromFile(file))))
      .then((/* array with repeated 'this' */) => this)
  }

  addProjectFromString(xml) {
    // Parse string into a XMLDOM object
    const parser = new global.document.window.DOMParser()
    return this.addProject(parser.parseFromString(xml, 'text/xml'))
  }

  getProjectProperties($doc) {
    const $settings = $doc.find('settings')
    return {
      name: $doc.attr('name'),
      version: $doc.attr('version'),
      title: $settings.find('title').text(),
      description: $settings.find('description').text(),
    }
  }

  getAllActivityText() {
    return this.$docs.map($doc => $doc.find('activities').text()).join(' ')
  }

  static getActivityText($doc, activity) {
    return $doc.find(`activity [name=${activity}]`).text()
  }

  getAllWords() {
    return this.getAllActivityText()
      .split(/[\s.…|;,_<>"“”«»'´’‘~+\-–—=%¿?¡!:/\\()\[\]{}$£*0-9\u2022]/)
      .map(word => {
        word = word.trim().toLowerCase()
        return (word.length > 1 && stopWords.search(word) === -1) ? word : null
      }, [])
      .sort()
      .filter((v, n, arr) => v !== null && n > 0 && v !== arr[n - 1] ? true : false)
  }

}

module.exports = Inspector
