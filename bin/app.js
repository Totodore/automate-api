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
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var fs = require("fs");
var node_fetch_1 = require("node-fetch");
var formidable = require("express-formidable");
var Bot_1 = require("./Bot");
var dotenv = require("dotenv");
var ejs = require("ejs");
dotenv.config();
var index_1 = require("./routes/index");
var connect_1 = require("./routes/connect");
var oauth_1 = require("./routes/oauth");
var ajax_1 = require("./routes/ajax");
var dashboard_1 = require("./routes/dashboard");
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("ejs", ejs.renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(formidable());
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({ secret: "CoderLab=<3", resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));
//Fonction pour détecter si l'utilisateur est connecté ou pas
app.use(function (req, res, next) {
    if (!req.session.userId && req.cookies.userId) {
        req.session.userId = req.cookies.userId;
        next();
    }
    else if (!req.session.userId && !req.cookies.userId && req.path != "/connect" && req.path != "/oauth" && !req.path.split("/").includes("ajax")) {
        //On exclu les chemins oauth et connect sinon on a des redirections infinies et ajax
        res.redirect("/connect");
    }
    else
        next();
});
//Fonction pour charger la photo de profile sur le header
app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var userData, reqUser, resUser, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.session.userId) return [3 /*break*/, 3];
                userData = JSON.parse(fs.readFileSync(__dirname + process.env.DB_FILE).toString())[req.session.userId];
                return [4 /*yield*/, node_fetch_1["default"]("https://discordapp.com/api/users/@me", {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer " + userData.access_token
                        }
                    })];
            case 1:
                reqUser = _c.sent();
                if (reqUser.status != 200) {
                    console.log("Error : " + reqUser.status + " " + reqUser.statusText);
                    res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
                    return [2 /*return*/];
                }
                _b = (_a = JSON).parse;
                return [4 /*yield*/, reqUser.text()];
            case 2:
                resUser = _b.apply(_a, [_c.sent()]);
                req.headerData = {
                    username: resUser.username,
                    avatar: process.env.CDN_ENDPOINT + "/avatars/" + req.session.userId + "/" + resUser.avatar + ".png?size=64"
                };
                _c.label = 3;
            case 3:
                next();
                return [2 /*return*/];
        }
    });
}); });
app.use('/', index_1["default"]);
app.use('/connect', connect_1["default"]);
app.use('/oauth', oauth_1["default"]);
app.use('/ajax', ajax_1["default"]);
app.use("/dashboard", dashboard_1["default"]);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
app.set("bot", new Bot_1["default"]());
app.listen(3000, function () {
    console.log("Server started, starting bot...");
    console.log("Checking tokens expiration every hour...");
    checkTokens();
    setInterval(checkTokens, 1000 * 60 * 60); //Toutes les heures le bot check les tokens des gens pour vérifier qu'il est à jour
});
function checkTokens() {
    return __awaiter(this, void 0, void 0, function () {
        var userData, keysToDelete, _i, _a, key, value;
        return __generator(this, function (_b) {
            userData = JSON.parse(fs.readFileSync(__dirname + "/data/users.json").toString());
            keysToDelete = [];
            try {
                for (_i = 0, _a = Object.keys(userData); _i < _a.length; _i++) {
                    key = _a[_i];
                    value = userData[key];
                    if (value.token_timestamp < Math.floor(Date.now() / 1000) - 60 * 60 * 24)
                        keysToDelete.push(key);
                }
                console.log("Checking token availability : " + keysToDelete.length + " user accounts expired");
                keysToDelete.forEach(function (key) { return delete userData[key]; });
            }
            catch (e) {
                console.error("Error function refresh token : " + e);
                return [2 /*return*/];
            }
            fs.writeFileSync(__dirname + "/data/users.json", JSON.stringify(userData));
            return [2 /*return*/];
        });
    });
}
exports["default"] = app;
