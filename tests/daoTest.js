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
    }, {});
  },
  InsertDaoMock = function (options) {
    var dao,
      connect = function (url, callback) {
      var client = {
        query: function (sql, values, callback) {
          dao.sql = sql;
          dao.values = values;
          callback(options.err, options.result);
        }
      };

      callback(null, client, options.done || function () {});
    };
    
    dao = new Dao({
      connect: connect
    }, {});
    
    return dao;
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
        var dao = new DaoMock([{ id: 1, runs_name: "Mwanji", runs_date: TODAY.toDate(), distance: 10 }]);
        dao.getRuns(this.callback);
      },
      "getting all runs should return the run": function (err, result) {
        assert.deepEqual(result.todayRuns, [{name: "Mwanji", date: TODAY.format("DD/MM/YYYY"), distance: 10}]);
      }
    },
    "Given 1 run of each type": {
      topic: function () {
        var dao = new DaoMock([
          { id: 1, runs_name: "Mwanji", runs_date: TODAY.toDate(), distance: 5 },
          { id: 2, runs_name: "Awie", runs_date: moment(TODAY).add("days", 1).toDate(), distance: 10 },
          { id: 3, runs_name: "Jesse", runs_date: moment(TODAY).add("days", 2).toDate(), distance: 15 }          
        ]);
        dao.getRuns(this.callback);
      },
      "each type should have 1 run": function (err, result) {
        assert.deepEqual(result.todayRuns, [{name: "Mwanji", date: TODAY.format("DD/MM/YYYY"), distance: 5}]);
        assert.deepEqual(result.tomorrowRuns, [{name: "Awie", date: moment(TODAY).add("days", 1).format("DD/MM/YYYY"), distance: 10}]);
        assert.deepEqual(result.laterRuns, [{name: "Jesse", date: moment(TODAY).add("days", 2).format("DD/MM/YYYY"), distance: 15}]);
      }
    },
    "On save,": {
      "given a run": {
        topic: function () {
          var dao = new InsertDaoMock({
            result: {
              rows: [15]
            }
          });
          
          return dao;
        },
        "should call correct SQL": function (dao) {
          dao.save({ name: "Mwanji", date: TODAY.toDate(), distance: 10 }, function (err, newId) {
            assert.match(dao.sql, /^INSERT INTO runs/);
            assert.deepEqual(dao.values, ["Mwanji", TODAY.format("YYYY-MM-DD"), 10]);
            assert.equal(newId, 15);
          });
        }
      },
      "given an error": {
        topic: function () {
          var dao = new InsertDaoMock({
            err: true,
            done: function () {
              assert.fail("Must not call done()!")
            }
          });
          
          return dao;
        },
        "should not call done()": function (dao) {
          dao.save({}, function () {});
        }
      }
    }
  })
  .export(module);
