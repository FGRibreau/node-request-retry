'use strict';

var request = require('../');
var t = require('chai').assert;

describe('Request attempts', function () {
  it('should show 1 attempt after a successful call', function (done) {
    request.get('http://www.filltext.com/?rows=1', function (err, response, body) {
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.attempts, 1);
      done();
    });
  });

  it('should show 3 attempts after some retries', function (done) {
    request({
      url: 'http://www.filltext.com/?rows=1&err=500', // return a 500 status
      maxAttempts: 3,
      retryDelay: 100
    }, function (err, response, body) {
      t.strictEqual(response.statusCode, 500);
      t.strictEqual(response.attempts, 3);
      done();
    });
  });
});
