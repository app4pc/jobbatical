var cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    express = require('express'),
    app = express(),
    chalk = require("chalk");


var addApiList= require("././api_routes/apiEngine"),
    middleware = require('./common/middleware.js'),
    processUtil= require("./common/processUtil"),
    opt=require("./option.json");



numCPUs=opt.no_of_cluster && opt.no_of_cluster<numCPUs?opt.no_of_cluster:numCPUs;

if (cluster.isMaster) {
    console.log(chalk.magenta("Master pid is: "+process.pid));
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
        console.log(chalk.red('worker ' + worker.process.pid + ' died with code n signal:',code, signal));
        cluster.fork();
    });
} else if(cluster.isWorker) {
    middleware(app,express);
    processUtil(express,app);
    addApiList(app);
    var srvr=app.listen(opt.port, function() {
        console.log(chalk.blue("Workers pid is: ", process.pid));
        console.log(chalk.green("Server is running on: ",opt.port))
    });
}

