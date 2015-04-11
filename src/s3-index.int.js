"use strict";

var ModuleUnderTest = require('./s3-indexer');


describe('s3-indexer integration', function () {
  var m;
  var testBucketName = 'win-s3-indexer-test-bucket';

  var params = {
    indexName: 'index_blob',
    bucketName: testBucketName,
    parser: function (key, blob) {
      return {
        key: key,
        indexedOn: time.getCurrentTime()
      };
    }
  };

  beforeEach(function () {
    m = ModuleUnderTest({}, dal, wincloud.Storage);
    return testDatabase.initialize({});
  });

  describe('first time running indexer on bucket:', function () {
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

    it('adds all blobs in bucket to the index', function () {
      return m.runIndexer(params)
        .then(function () {
          return dal.query('index_blob');
        })
        .then(function (rows) {
          expect(rows.length).to.equal(2);
            log('DONE MOTHER UCKE')
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
          expect(info.totalRows).to.equal(0);
          log('DATA:', data);
        });
      });
    });
    describe('new blobs', function () {
      it('loops through all the new blobs and adds them to index.');
    });
  });
});