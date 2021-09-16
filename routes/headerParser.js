const express = require('express')
const routerTwo = express.Router()

//Request Header Parser get request
routerTwo.get("/api/whoami", function (req, res) {
    res.json({
      ipaddress: req.headers["x-forward-for"] || req.socket.remoteAddress || null,
      language: req.headers["accept-language"],
      software: req.headers["user-agent"],
    });
  });

  
  module.exports = routerTwo