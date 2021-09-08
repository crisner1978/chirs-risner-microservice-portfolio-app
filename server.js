require("dotenv").config();
const express = require("express");
// var mongo = require('mongodb');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { nanoid } = require("nanoid");
const dns = require("dns");
const urlParser = require("url");
const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// enable CORS
var cors = require("cors");
const { request, response } = require("express");
const { resourceUsage } = require("process");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + "/views/timestamp.html");
});

app.get("/requestHeaderParser", function (req, res) {
  res.sendFile(__dirname + "/views/requestHeaderParser.html");
});

app.get("/urlShortener", function (req, res) {
  res.sendFile(__dirname + "/views/urlShortener.html");
});

app.get("/exerciseTracker", function (req, res) {
  res.sendFile(__dirname + "/views/exerciseTracker.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  console.log({ greeting: "hello API" });
  res.json({ greeting: "hello API" });
});

//Timestamp get request
app.get("/api/timestamp", function (req, res) {
  let now = new Date();
  res.json({
    unix: now.getTime(),
    utc: now.toUTCString(),
  });
});
app.get("/api/timestamp/:date_string", function (req, res) {
  let dateString = req.params.date_string;
  if (dateString.match(/\d{5,}/)) {
    dateString = +dateString;
  }
  let passedValue = new Date(dateString);
  if (passedValue == "Invalid Date") {
    res.json({ error: "Invalid Date" });
  } else {
    res.json({
      unix: passedValue.getTime(),
      utc: passedValue.toUTCString(),
    });
  }
});

//Request Header Parser get request
app.get("/api/whoami", function (req, res) {
  res.json({
    ipaddress: req.headers["x-forward-for"] || req.socket.remoteAddress || null,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"],
  });
});

//URL Shortener
//Build schema and model to save URLS
const ShortURL = mongoose.model(
  "ShortURL",
  new mongoose.Schema({
    short_url: String,
    original_url: String,
    suffix: String,
  })
);

app.post("/api/shorturl/", function (req, res) {
  let suffix = nanoid(8);
  let requestedURL = req.body.url;
  let newShortURL = suffix;
  dns.lookup(urlParser.parse(requestedURL).hostname, (error, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" });
    } else {
      let newURL = new ShortURL({
        short_url: newShortURL,
        original_url: requestedURL,
        suffix: suffix,
      });

      newURL.save(function (err, doc) {
        if (err) return console.error(err);
        res.json({
          short_url: newURL.short_url,
          original_url: newURL.original_url,
        });
      });
    }
  });
});

app.get("/api/shorturl/:suffix", function (req, res) {
  let generatedSuffix = req.params.suffix;
  ShortURL.find({ suffix: generatedSuffix }).then(function (foundUrls) {
    let urlRedirect = foundUrls[0];
    res.redirect(urlRedirect.original_url);
  });
});

//Exercise Tracker
//Build schema and model for exercise user
let exerciseUserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  exercises: [{
    _id: false,
    description: String,
    duration: Number,
    date: { type: String, }
  }]
});

let ExerciseUser = mongoose.model("ExerciseUser", exerciseUserSchema);

app.post("/api/users/", function (req, res) {
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

app.get("/api/users", (req, res) => {
  ExerciseUser.find({}, (err, exerciseUsers) => {
    res.json(exerciseUsers);
  });
});

app.post("/api/users/:_id/exercises", async (req, res, next) => {
  let date = req.body.date;
  var newDate;
  if(date){
    newDate = new Date(date);
    newDate.toString();
  } else { newDate = new Date() }
  newDate = newDate.toDateString();
  // let newExerciseSession = new ExerciseSession({
  //   description: req.body.description,
  //   duration: parseInt(req.body.duration),
  //   date: newDate,
  // });
  // if (newExerciseSession.date === "") {
  //   newExerciseSession.date === new Date().toISOString().substring(0, 10);
  // }
  try {
    const detail = await ExerciseUser.findByIdAndUpdate({ _id: req.params._id }, {
     $push: { 
        exercises: {
          description: req.body.description,
          duration: parseInt(req.body.duration),
          date: newDate
    } } } )
    // { new: true },
    // (err, updatedUser) => {
    //   let responseObject = {};
    //   responseObject["_id"] = updatedUser._id;
    //   responseObject["username"] = updatedUser.username;
    //   responseObject["date"] = newDate;
    //   responseObject["description"] = newExerciseSession.description;
    //   responseObject["duration"] = newExerciseSession.duration;
      res.json({
        _id: req.params._id,
        username: detail.username,
        date: newDate,
        duration: parseInt(req.body.duration),
        description: req.body.description
      });
    }
  catch (err) {
    res.send("Error, err.message");
  }
  }
  );

app.get("/api/users/:_id/logs", (req, res) => {
ExerciseUser.findById({ _id: req.params._id }, (error, result) => {
  if(!error){
    let responseObject = result
    responseObject['log'] = result.exercises
    responseObject['count'] = result.exercises.length  
    res.json(responseObject)
  }
})
  // var arr = {
  //   _id: logs._id,
  //   username: logs.username,
  //   count: logs.exercises.length,
  //   log: logs.exercises
  // }

  })


// listen for requests :)
var listener = app.listen(port, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
