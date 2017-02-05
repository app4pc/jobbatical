/**
 * Created by NB on 26-Jan-16.
 */
var apiList= require("./apiList"),
    chalk=require("chalk");
module.exports = function(app) {
    for(var methd in apiList){
        apiList[methd].forEach(function(itm){
            console.log(chalk.cyan("Method:",methd.toUpperCase()," | Url:",itm.url));
            app[methd](itm.url,itm.callback)
        });
    }
};
