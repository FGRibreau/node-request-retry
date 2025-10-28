'use strict';

var request = require('../');
var t = require('chai').assert;

describe('API surface', function () {

  describe('request methods', function(){
    it('should work with .on', function(f){
      request('http://httpbin.org/delay/0.1').on('end', function(){
        f();
      });
    });
  });

  describe('callback api', function(){
    [['request', request], ['request.get', request.get]].forEach(function(pair){
      it('should work with '+pair[0]+'(url, f)', function (done) {
        pair[1]('https://httpbin.org/json', function (err, response, body) {
          t.strictEqual(response.statusCode, 200);
          t.isString(response.body);
          done();
        });
      });

      it('should work with '+pair[0]+'(url, object, f)', function (done) {
        pair[1]('https://httpbin.org/json', {
          json:true,
        }, function (err, response, body) {
          t.strictEqual(response.statusCode, 200);
          t.isObject(response.body.slideshow);
          done();
        });
      });

      it('should work with '+pair[0]+'(object, f)', function (done) {
        pair[1]({
          url: 'https://httpbin.org/json',
          json:true
        }, function (err, response, body) {
          t.strictEqual(response.statusCode, 200);
          t.isObject(response.body.slideshow);
          done();
        });
      });
    });
  });

  describe('promise api', function(){
    [['request', request], ['request.get', request.get]].forEach(function(pair){
      it('should work with '+pair[0]+'(url)', function (done) {
        pair[1]('https://httpbin.org/json')
        .then(function (response) {
          t.strictEqual(response.statusCode, 200);
          t.isString(response.body);
          done();
        });
      });

      it('should work with request(url, object)', function (done) {
        pair[1]('https://httpbin.org/json', {
          json:true,
        })
        .then(function (response) {
          t.strictEqual(response.statusCode, 200);
          t.isObject(response.body.slideshow);
          done();
        });
      });

      it('should work with '+pair[0]+'(object)', function (done) {
        pair[1]({
          url: 'https://httpbin.org/json',
          json:true
        })
        .then(function (response) {
          t.strictEqual(response.statusCode, 200);
          t.isObject(response.body.slideshow);
          done();
        });
      });
    });
  });
});
