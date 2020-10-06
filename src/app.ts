import * as createError from "http-errors";
import * as express from "express";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";
import * as session from "express-session";
import * as formidable from "express-formidable";
import Bot from "./Bot";
import * as dotenv from "dotenv";
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

dotenv.config();
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

//MiddelWare qui detecte si l'utilisateur est connecté ou pas
app.use(CheckUserLogin);

//MiddleWare de chargement de la photo de profil
app.use(LoadUserData);

//Regex qui prend tt sauf connect
//Middelware de gestion des données
app.use(`/\b(?!${routesList.connect})\b\S+/g`, LoadDB);

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

app.listen(3000, () => {
    console.log("Server started, starting bot...");
    console.log("Checking tokens expiration every hour...");
    checkTokens();
    setInterval(checkTokens, 1000*60*60); //Toutes les heures le bot check les tokens des gens pour vérifier qu'il est à jour
});

export default app;
