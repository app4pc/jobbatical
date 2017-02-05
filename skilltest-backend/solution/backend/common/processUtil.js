/**
 * Created by NB on 30-Jan-16.
 */
var chalk=require("chalk");

module.exports=function(express,app){
    process.on('uncaughtException', function(err) {
        console.log(chalk.red(err, err.stack.split("\n")))
    });
};
