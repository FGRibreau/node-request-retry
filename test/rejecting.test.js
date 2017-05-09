'use strict';

var request = require('../');
var t = require('chai').assert;

describe('Reject on failed retryStrategy', function () {

  it('should reject the request if retryStrategy failed', function (done) {
    request({
      url: 'http://www.filltext.com/?rows=1&err=500', // return 1 row of data
      rejectOnRetryStrategyFail: true, // enable reject on failed retryStrategy
      retryStrategy: function (err, response, body) { // reject on 500 error
        return err || (response && response.statusCode === 500);
      },
      maxAttempts: 1 // 1 attempt
    })
    .catch(function (err) {
      t.strictEqual(err.message, 'Request failed retryStrategy check');
      t.property(err, 'body');
      t.property(err, 'response');
      t.strictEqual(err.response.statusCode, 500);
      done();
    });
  });

});
