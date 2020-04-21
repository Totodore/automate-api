const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const fs = require("fs");
const fetch = require("node-fetch");
const fork = require("child_process").fork;
const formidable = require("express-formidable");
const botProgram = path.resolve("./bot/bot.js");
require("dotenv").config();

const indexRouter = require('./routes/index');
const connectRouter = require('./routes/connect');
const oauthRouter = require("./routes/oauth");
const ajaxRouter = require("./routes/ajax");
const dashboardRouter = require("./routes/dashboard");

const app = express();
let bot;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("ejs", require("ejs").__express);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(formidable());
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({ secret: "CoderLab=<3", resave: false, saveUninitialized: true, }));
app.use(express.static(path.join(__dirname, 'public')));

try {
    const io = require("@pm2/io");
    io.init({
        transactions: true, // will enable the transaction tracing
        http: true // will enable metrics about the http server (optional)
    });
} catch (e) {
    console.log("Tracing request not enabled");
}
//Fonction pour détecter si l'utilisateur est connecté ou pas
app.use((req, res, next) => {
    if (!req.session.userId && req.cookies.userId) {
        req.session.userId = req.cookies.userId;
        next();
    } else if (!req.session.userId && !req.cookies.userId && req.path != "/connect" && req.path != "/oauth" && !req.path.split("/").includes("ajax")) {
        //On exclu les chemins oauth et connect sinon on a des redirections infinies
        res.redirect("/connect");
    } else next();
});

//Fonction pour charger la photo de profile sur le header
app.use(async (req, res, next) => {
    if (req.session.userId) {
        const userData = JSON.parse(fs.readFileSync(__dirname + process.env.DB_FILE))[req.session.userId];
        const reqUser = await fetch("https://discordapp.com/api/users/@me", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.access_token}`
            }
        });
        if (reqUser.status != 200) {
            console.log(`Error : ${reqUser.status} ${reqUser.statusText}`);
            res.redirect("../connect?msg="+encodeURI("Ouuups ! Il semblerait qu'il soit impossible de te connecter à Discord"));
            return;
        }
        const resUser = JSON.parse(await reqUser.text());
        req.headerData = {
            username: resUser.username,
            avatar: `${process.env.CDN_ENDPOINT}/avatars/${req.session.userId}/${resUser.avatar}.png?size=64`
        };
    } 
    next();
});

app.use('/', indexRouter);
app.use('/connect', connectRouter);
app.use('/oauth', oauthRouter);
app.use('/ajax', ajaxRouter);
app.use("/dashboard", dashboardRouter);

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

const botParameters = [];
const botOptions = {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
};


bot = fork(botProgram, botParameters, botOptions);  
bot.setMaxListeners(999999);
app.set("bot", bot);
bot.once("message", message => {
    console.log(`Message from bot : ${message}`);
    if (message == "started") {
        console.log("Bot started, communication enabled");
    }
});

app.listen(3000, () => {
    console.log("Server started, starting bot...");
});
module.exports = app;