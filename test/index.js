'use strict'

var assert = require('assert')
var BrowserCSRF = require('../')
var xhr = require('xhr')
var sinon = require('sinon')
var toArray = require('lodash/toArray')

var token = 'token'

var scaffolding = {
  root: null,
  setup: function (document) {
    document = document || window.document
    var root = document.createElement('div')
    root.id = 'root'
    if (document.getElementById('root')) throw new Error('test root already present')
    var form = document.createElement('form')
    var iframe = document.createElement('iframe')
    iframe.id = 'test_frame'
    root.appendChild(form)
    root.appendChild(iframe)
    document.body.appendChild(root)
    if (!this.root) this.root = document.getElementById('root')
  },
  teardown: function () {
    var root = document.getElementById('root')
    if (root) document.body.removeChild(root)
  }
}

describe('bcsrf', function () {
  it('should have no csrf inputs by default', function () {
    var injectedInputs = toArray(document.querySelectorAll('[name=csrf-token]'))
    assert.equal(injectedInputs.length, 0, 'no injected nodes')
    assert.throws(function () { BrowserCSRF() }, Error, 'requires token')
  })

  it('should inject csrf inputs', function () {
    scaffolding.setup()
    var bcsrf = new BrowserCSRF(token)
    bcsrf.inject()
    var injectedInputs = toArray(document.querySelectorAll('[name="csrf-token"]'))
    assert.equal(injectedInputs.length, 1, 'injected form node')
    assert.equal(injectedInputs[0].value, token, 'token injected into hidden field')
    assert(injectedInputs[0].hidden, 'csrf field hidden')
    bcsrf.deinject()
    assert(!bcsrf._token, 'token clears on deinject')
    scaffolding.teardown()
  })

  it('should inject the token into XHRs', function (done) {
    scaffolding.setup()
    var bcsrf = new BrowserCSRF(token)
    bcsrf.inject()
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
      scaffolding.teardown()
      return done()
    })
    if (window._phantom) return done() // skip xhr test in phantomJS
    xhr.get('/', function () { /* dummy xhr */ })
  })

  it('should work in iframes (example!)', function () {
    if (window._phantom) return
    scaffolding.setup() // scaffold root doc
    var iframe = document.getElementById('test_frame')
    var iDocument = iframe.contentDocument || iframe.contentWindow.document
    scaffolding.setup(iDocument) // scaffold iframe DOM
    var bcsrf = new BrowserCSRF({
      token: token,
      document: iDocument
    })
    bcsrf.inject()
    var injectedInputs = toArray(iDocument.querySelectorAll('[name="csrf-token"]'))
    assert.equal(injectedInputs.length, 1, 'injected form node')
    scaffolding.teardown()
  })
})
