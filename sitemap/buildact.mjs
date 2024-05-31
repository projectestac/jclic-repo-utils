#!/usr/bin/env node

/**
 * buildact.js
 * Builds an [XM sitemap](https://www.sitemaps.org/) with all the activities currently published on the ClicZone
 */

// import fetch from 'node-fetch';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import xml from 'xml';
// import util from 'node:util';

// const stat = util.promisify(fs.stat);
// const readFile = util.promisify(fs.readFile);

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

// const projectsList = 'https://clic.xtec.cat/projects/projects.json';
const projectsBasePath = '../../projects';
const repoBase = 'https://clic.xtec.cat/repo';
const newRepoBase = 'https://projectes.xtec.cat/clic';
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

const today = (new Date()).toISOString().substring(0, 10);

/**
 * Truncates the provided text to the specified `maxlength`, converting
 * HTML to plain text and adding the ellipsis sign when needed.
 * @param {string} text - The text to be processed
 * @param {number=} maxLength - Max length of resulting expression
 * @param {number=} minTruncLength - Minimum length when truncating
 * @returns {string} - The truncated text
 */
function summarize(text = '', maxLength = 1024, minTruncLength = 800) {
  if (text.indexOf('<') >= 0) {
    // If the provided text has HTML content, reduce it to plain text.
    text = /<\w*>/.test(text) ? text : text.replace(/\n/g, '<br>\n');
    const dom = new JSDOM(`<!DOCTYPE html><body>${text}</body>`);
    text = dom.window.document.querySelector('body').textContent;
  }
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ ][ ][ ]*/g, ' ')
    .replace(/[\n\r][ \n\r][ \n\r]*/g, '\n');
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    const p = Math.max(text.lastIndexOf(' '), text.lastIndexOf('.'), text.lastIndexOf(','), text.lastIndexOf('\n'));
    if (p > minTruncLength)
      text = `${text.substring(0, p).trim()} …`;
  }
  return text;
}

function main() {
  console.log(`Loading projects`);
  const projects = JSON.parse(fs.readFileSync(path.resolve(projectsBasePath, 'projects.json')));
  projects.forEach(prj => {
    const prjFile = path.resolve(projectsBasePath, prj.path, 'project.json');
    const stat = fs.statSync(prjFile);
    prj.lastModified = (new Date(stat.mtime)).toISOString().substring(0, 10);
    const project = JSON.parse(fs.readFileSync(prjFile));
    prj.description = project.description || {};
  });

  langs.forEach(lang => {
    // SITEMAP
    console.log(`Processing language: '${lang}'`);
    let sitemapData = {
      urlset: [
        // XML schema headers
        {
          _attr: {
            'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
          }
        },
        // Main repo URL for current language
        {
          url: [
            { loc: `${newRepoBase}/${lang}/repo/` },
            { changefreq: 'daily' },
            { priority: 1 },
            { lastmod: today },
          ]
        },
        ...projects.map(prj => ({
          url: [
            { loc: `${newRepoBase}/${lang}/repo/?prj=${prj.path}` },
            { changefreq: 'monthly' },
            { priority: 0.5 },
            { lastmod: prj.lastModified }
          ]
        })),
      ],
    };

    // Write the sitemap XML file
    const sitemapFileName = `sitemap_activities_${lang}.xml`;
    console.log(`Writting ${sitemapFileName}`);
    fs.writeFileSync(sitemapFileName, `${xmlHeader}\n${xml(sitemapData, { indent: '  ' })}`);

    // ATOM
    const tagBase = 'tag:clic@xtec.cat,2019:projects';

    let atomData = {
      feed: [
        { _attr: { 'xmlns': 'http://www.w3.org/2005/Atom' } },
        { title: dict[lang].title },
        { subtitle: dict[lang].subTitle },
        { link: [{ _attr: { href: `${newRepoBase}/${lang}/repo/`, hreflang: lang } }] },
        { link: [{ _attr: { href: `${repoBase}/atom_activities_${lang}.xml`, rel: 'self', hreflang: lang } }] },
        {
          author: [
            { name: dict[lang].author },
            { uri: 'https://projectes.xtec.cat/clic/' },
            { email: 'clic@xtec.cat' },
          ]
        },
        { id: `${tagBase}:${lang}` },
        { updated: new Date().toISOString() },
        ...projects.map(prj => ({
          entry: [
            { title: prj.title },
            { link: [{ _attr: { href: `${newRepoBase}/${lang}/repo/?prj=${prj.path}`, rel: 'alternate', hreflang: lang } }] },
            { id: `${tagBase}:${lang}:${prj.path}` },
            { updated: prj.lastModified },
            // Currently removed due to problems with 'summarize' and some descriptions
            // { summary: summarize(prj.description[lang]) },
            { author: [{ name: prj?.author?.trim() || '' }] }
          ]
        })),
      ]
    };

    // Write the Atom XML file for the current language
    const atomFileName = `atom_activities_${lang}.xml`;
    console.log(`Writting ${atomFileName}`);
    fs.writeFileSync(atomFileName, `${xmlHeader}\n${xml(atomData, { indent: '  ' })}`);
  });
};

main();
