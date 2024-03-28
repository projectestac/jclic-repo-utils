#!/usr/bin/env node

/**
 * buildsitemap_wp.js
 * Builds an [XM sitemap](https://www.sitemaps.org/) with all the files and activities currently published on the ClicZone (WP version)
 * Sitemap files will be stored in XML format (uncompressed)
 */

import fs from 'node:fs';
import path from 'node:path';
import xml from 'xml';

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
const langs = ['ca', 'es', 'en'];

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
          { loc: 'https://projectes.xtec.cat/clic/wp-content/uploads/usu2636/jclic_site_files.xml' },
          { lastmod: now },
        ]
      },
      ...langs.map(lang => ({
        sitemap: [
          { loc: `https://projectes.xtec.cat/clic/wp-content/uploads/usu2636/sitemap_activities_${lang}.xml` },
          { lastmod: now },
        ]
      })),
    ]
  }
  return `${xmlHeader}\n${xml(data, { indent: '  ' })}`;
}


// Main process:
console.log('Updating jclic_site.xml');
fs.writeFileSync(path.resolve('jclic_site.xml'), buildIndex());
