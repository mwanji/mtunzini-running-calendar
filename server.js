var
  pg = require("pg"),
  dao = require("./dao.js")(pg),
  express = require("express"),
  mustache = require("mustache-express"),
  app = express();
  
pg.on("error", function (err, client) {
  console.error(err);
});

app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded());

app.engine("html", mustache());
app.set("view engine", "html");
app.set("views", __dirname + "/templates");

app.get("/", function (req, res) {
  dao.getRuns(function (err, result) {
    if (err) {
      console.error(err);
      res.send(500, "Could not retrieve runs");
      
      return;
    }
    res.render("index", result);
  });
});

app.post("/runs", function (req, res) {
  dao.save(req.body, function (err, id) {
    if (err) {
      console.error(err);
      res.send(500, "Could not create run");
      
      return;
    }
    
    console.log("new record oid: " + id);
    res.redirect("/");
  });
});

app.listen(3000);

