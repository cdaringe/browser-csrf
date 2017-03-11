'use strict'

// var tape = require('tape')
var assert = require('assert')
var bcsrf = require('../')
var xhr = require('xhr')
var sinon = require('sinon')
var toArray = require('lodash/toArray')

var token = 'token'

describe('bcsrf', function () {
  it('should have no csrf inputs by default', function () {
    var injectedInputs = toArray(document.querySelectorAll('[name=csrf-token]'))
    assert.equal(injectedInputs.length, 0, 'no injected nodes')
    assert.throws(function () { bcsrf.inject() }, Error, 'requires token')
  })

  it('should inject csrf inputs', function () {
    bcsrf.inject(token)
    bcsrf.deinject()
    assert(!bcsrf._token, 'token clears on deinject')
    document.body.appendChild(document.createElement('form'))
    bcsrf.inject({ token: token })
    var injectedInputs = toArray(document.querySelectorAll('[name="csrf-token"]'))
    assert.equal(injectedInputs.length, 1, 'injected form node')
    assert.equal(injectedInputs[0].value, token, 'token injected into hidden field')
    assert(injectedInputs[0].hidden, 'csrf field hidden')
    bcsrf.deinject()
  })

  it('should inject the token into XHRs', function (done) {
    bcsrf.inject(token)
    // test XHR intercept
    var handled = false
    var stub = sinon.stub(bcsrf, '_xhrSend', function () {
      if (handled) return // concurrent xhrs may creep in here. just sniff one
      handled = true
      assert.equal(this.status, 0, 'intercepted xhr')

      // teardown
      stub.restore()
      this.abort()
      bcsrf.deinject()
      return done()
    })
    if (window._phantom) {
      // skip xhr test
      return done()
    }
    xhr.get('/', function () { /* dummy xhr */ })
  })
})
