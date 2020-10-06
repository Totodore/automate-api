import * as createError from "http-errors";
import * as express from "express";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";
import * as session from "express-session";
import * as fs from "fs";
import fetch from "node-fetch";
import * as formidable from "express-formidable";
import Bot from "./Bot";
import * as dotenv from "dotenv";
import * as ejs from "ejs";
import SessionRequest from "./requests/SessionRequest";

dotenv.config();
import IndexRouter from "./routes/index";
import ConnectRouter from './routes/connect';
import OauthRouter from "./routes/oauth";
import AjaxRouter from "./routes/ajax"; 
import DashboardRouter from "./routes/dashboard";

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("ejs", ejs.renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(formidable());
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({ secret: "CoderLab=<3", resave: false, saveUninitialized: true, }));
app.use(express.static(path.join(__dirname, 'public')));

//Fonction pour détecter si l'utilisateur est connecté ou pas
app.use((req: SessionRequest, res, next) => {
    if (!req.session.userId && req.cookies.userId) {
        req.session.userId = req.cookies.userId;
        next();
    } else if (!req.session.userId && !req.cookies.userId && req.path != "/connect" && req.path != "/oauth" && !req.path.split("/").includes("ajax")) {
        //On exclu les chemins oauth et connect sinon on a des redirections infinies et ajax
        res.redirect("/connect");
    } else next();
});

//Fonction pour charger la photo de profile sur le header
app.use(async (req: SessionRequest, res, next) => {
    if (req.session.userId) {
        const userData = JSON.parse(fs.readFileSync(__dirname + process.env.DB_FILE).toString())[req.session.userId];
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

app.use('/', IndexRouter);
app.use('/connect', ConnectRouter);
app.use('/oauth', OauthRouter);
app.use('/ajax', AjaxRouter);
app.use("/dashboard", DashboardRouter);

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

app.set("bot", new Bot());

app.listen(3000, () => {
    console.log("Server started, starting bot...");
    console.log("Checking tokens expiration every hour...");
    checkTokens();
    setInterval(checkTokens, 1000*60*60); //Toutes les heures le bot check les tokens des gens pour vérifier qu'il est à jour
});

async function checkTokens() {
    const userData = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`).toString());
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

export default app;
