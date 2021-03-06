#!/usr/bin/env node

/**
 * buildact.js
 * Builds an [XM sitemap](https://www.sitemaps.org/) with all the activities currently published on the ClicZone
 */

const fetch = require('node-fetch');
const xml = require('xml');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

const langs = ['ca', 'es', 'en'];
const dict = {
  ca: {
    langName: 'català',
    title: 'Activitats JClic',
    subTitle: 'Biblioteca d\'activitats educatives obertes creades amb JClic',
    author: 'Projecte Clic - Xarxa Telemàtica Educativa de Catalunya (XTEC)',
  },
  es: {
    langName: 'español',
    title: 'Actividades JClic',
    subTitle: 'Biblioteca de actividades educativas abiertas creadas con JClic',
    author: 'Proyecto Clic - Red Telemática Educativa de Cataluña (XTEC)',
  },
  en: {
    langName: 'English',
    title: 'JClic activities',
    subTitle: 'Library of open educational activities created with JClic',
    author: 'Clic Project - Catalan Educational Telematic Network (XTEC)',
  },
};

const projectsList = 'https://clic.xtec.cat/projects/projects.json';
const projectsBasePath = '/dades/zonaClic/projects';
const repoBase = 'https://clic.xtec.cat/repo';
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';



/**
 * Truncates the provided text to the specified `maxlength`, converting
 * HTML to plain text and adding the ellipsis sign when needed.
 * @param {string} text - The text to be processed
 * @param {number=} maxLength - Max length of resulting expression
 * @param {number=} minTruncLength - Minimum length when truncating
 * @returns {string} - The truncated text
 */
const summarize = (text = '', maxLength = 1024, minTruncLength = 800) => {
  if (text.indexOf('<') >= 0) {
    // If the provided text has HTML content, reduce it to plain text.
    text = /<\w*>/.test(text) ? text : text.replace(/\n/g, '<br>\n');
    const dom = new JSDOM(`<!DOCTYPE html><body>${text}</body>`);
    text = dom.window.document.querySelector('body').textContent;
  }
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&lt;/, '<')
    .replace(/&gt;/, '>')
    .replace(/[ ][ ][ ]*/g, ' ')
    .replace(/[\n\r][ \n\r][ \n\r]*/g, '\n');
  if (text.length > maxLength) {
    text = text.substr(0, maxLength);
    const p = Math.max(text.lastIndexOf(' '), text.lastIndexOf('.'), text.lastIndexOf(','), text.lastIndexOf('\n'));
    if (p > minTruncLength)
      text = `${text.substr(0, p).trim()} …`;
  }
  return text;
}



// Main process start here:
console.log(`Loading projects`);
(
  projectsBasePath
    ? readFile(path.join(projectsBasePath, 'projects.json')).then(text => JSON.parse(text))
    : fetch(projectsList).then(res => res.json())
)
  .then(projects => {
    // GET 'LAST MODIFIED' DATE OF EACH PROJECT
    console.log('Getting projects data...');
    return projectsBasePath ?
      Promise.all(projects.map(prj => {
        const prjPath = path.join(projectsBasePath, prj.path, 'project.json');
        return stat(prjPath)
          .then(stat => {
            prj.lastModified = new Date(stat.mtime);
          })
          .then(() => readFile(prjPath))
          .then(text => {
            const fullPrj = JSON.parse(text);
            prj.description = fullPrj.description || {};
            return prj;
          });
      })) :
      projects.map(prj => {
        prj.lastModified = new Date();
        prj.summary = '';
        return prj;
      });
  })
  .then(projects => {
    // SITEMAP
    console.log('Building sitemaps');
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
          { loc: `${repoBase}/index.html?lang=${lang}` },
          { changefreq: 'daily' },
          { priority: 1 },
        ]
      });

      projects.forEach(prj => {
        // Push each project data
        data.urlset.push({
          url: [
            { loc: `${repoBase}/index.html?lang=${lang}&prj=${prj.path}` },
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
    console.log('Building Atom RSS files');
    const tagBase = 'tag:clic@xtec.cat,2019:projects';
    langs.forEach(lang => {
      // Build the data container with its xml schema headers
      let data = {
        feed: [
          { _attr: { 'xmlns': 'http://www.w3.org/2005/Atom' } },
          { title: dict[lang].title },
          { subtitle: dict[lang].subTitle },
          { link: [{ _attr: { href: `${repoBase}/index.html?lang=${lang}`, hreflang: lang } }] },
          { link: [{ _attr: { href: `${repoBase}/atom_activities_${lang}.xml`, rel: 'self', hreflang: lang } }] },
          {
            author: [
              { name: dict[lang].author },
              { uri: 'https://clic.xtec.cat/' },
              { email: 'clic@xtec.cat' },
            ]
          },
          { id: `${tagBase}:${lang}` },
          { updated: new Date().toISOString() },
        ]
      };

      projects.forEach(prj => {
        // Push each project data
        const entry = [
          { title: prj.title },
          { link: [{ _attr: { href: `${repoBase}/index.html?lang=${lang}&prj=${prj.path}`, rel: 'alternate', hreflang: lang } }] },
          { id: `${tagBase}:${lang}:${prj.path}` },
          { updated: prj.lastModified.toISOString() },
          { summary: summarize(prj.description[lang]) },
        ];
        if (prj.author && prj.author.trim())
          entry.push({ author: [{ name: prj.author.trim() }] });

        data.feed.push({ entry });
      });

      // Write the atom XML file for the current language
      const fileName = `atom_activities_${lang}.xml`;
      fs.writeFile(
        fileName,
        `${xmlHeader}\n${xml(data, { indent: '  ' })}`,
        err => {
          if (err)
            throw err;
          console.log(`File "${fileName}" created.`);
        }
      );
    });
  })
  .catch(err => {
    console.log(`ERROR: ${err}`);
  });
