"use strict";

const RunsController = function (app, dao) {
  app.post("/runs", function (req, res) {
    dao.save(req.body, function (err, id) {
      if (err) {
        console.error(err);
        res.send(500, "Could not create run");
        
        return;
      }
      
      res.redirect("/");
    });
  });
};

module.exports = RunsController;
