/**
 * @module data/index
 * @summary: Creates a dal using a passed in config.
 *
 * @description:
 *
 * Author: justin
 * Created On: 2015-03-31.
 * @license Apache-2.0
 */

"use strict";


var knex = require('knex');

module.exports = function construct(config) {
  config = config || {};
  config = _.defaults(config, {});


  var db = knex.initialize(config.dbconfig);

  var dal = require('./dal')(config.DAL, db);

  dal.db = db;

  return dal;
};
