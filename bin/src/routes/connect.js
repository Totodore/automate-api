"use strict";
exports.__esModule = true;
var express_1 = require("express");
var router = express_1.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('connect', { oauth_link: process.env.OAUTH_LINK, header: req.headerData });
});
exports["default"] = router;
