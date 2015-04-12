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

/**
 *
 *
 * @param config
 * @param dal      A data access interface.  [dal.query, dal.insertRows]
 * @param Storage  A storage interface.
 * @returns {{}}
 */
module.exports = function construct(config, dal, Storage) {
  var m = {};
  config = config || {};
  config = _.defaults(config, {});

  var wincloud = require('win-cloud')({
    useGlobals: false  // we don't use globals in libraries.
  });

  Storage = Storage || wincloud.Storage;

  if (!dal.query) throw error('INCOMPLETE_INTERFACE', 'dal must provide a "query(tableName, params)" api.');
  if (!dal.insertRows) throw error('INCOMPLETE_INTERFACE', 'dal must provide a "insertRows(tableName, rows)" api.');

  m = _.extend(m, require('./src/s3-indexer')(config, dal, Storage));

  return m;
};