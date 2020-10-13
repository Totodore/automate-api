"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
exports.__esModule = true;
function default_1(req, res, next) {
    var _this = this;
    var Message = req.dbManager.Message;
    var Guild = req.dbManager.Guild;
    var User = req.dbManager.User;
    /**
     * Add Message to the message DB by passing query arguments and type of the message
     * @param query data to add to the message
     * @param type message type to add
     */
    req.addMessage = function (query, type) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = Message).create;
                    _c = [{}, query];
                    _d = { type: type };
                    return [4 /*yield*/, Guild.findOne({ where: { id: query.guild_id }, attributes: { include: ["timezone_code"] } })];
                case 1: return [4 /*yield*/, _b.apply(_a, [__assign.apply(void 0, _c.concat([(_d.timezone_code = (_e.sent()).timezone_code, _d)]))])];
                case 2: return [2 /*return*/, (_e.sent()).getDataValue("id")];
            }
        });
    }); };
    req.updateMessage = function (query) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Message.update(__assign({}, query), { where: { id: query.msg_id } })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    req.addUser = function (data) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User.create(data)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    req.addGuild = function (data) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Guild.create(data)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Check if the user can still ad messages or not depending on the current limit
     * @param guildId
     */
    req.isOverMessageLimit = function (guildId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Message.count({ where: { guild_id: guildId } })];
                case 1: return [2 /*return*/, (_a.sent()) > parseInt(process.env.MAX_MESSAGE)];
            }
        });
    }); };
    /**
     * Update the timezone of a guild, also update all the messages timezonese concerned by this guild
     * @param guildId the guild in which to change the timezone
     * @param timezone_code the timezone code to change
     * @param timezone the timezone text to change
     */
    req.updateTimezone = function (guildId, timezone_code, timezone) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Guild.update({
                        timezone: timezone,
                        timezone_code: timezone_code
                    }, { where: { id: guildId } })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, Message.update({
                            timezone_code: timezone_code
                        }, { where: { guild_id: guildId } })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get all the user data in function of his id
     * @param userId the desired user id
     */
    req.getUser = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User.findOne({ where: { id: userId } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    /**
     * Check if the guild exists in the database
     * @param guildId the guild id to check
     */
    req.hasGuild = function (guildId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Guild.findOne({ where: { id: guildId } })];
                case 1: return [2 /*return*/, (_a.sent()) != null];
            }
        });
    }); };
    /**
     * Check if the user exists in the database
     * @param userId  the user id to check
     */
    req.hasUser = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, req.getUser(userId)];
                case 1: return [2 /*return*/, (_a.sent()) != null];
            }
        });
    }); };
    next();
}
exports["default"] = default_1;
