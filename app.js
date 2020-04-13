const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const fs = require("fs");

const indexRouter = require('./routes/index');
const connectRouter = require('./routes/connect');
const oauthRouter = require("./routes/oauth");
const ajaxRouter = require("./routes/ajax");

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("ejs", require("ejs").__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "CoderLab=<3", resave: false, saveUninitialized: true,}));
app.use(express.static(path.join(__dirname, 'public')));

//Fonction pour détecter si l'utilisateur est connecté ou pas
app.use((req, res, next) => {
  if (!req.session.userId && req.cookies.userId) {
    req.session.userId = req.cookies.userId;
    next();
  } else if (!req.session.userId && !req.cookies.userId && req.path != "/connect" && req.path != "/oauth") {
    //On exclu les chemins oauth et connect sinon on a des redirections infinies
    res.redirect("/connect");
  } else next();
});

app.use((req, res, next) => {
  if (req.session.userId) {
    const userData = JSON.parse(fs.readFileSync("./data/users.json"))[req.session.userId];

    req.headerData = {
      username: userData.username,
      avatar: `https://cdn.discordapp.com/avatars/${req.session.userId}/${userData.avatar}.png?size=64`
    };
  }
  next();
});

app.use('/', indexRouter);
app.use('/connect', connectRouter);
app.use('/oauth', oauthRouter);
app.use('/ajax', ajaxRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(3000, () => console.log("App started"));


module.exports = app;
