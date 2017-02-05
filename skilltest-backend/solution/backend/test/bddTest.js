var request = require('request'),
    pg = require('pg'),
    chai = require('chai'),
    chalk = require('chalk'),
    expect = chai.expect,
    async = require('async'),
    opt=require("../option.json");
var pgUrl = opt.use_aws_db?opt.aws_db:opt.pg_test_db_url,
    baseURL=opt.test_case_baseURL;


var testUtills=require("./testUtils");
/**
 * Cleanup database before all tests
 */

describe('Test', function () {
    before(function(done){testUtills.cleanDb(done)});
    describe('Active Users API', function () {
        describe('GET /topActiveUsers', function () {
            beforeEach(function (done) {
                if(!opt.use_aws_db){
                    /**
                     * Create some data
                     */
                    var currentThis = this;
                    pg.connect(pgUrl, function (err, client, close) {
                        function cancel(err) {
                            close();
                            done(err);
                        }
                        var td = testUtills.dataHelper(client);
                        td.createUsers(testUtills.genUsers(17, 'User'), function (err, users) {
                            if (err) return cancel(err);
                            currentThis.users = users;
                            td.createListings(testUtills.genListings(20, 'Listing', users[0]),
                                function (err, listings) {
                                    if (err) return cancel(err);
                                    currentThis.listings = listings;
                                    td.createApplications([{
                                            user_id: users[3].id,
                                            listing_id: listings[0].id
                                        }, {
                                            user_id: users[3].id,
                                            listing_id: listings[1].id
                                        }, {
                                            user_id: users[3].id,
                                            listing_id: listings[2].id
                                        }, {
                                            user_id: users[3].id,
                                            listing_id: listings[3].id
                                        }, {
                                            user_id: users[1].id,
                                            listing_id: listings[4].id
                                        }, {
                                            user_id: users[1].id,
                                            listing_id: listings[5].id
                                        }, {
                                            user_id: users[0].id,
                                            listing_id: listings[6].id
                                        }],
                                        function (err, applications) {
                                            if (err) return cancel(err);
                                            currentThis.applications = applications;
                                            done();
                                        });
                                });
                        });
                    });
                }else{
                    done()
                }
            });
            it('should return first '+opt.page_limit+' Top Active Users', function (done) {
                var currentThis = this;

                var options2 = {
                    url: baseURL+'/topActiveUsers',
                    headers: {
                        'User-Agent': 'request',
                        'Accept':'application/json',
                        'Content-Type':'application/json'
                    }
                };
                request.get(options2,function (err,res,body1) {
                    if (err) return done(err);
                    var body=JSON.parse(body1);
                    expect(!body.failed).to.equal(true);
                    expect(body).to.be.instanceOf(Array);
                    expect(body.length>0 && body.length<=opt.page_limit).to.equal(true);
                    var user0 = body[0];
                    if(currentThis.users) {
                        expect(user0.id).to.equal(currentThis.users[3].id);
                    }else {
                        console.log(chalk.red("Data on DB is not in correct format provided"));
                    }
                    expect(user0.createdAt).to.be.present;
                    var user0CreatedAt = new Date(user0.createdAt);
                    expect(user0CreatedAt).to.not.equal(NaN);
                    expect(user0.count>0).to.equal(true);
                    expect(user0.listings).to.be.instanceOf(Array);
                    expect(user0.listings).to.have.length(3);


                    var user1 = body[1];
                    if(currentThis.users){
                        expect(user1.id).to.equal(currentThis.users[1].id);
                        expect(user1.count).to.equal(2);
                        expect(user1.listings).to.have.length(2);
                        var user2 = body[2];
                        expect(user2.id).to.equal(currentThis.users[0].id);
                        expect(user2.count).to.equal(1);
                        expect(user2.listings).to.have.length(1);
                    }else {
                        console.log(chalk.red("Data on DB is not in correct format provided"));
                    }
                    done();
                })
            });

            it('should return Top Active Users for current page', function (done) {
                var currentThis = this;
                var options3 = {
                    url: baseURL+'/topActiveUsers?page=2',
                    headers: {
                        'User-Agent': 'request',
                        'Accept':'application/json',
                        'Content-Type':'application/json'
                    }
                };
                request.get(options3,function (err,res,body1) {
                    if (err) return done(err);
                    var body=JSON.parse(body1);
                    expect(!body.failed).to.equal(true);
                    expect(body).to.be.instanceOf(Array);
                    expect(body).to.have.length(opt.page_limit);
                    var userList = body;
                    for (var i = 0; i < userList.length; i++) {
                        var userObj = userList[i];
                        if(currentThis.users){
                            expect(userObj.id).to.not.equal(currentThis.users[3].id);
                            expect(userObj.id).to.not.equal(currentThis.users[1].id);
                            expect(userObj.id).to.not.equal(currentThis.users[0].id);
                        }else {
                            console.log(chalk.red("Data on DB is not in correct format provided"));
                        }
                    }
                    done();
                })
            });
        });

        describe('User Details API', function () {
            beforeEach(function (done) {
                if(!opt.use_aws_db){
                    /**
                     * Create some data
                     */
                    var currentThis = this;
                    pg.connect(pgUrl, function (err, client, close) {
                        function cancel(err) {
                            close();
                            done(err);
                        }

                        var td = testUtills.dataHelper(client);
                        td.createUsers(testUtills.genUsers(2, 'User'), function (err, users) {
                            if (err) return cancel(err);
                            currentThis.users = users;
                            currentThis.user = users[0];
                            currentThis.creator = users[1];
                            td.createListings(testUtills.genListings(opt.page_limit, 'Listing', currentThis.creator),
                                function (err, listings) {
                                    if (err) return cancel(err);
                                    currentThis.listings = listings;
                                    td.createApplications(testUtills.genUserApplications(currentThis.user, listings),
                                        function (err, applications) {
                                            if (err) return cancel(err);
                                            currentThis.applications = applications;
                                            td.createCompanies(testUtills.genCompanies(opt.page_limit, 'Company'),
                                                function (err, companies) {
                                                    if (err) return cancel(err);
                                                    currentThis.companies = companies;
                                                    var cMap = {};
                                                    cMap[companies[0].id] = true;
                                                    td.createTeams(testUtills.genUserTeams(currentThis.user, companies, cMap),
                                                        function (err, teams) {
                                                            if (err) return cancel(err);
                                                            currentThis.teams = teams;
                                                            done();
                                                        });
                                                });
                                        });
                                });
                        });
                    });
                }else{
                    done()
                }
            });

            describe('GET /users/:userId', function () {
                it('should return the full details of the user', function (done) {
                    var currentThis = this;
                    if(currentThis.creator){
                        var options4 = {
                            url: baseURL+'/users/' + currentThis.creator.id,
                            headers: {
                                'User-Agent': 'request',
                                'Accept':'application/json',
                                'Content-Type':'application/json'
                            }
                        };
                        request.get(options4,function (err,res,body) {
                            if (err) return done(err);
                            var userDetails = JSON.parse(body);
                            expect(!userDetails.failed).to.equal(true);
                            expect(userDetails).to.be.instanceOf(Object);
                            expect(userDetails.id).to.equal(currentThis.creator.id);
                            expect(userDetails.name).to.equal(currentThis.creator.name);
                            expect(userDetails.createdAt).to.be.present;

                            var companies = userDetails.companies;
                            expect(companies).to.be.instanceOf(Array);
                            expect(companies).to.have.length(0);
                            var createdListings = userDetails.createdListings;
                            expect(createdListings).to.be.instanceOf(Array);
                            expect(createdListings).to.have.length(5);

                            var applications = userDetails.applications;
                            expect(applications).to.be.instanceOf(Array);
                            expect(applications).to.have.length(0);
                            var options1 = {
                                url: baseURL+'/users/' + currentThis.user.id,
                                headers: {
                                    'User-Agent': 'request',
                                    'Accept':'application/json',
                                    'Content-Type':'application/json'
                                }
                            };
                            request.get(options1,function (err,res,body) {
                                if (err) return done(err);
                                var userDetails = JSON.parse(body);
                                expect(!userDetails.failed).to.equal(true);
                                expect(userDetails).to.be.instanceOf(Object);
                                expect(userDetails.id).to.equal(currentThis.user.id);
                                expect(userDetails.name).to.equal(currentThis.user.name);
                                expect(userDetails.createdAt).to.be.present;

                                var companies = userDetails.companies;
                                expect(companies).to.be.instanceOf(Array);
                                expect(companies).to.have.length(5);
                                for (var i = 0; i < companies.length; i++) {
                                    var company = companies[i];
                                    expect(company.createdAt).to.be.present;
                                    expect(company.isContact).to.be.present;
                                }

                                var createdListings = userDetails.createdListings;
                                expect(createdListings).to.be.instanceOf(Array);
                                expect(createdListings).to.have.length(0);
                                for (var i = 0; i < createdListings.length; i++) {
                                    var listing = createdListings[i];
                                    expect(listing.createdAt).to.be.present;
                                    expect(listing.name).to.be.present;
                                    expect(listing.description).to.be.present;
                                }

                                var applications = userDetails.applications;
                                expect(applications).to.be.instanceOf(Array);
                                expect(applications).to.have.length(5);

                                for (var i = 0; i < applications.length; i++) {
                                    var application = applications[i];
                                    expect(application.createdAt).to.be.present;
                                    expect(application.coverLetter).to.be.present;
                                    expect(application.listing).to.be.instanceOf(Object);
                                    expect(application.listing.createdAt).to.be.present;

                                }
                                done();
                            })
                        })
                    }else {
                        done()
                    }
                });
            });
        });
    });
    after(function () {
        console.log("Post code for Active Users API")
    });
});