var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable("runs", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    runs_name: {
      type: type.STRING,
      notNull: true
    },
    runs_date: {
      type: "date",
      notNull: true
    },
    distance: {
      type: type.INTEGER,
      notNull: true
    }
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable("runs", callback);
};
