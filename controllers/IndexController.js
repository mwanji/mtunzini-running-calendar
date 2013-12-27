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
        
        let distance;
        switch (result.laterRuns[i].distance) {
          case 5:
            distance = "0 to 5K";
            break;
          case 10:
            distance = "5 - 10K";
            break;
          case 15:
            distance = "10 - 15K";
            break;
          case 20:
            distance = "15 - 20K";
            break;
        }
        
        viewData.laterRuns[viewData.laterRuns.length - 1].runs.push({ 
          name: result.laterRuns[i].name,
          distance: distance
        });
      }
      
      res.render("index", viewData);
    });
  });

};

module.exports = IndexController;
