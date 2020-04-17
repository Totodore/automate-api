const express = require('express');
const router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('connect', {oauth_link: process.env.OAUTH_LINK, header: req.headerData});
});

module.exports = router;
