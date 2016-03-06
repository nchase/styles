#!/usr/bin/env node

// todo: add an option manager like node-optimist.

var ejs = require('ejs');
var fs = require('fs');
var execSync = require('child_process').execSync;
var data = require('./data.js');
var matchers = require('./matchers');

var contentPath = process.argv[2];

if (!contentPath) {
  console.error('error: no path provided.')
  process.exit(1);
}

var frame = contentPath;

var content = fs.readFileSync(contentPath).toString();

var layoutPath = './src/layout.html';

var layout = fs.readFileSync(layoutPath).toString();

var header = '';
var footer = '';

if (process.argv[3]) {
  header = fs.readFileSync(process.argv[3]).toString();
}

if (process.argv[4]) {
  footer = fs.readFileSync(process.argv[4]).toString();
}

var titleMatch = matchers.getTitleFs(contentPath);
var title = '';

if (titleMatch) {
  title = titleMatch[1];
}

content = execSync(
  `
    cat ${contentPath} |
    node columnize.js |
    pandoc --from=markdown --to=html
  `
).toString();

process.stdout.write(ejs.render(layout, {
  data: {
    styles: data.styles
  },
  frameContent: content,
  filename: 'src/src/',
  index: contentPath.match('index.md') ? true : undefined,
  header: header,
  footer: footer,
  title: title,
  prefix: process.env.prefix || 'src/',
  requestStyle: '',
  bodyClass: data.bodyClass({
    frame: frame,
    singleColumn: matchers.singleColumn(content)
  }),
  notrack: false,
  published: true
}));
