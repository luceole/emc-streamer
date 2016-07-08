var request = require('request');
var hyperquest = require('hyperquest');
var superagent = require('superagent');
var spawn = require('child_process').spawn;
exports.mrequest = function(url,res)
{
loger.debug("request Stream=>"+url);
res.setHeader("Content-Type", "video/mp4");
var v=url.split('#')[0].split('?');
u=v[0];
var uri={'url':u,  'headers': { 'User-Agent': 'node/request'},qs: {'auth':v[1].split('auth=')[1]}};
var req  =request(uri).pipe(res);
}
exports.hrequest = function(url,res,video_type)
{
logger.debug("Hyperquest Stream=>"+url+ " "+video_type);
if (video_type)
res.setHeader("Content-Type", "video/"+video_type);
else
res.setHeader("Content-Type", "video/mp4");
var req  =hyperquest(url).pipe(res);
}
exports.sagent = function(url,res,video_type)
{
logger.debug("Super-Agent Stream=>"+url+ " "+ video_type);
if (video_type)
res.setHeader("Content-Type", "video/"+video_type);
else
res.setHeader("Content-Type", "video/mp4");
var saReq=superagent.get(url)
   .pipe(res)
   .on('finish', function(src) {
   logger.debug('*FINISH  REQ');
   })
   .on('close', function(src) {
   logger.debug('*CLOSE REQ');
   });
res.on('unpipe', function(src) {
  logger.debug('***********  something has stopped piping into the writer');
  saReq.destroy();
});
res.on('finish', function(src) {
  logger.debug('****finish piping into the writer');
  saReq.destroy();
  //res.removeAllListeners("event");
});

}
exports.download = function(url,res,video_type)
{
logger.info("download=>"+url+ " "+video_type);
res.setHeader("Content-Type", "application/force-download);
//res.setHeader("Content-disposition", "attachement;");
hyperquest(url).pipe(res);
}

exports.childrequest = function(url,res,video_type)
{

logger.debug("childRequest=>"+url+ " "+ video_type);
child = spawn('node', ['childrequest.js', url]);
//res.contentType = 'video/mp4';
if (video_type)
res.setHeader("Content-Type", "video/"+video_type);
else
res.setHeader("Content-Type", "video/mp4");
child.stdout.pipe(res);
res.on('unpipe', function(src) {
  logger.debug('Vstream: something has stopped piping into the writer=> Kill child process');
  child.kill();
});
child.on('close', function (code) {
          logger.debug('child process exited with code ' + code);
});
}
