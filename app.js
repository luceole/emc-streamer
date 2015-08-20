
/**
 *  Main  Application
 */

var cluster = require('cluster');
var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
var log4js = require('log4js');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var yt = require('./routes/yt');
var dlm = require('./routes/dlm');
var vim = require('./routes/vim');
var http = require('http');
var path = require('path');
var vidStreamer = require("vid-streamer");
var Cpt=0;
log4js.clearAppenders()
log4js.configure('log4js_configuration.json', {});
if (typeof logger !== undefined)  {logger = log4js.getLogger('log4js');}
logger.setLevel = 'ERROR';
logger.info('Worker ' + process.pid + ' is ready!');

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO }));
app.use(bodyParser());
app.use(methodOverride());
//app.use(bodyParser.urlencoded());
app.use(function (req, res, next)
   {
logger.debug("%s:%d=%s",process.pid,++Cpt,req.url);
//logger.debug(util.inspect(process.memoryUsage()));
//req.setTimeout(9000);
/*
res.on('finish', function(src) {
  logger.debug('finish piping into the writer');
  res.removeAllListeners("event");
});
res.on('close', function(src) {
  logger.debug('close piping into the writer');
});
req.on('finish', function(src) {
  logger.debug('finish piping from reader');
});
req.on('close', function(src) {
  logger.debug('close reader');
  req.removeAllListeners("event");
});
res.on('error', function(src) {
  logger.err('error piping into the writer');
});
res.on('pipe', function(src) {
  logger.debug('piping into the writer');
});
res.on('unpipe', function(src) {
  logger.debug('something has stopped piping into the writer');
});
res.on('drain', function(src) {
console.log(util.inspect(process.memoryUsage()));
console.log('drain from the writer');
});
*/
next();
});
//app.use(app.router);
// Static doit être la derniere route
app.use(express.static(path.join(__dirname, 'public')));
var newSettings = {
    rootPath: "videos",
    rootFolder: "/home/old-luc/node/emcstream/public" // TODO
}
vidStreamer.settings(newSettings);

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// YouTube
app.get('/yt/info/:idVideo', yt.info);
app.get('/yt/geturl/:idVideo/:format?', yt.geturl);
//app.get('/yt/getvideo/:idVideo/:format?', yt.getvideo);
app.get('/yt/getoembed/:idVideo', yt.getoembed);
app.get('/yt/stream/:idVideo/:format?', yt.stream);
app.get('/yt/download/:idVideo/:format?', yt.download);
// DailyMotion
app.get('/dlm/info/:idVideo', dlm.info);
app.get('/dlm/geturl/:idVideo', dlm.geturl);
app.get('/dlm/getoembed/:idVideo', dlm.getoembed);
app.get('/dlm/stream/:idVideo', dlm.stream);
app.get('/dlm/download/:idVideo', dlm.download);
// Vimeo
app.get('/vimeo/getoembed/:idVideo', vim.getoembed);
app.get('/vimeo/geturl/:idVideo', vim.geturl);
app.get('/vimeo/stream/:idVideo', vim.stream);
app.get('/vimeo/infos/:idVideo', vim.info);
app.get('/vimeo/download/:idVideo', vim.download);
// Videos Locales
app.get('/videos/*', vidStreamer);
app.get('/test', function(req,res) {
res.send(util.inspect(process.memoryUsage()));
});
app.get('/erase', function(req,res) {
res.send("erase OK");
req.removeAllListeners("event");
});
app.get('/kill', function(req,res) {
res.send("KILL OK");
cluster.worker.kill();
});
// Pour rire !
//app.get('/*', routes.index);  // Crazy Proxy ;-)


http.createServer(app).listen(app.get('port'), function(){
  logger.info('Express server %s listening on port %s ' ,process.pid, app.get('port'));
});

