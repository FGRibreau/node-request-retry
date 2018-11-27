'use strict';
module.exports = function HTTPOrNetworkError(httpError, networkError) {
  /**
   * @param  {Null | Object} err
   * @param  {Object} response
   * @return {Array} with first Boolean item, true if the request had a recoverable HTTP or network error
   */
  return function HTTPError(err, response) {
    return [httpError(err, response)[0] || networkError(err, response)[0]];
  };

};
