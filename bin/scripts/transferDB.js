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
var DBManager_1 = require("../src/utils/DBManager");
var path = require("path");
var node_fetch_1 = require("node-fetch");
var fs = require("fs");
var MessageModel_1 = require("../src/models/MessageModel");
var dotenv = require("dotenv");
console.log(dotenv);
dotenv.config();
var dbManager = new DBManager_1["default"]();
dbManager.init(true).then(dlUsers);
process.chdir(path.join(process.cwd(), "temp/guilds"));
function dlUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var users, _i, _a, userId, user, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, node_fetch_1["default"]("https://automatebot.app/users.json")];
                case 1: return [4 /*yield*/, (_b.sent()).json()];
                case 2:
                    users = _b.sent();
                    _i = 0, _a = Object.keys(users);
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    userId = _a[_i];
                    user = users[userId];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, dbManager.User.create(__assign({ id: userId }, user))];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _b.sent();
                    console.log(e_1);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    loadGuilds();
                    return [2 /*return*/];
            }
        });
    });
}
function loadGuilds() {
    return __awaiter(this, void 0, void 0, function () {
        var folders, _i, folders_1, guildId, data, _a, _b, message, _c, _d, message, e_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    folders = fs.readdirSync(".");
                    _i = 0, folders_1 = folders;
                    _e.label = 1;
                case 1:
                    if (!(_i < folders_1.length)) return [3 /*break*/, 14];
                    guildId = folders_1[_i];
                    data = JSON.parse(fs.readFileSync(path.join(guildId, "data.json")).toString());
                    console.log("data size", data.toString().length);
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 12, , 13]);
                    return [4 /*yield*/, dbManager.Guild.create({
                            id: guildId,
                            guild_owner_id: data.guild_owner_id,
                            refresh_token: data.refresh_token,
                            timezone: data.timezone,
                            timezone_code: data.timezone_code,
                            token: data.token,
                            token_expires: data.token_expires
                        })];
                case 3:
                    _e.sent();
                    _a = 0, _b = data.ponctual;
                    _e.label = 4;
                case 4:
                    if (!(_a < _b.length)) return [3 /*break*/, 7];
                    message = _b[_a];
                    return [4 /*yield*/, dbManager.Message.create(__assign({}, message, { guild_id: guildId, type: MessageModel_1.MessageType.Ponctual, timezone_code: data.timezone_code }))];
                case 5:
                    _e.sent();
                    _e.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 4];
                case 7:
                    _c = 0, _d = data.freq;
                    _e.label = 8;
                case 8:
                    if (!(_c < _d.length)) return [3 /*break*/, 11];
                    message = _d[_c];
                    return [4 /*yield*/, dbManager.Message.create(__assign({}, message, { guild_id: guildId, type: MessageModel_1.MessageType.Frequential, timezone_code: data.timezone_code }))];
                case 9:
                    _e.sent();
                    _e.label = 10;
                case 10:
                    _c++;
                    return [3 /*break*/, 8];
                case 11: return [3 /*break*/, 13];
                case 12:
                    e_2 = _e.sent();
                    console.log(e_2);
                    return [3 /*break*/, 13];
                case 13:
                    _i++;
                    return [3 /*break*/, 1];
                case 14: return [2 /*return*/];
            }
        });
    });
}
