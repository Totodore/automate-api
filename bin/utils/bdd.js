"use strict";
exports.__esModule = true;
var mysql = require("mysql");
var BDDManager = /** @class */ (function () {
    function BDDManager() {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST
        });
    }
    return BDDManager;
}());
exports["default"] = BDDManager;
