// Videos On YouTube
const cp = require('child_process');
const readline = require('readline');
var config = require('config');
var vstream = require("../vstream.js");
var fs = require("fs");
var request = require("request");
var ytdl = require("ytdl-core");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
var url = require("url");
const {
  pipe
} = require("superagent");

var rootFolder = config.serveIndex.rootFolder;
console.log(rootFolder)


exports.convertdownload = function (req,res) {
  var refUrl = "http://www.youtube.com/watch?v=" + req.params.idVideo;
  res.setHeader('Connection', 'Transfer-Encoding');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  res.write('<html> Convertion et Téléchargement  ');
  if (ytdl.validateID(req.params.idVideo)) {
    
    try {
      ytdl.getInfo(req.params.idVideo).then((infos) => {
        let stream = ytdl(refUrl, {
          quality: 'highestaudio',
        });
        res.write('<br> '+ infos.videoDetails.title )
        res.write('<br> Conversion audio => MP3 ...')
      
        let start = Date.now();
        ffmpeg(stream)
          .audioBitrate(128)
         .save(`${config.serveIndex.rootFolder}/${infos.videoDetails.title}.mp3`)
          .on('progress', p => {
            //readline.cursorTo(process.stdout, 0);
           // process.stdout.write(`${p.targetSize}kb downloaded`);
          })
          .on('end', () => {
            
            res.write(`     OK - ${(Date.now() - start) / 1000}s`);
            res.write("<br> Remix Audio et Vidéo => MP4...")
            video = ytdl(refUrl);
            var proc = ffmpeg(video)
            .addOutputOptions('-movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov')
            //.audioBitrate(128)
            .addInput(`${config.serveIndex.rootFolder}/${infos.videoDetails.title}.mp3`)
            //.addInput(audio)
            .on('end', function() {
              res.write(`     OK - ${(Date.now() - start) / 1000}s <br><a href="/medias/${infos.videoDetails.title}.mp4">  Regarder maintenant! </a>`);
              res.end("</html>")
            })
            .on('error', function(err) {
              console.log('an error happened: ' + err.message);
            })  
            //.pipe(res, {end:true})
            .save(`${config.serveIndex.rootFolder}/${infos.videoDetails.title}.mp4`)



          })

      });
    } catch (error) {
      //console.error(error);
      res.send("Video Not Found");
    }
   

  } else {
    res.send("Video Not Found");
  }



}
/*
 * Download on server
 */

exports.serverdownloadmp3 = function (req, res) {
  res.setHeader('Connection', 'Transfer-Encoding');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  res.write("<html> Conversion audio MP3")
  if (ytdl.validateID(req.params.idVideo)) {
    
    try {
      ytdl.getInfo(req.params.idVideo).then((infos) => {
        let stream = ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo, {
          quality: 'highestaudio',
        });
        res.write('<br>'+infos.videoDetails.title)
        res.write('<br> Conversion audio => MP3 ...')
        let start = Date.now();
        ffmpeg(stream)
          .audioBitrate(128)
         .save(`${config.serveIndex.rootFolder}/${infos.videoDetails.title}.mp3`)
          .on('progress', p => {
            //readline.cursorTo(process.stdout, 0);
           // process.stdout.write(`${p.targetSize}kb downloaded`);
          })
          .on('end', () => {
            res.end(` OK- ${(Date.now() - start) / 1000}s <br><a href="/medias/${infos.videoDetails.title}.mp3"> Ecouter maintenant! </a>`); 
           
          })

      });
    } catch (error) {
      //console.error(error);
      res.send("Video Not Found");
    }
  } else {
    res.send("Video Not Found");
  }
}

