const express = require('express')
const routerFive = express.Router()
var multer = require("multer");
var upload = multer({ dest: "uploads/" });


routerFive.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
    res.json({ 
      'name': req.file.originalname,
      'type': req.file.mimetype,
      'size': req.file.size, 
    });
  });
  

module.exports = routerFive