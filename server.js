var
  env = process.argv[2],
  config = require("./Config.js")(env),
  migrations = require("./migrations.js"),
  pg = require("pg"),
  dao = require("./dao.js")(pg, config),
  express = require("express"),
  mustache = require("mustache-express"),
  app = express();
  
  
migrations.up(env, config);

pg.on("error", function (err, client) {
  console.error(err);
});

app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded());

app.engine("html", mustache());
app.set("view engine", "html");
app.set("views", __dirname + "/templates");

require("./controllers/IndexController.js")(app, dao);

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

app.listen(3000);

