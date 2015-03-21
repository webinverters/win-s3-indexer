/**
 * @module node-quickstart
 * @summary: This module's purpose is to act as an example.
 *
 * @description:
 *
 * Author: justin
 * Created On: 2015-03-21.
 * @license Apache-2.0
 */

'use strict';


/**
 * The hello function says "hello"
 * @param sher
 * @returns {string}
 */
function hello(sher) {

  if (sher) {
    return "Hello, world!  I love you!";
  }
  return "Naw"
}

module.exports.hello = hello;