#!/usr/bin/env node

/**
 * checkProjectFolders.js
 * JClic repo utils command-line interface.
 * 
 * Scans the given folder for `project.json` files and creates missing 'index.html'
 * and 'imsmanifest.xml' files if needed.
 * 
 */

const MockBrowser = require('mock-browser').mocks.MockBrowser;
const mock = new MockBrowser();
global.window = mock.getWindow();
global.navigator = mock.getNavigator();

const fs = require('fs');
const path = require('path');
const app = require('../app');

const usage = [
    'Usage: checkProjectFolders.js path/to/project/folder ...',
    'Scans the folders for "project.json" files and creates',
    'missing index.html and imsmanifest.xml files if needed'
].join('\n');

const args = process.argv;

if (args.length < 3) {
    console.error(usage);
    process.exit(1);
}

const cwd = process.cwd();
const files = args.slice(2);

// iterate over each file and convert JSON5 files to JSON:
files.forEach(file => {
    console.log(file);
    /*
      var path = Path.resolve(cwd, file);
      var basename = Path.basename(path, '.json5');
      var dirname = Path.dirname(path);
  
      var json5 = FS.readFileSync(path, 'utf8');
      var obj = JSON5.parse(json5);
      var json = JSON.stringify(obj, null, 4); // 4 spaces; TODO configurable?
  
      path = Path.join(dirname, basename + '.json');
      FS.writeFileSync(path, json, 'utf8');
      */
});


const processDirectory = (dir, done) => {

    var prj = require(dir + '/project.json');
    var projectBase = path.dirname(prj.mainFile);
    iterateDir(dir, dir, (err, results) => {
        if (err)
            throw err;
        var files = results.filter(value => {
            var s = path.dirname(value);
            return s === '.' || s.startsWith(projectBase);
        }).sort();

        prj.files = files;

        fs.writeFile(dir + '/project.json', JSON.stringify(prj, null, 2), done);

    });
};

const iterateDir = (dir, base, done) => {
    var results = [];
    fs.readdir(dir, (err, list) => {
        if (err)
            throw err;
        var pending = list.length;
        if (!pending)
            return done(null, results);
        list.forEach(file => {
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
                if (err)
                    throw err;
                if (stat && stat.isDirectory()) {
                    iterateDir(file, base, (err, res) => {
                        if (err)
                            throw err;
                        results = results.concat(res);
                        if (!--pending)
                            done(null, results);
                    });
                } else {
                    results.push(path.relative(base, file));
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};

console.log(app.assets);

