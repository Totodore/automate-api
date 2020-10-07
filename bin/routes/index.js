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
var express = require("express");
var Logger_1 = require("../utils/Logger");
var router = express.Router();
var ADMINISTRATOR = 0x00000008;
var MANAGE_GUILD = 0x00000020;
/* GET home page. */
router.get('/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var logger, token, guildRes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger = new Logger_1["default"]("Index");
                return [4 /*yield*/, req.getUser(req.session.userId)];
            case 1:
                token = (_a.sent()).access_token;
                return [4 /*yield*/, req.getUserGuildsDiscord(token)];
            case 2:
                guildRes = _a.sent();
                if (!guildRes) {
                    res.render('index', { header: req.headerData, error: "I didn't manage to collect all your channels, sniffu..." });
                    return [2 /*return*/];
                }
                try {
                    guildRes = guildRes.filter(function (el) {
                        if (el.permissions & ADMINISTRATOR || el.permissions & MANAGE_GUILD)
                            return true;
                        else
                            return false;
                    });
                }
                catch (e) {
                    logger.log("Erreur lors de la guildRes filter");
                    res.render('index', { header: req.headerData, error: "I didn't manage to collect all your channels, sniffu..." });
                    return [2 /*return*/];
                }
                guildRes.forEach(function (element) { return element.added = req.hasGuild(element.id); });
                guildRes.sort(function (a, b) { if (a.added)
                    return -1;
                else if (b.added)
                    return 1;
                else
                    return 0; });
                if (guildRes.length > 0)
                    res.render('index', { header: req.headerData, guilds: guildRes, bot_link: process.env.BOT_LINK });
                else
                    res.render("index", { header: req.headerData, error: "It seems that there is nowhere for me to hop in... Snifffu.\n I'll be able to, if you ask for permissions to be Admin :p" });
                return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
