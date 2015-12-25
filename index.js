'use strict';

/*
 * Request
 *
 * Copyright(c) 2014 Francois-Guillaume Ribreau <npm@fgribreau.com>
 * MIT Licensed
 *
 */
var when = require('when');
var request = require('request');
var _ = require('fg-lodash');
var RetryStrategies = require('./strategies');


var DEFAULTS = {
  maxAttempts: 5, // try 5 times
  retryDelay: 5000, // wait for 5s before trying again
  fullResponse: true, // resolve promise with the full response object
  promiseFactory: defaultPromiseFactory // Function to use a different promise implementation library
};

// Default promise factory which use bluebird
function defaultPromiseFactory(resolver) {
  return when.promise(resolver);
}

/**
 * It calls the promiseFactory function passing it the resolver for the promise
 *
 * @param {Object} requestInstance - The Request Retry instance
 * @param {Function} promiseFactoryFn - The Request Retry instance
 * @return {Object} - The promise instance
 */
function makePromise(requestInstance, promiseFactoryFn) {

  // Resolver function wich assigns the promise (resolve, reject) functions
  // to the requestInstance
  function Resolver(resolve, reject) {
    this._resolve = resolve;
    this._reject = reject;
  }

  return promiseFactoryFn(Resolver.bind(requestInstance));
}

function Request(options, f, retryConfig) {
  this.maxAttempts = retryConfig.maxAttempts;
  this.retryDelay = retryConfig.retryDelay;
  this.fullResponse = retryConfig.fullResponse;
  this.attempts = 0;

  /**
   * Option object
   * @type {Object}
   */
  this.options = options;

  /**
   * Return true if the request should be retried
   * @type {Function} (err, response) -> Boolean
   */
  this.retryStrategy = _.isFunction(options.retryStrategy) ? options.retryStrategy : RetryStrategies.HTTPOrNetworkError;

  this._timeout = null;
  this._req = null;

  this._callback = _.isFunction(f) ? _.once(f) : null;

  // create the promise only when no callback was provided
  if (!this._callback) {
    this._promise = makePromise(this, retryConfig.promiseFactory);
  }

  this.reply = function requestRetryReply(err, response, body) {
    if (this._callback) {
      return this._callback(err, response, body);
    }

    if (err) {
      return this._reject(err);
    }

    // resolve with the full response or just the body
    response = this.fullResponse ? response : body;
    this._resolve(response);
  };
}

Request.request = request;

Request.prototype._tryUntilFail = function () {
  this.maxAttempts--;
  this.attempts++;

  this._req = Request.request(this.options, function (err, response, body) {
    if (response) {
      response.attempts = this.attempts;
    }
    if (this.retryStrategy(err, response) && this.maxAttempts > 0) {
      this._timeout = setTimeout(this._tryUntilFail.bind(this), this.retryDelay);
      return;
    }

    this.reply(err, response, body);
  }.bind(this));
};

Request.prototype.abort = function () {
  if (this._req) {
    this._req.abort();
  }
  clearTimeout(this._timeout);
  this.reply(new Error('Aborted'));
};

// expose request methods from RequestRetry
['end', 'on', 'emit', 'once', 'setMaxListeners', 'start', 'removeListener', 'pipe', 'write'].forEach(function (requestMethod) {
  Request.prototype[requestMethod] = function exposedRequestMethod () {
    return this._req[requestMethod].apply(this._req, arguments);
  };
});

// expose promise methods
['then', 'catch', 'finally', 'fail', 'done'].forEach(function (promiseMethod) {
  Request.prototype[promiseMethod] = function exposedPromiseMethod () {
    if (this._callback) {
      throw new Error('A callback was provided but waiting a promise, use only one pattern');
    }
    return this._promise[promiseMethod].apply(this._promise, arguments);
  };
});

function Factory(options, f) {
  var retryConfig = _(options || {}).defaults(DEFAULTS).pick(Object.keys(DEFAULTS)).value();
  var req = new Request(options, f, retryConfig);
  req._tryUntilFail();
  return req;
}

module.exports = Factory;

Factory.Request = Request;
Factory.RetryStrategies = RetryStrategies;
