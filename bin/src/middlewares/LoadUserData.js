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
exports.__esModule = true;
var node_fetch_1 = require("node-fetch");
function default_1(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userData, reqUser, resUser, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!req.session.userId) return [3 /*break*/, 4];
                    return [4 /*yield*/, req.getUser(req.session.userId)];
                case 1:
                    userData = _c.sent();
                    return [4 /*yield*/, node_fetch_1["default"]("https://discordapp.com/api/users/@me", {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer " + userData.access_token
                            }
                        })];
                case 2:
                    reqUser = _c.sent();
                    if (reqUser.status != 200) {
                        console.log("Error : " + reqUser.status + " " + reqUser.statusText);
                        res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
                        return [2 /*return*/];
                    }
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, reqUser.text()];
                case 3:
                    resUser = _b.apply(_a, [_c.sent()]);
                    req.headerData = {
                        username: resUser.username,
                        avatar: process.env.CDN_ENDPOINT + "/avatars/" + req.session.userId + "/" + resUser.avatar + ".png?size=64"
                    };
                    _c.label = 4;
                case 4:
                    next();
                    return [2 /*return*/];
            }
        });
    });
}
exports["default"] = default_1;
