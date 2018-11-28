'use strict';

var request = require('../');
var t = require('chai').assert;

describe('RetryStrategies', function () {

  describe('Default strategies', function () {
    it('should have a strategy `HTTPError` to only retry on HTTP errors', function () {
      checkHTTPErrors(request.RetryStrategies.HTTPError);
    });

    it('should have a strategy `NetworkError` to only retry on nodejs network errors', function () {
      checkNetworkErrors(request.RetryStrategies.NetworkError, request.RetryStrategies.NetworkError.RETRIABLE_ERRORS);
    });

    it('should have a strategy `HTTPOrNetworkError` to only retry on nodejs network and HTTP errors', function () {
      checkHTTPErrors(request.RetryStrategies.HTTPOrNetworkError);
      checkNetworkErrors(request.RetryStrategies.HTTPOrNetworkError, request.RetryStrategies.NetworkError.RETRIABLE_ERRORS);
    });
  });

  describe('Custom strategies', function () {
    it('should overwrite `options` object if strategy returned it', function (done) {
      var strategy = function (err, response, body, options) {
        options.url = 'http://www.filltext.com/?rows=1&err=200'; //overwrite url to return 200
        return {
          mustRetry: true,
          options: options,
        };
      };

      request({
        url: 'http://www.filltext.com/?rows=1&err=500', // returns a 500 status
        maxAttempts: 3,
        retryDelay: 100,
        retryStrategy: strategy
      }, function(err, response, body) {
        if(err) done(err);

        t.strictEqual(200, response.statusCode);
        done();
      });
    });

    it('should not overwrite `options` object if strategy did not returned it', function (done) {
      var strategy = function (err, response, body, options) {
        options.url = 'http://www.filltext.com/?rows=1&err=200'; //overwrite url to return 200
        //do not return `options`
        return {
          mustRetry: true,
        };
      };

      request({
        url: 'http://www.filltext.com/?rows=1&err=500', // returns a 500 status
        maxAttempts: 3,
        retryDelay: 100,
        retryStrategy: strategy
      }, function(err, response, body) {
        if(err) done(err);

        t.strictEqual(500, response.statusCode);
        done();
      });
    })
  });
});

function checkNetworkErrors(strategy, errorCodes) {
  errorCodes.forEach(function (errorCode) {
    var err = new Error();
    err.code = errorCode;
    t.ok(strategy(err), 'error code ' + errorCode + ' is recoverable');
  });

  ['hello', 'plop'].forEach(function (errorCode) {
    var err = new Error();
    err.code = errorCode;
    t.ok(!strategy(err), 'error code ' + errorCode + ' is not recoverable');
  });
}

function checkHTTPErrors(strategy) {
  [400, 301, 600].forEach(function (code) {
    t.ok(!strategy(null, {
      statusCode: code
    }), code + ' error is not recoverable');
  });

  [429, 500, 599].forEach(function (code) {
    t.ok(strategy(null, {
      statusCode: code
    }), code + ' error is recoverable');
  });
}
