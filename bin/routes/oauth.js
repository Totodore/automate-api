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
var _this = this;
exports.__esModule = true;
var express_1 = require("express");
var router = express_1.Router();
var Logger_1 = require("src/utils/Logger");
router.get('/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var logger, dataToSend, resToken, resUser, tokenTimestamp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger = new Logger_1["default"]("Oauth");
                logger.log("Oauth requested");
                //Si on a pas recu le code on redirige avec un msg d'erreur
                if (!req.query.code) {
                    logger.log("Error getting oauth code");
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
                return [4 /*yield*/, req.getDiscordToken(dataToSend)];
            case 1:
                resToken = _a.sent();
                return [4 /*yield*/, req.getUserDiscord(resToken.access_token)];
            case 2:
                resUser = _a.sent();
                if (!resToken || !resUser.id) {
                    res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
                    return [2 /*return*/];
                }
                //On fait une requete pour avoir l'id de la personne discord
                req.session.userId = resUser.id;
                if (!req.hasUser(resUser.id)) return [3 /*break*/, 4];
                req.session.userId = resUser.id;
                return [4 /*yield*/, req.getUser(resUser.id)];
            case 3:
                tokenTimestamp = (_a.sent()).token_timestamp;
                res.cookie("userId", resUser.id, {
                    maxAge: Math.floor(Date.now() / 1000) - tokenTimestamp - 60 * 60 * 24
                });
                res.redirect("../?msg=" + encodeURI("Nice to see you again!"));
                return [3 /*break*/, 5];
            case 4:
                try {
                    req.addUser(__assign({}, resToken, { token_timestamp: resToken.expires_in + Math.floor(Date.now() / 1000) }));
                }
                catch (e) {
                    logger.error(e);
                    res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
                }
                //La personne se reconnecte
                res.cookie("userId", resUser.id, {
                    maxAge: resToken.expires_in - 60 * 60 * 24 //Le cookie va expirer un jour avant l'expiration du token
                });
                res.redirect("../?msg=" + encodeURI("Your account has been successfully synced!"));
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get("/bot", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var logger, dataToSend, resToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger = new Logger_1["default"]("OauthBot");
                if (!req.query.code) {
                    logger.log("Error getting oauth code");
                    res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
                    return [2 /*return*/];
                }
                if (req.query.permissions != "8") {
                    res.redirect("../?msg=" + encodeURI("You need to get me full powers!"));
                    return [2 /*return*/];
                }
                dataToSend = {
                    'client_id': process.env.CLIENT_ID,
                    'client_secret': process.env.CLIENT_SECRET,
                    'grant_type': "authorization_code",
                    'redirect_uri': process.env.OWN_ENDPOINT + "/oauth/bot",
                    'code': req.query.code,
                    'scope': "bot"
                };
                return [4 /*yield*/, req.addBotDiscord(dataToSend)];
            case 1:
                resToken = _a.sent();
                if (!resToken) {
                    res.redirect("../?msg=" + encodeURI("Whoops ! It seems like your connection to your server is impossible!"));
                    return [2 /*return*/];
                }
                if (!!req.hasGuild(req.query.guild_id.toString())) return [3 /*break*/, 3];
                return [4 /*yield*/, req.addGuild({
                        token: resToken.access_token,
                        token_expires: resToken.expires_in,
                        refresh_token: resToken.refresh_token,
                        guild_owner_id: resToken.guild.owner_id,
                        id: req.query.guild_id.toString()
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                res.redirect("/dashboard/?id=" + req.query.guild_id);
                return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
