'use strict';

var http = require('http');
var request = require('../').defaults({ json: true });;
var t = require('chai').assert;

describe('Information Leak', function () {

  it('should not forward cookie headers when the request has a redirect from another protocol/domain/port', function (done) {

      request({
          url: 'https://httpbin.org/redirect-to?url=http://httpbin.org/cookies',
          headers: {
              'Content-Type': 'application/json',
              'cookie': 'ajs_anonymous_id=1234567890',
              'authorization': 'Bearer eyJhb12345abcdef'
          },
          json:true
      }, function (err, response, body) {
          t.deepEqual(body.cookies || {}, {});
          done();
      });
  });

  it('should forward cookie headers when the request has a redirect from the same protocol/domain/port', function (done) {

    request({
      url: 'https://httpbin.org/redirect-to?url=https://httpbin.org/cookies',
      headers: {
        'Content-Type': 'application/json',
        'cookie': 'ajs_anonymous_id=1234567890',
        'authorization': 'Bearer eyJhb12345abcdef'
      },
      json:true
    }, function (err, response, body) {
      t.deepEqual(body.cookies || {}, {
        "ajs_anonymous_id": "1234567890"
      });
      done();
    });
  });

  it('should forward cookie headers when the request hasn\'t any redirect', function (done) {

    request({
      url: 'https://httpbin.org/cookies?test=hello',
      headers: {
        'Content-Type': 'application/json',
        'cookie': 'ajs_anonymous_id=1234567890',
        'authorization': 'Bearer eyJhb12345abcdef'
      },
      json:true
    }, function (err, response, body) {
      t.deepEqual(body.cookies || {}, {
        "ajs_anonymous_id": "1234567890"
      });
      done();
    });
  });

  it('should not forward authorization headers when the request has a redirect', function (done) {

      request({
          url: 'https://httpbin.org/redirect-to?url=http://httpbin.org/bearer',
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
      url: 'https://httpbin.org/redirect-to?url=https://httpbin.org/bearer',
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

  it('should forward authorization headers when the request hasn\'t any redirect', function (done) {

    request({
      url: 'https://httpbin.org/bearer?test=hello',
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


  it('should not fail when the request has query parameters in array format', function (done) {

    request({
      url: 'https://httpbin.org/bearer?test=hello&test=world',
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
  
  
  it('should forward authorization headers regardless if skipHeaderSanitize is set to true', function (done) {

    request({
      url: 'https://httpbin.org/redirect-to?url=http://httpbin.org/bearer',
      headers: {
        'Content-Type': 'application/json',
        'cookie': 'ajs_anonymous_id=1234567890',
        'authorization': 'Bearer eyJhb12345abcdef'
      },
      skipHeaderSanitize: true
    }, function (err, response, body) {
      t.deepEqual(body, {
        "authenticated": true,
        "token": "eyJhb12345abcdef"
      });
      done();
    });
  });

  it('should remove credentials when a runtime redirect changes the port', function (done) {
    var target = http.createServer(function (req, res) {
      t.isUndefined(req.headers.cookie);
      t.isUndefined(req.headers.authorization);
      res.end('ok');
      target.close();
      source.close();
    });
    var source = http.createServer(function (req, res) {
      res.writeHead(302, { Location: 'http://127.0.0.1:' + target.address().port + '/capture' });
      res.end();
    });

    target.listen(0, '127.0.0.1', function () {
      source.listen(0, '127.0.0.1', function () {
        request({
          url: 'http://127.0.0.1:' + source.address().port + '/start',
          headers: {
            cookie: 'sessionId=abc123',
            authorization: 'Bearer secret-token'
          }
        }, function (err) {
          if (err) return done(err);
          done();
        });
      });
    });
  });

});
