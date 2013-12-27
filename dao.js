"use strict";

var
  moment = require("moment");

/**
 * Constructor.
 * @param db an object that conforms to the pg module's interface.
 *
 * Dao#save
 * @param run
 * @param callback(err, id) id of the new record
 *
 * Dao#getRuns
 * @return Object with 3 arrays: todayRuns, tomorrowRuns, laterRuns
 */
var Dao = function (db, config) {
  return {
    save: function (run, callback) {
      db.connect(config.dbUrl, function (err, client, done) {
        if (err) {
          callback(err, null);
          
          return;
        }
        
        client.query("INSERT INTO runs (id, runs_name, runs_date, distance) VALUES (DEFAULT, $1,$2,$3) RETURNING id", [run.name, moment.utc(run.date).format("YYYY-MM-DD"), run.distance], function (err, result) {
          if (err) {
            callback(err, null);
            return;
          }
          
          done();
          callback(null, result.rows[0]);
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
        
      db.connect(config.dbUrl, function (err, client, done) {
        var
          date = moment.utc().startOf("day"),
          tomorrow = moment(date).add("days", 1),
          todayString = date.toISOString();
          
        if (err) {
          callback(err, null);

          return;
        }
        
        client.query("SELECT * FROM runs WHERE runs_date >= $1 ORDER BY runs_date, distance, runs_name", [todayString], function (err, result) {
          var i, run;
          
          if (err) {
            done();
            callback(err, null);
            
            return;
          }
          
          for (i = 0; i < result.rows.length; i++) {
            run = {
              name: result.rows[i].runs_name,
              distance: result.rows[i].distance,
              date: moment(result.rows[i].runs_date)
            };
            
            if (date.isSame(run.date)) {
              context.todayRuns.push(run);
            } else if (tomorrow.isSame(run.date)) {
              context.tomorrowRuns.push(run);
            } else {
              context.laterRuns.push(run);
            }
            
            run.date = moment(run.date);
          }

          done();
          callback(null, context);
        });
      });
    }
  };
};

module.exports = Dao;

