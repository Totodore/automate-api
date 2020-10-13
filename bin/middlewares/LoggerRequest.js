"use strict";
exports.__esModule = true;
var Logger_1 = require("../utils/Logger");
function default_1(req, res) {
    var logger = new Logger_1["default"]("Request");
    logger.log(req.method, req.route, "requested");
}
exports["default"] = default_1;
