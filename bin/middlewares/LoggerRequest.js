"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../utils/Logger");
function default_1(req, res, next) {
    const logger = new Logger_1.default("Request");
    logger.log(req.method, req.path, "requested");
    next();
}
exports.default = default_1;
