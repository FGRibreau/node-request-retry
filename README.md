# Request-retry [![Deps](https://david-dm.org/FGRibreau/node-request-retry.png)](https://david-dm.org/FGRibreau/node-request-retry)

[![npm](https://nodei.co/npm/requestretry.png)](https://npmjs.org/package/requestretry)

When the connection fails with one of `ECONNRESET`, `ENOTFOUND`, `ESOCKETTIMEDOUT`, `ETIMEDOUT`, `ECONNREFUSED`, `EHOSTUNREACH`, `EPIPE` or when an HTTP 5xx error occurrs, the request will automatically be re-attempted as these are often recoverable errors and will go away on retry.

## Usage

Request-retry is a drop-in replacement for [request](https://github.com/mikeal/request) but adds two new options `maxAttempts` and `retryDelay`.

```javascript
var request = require('requestretry');

request({
  url: 'https://api.domain.com/v1/a/b'
  json:true,

  // The above parameters are specific to Request-retry:
  maxAttempts: 5,   // (default) try 5 times
  retryDelay: 5000  // (default) wait for 5s before trying again
}, function(err, response, body){
  // this callback will only be called when the request succeeded or after maxAttempts or on error
});
```

## Installation

Install with [npm](https://npmjs.org/package/requestretry).

    npm install --save requestretry

## Todos

- Tests
- Use an EventEmitter to notify retries
- Allow the end-user to specify its own conditions to trigger a retry

## Changelog

v1.0.4

    - added `EPIPE`

v1.0.3

    - added `EHOSTUNREACH`

v1.0.2

    - upgraded `request` to 2.44.0 (19/09/2014)
    - callback is now optional

v1.0.1: 

    - added `cancelable` as deps

v1.0.0:

    - request now yield an Request instance with a `.abort()` method.

v0.0.1 

    - initial commit

Copyright 2014, [Francois-Guillaume Ribreau](http://fgribreau.com) (npm@fgribreau.com)
