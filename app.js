/**
 *  Main  Application
 */

const cluster = require('cluster');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
//const morgan = require('morgan');
const {
  startDatabase
} = require('./mongo');
const {
  insertAd,
  getAds
} = require('./ads');
const apiSignature = require('api-signature');
const crypto = require("crypto");

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



// Set APIKEY
const apiKeys = new Map();
// dXNlcm5hbWU6MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MA==
apiKeys.set('123456789', {
  id: 1,
  name: 'app1',
  secret: 'secret1'
});
class Signer {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }
  signHeaders() {
    const headers = {};
    if (this.apiKey && this.apiKey) {
      const date = new Date().toUTCString();
      headers.Authorization = this.sign(date);
      headers.date = date;
    }
    return headers;
  }
  encrypt(data) {
    const hash = crypto.createHmac("sha256", this.apiSecret).update(data).digest();
    //to lowercase hexits
    return hash
  }
  sign(date) {
    const signature = Buffer.from(this.encrypt(`date: ${date}`)).toString("base64");
    console.log(date, signature);
    return `Signature keyId="${this.apiKey}",algorithm="hmac-sha256",signature="${signature}"`;
  }
}

// Your function to get the secret associated to the key id
function getSecret(keyId, done) {
  if (!apiKeys.has(keyId)) {
    return done(new Error('Unknown api key'));
  }
  const clientApp = apiKeys.get(keyId);
  done(null, clientApp.secret, {
    id: clientApp.id,
    name: clientApp.name
  });
}


const app = express();
// Uncomment for secure API

app.use(helmet({
  contentSecurityPolicy: false,
}));
// all environments
app.set('port', process.env.PORT || 3000);
app.use(log4js.connectLogger(logger, {
  level: log4js.levels.INFO
}));
app.use(bodyParser.text());
//app.use(bodyParser.json());
app.use(cors());
//app.use(methodOverride());


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
//app.get('/',apiSignature({ getSecret }), async (req, res) => {
//res.send(await getAds());
//});

app.get('/unprotected', async (req, res) => {
  const signer = new Signer('123456789', apiKeys.get('123456789').secret);
  console.log(signer)
  // const response = await request.post(
  //     "http://localhost:8080/protected",{
  //       headers: signer.signHeaders(),
  //     }
  //);
  console.log("Success");
  res.send(signer)
  //response.pipe(res);
});

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