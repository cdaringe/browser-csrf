# browser-csrf :lock:

[![Greenkeeper badge](https://badges.greenkeeper.io/cdaringe/browser-csrf.svg)](https://greenkeeper.io/)

inject csrf tokens into your browser's network calls.

[ ![Codeship Status for cdaringe/browser-csrf](https://app.codeship.com/projects/0e58fbf0-e5cb-0134-052a-32055ecf3473/status?branch=master)](https://app.codeship.com/projects/206665) ![](https://img.shields.io/badge/standardjs-%E2%9C%93-brightgreen.svg) [![Sauce Test Status](https://saucelabs.com/browser-matrix/wa11-e.svg)](https://saucelabs.com/u/wa11-e)

## what

injects a token on each:

- xhr request
- fetch request
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

CSRF attacks are real.   Using an authorization token on each request (such as a CSRF token) helps prevent unauthorized command execution.  Using cookies to store auth tokens generally works, but leaves your app vulnerable to malicious social engineering.  Malicious actors can lead your users to make network calls against your server using an _entirely different website_, via HTML forms or cross-origin javascript XHRs, exploiting the fact that cookies will be passed along, even outside the context of your website/domain!  Therefore, logged in users who browse to other sites or click malicious links could perform acts on your website, unbeknownst to them.  See https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet.

## how

how we do this is controversial!  we override the some `<network-object>.prototype` methods, add a header, & reproxy through to the original method.  the offense is minimal & shouldn't affect normal usage.  if you are not comfortable with this, this module isn't for you!  it is, however, robust for those who don't have easy access to every network that call their app is making.

### example exploit

See the `exploit/` directory for an easy to run, easy to understand example of CSRF.

<a href="https://www.youtube.com/embed/rMfvVTugxew?ecver=1"><img width="400px" src="https://github.com/cdaringe/browser-csrf/blob/master/img/video-thumb.png?raw=true" /></a>

here's how you can use the demo:

- launch **both servers**, `node exploit/<malicious/vulnerable>/src/index.js`
- open a browser to `localhost:7777`
  - log into the fake bank using the displayed credentials
  - simulate some fund transfers (the ui makes this clear how to do, hopefully :))
  - observe the exploit link at the bottom of the page.  **click it**
    - this link opens a website from the **malicious server**, and makes your browser execute a command against the **vulnerable server** on your behalf, unbeknownst to you!  this is the very essence of a CSRF!

hopefully you can see that another site's ability to issue a command on a completely different site using an existing authenticated session is _a big deal_.  so, how can we fix it?  OWASP [has some great documentation](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)) on how the attack vectors work.  they also provide some basic mechanisms on how to thwart the attack vector from the browser.  however, the **browser solutions they provide are not very robust for modern native webapps**.  this `browser-csrf` fills that gap.

what we will do now is tell our vulnerable server to sniff for CSRF tokens.

- kill the current vulnerable server
- reboot the vulnerable server as such, `CSRF_PROTECTION=true node exploit/vulnerable/src/index.js`
  - re-navigate to `localhost:7777`
  - on login, the server provides a CSRF token
  - our browser code, post-login, sets up `browser-csrf` to make sure each network request gets the token injected into request headers
  - our server will now sniff for CSRF tokens on each request that requires authentication
- repeat the above banking processes
  - observe fund transfers work fine!
  - observe the CSRF attack thwarted from the malicious site!
