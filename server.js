require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
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
const { resourceLimits } = require("worker_threads");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204
// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

//routes for microservices
const router = require('./routes/timestamp.js')
app.use(router)

const routerTwo = require('./routes/headerParser.js')
app.use(routerTwo)

const routerThree = require('./routes/urlShortener.js')
app.use(routerThree)

const routerFour = require('./routes/exerciseTracker.js')
app.use(routerFour)

const routerFive = require('./routes/fileMetadata.js')
app.use(routerFive)

//html views
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

app.get("/fileMetadata", function (req, res) {
  res.sendFile(process.cwd() + "/views/fileMetadata.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  console.log({ greeting: "hello API" });
  res.json({ greeting: "hello API" });
});

// listen for requests :)
var listener = app.listen(port, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
