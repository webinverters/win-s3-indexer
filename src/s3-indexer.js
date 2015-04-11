/**
 * @module myModule
 * @summary: This module's purpose is to:
 *
 * @description:
 *
 * Author: Justin Mooser
 * Created On: 2015-04-11.
 * @license Apache-2.0
 */

"use strict";

module.exports = function construct(config, dal, Storage) {
  var m = {};
  config = config || {};
  config = _.defaults(config, {});

  /**
   *
   * @notes For internal housekeeping purposes the index requires a "key" and "indexOn" column in the index.
   * @param indexName
   * @param bucket
   * @param parser The parser must use "key" as the name of the column for the key's name.
   */
  m.runIndexer = function(params) {
    var bucket = Storage(params.bucketName);
    return dal.query(params.indexName, { limit: 1, sortBy: 'indexedOn', sortDirection: 'desc' })
      .then(function(rows) {
        if (rows && rows.length) {
          return rows[0].key;
        }
        return null;
      })
      .then(function(lastKey) {
        log('LASTKEY', lastKey);
        return bucket.list(null, lastKey)
          .then(function(objects) {
            log('OBJECT COUNT:', objects.length);
            return p.map(objects, function(object) {
              return bucket.readString(object.Key).then(function(data) {
                return {
                  key: object.Key,
                  data: data,
                  lastModifiedOn: moment(Date.parse(object.LastModified)).unix()
                };
              });
            });
          });
      })
      .then(function(blobList) {
        log("BUCKET", blobList);
        return dal.insertRows(params.indexName, _.map(blobList, function(blob) {
          var data = params.parser(blob.key, blob.data);
          data.lastModifiedOn = blob.lastModifiedOn;
          return data;
        }), true)
        .then(function(info) {
          info.totalRows = blobList.length;
          return info;
        });
      });
  };

  return m;
};