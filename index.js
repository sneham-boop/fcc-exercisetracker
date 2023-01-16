const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const bodyParser = require("body-parser");

// Database connection
const mongoose = require("mongoose");
mongoose
  .connect(process.env["MONGO_URI"], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database."))
  .catch((e) => console.log("No connection to database.", e));

const Schema = mongoose.Schema;

let userSchema = new Schema({
  username: { type: String, required: true },
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});
let User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// POST to /api/users
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const user = new User({ username });
  user.save((err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    res.send(data);
  });
});

// GET request to /api/users
app.get("/api/users", (req, res) => {
  User.find((err, users) => {
    if (err) {
      console.log(err);
      return;
    }
    res.send(users);
  });
});

// POST to /api/users/:_id/exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;
  if (!date) date = Date.now();

  date = new Date(date).toDateString();

  const exercise = { description, date, duration: parseInt(duration) };

  User.findById({ _id }, (err, user) => {
    if (err) {
      console.log(err);
      return;
    }
    user.log.push(exercise);
    user.save((err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      const userData = {
        _id: user._id,
        username: user.username,
        ...exercise,
      };
      res.send(userData);
    });
  });
});

//  Get /api/users/:_id/logs
app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  // const log = getLog(_id, from, to, limit);
  // const exerciseCount = log.length;
  // const user = {
  //   ...users[_id],
  //   count: exerciseCount,
  //   log: log,
  // };
  // res.send(user);
  User.findById({ _id }, (err, response) => {
    if (err) {
      console.log(err);
      return;
    }
    const { _doc: user } = response;
    let log = [...user.log];
    const newLog = [];
    let count = 0;
    if (log.length !== 0) count = log.length;

    log.forEach((element, i) => {
      if (from && element.date >= from && element.date <= to) {
        newLog.push(element);
        newLog[i].date = new Date(element.date).toDateString();
      }
      if (!from) {
        newLog.push(element);
        newLog[i].date = new Date(element.date).toDateString();
      }
    });
    console.log(newLog);
    const userData = {
      ...user,
      log: newLog,
      count,
    };
    res.send(userData);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
