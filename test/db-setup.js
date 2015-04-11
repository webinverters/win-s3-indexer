/**
 * @module db-setup
 * @summary: Initialize the database for integration tests.
 *
 * @description:
 *
 * Author: justin
 * Created On: 2015-04-04.
 * @license Apache-2.0
 */

"use strict";

var pg = require('pg');

var sql = fs.readFileSync('./test/schema.sql').toString();


var sqlFixtures = require('sql-fixtures');

// depending on which database engine you are using
// this is a typical PostgreSQL config for the pg driver

module.exports = function construct(testdbconfig) {
  var m = {};

  var initializePromise = null;

  m.addDataFixture = function(dataSpec) {
    return p.resolve().then(function() {
      return initializePromise ? initializePromise.promise : null;
    })
      .then(function() {
        return sqlFixtures.create(testdbconfig, dataSpec).then(function() {
          console.log('Added fixture to db:', dataSpec);
        })
      })
  };

  m.initializeDb = function(dataSpec) {
    initializePromise = p.defer();
    pg.connect(testdbconfig.connection, function(err, client, done){
      if(err){
        console.log('error: ', err);
        if (initializePromise) {
          initializePromise.reject();
          initializePromise = null;
        }
        process.exit(1);
      }
      client.query(sql, function(err, result){
        done();
        if(err){
          console.log('error: ', err);
          process.exit(1);
        }
        if (initializePromise) {
          initializePromise.resolve(m.addDataFixture(dataSpec));
          initializePromise = null;
        }
      });
    });
    return initializePromise ? initializePromise.promise : p.resolve();
  };

  return m;
};