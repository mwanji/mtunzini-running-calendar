"use strict";

var IndexController = function (app, dao) {
  app.get("/", function (req, res) {
    dao.getRuns(function (err, result) {
      if (err) {
        console.error(err);
        res.send(500, "Could not retrieve runs");
        
        return;
      }
      
      const viewData = {
        todayRuns: result.todayRuns,
        tomorrowRuns: result.tomorrowRuns,
        laterRuns: []
      };
      
      let currentDate = null;
      
      for (let i = 0; i < result.laterRuns.length; i++) {
        if (currentDate === null || !currentDate.isSame(result.laterRuns[i])) {
          currentDate = result.laterRuns[i].date;
          viewData.laterRuns.push({
            date: currentDate.format("DD/MM/YYYY"),
            runs: []
          });
        }
        
        viewData.laterRuns[viewData.laterRuns.length - 1].runs.push(result.laterRuns[i])
      }
      
      res.render("index", viewData);
    });
  });

};

module.exports = IndexController;
