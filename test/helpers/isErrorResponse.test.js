'use strict';

const isErrorResponse = require('../../helpers/isErrorResponse');
const expect = require('chai').expect;

describe('isErrorResponse', function () {
  [200, 201, 302].forEach(statusCode => {
    it(`should return false for ${statusCode} statusCode`, function () {
      expect(isErrorResponse({ statusCode: statusCode })).to.equal(false);
    });
  });

  [400, 401, 403, 422, 500, 502].forEach(statusCode => {
    it(`should return true for ${statusCode} statusCode`, function () {
      expect(isErrorResponse({ statusCode: statusCode })).to.equal(true);
    });
  });
});
