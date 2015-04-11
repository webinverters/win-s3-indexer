require('win-common')({useTestGlobals: true, logging: {debug: true}});

global.AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

require('win-cloud')();

global.testdbconfig = {
  "client": "pg",
  "connection": "postgres://test:test@localhost/test"
};

global.testDatabase = require('./db-setup')(testdbconfig);
testDatabase.initialize = function(fixtures) {
  return testDatabase.initializeDb(fixtures);
};

global.dal = require('./data')({
  dbconfig: testdbconfig
});