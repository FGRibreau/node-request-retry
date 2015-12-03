'use strict';

var request = require('../');
var t = require('chai').assert;
var nock = require('nock');

describe('Promises support', function () {

  it('should by default resolve with the full response on success', function (done) {
    request({
      url: 'http://www.filltext.com/?rows=1', // return 1 row of data
    })
    .then(function (response) {
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.attempts, 1);
      done();
    });
  });

  it('should resolve with just the response body on success', function (done) {
    request({
      url: 'http://www.filltext.com/?rows=1', // return 1 row of data
      fullResponse: false, // to resolve with just the response body
    })
    .then(function (body) {
      t.isString(body);
      var data = JSON.parse(body);
      t.isArray(data);
      t.isObject(data[0]);
      done();
    });
  });

  it('should throw an error when passed a callback and waiting a promise', function (done) {
    var throwMessage = 'A callback was provided but waiting a promise, use only one pattern';
    try {
      request({url: 'http://www.filltext.com/?rows=1'}, function requestCallback(err, res, body) {
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
      url: 'http://www.filltext.com/?rows=1', // return 1 row of data
    });

    req.abort();

    req.catch(function (err) {
      t.strictEqual(err.message, 'Aborted');
      done();
    });
  });

  it('should reject the response on any error', function (done) {
    nock('http://www.filltext.com')
      .get('/')
      .query({rows: 1})
      .replyWithError('Some error');

    request({
      url: 'http://www.filltext.com/?rows=1', // return 1 row of data
      maxAttempts: 1,
    })
    .catch(function (err) {
      t.strictEqual(err.message, 'Some error');
      done();
    });
  });

  it('should still work with callbacks', function (done) {
    nock.restore(); // Allow next requests

    request({url: 'http://www.filltext.com/?rows=1'}, function requestCallback(err, response, body) {
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.attempts, 1);
      done();
    });
  });

});
