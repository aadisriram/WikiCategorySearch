var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', process.env.PORT || 3000);

var nodeDrpc = require('node-drpc');
var nodeDrpcClient =  new  nodeDrpc("152.46.17.135", 3772);

io.on('connection', function(socket) {
  socket.on('search', function(data) {
    drpcQuery(data, callback);
  });

  socket.on('get_summary', function(data) {
    elasticSearchQuery(data, sendSummary);
  });

  function callback(results) {
    socket.emit('result', results);
  }

  function sendSummary(result) {
    socket.emit("wiki_summary", result);
  }
});

//var baseURL = "http://152.46.18.173:9200/web_crawler/invertedIndex/_search?q=categories:";
var baseURL = "https://en.wikipedia.org/wiki/";
var requestify = require('requestify');

function drpcQuery(msg, callback) {
  nodeDrpcClient.execute("search", msg, function(err, response) {
    callback(response);
  });
};

var jsdom = require("jsdom");

function elasticSearchQuery(data, sendSummary) {
  requestify.get(baseURL + data)
      .then(function(response) {
        jsdom.env(
            response["body"],
            ["http://code.jquery.com/jquery.js"],
            function (errors, window) {
              try {
                sendSummary({summary: window.$("#mw-content-text p")[0].innerHTML, pageId: data});
              } catch(ex) {
                sendSummary({summary: "Failed to load summary from wikipedia", pageId: data});
              }
            }
        );
      });
}

http.listen(app.get('port'));
module.exports = app;
