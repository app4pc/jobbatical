var opt=require("../option.json");
var postgressUrl = require('pg'),
    async = require('async'),
    chalk = require('chalk'),
    postgressUrlUrl = opt.pg_test_db_url;

module.exports=function (req,res) {
    if(req.method=="GET" && req.query.mongoPth){
        postgressUrlUrl=opt[""+req.query.mongoPth];
    }else{
        postgressUrlUrl=opt[""+req.body.mongoPth];
    }
    var app = req.app;
    postgressUrl.connect(postgressUrlUrl, function (err, client, done) {
        if (err) {
            return res.json({
                message: 'Error connecting to DB',
                error: err,
                failed: true
            })
        }
        var userId = req.params.userId;
        var myData = {};
        /** Need to make 4 queries, run these queries in parallel**/
        var parallelTsk = [];
        parallelTsk.push(function (next) {
            var query = 'SELECT id, name, created_at "createdAt" FROM users WHERE id=$1';
            client.query(query, [userId], function (err, results) {
                if (err) return next(err);
                if (results.rows.length != 1) {
                    res.status(404);
                    return res.json({
                        message: 'User not found',
                        error: {},
                        failed: true
                    })
                }
                myData.userDet = results.rows[0];
                next();
            });
        });
        parallelTsk.push(function (next) {
            var companiesQuery = 'SELECT  c.id,c.name,c.created_at as "createdAt",t.contact_user as "isContact"  FROM companies c INNER JOIN teams t ON t.company_id=c.id WHERE t.user_id=$1 LIMIT 5';
            client.query(companiesQuery, [userId], function (err, results) {
                if (err) return next(err);
                myData.companies = results.rows;
                next();
            });
        });
        parallelTsk.push(function (next) {
            var listingsQuery = 'SELECT l.id,l.created_at as "createdAt",l.name,l.description FROM listings l WHERE created_by=$1 LIMIT 5';
            client.query(listingsQuery, [userId], function (err, results) {
                if (err) return next(err);
                myData.createdListings = results.rows;
                next();
            });
        });
        parallelTsk.push(function (next) {
            var applicationsQuery = 'SELECT a.id,a.created_at as "createdAt", a.cover_letter as "coverLetter", to_json((SELECT x FROM (SELECT l.id, l.name,l.description) x)) AS listing FROM applications a INNER JOIN listings l ON a.listing_id=l.id WHERE a.user_id=$1 GROUP BY a.id, l.id LIMIT 5 ';
            client.query(applicationsQuery, [userId], function (err, results) {
                if (err) return next(err);

                myData.applications = results.rows;
                next();

            });
        });

        async.parallel(parallelTsk, function (err) {
            if (err) {
                console.log(chalk.red(err));
                return res.json({
                    message: 'Query Error',
                    error: err,
                    failed: true
                })
            }
            var userDet = myData.userDet;
            userDet.companies = myData.companies;
            userDet.createdListings = myData.createdListings;
            userDet.applications = myData.applications;
            res.json(userDet);
        });
    });
};