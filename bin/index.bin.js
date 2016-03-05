#!/usr/bin/env node

/**
 * Dependencies
 */
var argv    = require('optimist').argv
  , scraper = require('./../index.js');
  
if (!argv.url && !argv.directory) {
  console.log("Please provide --url and --directory arguments.");
} else if (!argv.url) {
  console.log("Please provide --url argument.");
} else if (!argv.directory) {
  console.log("Please provide --directory argument.");
}
  
if (!argv.url || !argv.directory) {
  process.exit(1);
}

scraper(argv.url, argv.directory, (typeof argv.results !== 'undefined')); 