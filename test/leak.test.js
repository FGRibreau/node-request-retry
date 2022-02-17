'use strict';

var request = require('../').defaults({ json: true });;
var t = require('chai').assert;

describe('Information Leak', function () {

    it('should not forward cookie headers when the request has a redirect', function (done) {

        request({
            url: 'https://httpbingo.org/redirect-to?url=http://httpbingo.org/cookies',
            headers: {
                'Content-Type': 'application/json',
                'cookie': 'ajs_anonymous_id=1234567890',
                'authorization': 'Bearer eyJhb12345abcdef'
            }
        }, function (err, response, body) {
            t.strictEqual(Object.keys(body).length, 0);
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
            t.strictEqual(body, undefined);
            done();
        });
    });

});
