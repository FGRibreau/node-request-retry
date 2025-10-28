'use strict';

var request = require('../');
var t = require('chai').assert;

describe('Request', function () {
  it('should use overridden Request', function (done) {
    var set = false;
    request.Request = class extends request.Request {
      constructor(url, options, f, retryConfig) {
        super(url, options, f, retryConfig);
        set = true;
      }
    };
    request('https://httpbin.org/json', function (err, response, body) {
      t.strictEqual(set, true);
      done();
    });
  });
});
