"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(req, res, next) {
    req.dbManager = req.app.get("dbManager");
    next();
}
exports.default = default_1;
