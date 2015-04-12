/**
 * @module dal
 * @summary: Provides simple APIs to access data needed by the application.
 *
 * @description:
 *
 * Author: justin
 * Created On: 2015-03-31.
 * @license Apache-2.0
 */

module.exports = function construct(config, db) {
  var m = {};

  m.insertReading = function(meterId, timestamp, value) {
    return db('meterreading').insert({meter:meterId, timestamp: timestamp, value: value})
        .then(null, function(err) {
          if (err.message.indexOf('duplicate') >= 0)
            err.message = 'DUPLICATE_READING';
          throw err;
        })
  };

  m.insertRows = function(tableName, rows, ignoreDuplicates) {
    return db(tableName)
        .insert(rows)
        .catch(function (err) {
          if (err.message.indexOf('duplicate') >= 0) {
            if (!ignoreDuplicates) {
              throw error('DUPLICATE_READING');
            }
          }

          if (err.message == 'CONNECTION_FAILURE' ||
            err.message == "DB_UNAVAILABLE") {
            // DUE to some kind of concurrency thing with p.map
            // we must check for err.message == DB_UNAVAILABLE also...
            err.message = "DB_UNAVAILABLE";
            throw err;
          }

          // there was likely a duplicate exception, therefore
          // try each row individually as a fallback
          // and report the duplicates.
          var info={};  // info tracks details about database calls.  rowCount, duplicates, etc...
          return p.map(rows, function(row) {
            return dal.insertRows(tableName, [row])
              .then(function(result) {
                info.rowCount += result.rowCount;
              })
              .catch(function(err) {
                if (err.message == 'DUPLICATE_READING') {
                  // swallow the error and keep going if it is just a duplicate.
                  log('DUPLICATE:', row);
                  info.duplicateCount += 1;
                  return 0;
                }
                else throw err;
              });
          }).then(function(results) {
            return info;
          })
        });
  };

  /**
   * Retrieves rows from missing-readings-summary
   *
   * @param {Number} [params.start]
   * @param {Number} params.limit=5000
   * @param {Number} [params.end]
   * @param {String} params.sortBy
   * @param {String} params.sortDirection='asc'
   */
  m.query = function(tableName, params) {
    params = params || {};
    var query = db(tableName).select();
    if (params.sortBy) {
      query.orderBy(params.sortBy, params.sortDirection || 'asc')
    }
    if (params.limit) {
      query.limit(params.limit);
    }

    return query;
  };

  return m;
};
