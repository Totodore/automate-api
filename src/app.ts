import * as createError from "http-errors";
import * as express from "express";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";
import * as session from "express-session";
import * as formdata from "express-form-data";
import Bot from "./Bot";
import * as ejs from "ejs";

import IndexRouter from "./routes/index";
import ConnectRouter from './routes/connect';
import OauthRouter from "./routes/oauth";
import AjaxRouter from "./routes/ajax"; 
import DashboardRouter from "./routes/dashboard";
import LoadUserData from "./middlewares/LoadUserData";
import CheckUserLogin from "./middlewares/CheckUserLogin";
import checkTokens from "./utils/CheckTokens";
import routesList from "./RoutesList";
import LoadDB from "./middlewares/LoadDB";
import DBFunctions from "./middlewares/DBFunctions";
import DiscordRequestsMiddleware from "./middlewares/DiscordRequestsMiddleware";
import DBManager from "./utils/DBManager";
import LoggerRequest from "./middlewares/LoggerRequest";
const app = express();
// view engine setup
app.set('views', process.cwd() + '/views');
app.set('view engine', 'ejs');
app.engine("ejs", ejs.renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(formdata.parse({
	autoClean: true,
}));
app.use(formdata.format());
app.use(cookieParser());
process.env.NODE_ENV == "production" || app.use(logger('dev'));
app.use(cookieParser());
app.use(session({ secret: "CoderLab=<3", resave: false, saveUninitialized: true, }));
app.use(express.static(path.join(process.cwd(), "public")));

//Regex qui prend tt sauf connect
//Middleware de gestion des données
app.use(LoggerRequest);
app.use(LoadDB);
app.use(DBFunctions);
//MiddelWare qui detecte si l'utilisateur est connecté ou pas
//Pour les routes qui on besoin d'être logger on check le user login
app.use([routesList.dashboard, routesList.index], CheckUserLogin, LoadUserData);

//MiddleWare de chargement de la photo de profil
//Pour les routes où c'est requis
// app.use(`/\b(${routesList.dashboard}|${routesList.index})\b/g`, LoadUserData):,;

app.use([routesList.index, routesList.oauth], DiscordRequestsMiddleware);

app.use(routesList.index, IndexRouter);
app.use(routesList.connect, ConnectRouter);
app.use(routesList.oauth, OauthRouter);
app.use(routesList.ajax, AjaxRouter);
app.use(routesList.dashboard, DashboardRouter);

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

const dbManager = new DBManager()
dbManager.init().then(() => {
  app.set("dbManager", dbManager);
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log("Listening on port " + PORT)
    console.log("Server started, starting bot...");
    console.log("Checking tokens expiration every hour...");
    checkTokens();
    setInterval(checkTokens, 1000 * 60 * 60); //Toutes les heures le bot check les tokens des gens pour vérifier qu'il est à jour
  });
  
});
export default app
