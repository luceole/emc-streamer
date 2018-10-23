// Videos On YouTube
var vstream = require('../vstream.js');
var fs = require('fs');
var request = require('request');
var ytdl = require('ytdl-core');
var url = require('url');

/*
 * GET Video Info
 */

exports.info = function (req, res) {
  ytdl.getInfo('http://www.youtube.com/watch?v=' + req.params.idVideo, function (err, infos) {
    if (err) {
      console.log("getInfo " + err.message);
      res.send("Not Found", 404);
      return;
    }
    res.send(infos.video_id + " <br>" + infos.title);
  });
};

/*
 * GET video url video  webm ou mp4
 */
exports.geturl = function (req, res) {
  ytdl.getInfo('http://www.youtube.be/watch?v=' + req.params.idVideo, function (err, infos) {
    if (err) {
      console.log("getUrl " + req.params.idVideo + " " + err.message);
      logger.error("getUrl " + req.params.idVideo + " " + err.message);
      res.send("Not Found", 404);
      return;
    }
    var fmt = (req.params.format == "mp4") ? req.params.format : "webm";
    //console.log(fmt);
    var format = infos.formats.filter(function (format) {
      return format.container === fmt;
    })[0];
    //console.log("getUrl "+req.params.idVideo+" "+format.url);
    var reponse = {
      url: format.url
    };
    res.send(req.query.callback + '(' + JSON.stringify(reponse) + ');');
  });
};

/*
 * STREAM video  WEBM ou MP4
 */

exports.stream = function (req, res) {
  console.log("Stream => " + req.params.idVideo)
  ytdl.getInfo('http://www.youtube.be/watch?v=' + req.params.idVideo, function (err, infos) {
    if (err) {
      console.log("getUrl " + req.params.idVideo + " " + err.message);
      res.send("Not Found", 404);
      return;
    }
    var fmt = (req.params.format == "webm") ? req.params.format : "webm";
    //console.log(fmt);
    var format = infos.formats.filter(function (format) {
      return format.container === fmt;
    })[0];
    vstream.hrequest(format.url, res, fmt);
    //vstream.childrequest(format.url, res, fmt);
  });
}

exports.download = function (req, res) {
  ytdl.getInfo('http://www.youtube.be/watch?v=' + req.params.idVideo, function (err, infos) {
    if (err) {
      console.log("getUrl " + req.params.idVideo + " " + err.message);
      res.send("Not Found", 404);
      return;
    }
    var fmt = (req.params.format == "webm") ? req.params.format : "webm";
    //console.log(fmt);
    var format = infos.formats.filter(function (format) {
      return format.container === fmt;
    })[0];
    vstream.download(format.url, res, infos.title, fmt);
  });
}

exports.getoembed = function (req, res) {
  console.log("getOembed :" + req.params.idVideo);
  var url = "http://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch%3Fv%3D" + req.params.idVideo + "&format=json";
  //request(url).pipe(res);
  request(url, function (error, reponse, body) {
    var oembed = reponse.body;
    res.send(req.query.callback + '(' + JSON.stringify(oembed) + ');');
  });
}

exports.getembed = function (req,res) {
  console.log("getOembed :" + req.params.idVideo);
  var url = "http://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch%3Fv%3D" + req.params.idVideo + "&format=json";
  request(url, function (error, reponse, body) {
  obj = JSON.parse(reponse.body);
  console.log(obj.html)
    res.send(obj.html );
  });

}
