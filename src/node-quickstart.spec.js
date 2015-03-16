'use strict';

/* global describe, it, before, beforeEach, after, afterEach */

var assert   = require('assert');
var nodeqs   = require('./node-quickstart');

describe('hello', function(){
  it('should greet the world', function(){
    assert.equal('Hello, world!  I love you!', nodeqs.hello(true));
  });

  it('should Naw', function(){
    assert.equal('Naw', nodeqs.hello(false));
  });
});