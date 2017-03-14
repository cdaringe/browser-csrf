'use strict'

var bind = require('lodash/bind')
var toArray = require('lodash/toArray')
var assign = require('lodash/assign')

/**
 * @constructor
 * @class BrowserCSRF
 * @param {object|string} opts options or token
 * @param {string} opts.token token injected into the header
 * @param {string} [opts.document] document to operate in. defaults to `document`
 * @param {string} [opts.header] name of header. defaults to 'csrf-token'
 * @param {number} [opts.pollInterval] poll interval used to sniff for <form> elements
 *   on the page & inject CSRF fields. defaults to 1500ms
 * @returns {undefined}
 */
function BrowserCSRF (opts) {
  assign(this, defaultState)
  if (opts && typeof opts === 'string') opts = { token: opts }
  if (!opts.token) throw new ReferenceError('missing token')
  this._token = opts.token
  if (opts.header) this._headerName = opts.header
  if (opts.document) this._document = opts.document
}

var prototype = {

  /**
   * @private
   */
  _createCSRFInputNode: function () {
    var node = this._document.createElement('input')
    node.hidden = true
    node.value = this._token
    node.name = this._headerName
    return node
  },

  /**
   * @method deinject
   * @memberof BrowserCSRF
   * @description undo CSRF injection
   * @returns {undefined}
   */
  deinject: function () {
    // deactivate poll
    clearInterval(this._formInjectPollInterval)

    // remove injected nodes
    toArray(this._document.querySelectorAll('[name="' + this._headerName + '"]'))
    .forEach(function (node) { node.parentNode.removeChild(node) })

    // restore wrapped xhr
    XMLHttpRequest.prototype.send = this._xhrSend

    // restore default state
    assign(this, defaultState)
  },

  /**
   * @method inject
   * @memberof BrowserCSRF
   * @description inject CSRF header into each XHR request & form submission
   * @returns {undefined}
   */
  inject: function injectToken () {
    if (!this._hasWrappedXHR) {
      this._wrapXHR()
      this._hasWrappedXHR = true
    }
    if (!this._hasInjectedFormSniffing) {
      this._injectFormSniffing()
      this._hasInjectedFormSniffing = true
    }
  },

  /**
   * @private
   * @description poll for form entities & inject CSRF hidden fields
   */
  _injectFormSniffing: function () {
    var pollForForms = bind(function pollForForms () {
      var forms = toArray(this._document.getElementsByTagName('form'))
      forms.forEach(bind(function maybeAddOrUpdateCSRFNode (form) {
        var csrfNode = form.querySelectorAll('[name="' + this._headerName + '"]')[0]
        if (!csrfNode) csrfNode = this._createCSRFInputNode()
        csrfNode.value = this._token
        form.appendChild(csrfNode)
      }, this))
    }, this)
    pollForForms()
    this._formInjectPoll = setInterval(pollForForms, this._formInjectPollInterval)
  },

  /**
   * @private
   */
  _wrapXHR: function () {
    if (!XMLHttpRequest) throw new Error('browser does not permit XHRs. please use a modern browser')
    this._xhrSend = XMLHttpRequest.prototype.send
    var self = this
    XMLHttpRequest.prototype.send = function injectCSRFHeaderAndSend () {
      this.setRequestHeader(self._headerName, self._token)
      return self._xhrSend.apply(this, arguments)
    }
  }
}

var defaultState = {
  _document: document,
  _formInjectPoll: null,
  _formInjectPollInterval: 1500,
  _hasWrappedXHR: false,
  _hasInjectedFormSniffing: false,
  _headerName: 'csrf-token',
  _token: null,
  _xhrSend: null
}
assign(BrowserCSRF.prototype, prototype)

module.exports = BrowserCSRF
