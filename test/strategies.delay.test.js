'use strict';

var request = require('../');
var t = require('chai').assert;

describe('DelayStrategies', function () {
    it('should have a strategy `Fibbonaci` that returns the nth fibbonaci number plus 0-1000ms', function () {
        checkFibbonaci();
    });

    it('should have a strategy `Exponential` that returns the number of attempts squared in milliseconds + 0-1000ms', function () {
        checkExponential();
    });
});

function checkFibbonaci() {
    var fibbonaci = [1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597];
    for (var i = 0; i < fibbonaci.length; i++) {
        var delay = request.DelayStrategies.Fibbonaci(null, null, null, i);
        t.isAtLeast(delay, fibbonaci[i] * 1000, 'The number was smaller than expected');
        t.isAtMost(delay, fibbonaci[i] * 1000 + 1000, 'The number was larger than expected');
    }
}

function checkExponential() {
    for (var i = 1; i < 20; i++) {
        var expected = Math.pow(i, 2) * 1000;
        var delay = request.DelayStrategies.Exponential(null, null, null, i);
        t.isAtLeast(delay, expected, 'The number was smaller than expected');
        t.isAtMost(delay, expected + 1000, 'The number was larger than expected');
    }
}
