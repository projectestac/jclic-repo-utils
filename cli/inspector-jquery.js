/* global module:true */

const fs = require('fs')
const recursive = require('recursive-readdir')
const JSZip = require('jszip')
const JClic = require('jclic')

// Build the stop words list
const SortedArray = require('sorted-array')
const stopWords = new SortedArray(Object.values(require('./stopwords.json')).reduce((acc, val) => acc.concat(val), []))

// Use the jQuery object provided by JClic
const { $ } = JClic;

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
    // const parser = new global.document.window.DOMParser()
    /* global DOMParser */
    const parser = new DOMParser()
    return this.addProject(parser.parseFromString(xml, 'text/xml'))
  }

  getProjectProperties($doc) {
    const $settings = $doc.find('settings')
    return {
      name: $doc.attr('name'),
      version: $doc.attr('version'),
      title: $settings.find('title').text(),
      authors: $settings.find('author').toArray().reduce((result, author) => `${result}${result ? ',' : ''}${$(author).attr('name')}`, ''),
      organizations: $settings.find('organization').toArray().reduce((result, org) => `${result}${result ? ',' : ''}${$(org).attr('name')}`, ''),
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
    const base = [this.getAllActivityText()];
    this.$docs.forEach($doc => {
      const props = this.getProjectProperties($doc)
      base.push(props.authors || '')
      base.push(props.organizations || '')
    });
    return base.join(' ')
      .split(/[\s.…|;,_<>"“”«»'´’‘~+\-–—―=%¿?¡!:/\\()\[\]{}$£*0-9\u2022]/)
      .map(word => {
        word = word.trim().toLowerCase()
        return (word.length > 1 && stopWords.search(word) === -1) ? word : null
      }, [])
      .sort()
      .filter((v, n, arr) => v !== null && n > 0 && v !== arr[n - 1] ? true : false)
  }

  static getNumActivities($doc) {
    return $doc.find('activities > activity').length
  }

  getAllActivities() {
    return this.$docs.reduce((n, $doc) => n + Inspector.getNumActivities($doc), 0)
  }

  static getNumMedia($doc) {
    return $doc.find('mediaBag > media').length
  }

  getAllMedia() {
    return this.$docs.reduce((n, $doc) => n + Inspector.getNumMedia($doc), 0)
  }

}

module.exports = Inspector
