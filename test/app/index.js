'use strict'

var pify = require('pify')
var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.post('/', (req) => {
  console.log(req.params)
  console.log(req.body)
})
var server = require('http').createServer(app)
var listen = pify(server.listen.bind(server))

var PORT = process.env.PORT || 30000

module.exports = listen(PORT).then(() => {
  console.log(`server listening on: ${PORT}`)
  return server
})
