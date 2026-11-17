// selfCheck.js - run with:  npm run check
// Needs no installed packages. It checks that:
//   1. every record in backend/data/*.json passes the schema rules,
//   2. every image path used in the data exists on disk,
//   3. every local link, image, CSS and script in the HTML files exists.
const fs = require('fs');
const path = require('path');
const { resources } = require('./schemas');
const { validateAgainstSchema } = require('./validators');
const store = require('../services/jsonStore');

const root = path.join(__dirname, '..', '..');
const frontend = path.join(root, 'frontend');
let problems = 0;

function fail(message) { problems += 1; console.log('  PROBLEM: ' + message); }

function fileExistsForUrl(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (clean === '') { return true; }
  if (clean.indexOf('/uploads/') === 0) { return fs.existsSync(path.join(root, 'backend', clean)); }
  return fs.existsSync(path.join(frontend, clean));
}

console.log('1. Checking data files against schemas...');
Object.keys(resources).forEach(function (name) {
  const config = resources[name];
  store.findAll(config.collection).forEach(function (item) {
    const result = validateAgainstSchema(config.fields, item);
    if (!result.isValid) { fail(name + ' "' + item.id + '": ' + JSON.stringify(result.errors)); }
    config.fields.filter(function (f) { return f.type === 'image'; }).forEach(function (f) {
      if (item[f.name] && item[f.name].charAt(0) === '/' && !fileExistsForUrl(item[f.name])) {
        fail(name + ' "' + item.id + '" uses a missing image: ' + item[f.name]);
      }
    });
  });
});

console.log('2. Checking links, images, styles and scripts in HTML files...');
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce(function (list, entry) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { return list.concat(entry.name === 'assets' ? [] : htmlFiles(full)); }
    return entry.name.endsWith('.html') ? list.concat(full) : list;
  }, []);
}
htmlFiles(frontend).forEach(function (file) {
  const html = fs.readFileSync(file, 'utf8');
  const pattern = /(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const url = match[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) { continue; }
    if (!fileExistsForUrl(url)) { fail(path.relative(frontend, file) + ' points to missing file: ' + url); }
  }
});

// Links built inside JavaScript (the navigation menu).
const nav = fs.readFileSync(path.join(frontend, 'js', 'navigation.js'), 'utf8');
(nav.match(/href: '([^']+)'/g) || []).forEach(function (entry) {
  const url = entry.slice(7, -1);
  if (!fileExistsForUrl(url)) { fail('navigation.js links to missing page: ' + url); }
});

console.log(problems === 0 ? 'All checks passed.' : problems + ' problem(s) found.');
process.exit(problems === 0 ? 0 : 1);
