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
var router = express_1.Router();
var node_fetch_1 = require("node-fetch");
var fs = require("fs");
router.get('/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var dataToSend, formData, reqToken, _a, _b, _c, _d, resToken, _e, _f, reqUser, resUser, _g, _h, userDB;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                console.log("Oauth requested");
                //Si on a pas recu le code on redirige avec un msg d'erreur
                if (!req.query.code) {
                    console.log("Error getting oauth code");
                    res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
                    return [2 /*return*/];
                }
                dataToSend = {
                    'client_id': process.env.CLIENT_ID,
                    'client_secret': process.env.CLIENT_SECRET,
                    'grant_type': "authorization_code",
                    'redirect_uri': process.env.OWN_ENDPOINT + "/oauth",
                    'code': req.query.code,
                    'scope': "identify email connections"
                };
                formData = new URLSearchParams();
                Object.entries(dataToSend).forEach(function (el) { return formData.append(el[0], el[1].toString()); });
                return [4 /*yield*/, node_fetch_1["default"](process.env.API_ENDPOINT + "/oauth2/token", {
                        method: "POST",
                        body: formData
                    })];
            case 1:
                reqToken = _j.sent();
                if (!(reqToken.status != 200)) return [3 /*break*/, 4];
                console.log("Error : " + reqToken.status + " " + reqToken.statusText);
                if (!(reqToken.status == 429 || reqToken.status == 400)) return [3 /*break*/, 3];
                _b = (_a = console).error;
                _d = (_c = JSON).parse;
                return [4 /*yield*/, reqToken.text()];
            case 2:
                _b.apply(_a, [_d.apply(_c, [_j.sent()])]);
                _j.label = 3;
            case 3:
                res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
                return [2 /*return*/];
            case 4:
                _f = (_e = JSON).parse;
                return [4 /*yield*/, reqToken.text()];
            case 5:
                resToken = _f.apply(_e, [_j.sent()]);
                return [4 /*yield*/, node_fetch_1["default"](process.env.API_ENDPOINT + "/users/@me", {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer " + resToken.access_token
                        }
                    })];
            case 6:
                reqUser = _j.sent();
                if (reqUser.status != 200) {
                    console.log("Error : " + reqUser.status + " " + reqUser.statusText);
                    res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
                    return [2 /*return*/];
                }
                _h = (_g = JSON).parse;
                return [4 /*yield*/, reqUser.text()];
            case 7:
                resUser = _h.apply(_g, [_j.sent()]);
                userDB = JSON.parse(fs.readFileSync(__dirname + "/../data/users.json").toString());
                if (Object.keys(userDB).includes(resUser.id)) {
                    req.session.userId = resUser.id;
                    res.cookie("userId", resUser.id, {
                        maxAge: Math.floor(Date.now() / 1000) - userDB[resUser.id].token_timestamp - 60 * 60 * 24
                    });
                    res.redirect("../?msg=" + encodeURI("Nice to see you again!"));
                    return [2 /*return*/];
                }
                else {
                    // console.log(`data user : ${JSON.stringify(resUser)}`);
                    userDB[resUser.id] = {
                        access_token: resToken.access_token,
                        token_timestamp: resToken.expires_in + Math.floor(Date.now() / 1000),
                        refresh_token: resToken.refresh_token
                    };
                    try {
                        fs.writeFileSync(__dirname + "/../data/users.json", JSON.stringify(userDB));
                    }
                    catch (e) {
                        console.error(e);
                        res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
                        return [2 /*return*/];
                    }
                    //La personne se reconnecte
                    req.session.userId = resUser.id;
                    res.cookie("userId", resUser.id, {
                        maxAge: resToken.expires_in - 60 * 60 * 24 //Le cookie va expirer un jour avant l'expiration du token
                    });
                    res.redirect("../?msg=" + encodeURI("Your account has been successfully synced!"));
                }
                return [2 /*return*/];
        }
    });
}); });
router.get("/bot", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var dataToSend, formData_1, reqToken, resToken, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.query.code) {
                    console.log("Error getting oauth code");
                    res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
                    return [2 /*return*/];
                }
                if (!(req.query.permissions != "8")) return [3 /*break*/, 1];
                res.redirect("../?msg=" + encodeURI("You need to get me full powers!"));
                return [2 /*return*/];
            case 1:
                dataToSend = {
                    'client_id': process.env.CLIENT_ID,
                    'client_secret': process.env.CLIENT_SECRET,
                    'grant_type': "authorization_code",
                    'redirect_uri': process.env.OWN_ENDPOINT + "/oauth/bot",
                    'code': req.query.code,
                    'scope': "bot"
                };
                formData_1 = new URLSearchParams();
                Object.entries(dataToSend).forEach(function (el) { return formData_1.append(el[0], el[1].toString()); });
                return [4 /*yield*/, node_fetch_1["default"](process.env.API_ENDPOINT + "/oauth2/token", {
                        method: "POST",
                        body: formData_1
                    })];
            case 2:
                reqToken = _c.sent();
                if (reqToken.status != 200) {
                    console.log("Error : " + reqToken.status + " " + reqToken.statusText);
                    res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
                    return [2 /*return*/];
                }
                _b = (_a = JSON).parse;
                return [4 /*yield*/, reqToken.text()];
            case 3:
                resToken = _b.apply(_a, [_c.sent()]);
                if (!fs.existsSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + req.query.guild_id + "/data.json")) {
                    fs.mkdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + req.query.guild_id);
                    fs.writeFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + req.query.guild_id + "/data.json", JSON.stringify({
                        ponctual: [],
                        freq: [],
                        deleted: [],
                        token: resToken.access_token,
                        token_expires: resToken.expires_in,
                        refresh_token: resToken.refresh_token,
                        guild_owner_id: resToken.guild.owner_id
                    }));
                }
                res.redirect("../dashboard/?id=" + req.query.guild_id);
                _c.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
