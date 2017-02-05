var pg = require('pg'),
    async = require('async'),
    opt=require("../option.json"),
    pgUrl = opt.use_aws_db?opt.aws_db:opt.pg_test_db_url;


module.exports={
    cleanDb:function(done) {
        if(!opt.use_aws_db){
            pg.connect(pgUrl, function (err, client, close) {
                if (err) {
                    close();
                    done(err);
                }
                function truncateTable(tableName, next) {
                    var clientQueryCB=function (err, result) {
                        if(err){
                            console.log("dont have permission to TRUNCATE ",tableName);
                        }
                        next()
                    };
                    client.query(
                        "TRUNCATE TABLE " + tableName + " RESTART IDENTITY CASCADE").on('end',
                        clientQueryCB);
                }
                async.series([function (next) {
                    truncateTable('users', next)
                }, function (next) {
                    truncateTable('companies', next)
                }, function (next) {
                    truncateTable('teams', next)
                }, function (next) {
                    truncateTable('listings', next)
                }, function (next) {
                    truncateTable('applications', next)
                }], function () {
                    close();
                    done();
                });
            })
        }else {
            console.log("not clining aws DB");
            done();
        }
    },
    dataHelper:function (client) {
        return {
            createUsers: function (userDetailList, cb) {
                var insertStrings = [];
                for (var i = 0; i < userDetailList.length; i++) {
                    var userDetail = userDetailList[i];
                    insertStrings.push("('" + userDetail.name + "')");
                }
                var values = insertStrings.join(",");
                client.query(
                    "insert into users (name) values " + values + "RETURNING id, name, created_at",
                    function (err, results) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, results.rows);
                    });
            },
            createListings: function (listingsDetailsList, cb) {
                var insertStrings = [];
                for (var i = 0; i < listingsDetailsList.length; i++) {
                    var listingDetail = listingsDetailsList[i];
                    insertStrings.push(
                        "('" + listingDetail.created_by + "','" + listingDetail.name + "','" + listingDetail.description + "')");
                }
                var values = insertStrings.join(",");
                client.query(
                    "insert into listings (created_by, name, description) values " + values + "RETURNING id, name, description, created_by, created_at",
                    function (err, results) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, results.rows);
                    });
            },
            createApplications: function (applicationDetailsList, cb) {
                var insertStrings = [];
                for (var i = 0; i < applicationDetailsList.length; i++) {
                    var applicationDetail = applicationDetailsList[i];
                    insertStrings.push(
                        "('" + applicationDetail.user_id + "','" + applicationDetail.listing_id + "')");
                }
                var values = insertStrings.join(",");
                client.query(
                    "insert into applications (user_id, listing_id) values " + values + "RETURNING id, created_at, user_id, listing_id",
                    function (err, results) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, results.rows);
                    });
            },
            createCompanies: function (companyDetailsList, cb) {
                var insertStrings = [];
                for (var i = 0; i < companyDetailsList.length; i++) {
                    var companyDetails = companyDetailsList[i];
                    insertStrings.push(
                        "('" + companyDetails.name + "')");
                }
                var values = insertStrings.join(",");
                client.query(
                    "insert into companies (name) values " + values + "RETURNING id, created_at, name",
                    function (err, results) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, results.rows);
                    });
            },
            createTeams: function (teamDetailsList, cb) {
                var insertStrings = [];
                for (var i = 0; i < teamDetailsList.length; i++) {
                    var teamDetails = teamDetailsList[i];
                    insertStrings.push(
                        "('" + teamDetails.user_id + "','" + teamDetails.company_id + "','" + teamDetails.contact_user + "')");
                }
                var values = insertStrings.join(",");
                client.query(
                    "insert into teams (user_id,company_id,contact_user) values " + values + "RETURNING id,user_id,company_id,contact_user",
                    function (err, results) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, results.rows);
                    });
            }
        };
    },
    genUsers:function(count, prefix) {
        var data = [];
        for (var i = 0; i < count; i++) {
            data.push({
                name: prefix + i
            });
        }
        return data
    },
    genListings:function(count, prefix, user) {
        var data = [];
        for (var i = 0; i < count; i++) {
            data.push({
                created_by: user.id,
                name: prefix + ' name' + i,
                description: prefix + ' description' + i
            });
        }
        return data
    },
    genUserApplications:function(user, listings) {
        var data = [];
        for (var i = 0; i < listings.length; i++) {
            data.push({
                user_id: user.id,
                listing_id: listings[i].id
            });
        }
        return data
    },
    genCompanies:function (count, prefix) {
        var data = [];
        for (var i = 0; i < count; i++) {
            data.push({
                name: prefix + i
            });
        }
        return data
    },
    genUserTeams:function (user, companies, contactUserMap) {
        var data = [];
        for (var i = 0; i < companies.length; i++) {
            data.push({
                user_id: user.id,
                company_id: companies[i].id,
                contact_user: contactUserMap[companies[i].id] || false
            });
        }
        return data
    }
};