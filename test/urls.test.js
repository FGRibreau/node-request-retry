'use strict';

var request = require('../');
var t = require('chai').assert;
var sinon = require('sinon');

describe('URLs', function () {
  it('should handle a request with a query param containing encoded characters that don\'t parse into a url', function (done) {
    // 12:30PM with NARROW NO-BREAK SPACE between 0 and P
    request.get('http://www.filltext.com/?q=12%3A30%E2%80%AFPM', function (err, response, body) {
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.attempts, 1);
      done();
    });
  });
});
