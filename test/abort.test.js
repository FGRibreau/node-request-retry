'use strict';

var request = require('../');
var t = require('chai').assert;

describe('Request-retry', function () {
  it('should return a RequestRetry handler object with a abort method', function (done) {
    var o = request({
      url: 'https://httpbin.org/delay/10', // wait for 10s
      json: true
    }, function (err) {
      t.strictEqual(err.toString(), 'Error: Aborted');
      done();
    });

    o.abort();
  });
});
