"use strict";

var
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
          date = new Date(),
          tomorrow = new Date(),
          todayString,
          query;
        
        if (err) {
          callback(err, null);

          return;
        }
        
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        tomorrow.setTime(date.getTime());
        tomorrow.setDate(date.getDate() + 1);
        todayString = date.toISOString();
        
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
              date: new Date(result.rows[i].run_date)
            };
            
            date.setHours(run.date.getHours());
            tomorrow.setHours(run.date.getHours());
            
            if (run.date.getTime() === date.getTime()) {
              context.todayRuns.push(run);
            } else if (run.date.getTime() === tomorrow.getTime()) {
              context.tomorrowRuns.push(run);
            } else {
              context.laterRuns.push(run);
            }
            
            run.date = run.date.getDate() + "/" + (run.date.getMonth() + 1) + "/" + run.date.getFullYear();
          }

          done();
          callback(null, context);
        });
      });
    }
  };
};

module.exports = Dao;

