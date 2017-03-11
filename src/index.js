'use strict'

var bind = require('lodash/bind')
var toArray = require('lodash/toArray')

/**
 * @module browser-csrf
 */
var bcsrf = {
  /**
   * @private
   */
  _formInjectPoll: null,
  _formInjectPollInterval: 1500,
  _hasWrappedXHR: false,
  _hasInjectedFormSniffing: false,
  _headerName: 'csrf-token',
  _token: null,

  /**
   * @private
   */
  _createCSRFInputNode () {
    var node = document.createElement('input')
    node.hidden = true
    node.value = this._token
    node.name = this._headerName
    return node
  },

  /**
   * @method inject
   * @description inject CSRF header into each XHR request
   * @param {object} opts
   * @param {string} opts.token token injected into the header
   * @param {string} [opts.header] name of header. defaults to 'csrf-token'
   * @param {number} [opts.pollInterval] poll interval used to sniff for <form> elements
   *   on the page & inject CSRF fields. defaults to 1500ms
   * @returns {undefined}
   */
  inject: function injectToken (opts) {
    if (!opts.token) throw new ReferenceError('missing token')
    this._token = opts.token
    if (opts.header) this._headerName = opts.header
    if (!this._hasWrappedXHR) this._wrapXHR()
    if (!this._hasInjectedFormSniffing) this._injectFormSniffing()
  },

  /**
   * @private
   * @description poll for form entities & inject CSRF hidden fields
   */
  _injectFormSniffing () {
    this._formInjectPoll = setInterval(bind(function pollForForms () {
      var forms = toArray(document.getElementsByTagName('form'))
      forms.forEach(bind(function maybeAddOrUpdateCSRFNode (form) {
        var csrfNode = form.querySelectorAll('[name="' + this._headerName + '"]')[0]
        if (!csrfNode) csrfNode = this._createCSRFInputNode()
        csrfNode.value = this._token
      }, this))
    }, this), this._formInjectPollInterval)
  },

  /**
   * @private
   */
  _wrapXHR () {
    if (!XMLHttpRequest) throw new Error('browser does not permit XHRs. please use a modern browser')
    var send = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.send = function injectCSRFHeaderAndSend () {
      this.setRequestHeader(this._headerName, this._token)
      return send.apply(this, arguments)
    }
  }
}

for (var key in bcsrf) if (typeof bcsrf[key] === 'function') bcsrf[key] = bind(bcsrf[key], bcsrf)
module.exports = bcsrf
