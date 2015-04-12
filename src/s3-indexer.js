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
   * @description
   * It is import to implement a query method on the provided "dal".  Here is an example
   * of how it is called by this module:
   * Ex. dal.query(params.indexName, { limit: 1, sortBy: 'id', sortDirection: 'desc' })
   *
   * It automatically adds the following properties to index rows:
   * arrivedOn (which is the LastModified data according to S3)
   * key (which is the key to the file on s3)
   *
   * @notes For internal housekeeping purposes the index requires a "key" and "indexOn" column in the index.
   * @param indexName
   * @param bucket
   * @param parser The parser must use "key" as the name of the column for the key's name.
   */
  m.runIndexer = function(params) {
    var bucket = Storage(params.bucketName);
    return dal.query(params.indexName, { limit: 1, sortBy: 'id', sortDirection: 'desc' })
      .then(function(rows) {
        if (rows && rows.length) {
          return rows[0].key;
        }
        return null;
      })
      .then(function(lastKey) {
        return bucket.list(null, lastKey, 1000)
          .then(function(objects) {
            log('New Object Count From S3:', objects.length);
            return p.map(objects, function(object) {
              return bucket.readString(object.Key).then(function(data) {
                return {
                  key: object.Key,
                  data: data,
                  lastModifiedOn: moment(Date.parse(object.LastModified)).unix(),
                };
              });
            });
          });
      })
      .then(function(blobList) {
        log("Converting Blobs To Indexes:", blobList.length);
        return p.map(blobList, function(blob) {
          var indexRow = {};
          indexRow.arrivedOn = blob.lastModifiedOn;
          indexRow.key = blob.key;
          return params.parser(blob.key, blob.data, indexRow);
        }).then(function(indexRows) {
          return _.filter(indexRows, function(r) {
            return r != null;
          });
        });
      })
      .then(function(indexRows) {
        log("Indexing:", indexRows.length);
        return dal.insertRows(params.indexName, indexRows, true)
        .then(function(info) {
          info.totalRows = indexRows.length;
          return info;
        });
      });
  };

  return m;
};