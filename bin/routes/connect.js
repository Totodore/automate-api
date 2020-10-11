"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('connect', { oauth_link: process.env.OAUTH_LINK, header: req.headerData });
});
exports.default = router;
