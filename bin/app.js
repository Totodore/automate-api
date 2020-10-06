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
var dotenv = require("dotenv");
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
dotenv.config();
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
//MiddelWare qui detecte si l'utilisateur est connecté ou pas
app.use(CheckUserLogin_1["default"]);
//MiddleWare de chargement de la photo de profil
app.use(LoadUserData_1["default"]);
//Regex qui prend tt sauf connect
//Middelware de gestion des données
app.use("/\b(?!" + RoutesList_1["default"].connect + ")\bS+/g", LoadDB_1["default"]);
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
app.listen(3000, function () {
    console.log("Server started, starting bot...");
    console.log("Checking tokens expiration every hour...");
    CheckTokens_1["default"]();
    setInterval(CheckTokens_1["default"], 1000 * 60 * 60); //Toutes les heures le bot check les tokens des gens pour vérifier qu'il est à jour
});
exports["default"] = app;
