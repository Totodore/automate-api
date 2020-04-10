const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const compileSass = require('express-compile-sass');
const logger = require('morgan');
const session = require("express-session");

const indexRouter = require('./routes/index');
const connectRouter = require('./routes/connect');
const oauthRouter = require("./routes/oauth");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "CoderLab=<3", resave: false, saveUninitialized: true,}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compileSass({
  root: path.join(__dirname, 'public/stylesheets/'),
  sourceMap: true, // Includes Base64 encoded source maps in output css
  sourceComments: true, // Includes source comments in output css
  watchFiles: true, // Watches sass files and updates mtime on main files for each change
  logToConsole: true // If true, will log to console.error on errors
}));

app.use('/', indexRouter);
app.use('/connect', connectRouter);
app.use('/oauth/', oauthRouter);
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


module.exports = app;
