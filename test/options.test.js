'use strict';

var request = require('../').defaults({
  maxAttempts: 2,
  retryDelay: 200,
});
var t = require('chai').assert;

describe('Options test', function () {
  describe('"options.simple" is false by default', function() {
    [200, 201, 202, 400, 402, 404, 500, 501, 502, 503, 504]
    .forEach(function(code){
      it('should resolve for ' + code, function (done) {
        request('http://httpbin.org/status/' + code)
        .then(function (response) {
          t.strictEqual(response.statusCode, code);
          done();
        })
        .catch(function (error) {
          done(error);
        });
      });
    });
  });
    
  describe('"options.simple: true" resolves for 2xx', function() {
    [200, 201, 202]
    .forEach(function(code){
      it('should resolve for ' + code, function (done) {
        request({
          url: 'http://httpbin.org/status/' + code,
          simple: true,
        })
        .then(function (response) {
          t.strictEqual(response.statusCode, code);
          done();
        })
        .catch(function (error) {
          done(error);
        });
      });
    });
  });

  describe('"options.simple: true" rejects for non 2xx', function() {
    [400, 402, 404, 500, 501, 502, 503, 504]
    .forEach(function(code){
      it('should reject for ' + code, function (done) {
        request({
          url: 'http://httpbin.org/status/' + code,
          simple: true,
        })
        .then(function (response) {
          done(new Error('Resolved instead of rejecting for ' + code));
        })
        .catch(function (error) {
          t.strictEqual(error.statusCode, code);
          done();
        });
      });
    });
  });
});
