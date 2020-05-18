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
const pm2 = require('pm2');
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
        //On exclu les chemins oauth et connect sinon on a des redirections infinies et ajax
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
            res.redirect("../connect?msg="+encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
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
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    detached: false
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
    console.log("Checking tokens expiration every hour...");
    checkTokens();
    setInterval(checkTokens, 1000*60*60); //Toutes les heures le bot check les tokens des gens pour vérifier qu'il est à jour
    setTimeout(restartApp, 1000*60*60*3 + 3*1000);   //Toutes les trois heures on redémarre le bot (+ 3 seconde pour que ca redémarre pas en même temps que l'envoie des stats)
});

async function checkTokens() {
    const userData = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`));
    const keysToDelete = [];
    try {
        for (const key of Object.keys(userData)) {
            const value = userData[key];
            if (value.token_timestamp < Math.floor(Date.now()/1000) - 60*60*24)//si ca expire dans 1jours
                keysToDelete.push(key);
        }
        console.log(`Checking token availability : ${keysToDelete.length} user accounts expired`);
        keysToDelete.forEach(key => delete userData[key]);
    } catch(e) {
        console.error(`Error function refresh token : ${e}`);
        return;
    }
    fs.writeFileSync(`${__dirname}/data/users.json`, JSON.stringify(userData));
}

async function restartApp() {
    console.log("Restarting app...");
    pm2.restart("app", () => {
        console.error("Error restarting automatically restart app");
    });
}
module.exports = app;