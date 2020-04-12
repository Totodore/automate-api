const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("testdazdianz");
    res.sendStatus(200);
});

module.exports = router;