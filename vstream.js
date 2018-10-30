var request = require('request');
var hyperquest = require('hyperquest');
var superagent = require('superagent');
var spawn = require('child_process').spawn;

exports.hrequest = function (url, res, video_type) {  //Default Method
  logger.debug("Hyperquest Stream=>" + url + " " + video_type);
  if (video_type)
    res.setHeader("Content-Type", "video/" + video_type);
  else
    res.setHeader("Content-Type", "video/mp4");
    request(url).pipe(res)
    //hyperquest(url,{ method: 'GET',timeout: 10000}).pipe(res);
}
exports.stdrequest = function (url, res, video_type) {  //Default Method
  logger.debug("Standart Request Stream=" + url + " " + video_type);
  if (video_type)
    res.setHeader("Content-Type", "video/" + video_type);
  else
    res.setHeader("Content-Type", "video/mp4");
    request(url).pipe(res)
}

exports.sagent = function (url, res, video_type) {
  logger.debug("Super-Agent Stream=>" + url + " " + video_type);
  if (video_type)
    res.setHeader("Content-Type", "video/" + video_type);
  else
    res.setHeader("Content-Type", "video/mp4");
  var saReq = superagent.get(url)
    .pipe(res)
    .on('finish', function (src) {
      logger.debug('*FINISH  REQ');
    })
    .on('close', function (src) {
      logger.debug('*CLOSE REQ');
    });
  res.on('unpipe', function (src) {
    logger.debug('***********  something has stopped piping into the writer');
    saReq.destroy();
  });
  res.on('finish', function (src) {
    logger.debug('****finish piping into the writer');
    saReq.destroy();
    //res.removeAllListeners("event");
  });

}
exports.download = function (url, res, filename, fmt) {
  logger.info("download=>" + url)
  console.log("download=>" + filename);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename=' + filename + "." + fmt);
  //res.setHeader('Content-Description: File Transfer');
  //res.setHeader('Content-Transfer-Encoding: binary');
  //res.setHeader('Expires: 0');
  //res.setHeader('Cache-Control: must-revalidate, post-check=0, pre-check=0');
  //res.setHeader('Pragma: public');
  //header('Content-Length: ' . filesize($file));
  // res.setHeader("Content-Type", "application/force-download");
  //res.setHeader("Content-Type", "video");
  hyperquest(url).pipe(res);
}

exports.childrequest = function (url, res, video_type) {
  logger.debug("childRequest=>" + url + " " + video_type);
  child = spawn('node', ['childrequest.js', url]);
  if (video_type)
    res.setHeader("Content-Type", "video/" + video_type);
  else
    res.setHeader("Content-Type", "video/mp4");
  child.stdout.pipe(res);
  res.on('unpipe', function (src) {
    logger.debug('Vstream: something has stopped piping into the writer=> Kill child process');
    child.kill();
  });
  child.on('close', function (code) {
    logger.debug('child process exited with code ' + code);
  });
}

// exports.mrequest = function (url, res) { // Obsolete
//   loger.debug("request Stream=>" + url);
//   res.setHeader("Content-Type", "video/mp4");
//   var v = url.split('#')[0].split('?');
//   u = v[0];
//   var uri = {
//     'url': u,
//     'headers': {
//       'User-Agent': 'node/request'
//     },
//     qs: {
//       'auth': v[1].split('auth=')[1]
//     }
//   };
//   var req = request(uri).pipe(res);
// }
