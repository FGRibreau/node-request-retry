'use strict';

/**
 * @param  {Null | Object} err
 * @param  {Object} response
 * @param  {Object} body
 * @param  {Number} attempts
 * @return {Number} number of milliseconds to wait before retrying.
 */
module.exports = function (err, response, body, attempts) {
    return Math.floor((Math.random() + GetFibonacci(attempts)) * 1000);
};


function GetFibonacci(num){
    var a = 1, b = 0, temp;
    while (num >= 0){
        temp = a;
        a = a + b;
        b = temp;
        num--;
    }
    return b;
}