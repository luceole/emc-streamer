// Stupid Proxy ;-)
var request = require('request');

exports.index = function(req, res){
var url="http://localhost"+req.url;
console.log(url);
request(url).pipe(res);
};
