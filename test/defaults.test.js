'use strict';

var request = require('../');
var t = require('chai').assert;

describe('Defaults', function () {
  it('should set the default options', function (done) {
    var r = request.defaults({
        json: true,
        qs: { d: "{index}" }
    });
    r('https://httpbin.org/json', function (err, response, body) {
      if (err) return done(err);
      t.strictEqual(response.statusCode, 200);
      t.isObject(body.slideshow);
      done();
    });
  });

  it('should set a default function', function (done) {
    var r = request.defaults({}, function (err, response, body) {
      if (err) return done(err);
      t.strictEqual(response.statusCode, 200);
      t.isObject(body.slideshow);
      done();
    });
    r({ url: 'https://httpbin.org/json', json: true });
  });

  it('should prefer options supplied to the call over default options', function (done) {
    var r = request.defaults({
        json: true,
        qs: { d: "foo" }
    });
    r.get({ url: 'https://httpbin.org/json', qs: { d: "{index}" } }, function (err, response, body) {
      if (err) return done(err);
      t.strictEqual(response.statusCode, 200);
      t.isObject(body.slideshow);
      done();
    });
  });

  it('should allow nesting', function (done) {
    var level0 = request.defaults({
        baseUrl: 'https://httpbin.org'
    });
    var level1 = level0.defaults({
        json: true
    });
    var level2 = level1.defaults({
        qs: { d: "{index}" },
        fullResponse: false
    });
    level2.get('/json').then(function (body) {
      t.isObject(body.slideshow);
      done();
    }).catch(done);
  });

  it('should perform "deep" defaulting', function (done) {
    var r = request.defaults({
        json: true,
        qs: { d: "{index}" }
    });
    r({ url: 'https://httpbin.org/json', qs: { x: "test" } }, function (err, response, body) {
      if (err) return done(err);
      t.strictEqual(response.statusCode, 200);
      t.isObject(body.slideshow);
      done();
    });
  });

});