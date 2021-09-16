const express = require('express')
const routerThree = express.Router()
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const dns = require("dns");
const urlParser = require("url");

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

  routerThree.post("/api/shorturl/", function (req, res) {
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

routerThree.get("/api/shorturl/:suffix", function (req, res) {
    let generatedSuffix = req.params.suffix;
    ShortURL.find({ suffix: generatedSuffix }).then(function (foundUrls) {
      let urlRedirect = foundUrls[0];
      res.redirect(urlRedirect.original_url);
    });
  });

  
  module.exports = routerThree