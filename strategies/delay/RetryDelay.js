'use strict';

/**
 * @param  {Null | Object} err
 * @param  {Object} response
 * @param  {Object} body
 * @param  {Number} attempts
 * @return {Number} number of milliseconds to wait before retrying.
 */
module.exports = function (err, response, body, attempts, retryDelay) {
    return retryDelay;
};