exports.serverdownload = function (req, res) {
  if (ytdl.validateID(req.params.idVideo)) {
    try {
      ytdl.getInfo(req.params.idVideo).then((infos) => {
        try {
        const format = ytdl.chooseFormat(infos.formats, {
          quality: '18'
        });
      }
       catch (error) {
          res.send("Video Not Found");
          return;
        }
      
        //console.log(format)

        video = ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo)
        let starttime;
        video.pipe(fs.createWriteStream(config.serveIndex.rootFolder + '/' + infos.videoDetails.title + '.mp4'));
        res.write('<html>' + infos.videoDetails.title + ' => Téléchargement ...');
        video.once('response', () => {
          starttime = Date.now();
        });
        video.on('progress', (chunkLength, downloaded, total) => {

          const percent = downloaded / total;
          const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
          const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
          z = (percent * 100).toFixed(1)
          if ((z % 10) == 0) {
            res.write(`<br> ${z}% downloaded  `)
          }
          // res.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
          // res.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
          //res.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `+'</body></html>');
          //readline.moveCursor(process.stdout, 0, -1);

        });
        video.on('end', () => {
          res.end(' <br><strong>terminé</strong>');
        })
      });
    } catch (error) {
      console.error(error);
      res.send("Video Not Found");

    }
  } else {
    res.send("Video Not Found");
  }

}
/*
 * GET Video Info
 */

exports.info = function (req, res) {

  if (ytdl.validateID(req.params.idVideo)) {
    try {
      ytdl.getInfo(req.params.idVideo).then((infos) => {
        res.send(
          "<b>" +
          infos.videoDetails.title +
          "</b><br><p>" +
          infos.videoDetails.description
        );
      });
    } catch (error) {
      console.error(error);
      res.send("Video Not Found");

    }
  } else {
    res.send("Video Not Found");
  }
};

/*
 * GET video url video  webm ou mp4
 */

exports.geturl = function (req, res) {
  if (ytdl.validateID(req.params.idVideo)) {
    try {
      ytdl.getInfo(req.params.idVideo).then((infos) => {
        var fmt = req.params.format == "mp4" ? req.params.format : "webm";
        console.log(fmt)
        var format = infos.formats.filter(function (format) {
          return format.container === fmt;
        })[0];
        res.send(
          format.url
        );
      });
    } catch (error) {
      console.error(error);
      res.send("Video Not Found");

    }
  } else {
    res.send("Video Not Found");
  }
};

/*
 * STREAM video  WEBM ou MP4
 */

exports.stream = function (req, res) {
  if (ytdl.validateID(req.params.idVideo)) {
    try {
      ytdl.getInfo(req.params.idVideo).then((infos) => {
        try {
        const format = ytdl.chooseFormat(infos.formats, {
          quality: 'highest'
        });
      }
      catch (error) {
        res.send("Video Not Found");
        return;
      }
        //console.log(format.url)  
        mystream = ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo, {
          filter: format => format.container === 'webm'
        })
        //res.setHeader('Content-Type', 'application/octet-stream');
        mystream.pipe(res);
      });
    } catch (error) {
      console.error(error);
      res.send("Video Not Found");

    }
  } else {
    res.send("Video Not Found");
  }
};
exports.audio = function (req, res) {
  if (ytdl.validateID(req.params.idVideo)) {
    try {
      ytdl.getInfo(req.params.idVideo).then((infos) => {
        try {
        const format = ytdl.chooseFormat(infos.formats, {
          quality: 'highest'
        });
      }
      catch (error) {
        res.send("Video Not Found")
        return;
      }
        //console.log(format.url)  
        mystream = ytdl("http://www.youtube.com/watch?v=" + req.params.idVideo, {
          filter: 'audioonly'
        })
        //res.setHeader('Content-Type', 'application/octet-stream');
        mystream.pipe(res);
      });
    } catch (error) {
      console.error(error);
      res.send("Video Not Found");

    }
  } else {
    res.send("Video Not Found");
  }

};


exports.download = function (req, res) {
  videoID = req.params.idVideo;
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
        const format = ytdl.chooseFormat(infos.formats, {
          quality: '18'
        });
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
    } catch (error) {
      console.error(error);
      res.send("Video Not Found");

    }
  } else {
    res.send("Video Not Found");
  }

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