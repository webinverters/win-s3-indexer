"use strict";

var ModuleUnderTest = require('./s3-indexer');


describe('s3-indexer integration', function () {
  var m;
  var testBucketName = 'win-s3-indexer-test-bucket';

  var params = {
    indexName: 'index_blob',
    bucketName: testBucketName,
    getMarker:   function(dal) {
      return dal.query(params.indexName, {
        limit: 1,
        sortBy: 'id',
        sortDirection: 'desc' })
        .then(function(rows) {
          if (rows && rows.length) {
            return rows[0].key;
          }
          return null;
        })
    },
    parser: function (key, blob, row) {
      return row;
    }
  };

  beforeEach(function () {
    m = ModuleUnderTest({}, dal, wincloud.Storage);
    return testDatabase.initialize({});
  });

  beforeEach(function () {
    return wincloud.Storage(testBucketName).writeBlobs([
      {
        key: 'blob1',
        data: 'blob1-data'
      },
      {
        key: 'blob2',
        data: 'blob2-data'
      }
    ]);
  });

  afterEach(function() {
    return wincloud.Storage(testBucketName).emptyBucket();
  });

  describe('first time running indexer on bucket:', function () {
    it('adds all blobs in bucket to the index', function () {
      return m.runIndexer(params)
        .then(function () {
          return dal.query('index_blob');
        })
        .then(function (rows) {
          expect(rows.length).to.equal(2);
        });
    });
  });

  describe('running indexer after it has already indexed a bucket', function () {
    describe('no new blobs', function () {
      it('completes without doing any other work.', function() {
        return m.runIndexer(params)
        .then(function() {
          return m.runIndexer(params)
        })
        .then(function(info) {
          // we are checking that totalRows is zero
          // because it shows that nothing was attemtped to
          // be added to the db.  Which means nothing was download from S3 either.
          expect(info.totalRows).to.equal(0);
        });
      });
    });
    describe('new blobs', function () {
      it('loops through all the new blobs and adds them to index.', function() {
        var newBlobs = [
          {
            key: 'blob3',
            data: 'blob3-data'
          },
          {
            key: 'blob4',
            data: 'blob4-data'
          }
        ];
        return m.runIndexer(params)
          .then(function(data) {
            return wincloud.Storage(testBucketName).writeBlobs(newBlobs);
          })
          .then(function() {
            return m.runIndexer(params)
          })
          .then(function(info) {
            // we are checking that totalRows is zero
            // because it shows that nothing was attemtped to
            // be added to the db.  Which means nothing was download from S3 either.
            expect(info.totalRows).to.equal(2);
            return dal.query('index_blob');
          })
        .then(function(data) {
          expect(data).to.containSubset([
            {
              key: 'blob3'
            },
            {
              key: 'blob4'
            }
          ]);
        })
      });
    });
  });
});