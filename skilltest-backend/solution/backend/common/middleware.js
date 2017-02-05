var bodyParser = require('body-parser'),
	cors = require('cors'),
    chalk=require("chalk"),
    opt=require("../option.json");

module.exports = function(app,express) {
	app.use(cors());
	app.use(bodyParser.json({limit: '10mb'}));
	app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
    app.use('/prod/', function (req, res, next) {
        console.log(chalk.yellow("inside prod url"));
        if(req.method=="GET"){
            req.query.mongoPth=opt.use_aws_db?"aws_db":"pg_prod_db_url";
        }else{
            req.body.mongoPth=opt.use_aws_db?"aws_db":"pg_prod_db_url";
        }
        next();
    });
    app.use('/test/', function (req, res, next) {
        console.log(chalk.yellow("inside test url"));
        if(req.method=="GET"){
            req.query.mongoPth=opt.use_aws_db?"aws_db":"pg_test_db_url";
        }else{
            req.body.mongoPth=opt.use_aws_db?"aws_db":"pg_test_db_url";
        }
        next();
    });
};
