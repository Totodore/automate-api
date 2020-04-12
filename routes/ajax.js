const express = require('express');
const fs = require("fs");

const router = express.Router();
router.get('/', function(req, res, next) {
  res.redirect("../");
});

router.get('/deconnectUser', function(req, res, next) {
    req.session.destroy();
    res.clearCookie("userId");
    res.sendStatus(200);
});

module.exports = router;
