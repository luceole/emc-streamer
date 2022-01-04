// Videos On YouTube
var vstream = require("../vstream.js");
var fs = require("fs");
var request = require("request");
var ytdl = require("ytdl-core");
var url = require("url");

/*
 * GET Video Info
 */

exports.info = function (req, res) {
 
  if (ytdl.validateID(req.params.idVideo)) {
  try {
  ytdl.getInfo(req.params.idVideo).then((infos) => {
    // if (err) {
    //   console.log("getInfo " + err.message);
    //   res.send("Not Found", 404);
    //   return;
    // }
    //res.send(infos);
    res.send(
      "<b>" +
        infos.videoDetails.title +
        "</b><br><p>" +
        infos.videoDetails.description
    );
  });
}
catch (error) {
  console.error(error);
  res.send("Video Not Found");
 
}
  } else {res.send("Video Not Found");}
};

/*
 * GET video url video  webm ou mp4
 */
exports.geturl = function (req, res) {
  console.log("test  "+ytdl.validateID(req.params.idVideo));
  ytdl.getInfo(
    "https://www.youtube.com/watch?v=" + req.params.idVideo,
    function (err, infos) {
      if (err) {
        console.log("getUrl " + req.params.idVideo + " " + err.message);
        res.send("Not Found", 404);
        return;
      }
      var fmt = req.params.format == "mp4" ? req.params.format : "webm";
      var format = infos.formats.filter(function (format) {
        return format.container === fmt;
      })[0];
      var reponse = {
        url: format.url,
      };
      res.send(req.query.callback + "(" + JSON.stringify(reponse) + ");");
    }
  );
};

/*
 * STREAM video  WEBM ou MP4
 */

exports.stream = function (req, res) {
  //console.log(req.params)
 
  if (ytdl.validateID(req.params.idVideo)) {
  try {
  ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo, {
    filter: (format) => format.container === "mp4",
  }).pipe(res);
}
catch (error) {
  console.error("catch " + error);
  res.send("Video Not Found");
 
}}
else res.end();
  /*
  ytdl.getInfo('https://www.youtube.com/watch?v=' + req.params.idVideo, function (err, infos) {
    if (err) {
      console.log("getUrl " + req.params.idVideo + " " + err.message);
      res.send("Not Found", 404);
      return;
    }
    var fmt = (req.params.format) ? req.params.format : "webm";
    var format = infos.formats.filter(function (format) {
      return format.container === fmt;
    })[0];
    //console.log(format)
    if (format==undefined) {
      res.send("Not Found", 404);
      return;
    }
    vstream.hrequest(format.url, res, fmt);
     //vstream.stdrequest(format.url, res, fmt);
    // alternatives ways
    //vstream.sagent(format.url, res, fmt);
    //vstream.childrequest(format.url, res, fmt);
  A});
*/
};

exports.download = function (req, res) {
  ytdl.getInfo(
    "https://www.youtube.com/watch?v=" + req.params.idVideo,
    function (err, infos) {
      if (err) {
        console.log("getUrl " + req.params.idVideo + " " + err.message);
        res.send("Not Found", 404);
        return;
      }
      var fmt = req.params.format == "mp4" ? req.params.format : "webm";
      //console.log(fmt);
      var format = infos.formats.filter(function (format) {
        return format.container === fmt;
      })[0];
      vstream.download(format.url, res, req.params.idVideo, fmt);
    }
  );
};

exports.getoembed = function (req, res) {
  console.log("getOembed :" + req.params.idVideo);
  var url =
    "https://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch%3Fv%3D" +
    req.params.idVideo +
    "&format=json";
  //request(url).pipe(res);
  request(url, function (error, reponse, body) {
    var oembed = reponse.body;
    res.send(req.query.callback + "(" + JSON.stringify(oembed) + ");");
  });
};

exports.getembed = function (req, res) {
  console.log("getOembed :" + req.params.idVideo);
  var url =
    "https://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch%3Fv%3D" +
    req.params.idVideo +
    "&format=json";
  request(url, function (error, reponse, body) {
    obj = JSON.parse(reponse.body);
    console.log(reponse.body);
    res.send(obj.html);
  });
};
