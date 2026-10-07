'use strict';

var http = require('http');
var request = require('../');
var t = require('chai').assert;

function listen(server) {
  return new Promise(function (resolve) {
    server.listen(0, '127.0.0.1', resolve);
  });
}

function close(server) {
  return new Promise(function (resolve) {
    server.close(resolve);
  });
}

describe('Runtime redirect options', function () {
  it('does not follow redirects when followRedirect is false', async function () {
    var redirected = false;
    var server = http.createServer(function (req, res) {
      if (req.url === '/start') {
        res.writeHead(302, { Location: '/target' });
      } else {
        redirected = true;
      }
      res.end('ok');
    });
    await listen(server);
    try {
      var response = await request({
        url: 'http://127.0.0.1:' + server.address().port + '/start',
        followRedirect: false,
        maxAttempts: 1
      });
      t.strictEqual(response.statusCode, 302);
      t.isFalse(redirected);
    } finally {
      await close(server);
    }
  });

  it('keeps credentials on same-origin redirects', async function () {
    var captured;
    var server = http.createServer(function (req, res) {
      if (req.url === '/start') {
        res.writeHead(302, { Location: '/target' });
      } else {
        captured = req.headers;
      }
      res.end('ok');
    });
    await listen(server);
    try {
      var response = await request({
        url: 'http://127.0.0.1:' + server.address().port + '/start',
        headers: { cookie: 'session=abc', authorization: 'Bearer secret' },
        maxAttempts: 1
      });
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(captured.cookie, 'session=abc');
      t.strictEqual(captured.authorization, 'Bearer secret');
    } finally {
      await close(server);
    }
  });

  it('preserves a redirect callback that rejects the redirect', async function () {
    var redirected = false;
    var callbackCalled = false;
    var server = http.createServer(function (req, res) {
      if (req.url === '/start') {
        res.writeHead(302, { Location: '/target' });
      } else {
        redirected = true;
      }
      res.end('ok');
    });
    await listen(server);
    try {
      var response = await request({
        url: 'http://127.0.0.1:' + server.address().port + '/start',
        followRedirect: function (response) {
          callbackCalled = true;
          t.strictEqual(response.statusCode, 302);
          t.strictEqual(this.uri.pathname, '/start');
          return false;
        },
        maxAttempts: 1
      });
      t.strictEqual(response.statusCode, 302);
      t.isTrue(callbackCalled);
      t.isFalse(redirected);
    } finally {
      await close(server);
    }
  });

  it('sanitizes followed cross-origin redirects when followAllRedirects overrides false', async function () {
    var captured;
    var target = http.createServer(function (req, res) {
      captured = req.headers;
      res.end('ok');
    });
    var source = http.createServer(function (req, res) {
      res.writeHead(302, { Location: 'http://127.0.0.1:' + target.address().port + '/target' });
      res.end();
    });
    await listen(target);
    await listen(source);
    try {
      var response = await request({
        url: 'http://127.0.0.1:' + source.address().port + '/start',
        headers: { cookie: 'session=abc', authorization: 'Bearer secret' },
        followRedirect: false,
        followAllRedirects: true,
        maxAttempts: 1
      });
      t.strictEqual(response.statusCode, 200);
      t.isUndefined(captured.cookie);
      t.isUndefined(captured.authorization);
    } finally {
      await close(source);
      await close(target);
    }
  });
});
