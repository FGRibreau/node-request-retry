# Request-retry [![Deps](https://david-dm.org/FGRibreau/node-request-retry.png)](https://david-dm.org/FGRibreau/node-request-retry) [![Build Status](https://drone.io/github.com/FGRibreau/node-request-retry/status.png)](https://drone.io/github.com/FGRibreau/node-request-retry/latest) [![Downloads](http://img.shields.io/npm/dm/requestretry.svg)](https://www.npmjs.com/package/requestretry)

[![npm](https://nodei.co/npm/requestretry.png)](https://npmjs.org/package/requestretry)

When the connection fails with one of `ECONNRESET`, `ENOTFOUND`, `ESOCKETTIMEDOUT`, `ETIMEDOUT`, `ECONNREFUSED`, `EHOSTUNREACH`, `EPIPE`, `EAI_AGAIN` or when an HTTP 5xx error occurrs, the request will automatically be re-attempted as these are often recoverable errors and will go away on retry.

## Usage

Request-retry is a drop-in replacement for [request](https://github.com/mikeal/request) but adds two new options `maxAttempts` and `retryDelay`. It also adds one property to the response, `attempts`.

```javascript
var request = require('requestretry');

request({
  url: 'https://api.domain.com/v1/a/b'
  json:true,

  // The above parameters are specific to Request-retry
  maxAttempts: 5,   // (default) try 5 times
  retryDelay: 5000,  // (default) wait for 5s before trying again
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors
}, function(err, response, body){
  // this callback will only be called when the request succeeded or after maxAttempts or on error
  if (response) {
    console.log('The number of request attempts: ' + response.attempts);
  }
});
```

## Installation

Install with [npm](https://npmjs.org/package/requestretry).

    npm install --save requestretry

## How to define your own retry strategy

```
/**
 * @param  {Null | Object} err
 * @param  {Object} response
 * @return {Boolean} true if the request should be retried
 */
function myRetryStrategy(err, response){
  // retry the request if we had an error or if the response was a 'Bad Gateway'
  return err || response.statusCode === 502;
}

request({
  url: 'https://api.domain.com/v1/a/b'
  json:true,
  retryStrategy: myRetryStrategy
}, function(err, response, body){
  // this callback will only be called when the request succeeded or after maxAttempts or on error
});
```

## Modifying `request` options
You can access request's `defaults` method like so:

```js
var request = require('requestretry').request.defaults({my: options});
```

## Todo

- Tests

## [Changelog](CHANGELOG.md)

Copyright 2014, [Francois-Guillaume Ribreau](http://fgribreau.com) (npm@fgribreau.com)
