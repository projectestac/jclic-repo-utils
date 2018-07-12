#!/usr/bin/env node

/**
 * buildact.js
 * Builds an [XM sitemap](https://www.sitemaps.org/) with all the activities currently published on the ClicZone
 */

const fetch = require('node-fetch');
const xml = require('xml');
const fs = require('fs');

const langs = ['ca', 'es', 'en'];
const projectsList = 'http://localhost:8080/projects/projects.json';
//const projectsList = 'https://clic.xtec.cat/projects/projects.json';
const repo = 'https://clic.xtec.cat/repo/index.html';
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

fetch(projectsList)
  .then(res => res.json())
  .then(projects => {

    // SITEMAP
    langs.forEach(lang => {
      // Build the data container with its xml schema headers
      let data = {
        urlset: [
          {
            _attr: {
              'xmlns': 'http://www.google.com/schemas/sitemap/0.84',
              'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
              'xsi:schemaLocation': 'http://www.google.com/schemas/sitemap/0.84 http://www.google.com/schemas/sitemap/0.84/sitemap.xsd',
            }
          }
        ]
      };

      // Main repo URL for current language
      data.urlset.push({
        url: [
          { loc: `${repo}?lang=${lang}` },
          { changefreq: 'daily' },
          { priority: 1 },
        ]
      });

      projects.forEach(prj => {
        // Push each project data
        data.urlset.push({
          url: [
            { loc: `${repo}?lang=${lang}&prj=${prj.path}` },
            { changefreq: 'monthly' },
            { priority: 0.5 },
          ],
        });
      });

      // Write the sitemap XML file for the current language
      const fileName = `sitemap_activities_${lang}.xml`;
      fs.writeFile(
        fileName,
        `${xmlHeader}\n${xml(data, { indent: '  ' })}`,
        err => {
          if (err)
            throw err;
          console.log(`Fitxer "${fileName}" creat amb èxit!`);
        }
      );
    });

    // ATOM
    const uuids = {
      ca: 'd38a6836-512d-4de7-871d-504075b84e8d',
      es: 'd26cef1d-dd91-4c89-8cac-d13e813913f0',
      en: 'a60170c8-a010-4cc8-ac36-75cc4786d24e',
    }
    langs.forEach(lang => {
      // Build the data container with its xml schema headers
      let data = {
        feed: [
          { _attr: { 'xmlns': 'http://www.w3.org/2005/Atom' } },
          { title: `JClic activities (${lang})` },
          { subtitle: `A subtitle...` },
          { link: [{ _attr: { href: `https://clic.xtec.cat/repo/index.html?lang=${lang}.xml` } }] },
          { link: [{ _attr: { href: `https://clic.xtec.cat/repo/feed_${lang}.xml`, rel: 'self' } }] },
          { id: uuids[lang] },
          {updated: new Date().toISOString()}
        ]
      };

      projects.forEach(prj => {
        // Push each project data
        data.feed.push({
          entry: [
            // S'ha d'actualitzar!!
            { loc: `${repo}?lang=${lang}&prj=${prj.path}` },
            { changefreq: 'monthly' },
            { priority: 0.5 },
          ],
        });
      });

      // Write the atom XML file for the current language
      const fileName = `atom_activities_${lang}.xml`;
      fs.writeFile(
        fileName,
        `${xmlHeader}\n${xml(data, { indent: '  ' })}`,
        err => {
          if (err)
            throw err;
          console.log(`Fitxer "${fileName}" creat amb èxit!`);
        }
      );
    });
  })
  .catch(err => {
    console.log(`ERROR: ${err}`);
  });
