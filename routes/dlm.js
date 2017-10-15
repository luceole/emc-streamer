var fs = require('fs');
var request = require('request');
var async = require('async');
var vstream = require('../vstream.js');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
//var url = require('url');
request.defaults({
  jar: true
});

/*
 * GET Video Info
 */

exports.info = function (req, res) {
  url = "https://api.dailymotion.com/video/" + req.params.idVideo;
  request(url, function (error, reponse, body) {
    if (error) {
      console.log("getInfo " + error.message);
      res.send("Not Found", 404);
      return;
    }
    res.send(JSON.parse(body));
  });
};
/*
 * GET video url video  mp4
 */
exports.geturl = function (req, res) { // Inutile Daily Bloque si IP differentes

  res.send("Not Implemented");
  // return {e:null, url:reponse};
}

/*
 * STREAM video
 */
exports.stream = function (req, res) {
  var rurl = "nada";
  async.series([
function (cb) {
      var url = "https://www.dailymotion.com/embed/video/" + req.params.idVideo + "?html";
      var t = request({
        url: url
      }, function (err, reponse, body) {
        if (err) return cb(err);
        //var regex=/H264-320x240/
        //var regex = /H264-848x480/
        var regex = /H264-512x384/
        var regex1 = /\"/
        var info = body.split(regex);
        try {
          rurl = "https://www.dailymotion.com/cdn/H264-512x384" + (info[1].split(regex1)[0]).replace(/\\/g, '') + "&redirect=0";
          logger.debug("rurl=" + rurl);
        } catch (err) {
          return cb(err);
        }
        return cb(null);
      });
}
,
function (cb) {
      request({
        followAllRedirects: true,
        url: rurl
      }, function (err, reponse, body) {
        if (err) {
          return cb(err);
        }
        rurl = body;
        return cb(null);
      });
}
], function (err) { // At least Function
    if (err) {
      logger.error("stream " + req.params.idVideo + " " + err.message);
      res.send("Video Not Found", 404);
    } else // Stream the video
    {
      //vstream.hrequest(rurl,res);
      //vstream.sagent(rurl,res);
      vstream.childrequest(rurl, res);
    }
  });
}

exports.download = function (req, res) {
  var rurl = "nada";
  var info = "";
  async.series([
function (cb) {
        var url = "https://www.dailymotion.com/embed/video/" + req.params.idVideo + "?html";
        var t = request({
          url: url
        }, function (err, reponse, body) {
          if (err) return cb(err);
          //var regex=/H264-320x240/
          //var regex=/H264-848x480/
          var regex = /H264-512x384/
          var regex1 = /\"/
          var info = body.split(regex);
          try {
            rurl = "http://www.dailymotion.com/cdn/H264-512x384" + (info[1].split(regex1)[0]).replace(/\\/g, '') + "&redirect=0";
            logger.debug("rurl=" + rurl);
          } catch (err) {
            return cb(err);
          }
          return cb(null);
        });
    },
    function (cb) {
        url = "https://api.dailymotion.com/video/" + req.params.idVideo;
        request(url, function (error, reponse, body) {
          if (error) {
            console.log("getInfo " + req.params.idVideo + " " + error.message);
            res.send("Not Found", 404);
            return cb(err);
          }
          info = JSON.parse(body)
          return cb(null);
        });
  },
  function (cb) {
        var x = request(rurl, function (err, reponse, body) {
          if (err) return cb(err);
          rurl = body;
          return cb(null);
        });
}
],
    function (err) { // At least Function
      if (err) {
        logger.error("download " + req.params.idVideo + " " + err.message);
        res.send("Video Not Found", 404);
      } else // Download the video
      {
        vstream.download(rurl, res, info.title);
      }
    });
}

/*
 Get Oembed
*/
exports.getoembed = function (req, res) {
  var url = "http://www.dailymotion.com/services/oembed?url=http%3A//www.dailymotion.com/video/" + req.params.idVideo + "&format=json";
  // Reponse en JSONP
  request(url, function (error, reponse, body) {
    if (error) {
      logger.error("getoembed " + req.params.idVideo + " " + err.message);
      res.send("Not Found", 404);
      return;
    }
    var oembed = reponse.body;
    res.send(req.query.callback + '(' + JSON.stringify(oembed) + ');');
  });
}
