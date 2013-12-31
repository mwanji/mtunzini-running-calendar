"use strict";

const
  assert = require("assert"),
  vows = require("vows"),
  Config = require("../Config"),
  CONFIG_PATH = __dirname + "/configTest.json";
  
  console.log(CONFIG_PATH);
vows
  .describe("Config")
  .addBatch({
    "Given simple configuration": {
      topic: Config("simpleVars", CONFIG_PATH),
      "should use values directly": function (config) {
        assert.equal(config.dbUrl, "local_db");
        assert.equal(config.port, 3000);
      }
    },
    "Given configuration keys prefixed with 'env:'": {
      topic: function () {
        process.env.DATABASE_URL = "test_db";
        process.env.PORT = 9999;
        
        return Config("envVars", CONFIG_PATH);
      },
      "should use environment variables": function (config) {
        assert.equal(config.port, 9999);
        assert.equal(config.dbUrl, "test_db");
        assert.equal(config.hardcoded, "a value");
      }
    }
    })
    .export(module);
