require('dotenv').config();
const express = require('express');
// var mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid')
const dns = require('dns');
const urlParser = require('url');
const app = express();
const port = process.env.PORT || 3000

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
});

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
const { request } = require('express');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/requestHeaderParser", function (req, res) {
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

app.get("/urlShortener", function (req, res) {
  res.sendFile(__dirname + '/views/urlShortener.html');
});

app.get("/exerciseTracker", function (req, res) {
  res.sendFile(__dirname + '/views/exerciseTracker.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  console.log(({greeting: 'hello API'}))
  res.json({greeting: 'hello API'});
});

//Timestamp get request
app.get("/api/timestamp", function(req, res) {
  let now = new Date()
  res.json({
    "unix": now.getTime(),
    "utc": now.toUTCString()
  })
})
app.get("/api/timestamp/:date_string", function (req, res) {
  let dateString = req.params.date_string;
  if(dateString.match(/\d{5,}/)){
    dateString = +dateString;
  }
  let passedValue = new Date(dateString);
  if(passedValue == "Invalid Date") {
    res.json({ "error" : "Invalid Date" })
  } else {
    res.json({
      "unix": passedValue.getTime(),
      "utc": passedValue.toUTCString()
    })
  }  
})

//Request Header Parser get request
app.get("/api/whoami", function (req, res) {
  res.json({
    "ipaddress": req.headers['x-forward-for'] || req.socket.remoteAddress || null,
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"]    
  })
})

//URL Shortener
//Build schema and model to save URLS
const ShortURL = mongoose.model('ShortURL', new mongoose.Schema({ 
  short_url: String,
  original_url: String,
  suffix: String
}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post("/api/shorturl/", function (req, res) {
  let suffix = nanoid(8)
  let requestedURL = req.body.url
  let newShortURL = suffix
  dns.lookup(urlParser.parse(requestedURL).hostname, (error, address) => {
    if(!address) {
      res.json({ error: "Invalid URL" })
    } else {let newURL = new ShortURL ({
    short_url: newShortURL,
    original_url: requestedURL,
    suffix: suffix
  })

  newURL.save(function(err, doc) {
    if (err) return console.error(err);
    res.json({    
    "short_url": newURL.short_url,
    "original_url": newURL.original_url    
    });
  });}
  })
  
})

app.get("/api/shorturl/:suffix", function(req, res) {
  let generatedSuffix = req.params.suffix;
  ShortURL.find({suffix: generatedSuffix}).then(function(foundUrls) {
    let urlRedirect = foundUrls[0];
    res.redirect(urlRedirect.original_url)
  })
});

//Exercise Tracker
//Build schema and model for exercise user
const ExerciseUser = mongoose.model('ExerciseUser', new mongoose.Schema({ 
  _id: String,
  username: String
}));


app.post("/api/users/", function (req, res) {
  console.log("accessing post request")
  let id = mongoose.Types.ObjectId();
  let exerciseUser = new ExerciseUser ({
    username: req.body.username,
    _id: id
  })

  exerciseUser.save(function(err, doc) {
    if (err) return console.error(err);
    res.json({    
    "saved": true,
    "username": exerciseUser.username,
    "_id": exerciseUser["_id"]    
    });
  })
})

app.get("/api/users", (req, res) => {
  ExerciseUser.find({}, (err, exerciseUsers) => {
    res.json(exerciseUsers)
  })  
})

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
