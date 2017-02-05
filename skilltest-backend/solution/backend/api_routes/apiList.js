var path=require("path"),
    mong=require("../module/pgTopUser"),
    mongrRng=require("../module/pgUsers");
var myOption=require("../option.json");
var createToken=function (user) {
    return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: 60*60*5 });
};
module.exports ={
    "get":[
        {
            "url":'/',
            "callback":function(req, res, next){
                console.log("__dirname",__dirname);
                res.send({"msg":"Yea server is running"});
            }
        },
        {
            "url":['/test/topActiveUsers','/prod/topActiveUsers'],
            "callback":function(req, res, next){
                mong(req,res);
            }
        },
        {
            "url":['/test/users/:userId','/prod/users/:userId'],
            "callback":function(req, res, next){
                mongrRng(req,res);
            }
        }
    ],
    "post":[],
    "put":[]
};


