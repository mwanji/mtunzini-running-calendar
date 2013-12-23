var
  pg = require("pg"),
  CONNECTION_STRING = "postgres://postgres:postgres@localhost:5432/runningCalendar",
  express = require("express"),
  mustache = require("mustache-express"),
  app = express();
  
pg.on("error", function (err, client) {
  console.log(err);
});

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded());

app.engine("html", mustache());
app.set("view engine", "html");
app.set("views", __dirname + "/templates");

app.get("/", function (req, res) {
  var
    context = {
      todayRuns: [],
      tomorrowRuns: [],
      laterRuns: []
    };
    
  pg.connect(CONNECTION_STRING, function (err, client, done) {
    var
      date = new Date(),
      tomorrow = new Date(),
      todayString,
      query;
    
    if (err) {
      console.log(err);

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
      res.render("index", context);
    });
  });
});

app.post('/runs', function (req, res) {
  pg.connect(CONNECTION_STRING, function (err, client, done) {
    if (err) {
      console.log(err);
      res.send(500, "Could not connect to database");
      
      return;
    }
    
    client.query("INSERT INTO runs (runner, run_date, distance) VALUES ($1,$2,$3)", [req.body.name, req.body.date, req.body.distance], function (err, result) {
      if (err) {
        console.log(err);
        
        return;
      }
      console.log(result.rows);
    });    
    done();
  });
  
  res.redirect("/");
});

app.listen(3000);

