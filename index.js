const { JSDOM } = require("jsdom");
const fs = require('fs')
const request = require('request')

var listings = [];
const url = 'https://www.demonoid.pw/files/?uid=9412950';
const interval = 15 * 60 * 1000;

init();
setInterval(checkAndDownload, interval);

function init() {
  checkAndDownload();
}

function checkAndDownload() {
  JSDOM.fromURL("http://demonoid.pw/files/?uid=9412950")
  .then(dom => {
    var results = [];
    dom.window.document.querySelectorAll('.tone_1_pad').forEach(node => {
      if(node.firstChild.textContent.indexOf('Formula') > -1 && node.firstChild.textContent.indexOf('1080') > -1) {
        var entry = {
          label: node.firstChild.text,
          url: node.firstChild.href.replace('details','download')  
        }
        results.push(entry);
      } 
    });
    dom.window.document.querySelectorAll('.tone_3_pad').forEach(node => {
      if(node.firstChild.textContent.indexOf('Formula') > -1 && node.firstChild.textContent.indexOf('1080') > -1) {
        var entry = {
          label: node.firstChild.text,
          url: node.firstChild.href.replace('details','download')  
        }
        results.push(entry);
      } 
    });
    if(listings.length > 0) {
      results.forEach(result => {
        if(!listings.some(listing => {
          return listing.label.indexOf(result.label) > -1
        })) {
          downloadFile(result.label, result.url);
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