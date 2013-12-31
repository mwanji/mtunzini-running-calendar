"use strict";

const defaultConfigs = require("./config.json");

var Config = function (environment, configPath) {
  const configs = configPath ? require(configPath) : defaultConfigs;
  const config = configs[environment];
  
  Object.keys(config).forEach(function (key) {
    if (config[key].indexOf && config[key].indexOf("env:") === 0) {
      const envKey = config[key].substring(4);
      config[key] = process.env[envKey];
    }
  });
  
  return config;
};

module.exports = Config;
