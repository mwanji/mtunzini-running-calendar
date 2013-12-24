"use strict";

const
  path = require("path"),
  dbMigrate = require("db-migrate"),
  parseDbUrl = require("parse-database-url");

const up = function (env, config) {
  const options = parseDbUrl(config.dbUrl);
  options.driver = "pg";

  dbMigrate.connect(options, function (err, migrator) {
      migrator.migrationsDir = path.resolve("migrations");
      migrator.driver.createMigrationsTable(function(err) {
        if (err) {
          console.error(err);
          return;
        }
        
        migrator.upBy(Number.MAX_VALUE, function (err) {
          console.log(arguments);
        });
      });
  });
};

module.exports.up = up;

