"use strict";
exports.__esModule = true;
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var formidable = require("express-formidable");
var Bot_1 = require("./Bot");
var ejs = require("ejs");
var index_1 = require("./routes/index");
var connect_1 = require("./routes/connect");
var oauth_1 = require("./routes/oauth");
var ajax_1 = require("./routes/ajax");
var dashboard_1 = require("./routes/dashboard");
var LoadUserData_1 = require("./middlewares/LoadUserData");
var CheckUserLogin_1 = require("./middlewares/CheckUserLogin");
var CheckTokens_1 = require("./utils/CheckTokens");
var RoutesList_1 = require("./RoutesList");
var LoadDB_1 = require("./middlewares/LoadDB");
var DBFunctions_1 = require("./middlewares/DBFunctions");
var DiscordRequestsMiddleware_1 = require("./middlewares/DiscordRequestsMiddleware");
var DBManager_1 = require("./utils/DBManager");
var app = express();
// view engine setup
app.set('views', process.cwd() + '/views');
app.set('view engine', 'ejs');
app.engine("ejs", ejs.renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(formidable());
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({ secret: "CoderLab=<3", resave: false, saveUninitialized: true }));
app.use(express.static(path.join(process.cwd(), "public")));
//Regex qui prend tt sauf connect
//Middleware de gestion des données
app.use(LoadDB_1["default"]);
app.use(DBFunctions_1["default"]);
//MiddelWare qui detecte si l'utilisateur est connecté ou pas
//Pour les routes qui on besoin d'être logger on check le user login
app.use([RoutesList_1["default"].dashboard, RoutesList_1["default"].index], CheckUserLogin_1["default"], LoadUserData_1["default"]);
//MiddleWare de chargement de la photo de profil
//Pour les routes où c'est requis
// app.use(`/\b(${routesList.dashboard}|${routesList.index})\b/g`, LoadUserData):,;
app.use([RoutesList_1["default"].index, RoutesList_1["default"].oauth], DiscordRequestsMiddleware_1["default"]);
app.use(RoutesList_1["default"].index, index_1["default"]);
app.use(RoutesList_1["default"].connect, connect_1["default"]);
app.use(RoutesList_1["default"].oauth, oauth_1["default"]);
app.use(RoutesList_1["default"].ajax, ajax_1["default"]);
app.use(RoutesList_1["default"].dashboard, dashboard_1["default"]);
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
var dbManager = new DBManager_1["default"]();
dbManager.init().then(function () {
    app.set("dbManager", dbManager);
    var PORT = process.env.PORT || 3000;
    app.listen(PORT, function () {
        console.log("Listening on port " + PORT);
        console.log("Server started, starting bot...");
        console.log("Checking tokens expiration every hour...");
        CheckTokens_1["default"]();
        setInterval(CheckTokens_1["default"], 1000 * 60 * 60); //Toutes les heures le bot check les tokens des gens pour vérifier qu'il est à jour
    });
});
exports["default"] = app;
