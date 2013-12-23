"use strict";

var
  moment = require("moment"),
  CONNECTION_STRING = require("./runCalendarConfig.json").dbUrl;

/**
 * Dao#save
 *
 * @param run
 * @param callback(err, id) id of the new record
 *
 * Dao#getRuns
 *
 * @return Object with 3 arrays: todayRuns, tomorrowRuns, laterRuns
 */
var Dao = function (db) {
  return {
    save: function (run, callback) {
      db.connect(CONNECTION_STRING, function (err, client, done) {
        if (err) {
          callback(err, null);
          
          return;
        }
        
        client.query("INSERT INTO runs (runner, run_date, distance) VALUES ($1,$2,$3)", [run.name, run.date, run.distance], function (err, result) {
          if (err) {
            console.log(err);
          }
          
          done();
          callback(null, result.oid);
        });    
      });
    },
    getRuns: function (callback) {
      var
        context = {
          todayRuns: [],
          tomorrowRuns: [],
          laterRuns: []
        };
        
      db.connect(CONNECTION_STRING, function (err, client, done) {
        var
          date = moment.utc().startOf("day"),
          tomorrow = moment(date).add("days", 1),
          todayString = date.toISOString();
          
        if (err) {
          callback(err, null);

          return;
        }
        
        client.query("SELECT * FROM runs WHERE run_date >= $1 ORDER BY distance, runner", [todayString], function (err, result) {
          var i, run;
          
          if (err) {
            done();
            callback(err, null);
            
            return;
          }
          
          for (i = 0; i < result.rows.length; i++) {
            run = {
              name: result.rows[i].runner,
              distance: result.rows[i].distance,
              date: result.rows[i].run_date
            };
            
            if (date.isSame(run.date)) {
              context.todayRuns.push(run);
            } else if (tomorrow.isSame(run.date)) {
              context.tomorrowRuns.push(run);
            } else {
              context.laterRuns.push(run);
            }
            
            run.date = moment(run.date).format("DD/MM/YYYY");
          }

          done();
          callback(null, context);
        });
      });
    }
  };
};

module.exports = Dao;

