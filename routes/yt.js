// Videos On YouTube
var config = require('config');
var vstream = require("../vstream.js");
var fs = require("fs");
var request = require("request");
var ytdl = require("ytdl-core");
var url = require("url");
const { pipe } = require("superagent");

var rootFolder=config.serveIndex.rootFolder;
console.log(rootFolder)

//vidStreamer.settings(newSettings);
/*
 * Download on server
 */
exports.serverdownload = function (req, res) {
  if (ytdl.validateID(req.params.idVideo)) {
    try {
    ytdl.getInfo(req.params.idVideo).then((infos) => {
    const format = ytdl.chooseFormat(infos.formats, {quality: '18'});
    console.log(format)  
     mystream=  ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo)
    //res.setHeader('Content-Type', 'application/octet-stream');
       mystream.pipe(fs.createWriteStream(config.serveIndex.rootFolder+'/'+infos.videoDetails.title+'.mp4'));
       res.write('<html>'+infos.videoDetails.title+' => Téléchargement ...');
       mystream.on('end', () => {
         res.end( ' <strong>terminé</strong></html>');
       })
  });
  }
  catch (error) {
    console.error(error);
    res.send("Video Not Found");
   
  }
    } else {res.send("Video Not Found");}
  // ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ')
  // .pipe(fs.createWriteStream('video.mp4'));
}
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
  if (ytdl.validateID(req.params.idVideo)) {
    try {
    ytdl.getInfo(req.params.idVideo).then((infos) => {
      // if (err) {
      //   console.log("getInfo " + err.message);
      //   res.send("Not Found", 404);
      //   return;
      // }
      //res.send(infos);
      var fmt = req.params.format == "mp4" ? req.params.format : "webm";
      console.log(fmt)
      var format = infos.formats.filter(function (format) {
           return format.container === fmt;
             })[0];
      res.send(
        format.url
      );
    });
  }
  catch (error) {
    console.error(error);
    res.send("Video Not Found");
   
  }
    } else {res.send("Video Not Found");}
  
  //console.log(req.params.format)
  // console.log("test  "+ytdl.validateID(req.params.idVideo));
  // ytdl.getInfo( req.params.idVideo,
  //   function (err, infos) {
  //     if (err) {
  //       console.log("getUrl " + req.params.idVideo + " " + err.message);
  //       res.send("Not Found", 404);
  //       return;
  //     }
  //     console.log(infos)
  //     var fmt = req.params.format == "mp4" ? req.params.format : "webm";
  //     console.log(fmt)
  //     var format = infos.formats.filter(function (format) {
  //       return format.container === fmt;
  //     })[0];
  //     var reponse = {
  //       url: format.url,
  //     };
  //     res.send(req.query.callback + "(" + JSON.stringify(reponse) + ");");
  //   }
  // );
};

/*
 * STREAM video  WEBM ou MP4
 */

exports.stream = function (req, res) {
  if (ytdl.validateID(req.params.idVideo)) {
    try {
    ytdl.getInfo(req.params.idVideo).then((infos) => {
    const format = ytdl.chooseFormat(infos.formats, {quality: 'highest'});
    //console.log(format.url)  
     mystream=  ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo)
    //res.setHeader('Content-Type', 'application/octet-stream');
       mystream.pipe(res);
  });
  }
  catch (error) {
    console.error(error);
    res.send("Video Not Found");
   
  }
    } else {res.send("Video Not Found");}
};
exports.audio = function (req, res) {
  if (ytdl.validateID(req.params.idVideo)) {
    try {
    ytdl.getInfo(req.params.idVideo).then((infos) => {
    const format = ytdl.chooseFormat(infos.formats, {quality: 'highest'});
    //console.log(format.url)  
     mystream=  ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo, { filter: 'audioonly'})
    //res.setHeader('Content-Type', 'application/octet-stream');
       mystream.pipe(res);
  });
  }
  catch (error) {
    console.error(error);
    res.send("Video Not Found");
   
  }
    } else {res.send("Video Not Found");}
  
};


exports.download = function (req, res) {
  videoID=req.params.idVideo;
  //ytdl.getInfo(videoID).then(info) => {
  //ytdl.getInfo(req.params.idVideo).then((info) => {
   
    //const format = ytdl.chooseFormat(info.formats, {quality: 'highest'});
    //console.log(format.url)  
    // RNFetchBlob
    //   .config({
    //       addAndroidDownloads: {
    //           useDownloadManager: true,
    //           mime: format.type
    //       }
    //   })
    //   .fetch('GET', format.url)
    //   .then((resp) => {
    //     resp.path()
    // })
  //})

  if (ytdl.validateID(req.params.idVideo)) {
    try {
    ytdl.getInfo(req.params.idVideo).then((infos) => {
    const format = ytdl.chooseFormat(infos.formats, {quality: '18'});
    console.log(infos)  
    if (url) {
      vstream.download(format.url, res, req.params.idVideo, "mp4");
    } else res.send("Not Found", 404);
    // res.setHeader('Content-Type', 'application/octet-stream');
    //   var msg='<a href="'+format.url+'" download> Télécharger la vidéo</a><br>'+format.url;
    //   var msg1='<a href="https://www.w3schools.com/html/mov_bbb.mp4" target="_blank" download>ici</a> <video controls controlsList="donwnload" width="600" height="350">  <source src="'+format.url+'" type="video/mp4"> </video> <button class="btn"><i class="fa fa-download"></i> Download</button>';
    //   ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo).pipe(res);
    //   //var msg1='<a href="javascript:void(0);" onclick="javascript:document.execCommand("SaveAs","1","'+infos.formats[0].url+'")>download file</a>'
    //   //res.send(msg);
    //   //ytdl.downloadFromInfo(infos)
    });
  }
  catch (error) {
    console.error(error);
    res.send("Video Not Found");
   
  }
    } else {res.send("Video Not Found");}
  
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
