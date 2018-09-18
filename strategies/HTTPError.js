'use strict';

/**
 * @param  {Null | Object} err
 * @param  {Object} response
 * @return {Boolean} true if the request had a recoverable HTTP error
 */
module.exports = function HTTPError(err, response) {
  let statusCode;

  if (response) {
    statusCode = response.statusCode
  }

  // 429 means "Too Many Requests" while 5xx means "Server Error"
  return statusCode && (statusCode === 429 || (500 <= statusCode && statusCode < 600));
};
