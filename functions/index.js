const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const path = require("path");

const db = require("./util/db");
const middleware = require("./util/AuthMiddleware");

const { signup, login, getAllUsers } = require("./handlers/users");

db.connect(err => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    app.listen(3000, () => {
      console.log("connected to db");
    });
  }
});

//Signup route
app.post("/signup", signup);
app.post("/login", login);
app.get("/users", middleware, getAllUsers);
