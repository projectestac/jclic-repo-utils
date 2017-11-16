#!/usr/bin/env node

/**
 * scanDB.js
 * Scans the clicZone mySQL database (running in a virtual host)
 * creating two files: `diccionari.json` and `descriptors.json`
 * 
 */

const mysql = require('mysql');
const fs = require('fs');

const con = mysql.createConnection({
  host: 'agora-virtual.xtec.cat',
  user: 'root',
  password: 'agora',
  database: 'clic'
});

con.connect(err => {
  if (err)
    throw err
  console.log('Connected!')
})

const diccionari = { ca: {}, es: {}, en: {} }
const descriptors = {};

con.query('SELECT * FROM `diccionari_descriptors`', (err, rows) => {
  if (err)
    console.log(`ERROR in query: ${err}`)
  else
    rows.forEach(row => {
      diccionari[row.idioma][row.codi] = row.text
    })
})

con.query('SELECT * FROM `descriptors_act`', (err, rows) => {
  if (err)
    console.log(`ERROR in query: ${err}`)
  else
    rows.forEach(row => {
      if (typeof descriptors[row.activitat] === 'undefined')
        descriptors[row.activitat] = []
      descriptors[row.activitat].push(row.descriptor)
    })
})

con.end(err => {
  if (err)
    console.log(`ERROR: ${err}`)
  console.log('Writting `diccionari.json`...')
  fs.writeFileSync('diccionari.json', JSON.stringify(diccionari))
  console.log('Writting `descriptors.json`...')
  fs.writeFileSync('descriptors.json', JSON.stringify(descriptors))
  console.log('That\'s all folks!')
})
