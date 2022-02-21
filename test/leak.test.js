'use strict';

var request = require('../').defaults({ json: true });;
var t = require('chai').assert;

describe('Information Leak', function () {

    it('should not forward cookie headers when the request has a redirect from another protocol/domain/port', function (done) {

        request({
            url: 'https://httpbingo.org/redirect-to?url=http://httpbingo.org/cookies',
            headers: {
                'Content-Type': 'application/json',
                'cookie': 'ajs_anonymous_id=1234567890',
                'authorization': 'Bearer eyJhb12345abcdef'
            },
            json:true
        }, function (err, response, body) {
            t.deepEqual(Object.keys(body).length, 0);
            done();
        });
    });

  it('should  forward cookie headers when the request has a redirect from the same protocol/domain/port', function (done) {

    request({
      url: 'https://httpbingo.org/redirect-to?url=https://httpbingo.org/cookies',
      headers: {
        'Content-Type': 'application/json',
        'cookie': 'ajs_anonymous_id=1234567890',
        'authorization': 'Bearer eyJhb12345abcdef'
      },
      json:true
    }, function (err, response, body) {
      t.deepEqual(body, {
        "ajs_anonymous_id": "1234567890"
      });
      done();
    });
  });

    it('should not forward authorization headers when the request has a redirect', function (done) {

        request({
            url: 'https://httpbingo.org/redirect-to?url=http://httpbingo.org/bearer',
            headers: {
                'Content-Type': 'application/json',
                'cookie': 'ajs_anonymous_id=1234567890',
                'authorization': 'Bearer eyJhb12345abcdef'
            }
        }, function (err, response, body) {
            t.deepEqual(body, undefined);
            done();
        });
    });

  it('should forward authorization headers when the request has a redirect from the same protocol/domain/port', function (done) {

    request({
      url: 'https://httpbingo.org/redirect-to?url=https://httpbingo.org/bearer',
      headers: {
        'Content-Type': 'application/json',
        'cookie': 'ajs_anonymous_id=1234567890',
        'authorization': 'Bearer eyJhb12345abcdef'
      }
    }, function (err, response, body) {
      t.deepEqual(body, {
        "authenticated": true,
        "token": "eyJhb12345abcdef"
      });
      done();
    });
  });

});
