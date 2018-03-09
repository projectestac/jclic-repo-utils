#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const recursive = require('recursive-readdir')
const SortedArray = require('sorted-array')

const FILE_NAME = "all-words.txt"

const base = (process.argv && process.argv.length > 2) ? path.resolve(process.cwd(), process.argv[2]) : null
const csvBase = (process.argv && process.argv.length > 3) ? path.resolve(process.cwd(), process.argv[3]) : null

if (!base || !fs.statSync(base).isDirectory())
  console.log('Usage: countWords [folder] [csv-base]')
else
  recursive(base,
    [(file, stats) => !stats.isDirectory() && !(path.basename(file) === 'project.json')])
    .then(projects => {
      const result = {}
      projects.forEach(project => {
        const prjBase = path.dirname(project)
        const wordsFile = path.resolve(prjBase, FILE_NAME)
        if (fs.existsSync(wordsFile) && fs.statSync(wordsFile).isFile()) {
          console.log(`Processing ${wordsFile}`)
          const prj = JSON.parse(fs.readFileSync(project))
          const langCodes = prj.langCodes || ['en']
          const words = fs.readFileSync(wordsFile, 'utf-8').split(' ')
          words.forEach(word => {
            langCodes.forEach(code => {
              if (!result[code])
                result[code] = { sortedWords: new SortedArray([]), words: [], hits: [] }
              if (result[code].sortedWords.search(word) === -1) {
                result[code].sortedWords.insert(word)
                result[code].words.push(word)
                result[code].hits.push(1)
              } else {
                const k = result[code].words.indexOf(word)
                result[code].hits[k]++
              }
            })
          })
        }

      })

      Object.keys(result).forEach(lang => {
        const csvFile = `${csvBase}-${lang}.csv`
        const writer = fs.createWriteStream(csvFile)
        writer.write(`"WORD","HITS"\n`)
        result[lang].words.forEach((word, n) => writer.write(`"${word}","${result[lang].hits[n]}"\n`))
        writer.end()
        writer.on('finish', () => console.log(`File ${csvFile} created`))
      })
    })



