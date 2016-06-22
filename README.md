# Request-retry
[![Deps](	https://img.shields.io/david/FGRibreau/node-request-retry.svg)](https://david-dm.org/FGRibreau/node-request-retry) [![Build Status](	https://img.shields.io/circleci/project/FGRibreau/node-request-retry.svg)](https://drone.io/github.com/FGRibreau/node-request-retry/latest) [![Downloads](http://img.shields.io/npm/dm/requestretry.svg)](https://www.npmjs.com/package/requestretry) ![extra](https://img.shields.io/badge/actively%20maintained-yes-ff69b4.svg)

![NPM](https://nodei.co/npm/requestretry.png?downloadRank=true) ![NPM](https://nodei.co/npm-dl/requestretry.png?months=3&height=2)

When the connection fails with one of `ECONNRESET`, `ENOTFOUND`, `ESOCKETTIMEDOUT`, `ETIMEDOUT`, `ECONNREFUSED`, `EHOSTUNREACH`, `EPIPE`, `EAI_AGAIN` or when an HTTP 5xx error occurrs, the request will automatically be re-attempted as these are often recoverable errors and will go away on retry.

## Usage

Request-retry is a drop-in replacement for [request](https://github.com/mikeal/request) but adds two new options `maxAttempts` and `retryDelay`. It also adds one property to the response, `attempts`. It supports callbacks or promises.

### With callbacks

```javascript
var request = require('requestretry');

request({
  url: 'https://api.domain.com/v1/a/b'
  json:true,

  // The below parameters are specific to request-retry
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

### With promises

When you're using promises, you can pass the two following options:
- `fullResponse` _(default true)_ - To resolve the promise with the full response or just the body
- `promiseFactory` _(default whenjs)_ - A function to allow the usage of a different promise implementation library

```javascript
request({
  url: 'https://api.domain.com/v1/a/b'
  json:true,

  fullResponse: true // (default) To resolve the promise with the full response or just the body
})
.then(function (response) {
  // response = The full response object or just the body
})
.catch(function(error) {
  // error = Any occurred error
})
```

**Using `promiseFactory` option to use a different promise implementation library**

```javascript
// See the tests for different libraries usage examples

/**
 * @param  {Function} resolver The promise resolver function
 * @return {Object} The promise instance
 */
function customPromiseFactory(resolver) {
  // With when.js
  return require('when').promise(resolver);

  // With RSVP.js
  var Promise = require('rsvp').Promise;

  return new Promise(resolver);
}

request({
  url: 'https://api.domain.com/v1/a/b'
  json:true,

  // Custom promise factory function
  promiseFactory: customPromiseFactory
})
.then(function (response) {
  // response = The full response object or just the body
})
.catch(function(error) {
  // error = Any occurred error
})
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
function myRetryStrategy(err, response, body){
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

You can use the `defaults` method to provide default options like so:

```js
var request = require('requestretry').defaults({ json: true, retryStrategy: myRetryStrategy });
```

## Convenience methods

As with `request`, several helpers are provided for various HTTP methods:

* `request.get(url)` - same as `request(options, callback)` or `request(options)`.
* `request.head(url)` - same as `request(options, callback)` or `request(options)`, but it defaults `options.method` to `HEAD`.
* `request.post(url)` - same as `request(options, callback)` or `request(options)`, but it defaults `options.method` to `POST`.
* `request.put(url)` - same as `request(options, callback)` or `request(options)`, but it defaults `options.method` to `PUT`.
* `request.patch(url)` - same as `request(options, callback)` or `request(options)`, but it defaults `options.method` to `PATCH`.
* `request.del(url)` - same as `request(options, callback)` or `request(options)`, but it defaults `options.method` to `DELETE`.
* `request.delete(url)` - same as `request(options, callback)` or `request(options)`, but it defaults `options.method` to `DELETE`.

## [Changelog](CHANGELOG.md)

## Donate

I maintain this project in my free time, if it helped you, well, I would be grateful to buy a beer thanks to your [paypal](https://paypal.me/fgribreau) or [Bitcoins](https://www.coinbase.com/fgribreau), donation!

[Francois-Guillaume Ribreau](http://fgribreau.com) (npm@fgribreau.com)
