// 'use strict'

// require('perish')
// // var appReady = require('./app/')
// // const pify = require('pify')
// var webdriverio = require('webdriverio')
// var options = process.env.NODE_ENV.match(/devel/)
//   ? {
//     desiredCapabilities: {
//       browserName: 'firefox'
//     }
//   }
//   : {
//     user: process.env.SAUCE_USERNAME,
//     key: process.env.SAUCE_ACCESS_KEY,
//     host: 'localhost',
//     port: 4445,
//     desiredCapabilities: {
//       browserName: 'firefox'
//     }
//   }

// // appReady.then(server => {
// webdriverio
//   .remote(options)
//   .init()
//   .url('http://google.com')
//   .getTitle().then(console.log)
//   .end()
// //   .url('http://localhost:30000')
// //   .getTitle()
// //   .then(title => {
// //     console.log('Title was: ' + title)
// //   })
// //   .end()
// //   .then(() => pify(server.close.bind(server))())
// //   .then(() => console.log('exitting gracefully'))
// // })

var webdriver = require('selenium-webdriver'),
    username =  process.env.SAUCE_USERNAME,
    accessKey = process.env.SAUCE_ACCESS_KEY,
    driver;

driver = new webdriver.Builder().
  withCapabilities({
    'browserName': 'chrome',
    'platform': 'Windows XP',
    'version': '43.0',
    'username': username,
    'accessKey': accessKey
  }).
  usingServer("http://" + username + ":" + accessKey +
              "@ondemand.saucelabs.com:80/wd/hub").
  build();

driver.get("http://saucelabs.com/test/guinea-pig");

driver.getTitle().then(function (title) {
    console.log("title is: " + title);
});

driver.quit();
