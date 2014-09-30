'use strict';

/*
 * Request
 *
 * Copyright(c) 2014 Francois-Guillaume Ribreau <npm@fgribreau.com>
 * MIT Licensed
 *
 */
var request    = require('request');
var _          = require('fg-lodash');
var Cancelable = require('cancelable');

var RETRIABLE_ERRORS = ['ECONNRESET', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE'];

var DEFAULTS         = {
  maxAttempts: 5,   // try 5 times
  retryDelay: 5000, // wait for 5s before trying again
};

function Request(options, f, maxAttempts, retryDelay){
  this.maxAttempts = maxAttempts;
  this.retryDelay  = retryDelay;
  this.options     = options;
  this.f           = _.once(f);
  this._timeout    = null;
  this._req        = null;
}

Request.request = request;

Request.prototype._tryUntilFail = function(){
  this.maxAttempts--;

  this._req = Request.request(this.options, function(err, response, body){
    if(this._isRetriable(err, response) && this.maxAttempts >= 0){
      this._timeout = setTimeout(this._tryUntilFail.bind(this), this.retryDelay);
      return;
    }

    return this.f(err, response, body);
  }.bind(this));
};

Request.prototype._isRetriable = function(err, response){
  // Inspired from https://github.com/geoffreak/request-enhanced/blob/master/src/request-enhanced.coffee#L107
  return (err && _.contains(RETRIABLE_ERRORS, err.code)) || (response && 500 <= response.statusCode && response.statusCode < 600);
};

Request.prototype.abort = function(){
  if(this._req){
    this._req.abort();
  }
  clearTimeout(this._timeout);
  this.f(new Error('Aborted'));
};

function Factory(options, f){
  f = _.isFunction(f) ? f : _.noop;
  var retry = _(options || {}).defaults(DEFAULTS).pick(Object.keys(DEFAULTS)).value();
  var req = new Request(options, f, retry.maxAttempts, retry.retryDelay);
  req._tryUntilFail();
  return req;
}

module.exports = Factory;

Factory.Request = Request;
