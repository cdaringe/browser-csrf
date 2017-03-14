# browser-csrf :lock:

inject csrf tokens into your browser's network calls.

[ ![Codeship Status for cdaringe/browser-csrf](https://app.codeship.com/projects/0e58fbf0-e5cb-0134-052a-32055ecf3473/status?branch=master)](https://app.codeship.com/projects/206665) ![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg) [![Sauce Test Status](https://saucelabs.com/browser-matrix/wa11-e.svg)](https://saucelabs.com/u/wa11-e)

## what

injects a token on each:

- xhr request
- form submission

## usage

```js
// example
var BrowserCSRF = require('browser-csrf')
var bcsrf = new BrowserCSRF({ token: '<your-csrf-token>' })
bcsrf.inject()
```

this is a fairly simple example.  see the API docs for more.

## api

See the official [API Docs](https://cdaringe.github.io/browser-csrf/).

## why

CSRF attacks are real.   Using an authorization token on each request (such as a CSRF token) helps prevent unauthorization command execution.  Using cookies to store auth tokens generally works, but leaves your app vulnerable to malicious social engineering.  Malicious actors can lead your users to make network calls against your server using an _entirely different website_, via HTML forms or cross-origin javascript XHRs, exploiting the fact that your cookies will be passed along, even outside the context your website/domain!

## how

how we do this is controversial!  we override the `XMLHttpRequest.prototype.send` method, add a header, & reproxy through to the original method.  if you are not comfortable with this, this module isn't for you!

### example exploit

See the `exploit/` directory for an easy to run, easy to understand example of CSRF.
