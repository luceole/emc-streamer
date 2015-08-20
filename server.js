#! /usr/bin/env node
/*
*  Stream Video
* Licence CECILL 2 
* A Completer
*/
var cluster = require('cluster');
var log4js = require('log4js');
log4js.clearAppenders() 
log4js.configure('log4js_configuration.json', {});
logger = log4js.getLogger();

if(cluster.isMaster){
//master process
var numForks;
var numCPUs = numForks= require('os').cpus().length;
if (numCPUs<2) numForks = 2; else numForks = numCPUs;  // 2 process minimum
logger.info("Stream Server  started. Nb CPU =%s => Nb process=%s ",numCPUs,numForks); 
console.log("Stream Server  started. Nb CPU =%s => Nb process=%s ",numCPUs,numForks); 
	//Fork based on the number of CPUs
	for (var i = 0; i < numForks; i++) {
		cluster.fork();
	}
	//Check for the child's states and restart them if died
	cluster.on('exit', function(worker, code) {
	console.log('Worker ' + worker.process.pid + ' died with code '+code);
	logger.info('Worker ' + worker.process.pid + ' died with code '+code);
	var myWork=cluster.fork();  // Start Again 
	});
}else{
// Child  Process => Do the job!
require("./app.js");
}
