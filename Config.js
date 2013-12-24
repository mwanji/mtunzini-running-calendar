"use strict";

var configs = require("./config.json");

var Config = function (environment) {
  return configs[environment];
};

module.exports = Config;
