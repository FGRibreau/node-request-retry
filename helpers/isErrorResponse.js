/**
 * Checks if the returned response is an error response.
 *
 * @param response a Node's http.IncomingMessage object
 * @return boolean true if the response status is 4XX or 5XX
 */
function isErrorResponse(response) {
  return response.statusCode >= 400;
}

module.exports = isErrorResponse;
