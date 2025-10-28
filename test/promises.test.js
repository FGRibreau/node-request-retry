'use strict';

var request = require('../');
var t = require('chai').assert;

describe('Promises support', function () {

  it('should by default resolve with the full response on success', function (done) {
    request({
      url: 'https://httpbin.org/json', // return JSON data
    })
    .then(function (response) {
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.attempts, 1);
      done();
    });
  });

  it('should resolve with just the response body on success', function (done) {
    request.get({
      url: 'https://httpbin.org/json', // return JSON data
      fullResponse: false, // to resolve with just the response body
    })
    .then(function (body) {
      t.isString(body);
      var data = JSON.parse(body);
      t.isObject(data);
      t.isObject(data.slideshow);
      done();
    });
  });

  it('should throw an error when passed a callback and waiting a promise', function (done) {
    var throwMessage = 'A callback was provided but waiting a promise, use only one pattern';
    try {
      request({url: 'https://httpbin.org/json'}, function requestCallback(err, res, body) {
        // should not be executed
      })
      .then(function (response) {
        // should not be executed
      });
    } catch (err) {
      t.strictEqual(err.message, throwMessage);
      done();
    }
  });

  it('should reject the promise on request aborted', function (done) {
    var req = request({
      url: 'https://httpbin.org/json', // return JSON data
    });

    req.abort();

    req.catch(function (err) {
      t.strictEqual(err.message, 'Aborted');
      done();
    });
  });

  it('should reject the promise on request aborted', function (done) {
    var req = request({
      url: 'https://httpbin.org/json', // return JSON data
    });

    req._req = null;
    req.abort();

    req.catch(function (err) {
      t.strictEqual(err.message, 'Aborted');
      done();
    });
  });

  it('should reject the response on any error', function (done) {
    this.timeout(5000);
    request({
      url: 'http://localhost:1', // intentionally invalid port
      maxAttempts: 1,
      retryStrategy: request.RetryStrategies.HTTPOrNetworkError,
      timeout: 1000
    })
    .catch(function (err) {
      // Just verify we got an error when connecting to invalid address
      t.isOk(err, 'Should get an error for invalid address');
      done();
    });
  });

  it('should still work with callbacks', function (done) {
    request({url: 'https://httpbin.org/json'}, function requestCallback(err, response, body) {
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.attempts, 1);
      done();
    });
  });

  describe('Different libraries support', function () {

    function makeRequest(promiseFactoryFn, done, throwError) {
      var requestUrl = 'https://httpbin.org/json';

      if (throwError) {
        requestUrl = 'https://httpbin.org/status/500';
      }

      return request({
        url: requestUrl,
        maxAttempts: 1,
        fullResponse: false, // to resolve with just the response body,
        promiseFactory: promiseFactoryFn // custom promise factory function
      })
      .then(function (body) {
        if (throwError) {
          throw new Error('Server returned 500'); // To simulate an error in the request
        }

        t.isString(body);
        var data = JSON.parse(body);
        t.isObject(data);
        t.isObject(data.slideshow);
        done();
      });
    }

    describe('Using bluebird', function () {
      var Promise = require('bluebird');
      function customPromiseFactory(resolver) {
        return new Promise(resolver);
      }

      it('should work on request success', function (done) {
        makeRequest(customPromiseFactory, done);
      });

      it('should work on request fail', function (done) {
        makeRequest(customPromiseFactory, done, true)
          .catch(function (err) {
            t.strictEqual(err.message, 'Server returned 500');
            done();
          });
      });
    });

    describe('Using Q', function () {
      function customPromiseFactory(resolver) {
        return require('q').Promise(resolver);
      }

      it('should work on request success', function (done) {
        makeRequest(customPromiseFactory, done);
      });

      it('should work on request fail', function (done) {
        makeRequest(customPromiseFactory, done, true)
          .catch(function (err) {
            t.strictEqual(err.message, 'Server returned 500');
            done();
          });
      });
    });

    describe('Using kew', function () {
      function customPromiseFactory(resolver) {
        var Promise = require('kew').Promise;
        var promise = new Promise();

        resolver(promise.resolve.bind(promise), promise.reject.bind(promise));

        return promise;
      }

      it('should work on request success', function (done) {
        makeRequest(customPromiseFactory, done);
      });

      it('should work on request fail', function (done) {
        makeRequest(customPromiseFactory, done, true)
          .fail(function (err) {
            t.strictEqual(err.message, 'Server returned 500');
            done();
          });
      });
    });

    describe('Using RSVP.js', function () {
      function customPromiseFactory(resolver) {
        var Promise = require('rsvp').Promise;

        return new Promise(resolver);
      }

      it('should work on request success', function (done) {
        makeRequest(customPromiseFactory, done);
      });

      it('should work on request fail', function (done) {
        makeRequest(customPromiseFactory, done, true)
          .catch(function (err) {
            t.strictEqual(err.message, 'Server returned 500');
            done();
          });
      });
    });

  });

});
