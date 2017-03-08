'use strict'

require('perish')
var appReady = require('./app/')
const pify = require('pify')
var webdriverio = require('webdriverio')
var options = {
  desiredCapabilities: {
    browserName: 'firefox'
  }
}

appReady.then(server => {
  webdriverio
  .remote(options)
  .init()
  .url('http://localhost:30000')
  .getTitle()
  .then(title => {
    console.log('Title was: ' + title)
  })
  .end()
  .then(() => pify(server.close.bind(server))())
  .then(() => console.log('exitting gracefully'))
})
