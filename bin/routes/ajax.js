"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var express_1 = require("express");
var momentTz = require("moment-timezone");
var MessageModel_1 = require("src/models/MessageModel");
var Logger_1 = require("src/utils/Logger");
var router = express_1.Router();
router.get('/', function (req, res) {
    res.redirect("../");
});
router.get('/deconnectUser', function (req, res) {
    delete req.session;
    res.clearCookie("userId");
    res.sendStatus(200);
});
router.get("/remove_message", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var logger, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger = new Logger_1["default"]("RemoveMessage");
                if (!req.query.id) {
                    logger.log("Error args not given");
                    res.status(520).send("Error args not given bad request");
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, req.dbManager.Guild.findOne({ where: { id: req.query.id } })];
            case 2:
                (_a.sent()).destroy();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                logger.log("Error ajax remove schedule : " + error_1);
                res.status(500).send("Error operating on db");
                return [2 /*return*/];
            case 4:
                res.send("This message has successfully been deleted");
                return [2 /*return*/];
        }
    });
}); });
router.post("/add_schedule", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var logger, query, addedID, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger = new Logger_1["default"]("AddSchedule");
                query = req.body;
                if (!query.content || query.content.length < 1 || !query.frequency || !query.cron || !query.channel_id || !query.guild_id || !query.sys_content) {
                    res.status(520);
                    res.send("Error params not given");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, req.isOverMessageLimit(query.guild_id)];
            case 2:
                if (!_a.sent()) return [3 /*break*/, 3];
                res.status(403);
                res.send("Message not allowed");
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, req.addMessage(query, MessageModel_1.MessageType.Frequential)];
            case 4:
                addedID = _a.sent();
                res.send(addedID);
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                logger.log("Error ajax add schedule : " + error_2);
                res.sendStatus(500);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.post("/add_timer", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var query, logger, addedID, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.body;
                logger = new Logger_1["default"]("AddTimer");
                if (!query.content || query.content.length < 1 || !query.timestamp || !query.description || !query.channel_id || !query.guild_id || !query.sys_content) {
                    res.status(400).send("Bad request : Params not given");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, req.isOverMessageLimit(query.guild_id)];
            case 2:
                if (_a.sent()) {
                    res.status(403);
                    res.send("Message not allowed");
                }
                else {
                    req.addMessage(query, MessageModel_1.MessageType.Ponctual);
                    res.send(addedID);
                }
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                logger.log("Error ajax add ponctual : " + error_3);
                res.sendStatus(500);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/set_timezone", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var query, logger, utc_offset_1, timezone_code, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.query;
                logger = new Logger_1["default"]("SetTimezone");
                if (!query.guild_id || !query.utc_offset || !query.timezone) {
                    res.status(400).send("Bad request : Params not given");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                utc_offset_1 = parseInt(query.utc_offset.toString()) * 60;
                timezone_code = momentTz.tz.names().filter(function (el) {
                    return momentTz.tz.zone(el).utcOffset(new Date().getTime()) == utc_offset_1;
                })[0];
                return [4 /*yield*/, req.updateTimezone(query.guild_id.toString(), timezone_code, query.timezone.toString())];
            case 2:
                _a.sent();
                res.send("This timezone has been successfully set !");
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                logger.log("Error ajax set timezone : " + error_4);
                res.status(500);
                return [2 /*return*/];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/set_message", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var query, logger, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.body;
                logger = new Logger_1["default"]("SetMessage");
                if (!query.content || query.content.length < 1 || !query.msg_id || !query.guild_id || !query.sys_content) {
                    res.status(400).send("Error bad request : params not given");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, req.updateMessage(query.msg_id, query.content, query.sys_content)];
            case 2:
                _a.sent();
                res.send();
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                logger.log("Error ajax set message : " + error_5);
                res.status(500);
                return [2 /*return*/];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
