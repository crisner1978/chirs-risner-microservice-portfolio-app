const express = require("express");
const routerFour = express.Router();
const mongoose = require('mongoose')

let exerciseUserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  exercises: [
    {
      _id: false,
      description: String,
      duration: Number,
      date: { type: String },
    },
  ],
});

let ExerciseUser = mongoose.model("ExerciseUser", exerciseUserSchema);

routerFour.post("/api/users/", function (req, res) {
  let newExerciseUser = new ExerciseUser({ username: req.body.username });
  newExerciseUser.save((err, savedUser) => {
    if (!err) {
      let responseObject = {};
      responseObject["username"] = savedUser.username;
      responseObject["_id"] = savedUser.id;
      res.json(responseObject);
    }
  });
});

routerFour.get("/api/users", (req, res) => {
  ExerciseUser.find({}, (err, exerciseUsers) => {
    res.json(exerciseUsers);
  });
});

routerFour.post("/api/users/:_id/exercises", async (req, res, next) => {
  let date = req.body.date;
  var newDate;
  if (date) {
    newDate = new Date(date);
    newDate.toString();
  } else {
    newDate = new Date();
  }
  newDate = newDate.toDateString();

  try {
    const detail = await ExerciseUser.findByIdAndUpdate(
      { _id: req.params._id },
      {
        $push: {
          exercises: {
            description: req.body.description,
            duration: parseInt(req.body.duration),
            date: newDate,
          },
        },
      }
    );
    res.json({
      _id: req.params._id,
      username: detail.username,
      date: newDate,
      duration: parseInt(req.body.duration),
      description: req.body.description,
    });
  } catch (err) {
    res.send("Error, err.message");
  }
});

routerFour.get("/api/users/:_id/logs", async (req, res) => {
  const logs = await ExerciseUser.findById({ _id: req.params._id });
  // add to and mark param
  const from = req.query.from;
  const to = req.query.to;

  if (from || to) {
    let fromDate = new Date(0);
    let toDate = new Date();

    if (from) {
      fromDate = new Date(from);
    }

    if (to) {
      toDate = new Date(to);
    }

    fromDate = fromDate.getTime();
    toDate = toDate.getTime();

    logs.exercises = logs.exercises.filter((session) => {
      let sessionDate = new Date(session.date).getTime();
      return sessionDate >= fromDate && sessionDate <= toDate;
    });
  }

  //limit paramater
  if (req.query.limit) {
    logs.exercises = logs.exercises.slice(0, req.query.limit);
  }

  res.json({
    _id: logs._id,
    username: logs.username,
    count: logs.exercises.length,
    log: logs.exercises,
  });
});

module.exports = routerFour;
