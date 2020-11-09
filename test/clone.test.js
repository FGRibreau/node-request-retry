'use strict';

const rewire = require('rewire');
const _cloneOptions = rewire('../').__get__('_cloneOptions');
const http = require('http');
const t = require('chai').assert;

describe('Clone option function', function () {
  it('should not clone agent and non-own properties', function (done) {
    const options = Object.create({ parent: true });
    options.cloneable = { a: 1 };
    options.agent =  new http.Agent({ keepAlive: true });
    const cloned = _cloneOptions(options);
    t.strictEqual(options.agent, cloned.agent);
    t.notStrictEqual(options.cloneable, cloned.cloneable);
    t.equal(options.cloneable.a, cloned.cloneable.a)
    t.isUndefined(cloned.parent);
    t.isTrue(options.parent);
    done();
  });
});
