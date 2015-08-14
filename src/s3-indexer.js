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
    var insertMarker = function(marker) {
        if (!marker) return p.resolve();
        // insert the marker.
        return dal.insertRows(params.indexName, [{
          key: marker,
          arrivedOn: 0
        }], true).then(function() {
          removeMarker = function() {
            return dal.deleteRows(params.indexName, {
              key: marker
            });
          };
        });
      },
      removeMarker = function() { return p.resolve() };

    var getLastObject = function(objects) {
      if (!objects || !objects.length) return null;
      objects = _.sortBy(objects, 'Key');
      return objects[objects.length-1].Key;
    };

    var bucket = Storage(params.bucketName);
      return p.resolve()
      .then(function() {
        if (!params.getMarker) return null;
        return params.getMarker(dal); // return null if there is no last blob to start from.
      })
      .then(function(lastKey) {
        log('Start Marker=', lastKey);
        return bucket.list(null, lastKey, config.BATCH_SIZE || 100)
          .then(function(objects) {
            log('New Object Count From S3:', objects.length);
            var marker = getLastObject(objects);
            log('Saving New End Marker:', marker);
            return insertMarker(marker)
              .then(function() {
                log('Downloading blobs...');
                return p.map(objects, function(object) {
                  return bucket.readString(object.Key).then(function(data) {
                    return {
                      key: object.Key,
                      data: data,
                      lastModifiedOn: moment(Date.parse(object.LastModified)).unix()
                    };
                  });
                }, {concurrency: 1});
              })
          });
      })
      .then(function(blobList) {
        log("Converting Blobs To Indexes:", blobList.length);
        return p.map(blobList, function(blob) {
          var indexRow = {};
          indexRow.arrivedOn = parseInt(blob.lastModifiedOn || moment().unix());
          indexRow.key = blob.key;
          return params.parser(blob.key, blob.data, indexRow);
        }).then(function(indexRows) {
          return _.filter(indexRows, function(r) {
            return r != null;
          });
        });
      })
      .then(function(indexRows) {
        return removeMarker().then(function() {
          return indexRows;
        });
      })
      .then(function(indexRows) {
        log("Indexing:", indexRows.length);
          console.log(indexRows[0]);
        return dal.insertRows(params.indexName, indexRows, true)
        .then(function(info) {
          info.totalRows = indexRows.length;
          return info;
        });
      })
      .catch(function(err) {
        logError(err);
        throw err;
      })
  };

  return m;
};