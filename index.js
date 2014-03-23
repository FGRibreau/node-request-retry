'use strict';

/*
 * retriablerequest
 *
 * Copyright(c) 2014 Francois-Guillaume Ribreau <npm@fgribreau.com>
 * MIT Licensed
 *
 */
var request          = require('request');
var _                = require('fg-lodash');

var RETRIABLE_ERRORS = ['ECONNRESET', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNREFUSED'];

var DEFAULTS         = {
  maxAttempts: 5,   // try 5 times
  retryDelay: 5000, // wait for 5s before trying again
};

function isRetriableRequest(err, response){
  return (err && _.contains(RETRIABLE_ERRORS, err.code)) || (response && 500 <= response.statusCode && response.statusCode < 600);
}

function tryUntilFail(options, f, retryOptions){
  retryOptions.maxAttempts--;

  request(options, function(err, response, body){
    if(isRetriableRequest(err, response)){
      return setTimeout(tryUntilFail.bind(null, options, f, retryOptions), retryOptions.retryDelay);
    }

    return f(err, response, body);
  });
}

function RetriableRequest(options, f){
  var retryOptions = _(options || {}).defaults(DEFAULTS).pick(Object.keys(DEFAULTS)).value();
  tryUntilFail(options, f, retryOptions);
}

module.exports = RetriableRequest;
