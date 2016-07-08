// Videos On Vimeo
var request = require('request');
var vstream = require('vstream.js');

/*
 * GET Video Info
 */

exports.info = function(req, res){
var url="http://vimeo.com/api/v2/video/"+req.params.idVideo+".json";
request(url, function(error,reponse,body) {
if (error) {
console.log("getInfo "+req.params.idVideo+" "+error.message);
res.send("Not Found",404);
return;
}
res.send(body);
});
}


/*
 * GET video url video  webm ou mp4
*/

exports.geturl = function(req, res){
magic_url(req.params.idVideo, function(url) {
if (url) {
var reponse= { url: url};
res.send(req.query.callback + '('+ JSON.stringify(reponse) + ');');
} else res.send("Not Found",404);
});
}

exports.getoembed = function(req, res){
var url="http://vimeo.com/api/oembed.json?url=http://vimeo.com/"+req.params.idVideo+"&width=480";
request(url, function(error,reponse,body) {
if (error) {
console.log("getoembed "+req.params.idVideo+" "+error.message);
res.send("Not Found",404);
return;
}
var oembed= reponse.body;
res.send(req.query.callback + '('+ JSON.stringify(oembed) + ');');
});
}

/*
 * STREAM video  WEBM ou MP4
 */

exports.stream = function(req, res){
magic_url(req.params.idVideo, function(url)
{
if (url)
{
//vstream.sagent(url,res);
vstream.childrequest(url,res);
} else res.send("Not Found",404);
});
}

exports.download = function(req, res){  // TODO
console.log("vim "+req.params.idVideo);
magic_url(req.params.idVideo, function(url)
{
console.log(url);
if (url)
{
vstream.download(url,res);
} else res.send("Not Found",404);
});
}


function magic_url(idVideo ,cb) {
var url="https://player.vimeo.com/video/"+idVideo;
request({"url":url,  "headers": { 'User-Agent': 'Mozilla/5.0 (X11; U; Linux i686; fr; rv:1.9b5) Gecko/2008041514 Firefox/3.0b5'}}, function(error,reponse,body) {
if (error) {
console.log("stream "+req.params.idVideo+" "+error.message);
return cb(null);
}
//var regex = /{\"h264.*}}/;
//var regex = /:119.*\.mp4"/;
var regex = /"progressive".*/;
try
{
var info = body.match(regex)[0].split(',');
for ( i in info) {
regex=/token/
if (info[i].match(regex) )console.log( i+ "=>" +info[i]);
}
regex = /https:.*expire/;
var t = body.match(regex)[0].split(',')[0].split('"');
regex = /mp4/;
console.log(t);
console.log("\n*************")
var url = info[4].split('":"')[1].split('"');
var urlSD=url[0];


} catch(err) { console.log(err);return cb(null); }
console.log(urlSD)
cb(urlSD);
});
}
