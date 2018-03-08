#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const recursive = require('recursive-readdir')

const FILE_NAME = "all-words.txt"

const base = (process.argv && process.argv.length > 2) ? path.resolve(process.cwd(), process.argv[2]) : null

if (!base || !fs.statSync(base).isDirectory())
  console.log('Usage: countWords [folder]')
else
  recursive(base,
    [(file, stats) => !stats.isDirectory() && !(path.basename(file) === 'project.json')])
    .then(projects => {
      const result = {}
      projects.forEach(project => {
        const prjBase = path.dirname(project)
        const wordsFile = path.resolve(prjBase, FILE_NAME)
        if (fs.statSync(wordsFile).isFile()) {
          const prj = JSON.parse(fs.readFileSync(project))
          const langCodes = prj.langCodes || ['en']
          const words = fs.readFileSync(wordsFile, 'utf-8').split(' ')
          words.forEach(word => {
            langCodes.forEach(code => {
              if (!result[code])
                result[code] = { words: [], hits: [] }
              const k = result[code].words.indexOf(word)
              if (k < 0) {
                result[code].words.push(word)
                result[code].hits.push(1)
              } else {
                result[code].hits[k]++
              }
            })
          })
        }

      })
      console.log(`"LANG","WORD","HITS"`)
      Object.keys(result).forEach(lang => {
        result[lang].words.forEach((word, n)=>{
          console.log(`"${lang}","${word}","${result[lang].hits[n]}"`)
        })
      })
    })



