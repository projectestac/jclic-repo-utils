#!/usr/bin/env node

/**
 * buildsitemap.js
 * Builds an [XM sitemap](https://www.sitemaps.org/) with all the files and activities currently published on the ClicZone
 * Sitemap files will be stored in './gz'
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import xml from 'xml';

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
const langs = ['ca', 'es', 'en'];

// Delete a folder and all its content, recursively
const deleteFolder = folderPath => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.resolve(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory())
        deleteFolder(curPath);
      else {
        console.log(`Deleting file: ${curPath}`);
        fs.unlinkSync(curPath);
      }
    });
    console.log(`Deleting folder: ${folderPath}`);
    fs.rmdirSync(folderPath);
  }
}

// Compresses the given file in GZip format
const gzipFile = (fName, srcDir, outDir) => {
  const inFileName = path.resolve(srcDir, fName);
  const outFileName = `${path.resolve(outDir, fName)}.gz`;
  console.log(`Compressing ${inFileName} into ${outFileName}`);
  const buffer = fs.readFileSync(inFileName);
  fs.writeFileSync(outFileName, zlib.gzipSync(buffer));
}

// Builds site.xml
const buildIndex = () => {
  const now = new Date().toISOString();
  const data = {
    sitemapindex: [
      {
        _attr: {
          // 'xmlns': 'http://www.google.com/schemas/sitemap/0.84',
          // 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          // 'xsi:schemaLocation': 'http://www.google.com/schemas/sitemap/0.84 http://www.google.com/schemas/sitemap/0.84/siteindex.xsd'
          'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        }
      },
      {
        sitemap: [
          { loc: 'https://clic.xtec.cat/jclic_site_files.xml.gz' },
          { lastmod: now },
        ]
      },
      ...langs.map(lang => ({
        sitemap: [
          // { loc: `https://clic.xtec.cat/atom_activities_${lang}.xml.gz` },
          { loc: `https://clic.xtec.cat/sitemap_activities_${lang}.xml.gz` },
          { lastmod: now },
        ]
      })),
    ]
  }
  return `${xmlHeader}\n${xml(data, { indent: '  ' })}`;
}


// Main process:
const srcPath = path.resolve('.');
const gzPath = path.resolve(srcPath, 'gz');
deleteFolder(gzPath);

console.log(`Creating folder ${gzPath}`);
fs.mkdirSync(gzPath);

console.log('Updating jclic_site.xml');
fs.writeFileSync(path.resolve('jclic_site.xml'), buildIndex());

gzipFile('jclic_site.xml', srcPath, gzPath);
langs.forEach(lang => {
  gzipFile(`atom_activities_${lang}.xml`, srcPath, gzPath);
  gzipFile(`sitemap_activities_${lang}.xml`, srcPath, gzPath);
});
gzipFile('jclic_site_files.xml', srcPath, gzPath);
