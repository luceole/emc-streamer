// Videos On Vimeo
var request = require('request');
var vstream = require('../vstream.js');

/*
 * GET Video Info
 */

exports.info = function (req, res) {
  var url = "http://vimeo.com/api/v2/video/" + req.params.idVideo + ".json";
  request(url, function (error, reponse, body) {
    if (error) {
      console.log("getInfo " + error.message);
      res.send("Not Found", 404);
    } else
      res.send(JSON.parse(body));
  });
}


/*
 * GET video url video  webm ou mp4
 */

exports.geturl = function (req, res) {
  magic_url(req.params.idVideo, function (url) {
    if (url) {
      var reponse = {
        url: url
      };
      res.send(req.query.callback + '(' + JSON.stringify(reponse) + ');');
    } else res.send("Not Found", 404);
  });
}

exports.getoembed = function (req, res) {
  var url = "http://vimeo.com/api/oembed.json?url=http://vimeo.com/" + req.params.idVideo + "&width=480";
  request(url, function (error, reponse, body) {
    if (error) {
      console.log("getoembed " + req.params.idVideo + " " + error.message);
      res.send("Not Found", 404);
      return;
    }
    var oembed = reponse.body;
    res.send(req.query.callback + '(' + JSON.stringify(oembed) + ');');
  });
}

/*
 * STREAM video  WEBM ou MP4
 */

exports.stream = function (req, res) {
  console.log(req.params)
  magic_url(req.params.idVideo, function (url) {
    console.log(url)
    if (url) {
      //vstream.sagent(url,res);
      vstream.hrequest(url, res, "mp4");
      //vstream.childrequest(url, res);
    } else res.send("Not Found", 404);
  });
}

exports.download = function (req, res) { // TODO
  //console.log("vim " + req.params.idVideo);
  var url = "http://vimeo.com/api/v2/video/" + req.params.idVideo + ".json";
  request(url, function (error, reponse, body) {
    if (error) {
      console.log("getInfo " + req.params.idVideo + " " + error.message);
      res.send("Not Found", 404);
      return;
    }
    var infos = JSON.parse(body)
    magic_url(req.params.idVideo, function (url) {
      console.log(url);
      if (url) {
        vstream.download(url, res, infos[0].title, "mp4");
      } else res.send("Not Found", 404);
    });
  });
}


function magic_url(idVideo, cb) {
  var url = "https://player.vimeo.com/video/" + idVideo;
  request({
    "url": url
    // "headers": {
    //  'User-Agent': 'Mozilla/5.0 (X11; U; Linux i686; fr; rv:1.9b5) Gecko/2008041514 Firefox/3.0b5'
    //}
  }, function (error, reponse, body) {
    if (error) {
      console.log("stream " + error.message);
      return cb(null);
    }
    var regex = /video\/mp4.*/;
    try {

      //      console.log(body)
      var info = body.match(regex)[0].split(',');
      console.log(info[2])
      var urlSD = JSON.parse("{" + info[2] + "}");
    } catch (err) {
      console.log(err);
      return cb(null);
    }
    cb(urlSD.url);
  });
}
