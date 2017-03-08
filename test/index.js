'use strict'

var tape = require('tape')
var bcsrf = require('../')
var xhr = require('xhr')
var sinon = require('sinon')
var toArray = require('lodash/toArray')

var token = 'token'

tape('inject', function (t) {
  t.plan(10)

  var injectedInputs = toArray(document.querySelectorAll('[name=csrf-token]'))
  t.equals(injectedInputs.length, 0, 'no injected nodes')
  t.throws(function () { bcsrf.inject() }, 'requires token')

  bcsrf.inject(token)
  t.pass('permits string token')
  bcsrf.deinject()
  t.notOk(bcsrf._token, 'token clears on deinject')

  document.body.appendChild(document.createElement('form'))

  bcsrf.inject({ token: token })
  t.pass('permits token in opts')

  injectedInputs = toArray(document.querySelectorAll('[name="csrf-token"]'))
  t.equals(injectedInputs.length, 1, 'injected form node')
  t.equals(injectedInputs[0].value, token, 'token injected into hidden field')
  t.ok(injectedInputs[0].hidden, 'csrf field hidden')

  // test XHR intercept
  var handled = false
  var stub = sinon.stub(bcsrf, '_xhrSend', function () {
    if (handled) return // concurrent xhrs may creep in here. just sniff one
    handled = true
    t.equal(this.status, 0, 'intercepted xhr')

    // teardown
    stub.restore()
    this.abort()
    bcsrf.deinject()
    t.pass('teardown')
    t.end()
  })
  if (window._phantom) {
    // skip xhr test
    t.pass('phantom xhr skip')
    bcsrf.deinject()
    t.pass('teardown')
    return t.end()
  }
  xhr.get('/', function () {
  })
})
