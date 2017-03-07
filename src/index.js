'use strict'

require('./bind-polyfill')

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
    this._formInjectPoll = setInterval(function pollForForms () {

    }, 1000)
  },

  /**
   * @private
   */
  _wrapXHR () {
    if (!XMLHttpRequest) throw new Error('browser does not permit XHRs. please use a modern browser')
    var send = XMLHttpRequest.prototype.send
    return XMLHttpRequest.prototype.send = function injectCSRFHeaderAndSend () {
      this.setRequestHeader(this._headerName, this._token)
      return send.apply(this, arguments)
    }
  }
}

for (var key in bcsrf) if (typeof bcsrf[key] === 'function') bcsrf[key] = bcsrf[key].bind(bcsrf)
module.exports = bcsrf
