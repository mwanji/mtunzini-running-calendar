"use strict";

const
  path = require("path"),
  dbMigrate = require("db-migrate"),
  parseDbUrl = require("parse-database-url"),
  rollback = process.argv[2] === "rollback",
  env = process.argv[3];
  
const closeDb = function (migrator) {
  return function (err) {
    if (err) {
      console.log(err);
      return;
    }
    
    migrator.driver.close(function (err2) {
      if (err2) {
        console.log(err2);
      } else {
        console.log("Closed migration DB connection");
      }
    });
  };
};

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
        
        migrator.upBy(Number.MAX_VALUE, closeDb(migrator));
      });
  });
};

const down = function (env, config) {
  const options = parseDbUrl(config.dbUrl);
  options.driver = "pg";

  dbMigrate.connect(options, function (err, migrator) {
      migrator.migrationsDir = path.resolve("migrations");
      migrator.driver.createMigrationsTable(function(err) {
        if (err) {
          console.error(err);
          return;
        }
        
        migrator.downBy(Number.MAX_VALUE, closeDb(migrator));
      });
  });
}

if (rollback) {
  down(env, require("./Config.js")(env));
} else {
  module.exports.up = up;
}

