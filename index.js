const { JSDOM } = require("jsdom");
const chalk = require('chalk');
const fs = require('fs')
const request = require('request')

let listings = [];
const url = 'https://www.demonoid.is/files/?uid=15328&seeded=2';
const interval = 10 * 60 * 1000;

init();
setInterval(checkAndDownload, interval);

function init() {
  console.log('Initializing');
  console.log(chalk.inverse('... REMEMBER TO START uTORRENT... '));
  checkAndDownload();
}

const extractData = node => {
  const { textContent, href } = node.children[0];
  if(textContent.includes('Formula') && textContent.includes('HD')) {
    const entry = {
      label: textContent,
      url: href.replace('details','download')  
    }
    return entry;
  }
}

function checkAndDownload() {
  console.log(chalk.dim('Checking for new episode at ', new Date()));
  JSDOM.fromURL(url)
  .then(dom => {
    const nodes = [...dom.window.document.querySelectorAll('.tone_1_pad'), ...dom.window.document.querySelectorAll('.tone_3_pad')];
    
    const results = [];
    nodes.forEach(node => {
        const entry = extractData(node);
        if(entry) {
          results.push(entry);
        }
    });
    
    if(listings.length > 0) {
      results.forEach(result => {
        if(!listings.some(listing => {
          return listing.label.indexOf(result.label) > -1
        })) {
          console.log(chalk.bold.redBright.bgGreen('Found new episode ', result.label, ' at ', new Date()));
          downloadFile(result.label, result.url);
        }
      });
    } 
    listings = results;
  });
  
}

const downloadFile = (name, url) => {
  request(url)
     .pipe(fs.createWriteStream(name + '.torrent'));
  console.log('Downloading ', name, ' from ', url);
}