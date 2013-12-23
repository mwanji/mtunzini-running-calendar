"use strict";

var
  moment = require("moment"),
  vows = require("vows"),
  assert = require("assert"),
  Dao = require("../dao.js"),
  DaoMock = function (rows) {
    return new Dao({
      connect: function (url, callback) {
        var client = {
          query: function (sql, values, callback) {
            callback(null, {
              rows: rows
            });
          }
        };
        
        callback(null, client, function () {});
      }
    });
  },
  TODAY = moment().utc().startOf("day");
  
vows.describe("Dao")
  .addBatch({
    "Given an empty DB": {
      topic: function () {
        var dao = new DaoMock([]);
        dao.getRuns(this.callback);
      },
      "getting all runs should return an empty result": function (err, result) {
        assert.isEmpty(result.todayRuns);
        assert.isEmpty(result.tomorrowRuns);
        assert.isEmpty(result.laterRuns);
      }
    },
    "Given 1 run today": {
      topic: function () {
        var dao = new DaoMock([{ id: 1, runner: "Mwanji", run_date: TODAY.toDate(), distance: 10 }]);
        dao.getRuns(this.callback);
      },
      "getting all runs should return the run": function (err, result) {
        assert.deepEqual(result.todayRuns, [{name: "Mwanji", date: TODAY.format("DD/MM/YYYY"), distance: 10}]);
      }
    },
    "Given 1 run of each type": {
      topic: function () {
        var dao = new DaoMock([
          { id: 1, runner: "Mwanji", run_date: TODAY.toDate(), distance: 5 },
          { id: 2, runner: "Awie", run_date: moment(TODAY).add("days", 1).toDate(), distance: 10 },
          { id: 3, runner: "Jesse", run_date: moment(TODAY).add("days", 2).toDate(), distance: 15 }          
        ]);
        dao.getRuns(this.callback);
      },
      "each type should have 1 run": function (err, result) {
        assert.deepEqual(result.todayRuns, [{name: "Mwanji", date: TODAY.format("DD/MM/YYYY"), distance: 5}]);
        assert.deepEqual(result.tomorrowRuns, [{name: "Awie", date: moment(TODAY).add("days", 1).format("DD/MM/YYYY"), distance: 10}]);
        assert.deepEqual(result.laterRuns, [{name: "Jesse", date: moment(TODAY).add("days", 2).format("DD/MM/YYYY"), distance: 15}]);
      }
    }
  })
  .export(module);
