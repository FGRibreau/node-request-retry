'use strict';

var request = require('../');
var t = require('chai').assert;

describe('Delay Calculators', function () {
  it('should return delay on first attempt', function () {
    t.strictEqual(5, request.Calculators.IncrementTimesAttemptDelayCalculator(5, 2, 1, 10));
  });
  it('should return delay + retryIncrement on second attempt', function () {
    t.strictEqual(7, request.Calculators.IncrementTimesAttemptDelayCalculator(5, 2, 2, 10));
  });
  it('should return delay + 2*retryIncrement on third attempt', function () {
    t.strictEqual(9, request.Calculators.IncrementTimesAttemptDelayCalculator(5, 2, 3, 10));
  });
  it('should return cap to retryMaxDelay on fourth attempt', function () {
    t.strictEqual(10, request.Calculators.IncrementTimesAttemptDelayCalculator(5, 2, 4, 10));
  });
});