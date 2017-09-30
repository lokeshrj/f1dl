const { JSDOM } = require("jsdom");
const chalk = require('chalk');
const fs = require('fs')
const request = require('request')

var listings = [];
const url = 'https://www.demonoid.pw/files/?uid=9412950';
const interval = 15 * 60 * 1000;

init();
setInterval(checkAndDownload, interval);

function init() {
  console.log('Initializing');
  console.log(chalk.inverse('... REMEMBER TO START uTORRENT... '));
  checkAndDownload();
}

const extractData = node => {
  if(node.firstChild.textContent.indexOf('Formula') > -1 && node.firstChild.textContent.indexOf('1080') > -1) {
    var entry = {
      label: node.firstChild.text,
      url: node.firstChild.href.replace('details','download')  
    }
    return entry;
  }
}

function checkAndDownload() {
  console.log(chalk.dim('Checking for new episode at ', new Date()));
  JSDOM.fromURL(url)
  .then(dom => {
    var results = [];
    var evenNodes = dom.window.document.querySelectorAll('.tone_1_pad');
    var oddNodes = dom.window.document.querySelectorAll('.tone_3_pad');
    
    evenNodes.forEach(node => {
        var entry = extractData(node);
        if(entry) {
          results.push(entry);
        }
    });
    oddNodes.forEach(node => {
      var entry = extractData(node);
      if(entry) {
        results.push(entry);
      }
    });
    
    if(listings.length > 0) {
      results.forEach(result => {
        if(!listings.some(listing => {
          return listing.label.indexOf(result.label) > -1
        })) {
          downloadFile(result.label, result.url);
          console.log(chalk.bold.redBright.bgGreen('Starting download of new episode ', result.label, ' at ', new Date()));
        }
      });
    } 
    listings = results;
  })
}

const downloadFile = (name, url) => {
  request(url)
     .pipe(fs.createWriteStream(name + '.torrent'));
  console.log('Downloading ', name, ' from ', url);
}