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
  assertRunsEqual = function (actual, expected) {
    assert.equal(actual.name, expected.name);
    assert.equal(actual.distance, actual.distance);
    assert.isTrue(actual.date.isSame(expected.date), "Expected date: " + expected.date + " but got: " + actual.date);
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
        assert.lengthOf(result.todayRuns, 1);
        assertRunsEqual(result.todayRuns[0], {name: "Mwanji", date: TODAY, distance: 10});
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
        assert.lengthOf(result.todayRuns, 1);
        assert.lengthOf(result.tomorrowRuns, 1);
        assert.lengthOf(result.laterRuns, 1);
        assertRunsEqual(result.todayRuns[0], {name: "Mwanji", date: TODAY, distance: 5});
        assertRunsEqual(result.tomorrowRuns[0], {name: "Awie", date: moment(TODAY).add("days", 1), distance: 10});
        assertRunsEqual(result.laterRuns[0], {name: "Jesse", date: moment(TODAY).add("days", 2), distance: 15});
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
