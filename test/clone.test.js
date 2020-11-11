'use strict';

var request = require('../');
var t = require('chai').assert;
const http = require('http');

describe('Clone option function', function () {
  it('should not clone `options.agent`', function (done) {
    const agent = new http.Agent({ keepAlive: true });
    const strategy = function (err, response, body, options) {
      options.url = 'http://www.filltext.com/?rows=1&err=200'; //overwrite url to return 200
      t.strictEqual(agent, options.agent);
      return {
        mustRetry: true,
        options: options,
      };
    };

    request({
      url: 'http://www.filltext.com/?rows=1&err=500', // returns a 500 status
      maxAttempts: 3,
      agent: agent,
      retryDelay: 100,
      retryStrategy: strategy
    }, function (err, response, body) {
      if (err) done(err);
      t.strictEqual(200, response.statusCode);
      done();
    });
  });

  it('should not clone `non-own` property', function (done) {
    const originOptions = Object.create({ parent: true });
    originOptions.url = 'http://www.filltext.com/?rows=1&err=500'; // returns a 500 status
    originOptions.maxAttempts = 3;
    originOptions.retryDelay = 100;
    originOptions.cloneable = { a: 1 };
    
    const strategy = function (err, response, body, options) {
      t.isUndefined(options.parent);
      t.notStrictEqual(originOptions.cloneable, options.cloneable);
      t.equal(originOptions.cloneable.a, options.cloneable.a);
      options.url = 'http://www.filltext.com/?rows=1&err=200'; //overwrite url to return 200
      return {
        mustRetry: true,
        options: options,
      };
    };

    originOptions.retryStrategy = strategy;

    request(originOptions, function (err, response, body) {
      if (err) done(err);
      t.strictEqual(200, response.statusCode);
      done();
    });
  });
});
