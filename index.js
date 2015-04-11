/**
 * @module index.js
 * @summary: Wires up the library.
 *
 * @description:
 *
 * win-s3-indexer
 *
 * Author: justin
 * Created On: 2015-03-21.
 * @license Apache-2.0
 */

module.exports = function construct(config, dal, Storage) {
  var m = {};
  config = config || {};
  config = _.defaults(config, {});

  var wincloud = require('win-cloud')({
    useGlobals: false  // we don't use globals in libraries.
  });

  Storage = Storage || wincloud.Storage;

  m = _.extend(m, require('./src/s3-indexer')(config, dal, Storage));

  return m;
};