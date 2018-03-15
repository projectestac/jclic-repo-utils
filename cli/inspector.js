/* global module:true */

const fs = require('fs')
const stopWords = Object.values(require('./stopwords.json')).reduce((acc, val) => acc.concat(val), []).sort()
const stopWordsLength = stopWords.length

// Use mock-browser as a browser simulator
const MockBrowser = require('mock-browser').mocks.MockBrowser
const mock = new MockBrowser()
global.window = mock.getWindow()
global.document = mock.getDocument()
global.Image = function () { }
global.Audio = function () { }

// Use `xmldom` as DOM parser
global.DOMParser = require('xmldom').DOMParser

// amdefine allows to load AMD modules into node.js modules
require('amdefine/intercept')

const JClic = require('jclic')


class Inspector {

  constructor(project) {
    this.project = project
  }

  static CreateInspector(path) {
    // Read file and parse it into a DOM object
    const xml = fs.readFileSync(path, 'utf8')
    const doc = new DOMParser().parseFromString(xml)

    // Create a JClicProject and initialize it with the file contents
    const project = new JClic.JClicProject()
    project.setProperties(JClic.$(doc).find('JClicProject'), path, null, {})
    const result = new Inspector(project)
    result.path = path
    return result
  }

  getNumActivities() {
    return Object.keys(this.project._activities).length
  }

  getNumMedia() {
    return Object.keys(this.project.mediaBag.elements).length
  }

  getProjectProperties() {
    return {
      file: this.path,
      name: this.project.name,
      version: this.project.version,
      title: this.project.settings.title,
      description: this.project.settings.description,
      languages: this.project.settings.languages,
      skin: this.project.settings.skinFileName
    }
  }

  getAllActivityText() {
    return Object.keys(this.project._activities).map(act => this.getActivityText(act))
  }

  getActivityText(activity) {
    const result = []

    if (typeof activity === 'string')
      activity = this.project.getActivity(activity)

    if (activity.description)
      result.push(activity.description)

    if (activity.messages)
      Object.keys(activity.messages).forEach(msg => {
        if (activity.messages[msg].text)
          result.push(activity.messages[msg].text)
      })

    if (activity.abc)
      Object.keys(activity.abc).forEach(abb => {
        activity.abc[abb].activeBoxContentArray.forEach(bc => {
          if (bc.text)
            result.push(bc.text)
        })
      })

    // Textgrid content
    if (activity.tgc)
      result.push(...activity.tgc.text)

    if (activity.checkButtonText)
      result.push(activity.checkButtonText)

    if (activity.prevScreenText)
      result.push(activity.prevScreenText)

    if (activity.document)
      result.push(activity.document.getRawText())

    return result
  }

  getAllWords() {
    const texts = this.getAllActivityText()
    const result = []
    texts.forEach(txArray => {
      txArray.forEach(txt => {
        txt.split(/[\s.;,_<>"'+\-=%?¡!:/\\()*0-9\u2022]/).forEach(word => {
          console.log(`"${word}"`)
          word = word.trim().toLowerCase()
          if (word.length > 1 && !Inspector.isStopWord(word))
            result.push(word)
        })
      })
    })
    return result.sort().filter((v, n, arr) => n > 0 && v !== arr[n - 1] ? true : false)
  }

  static isStopWord(word) {
    let
      firstIndex = 0,
      lastIndex = stopWordsLength - 1,
      middleIndex = Math.floor((lastIndex + firstIndex) / 2)
    while (stopWords[middleIndex] != word && firstIndex < lastIndex) {
      if (word < stopWords[middleIndex])
        lastIndex = middleIndex - 1    
      else if (word > stopWords[middleIndex])
        firstIndex = middleIndex + 1    
      middleIndex = Math.floor((lastIndex + firstIndex) / 2)
    }
    return stopWords[middleIndex] === word
  }
  
}

module.exports = Inspector
