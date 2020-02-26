require("dotenv").config();
const db = require("../util/db");
const { validateSignupData, validateLoginData } = require("../util/validators");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const collection = "users";

exports.signup = (req, res) => {
  const userData = {};
  const validateUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const { valid, errors } = validateSignupData(validateUser);

  if (!valid) {
    return res.status(400).json(errors);
  } else {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.status(500), json({ error: err });
      } else {
        const newUser = {
          email: req.body.email,
          password: hash,
          handle: req.body.handle
        };

        db.getDB()
          .collection(collection)
          .findOne({ email: newUser.email })
          .then(doc => {
            if (doc) {
              res.status(400).json({ email: "this email is already taken" });
            } else {
              return db
                .getDB()
                .collection(collection)
                .insertOne(newUser);
            }
          })
          .then(data => {
            if (data) {
              userData.userHandle = data.ops[0].handle;
              userData.email = data.ops[0].email;
              userData.objectId = data.ops[0]._id;
            }
            // data: data, document: data.ops[0],
            jwt.sign(newUser, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
              res.status(201).json({ token });
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  }
};

exports.login = (req, res) => {
  const userData = {};

  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) {
    return res.status(400).json(errors);
  }

  db.getDB()
    .collection(collection)
    .findOne({ email: user.email })
    .then(data => {
      bcrypt.compare(user.password, data.password, function(err, isMatch) {
        if (err) {
          console.error(err);
          throw err;
        } else if (!isMatch) {
          return res
            .status(403)
            .json({ genaral: "Wrong credentials, please try again" });
        } else {
          userData.objectId = data._id;
          userData.userHandle = data.handle;
          userData.email = data.email;
          jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
            console.log("token : " + token);
            res.json({ token });
          });
        }
      });
    })
    .catch(err => {
      console.error(err);
      return res
        .status(403)
        .json({ genaral: "Wrong credentials, please try again" });
    });
};

exports.getAllUsers = (req, res) => {
  db.getDB()
    .collection(collection)
    .find({})
    .toArray((err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json({ data });
        console.log(data);
      }
    });
};
