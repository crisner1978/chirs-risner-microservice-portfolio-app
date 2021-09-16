const express = require('express')
const router = express.Router()

  //Timestamp get request
router.get("/api/timestamp", function (req, res) {
    let now = new Date();
    res.json({
      unix: now.getTime(),
      utc: now.toUTCString(),
    });
  });

  router.get("/api/timestamp/:date_string", function (req, res) {
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
  

module.exports = router