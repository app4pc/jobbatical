var opt=require("../option.json");
var postgress = require('pg'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    postgressUrl = opt.pg_test_db_url;

module.exports=function (req,res) {
    if(req.method=="GET" && req.query.mongoPth){
        postgressUrl=opt[""+req.query.mongoPth];
    }else{
        postgressUrl=opt[""+req.body.mongoPth];
    }

    var SQL_DIR = path.join(__dirname, '../pgSql');
    function getSQL(queryName) {
        return fs.readFileSync(path.join(SQL_DIR, queryName + '.sql'), 'utf8');
    }

    var sql = {
        topActiveUsers: getSQL('topActiveUsers')
    };

    postgress.connect(postgressUrl, function (err, client, done) {
        if (err) {
            return res.send({
                message: 'DB connection err',
                error: err,
                failed: true
            })
        }
        var pageNumber = parseInt(req.query.page) || 1;
        var limit = opt.page_limit;
        var offset = (pageNumber - 1) * limit;

        var query = sql.topActiveUsers
                .replace('${limit}', limit)
                .replace('${offset}', offset);
        client.query(query, function (err, results) {
            if (err) {
                console.log(chalk.red(err));
                return res.json({
                    message: 'Query Error',
                    error: err,
                    failed: true
                })
            }
            res.json(results.rows);
        });

    });
};