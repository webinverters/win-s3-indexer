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
   * indexedOn (which is the time that it was indexed by this script.)
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
        return bucket.list(null, lastKey)
          .then(function(objects) {
            log('New Object Count From S3:', objects.length);
            return p.map(objects, function(object) {
              return bucket.readString(object.Key).then(function(data) {
                return {
                  key: object.Key,
                  data: data,
                  lastModifiedOn: moment(Date.parse(object.LastModified)).unix(),
                  indexedOn: time.getCurrentTime()
                };
              });
            });
          });
      })
      .then(function(blobList) {
        log("Indexing Blobs:", blobList.length);
        return dal.insertRows(params.indexName, _.map(blobList, function(blob) {
          var data = params.parser(blob.key, blob.data);
          data.arrivedOn = blob.lastModifiedOn;
          data.indexedOn = blob.indexedOn;
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