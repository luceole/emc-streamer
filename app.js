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
var serveIndex = require('serve-index')
var config = require('config');
console.log(config)
var Cpt = 0;
log4js.configure('log4js_configuration.json', {});
if (typeof logger !== undefined) {
  logger = log4js.getLogger('log4js');
}
logger.setLevel = 'ERROR';
logger.info('Worker ' + process.pid + ' is ready!');

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.use(log4js.connectLogger(logger, {
  level: log4js.levels.INFO
}));
app.use(bodyParser.text());
app.use(methodOverride());


var newSettings = {
  "rootFolder": config.videosStream.rootFolder,
  "rootPath": ""
}
vidStreamer.settings(newSettings);

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
//
app.use('/media', express.static(config.serveIndex.rootFolder), serveIndex(config.serveIndex.rootFolder, {
  'icons': true
}))
app.use('/medias', express.static(config.serveIndex.rootFolder), serveIndex(config.serveIndex.rootFolder, {
  'icons': true
}))
app.use('/videos', express.static(config.serveIndex.rootFolder), serveIndex(config.serveIndex.rootFolder, {
  'icons': true
}))
app.use('/video', express.static(config.serveIndex.rootFolder), serveIndex(config.serveIndex.rootFolder, {
  'icons': true
}))

// Derniere route = static
app.use('/demo', express.static(path.join(__dirname, '/static')));
app.use(express.static(path.join(__dirname, 'public')));

// YouTube
app.get('/yt/info/:idVideo', yt.info);
app.get('/yt/geturl/:idVideo/:format?', yt.geturl);
app.get('/yt/getoembed/:idVideo', yt.getoembed);
app.get('/yt/getembed/:idVideo', yt.getembed);
app.get('/yt/stream/:idVideo/:format?', yt.stream);
app.get('/yt/play/:idVideo/:format?', yt.stream);
app.get('/yt/download/:idVideo/:format?', yt.download);
app.get('/yt/serverdownload/:idVideo/:format?', yt.serverdownload);
app.get('/yt/serverdownloadmp3/:idVideo/:format?', yt.serverdownloadmp3);
app.get('/yt/audio/:idVideo/:format?', yt.audio);
app.get('/yt/serverdowload/:idVideo/:format?', yt.serverdownload);
// DailyMotion
app.get('/dlm/info/:idVideo', dlm.info);
app.get('/dlm/geturl/:idVideo', dlm.geturl);
app.get('/dlm/getoembed/:idVideo', dlm.getoembed);
app.get('/dlm/getembed/:idVideo', dlm.getembed);
app.use('/dlm/stream/:idVideo', dlm.stream);
app.get('/dlm/play/:idVideo', dlm.stream);
app.get('/dlm/download/:idVideo', dlm.download);
// Vimeo
app.get('/vimeo/getoembed/:idVideo', vim.getoembed);
app.get('/vimeo/getembed/:idVideo', vim.getembed);
app.get('/vimeo/geturl/:idVideo', vim.geturl);
app.get('/vimeo/stream/:idVideo', vim.stream);
app.get('/vimeo/play/:idVideo', vim.stream);
app.get('/vimeo/info/:idVideo', vim.info);
app.get('/vimeo/download/:idVideo', vim.download);


app.get('/test', function (req, res) {
  res.send(util.inspect(process.memoryUsage()));
});
app.get('/erase', function (req, res) {
  res.send("erase OK");
  req.removeAllListeners("event");
});
app.get('/kill', function (req, res) {
  res.send("KILL OK");
  cluster.worker.kill();
});

http.createServer(app).listen(app.get('port'), function () {
  logger.info('Express server %s listening on port %s ', process.pid, app.get('port'));
});