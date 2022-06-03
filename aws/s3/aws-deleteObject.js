/*
  DELETE an object in an existing S3 bucket
  Relies on  ~/.aws/credentials
*/

// modules
var AWS = require('aws-sdk');
const {s3Config, BUCKET} = require("../configs");
var s3 = s3Config;

// params
var params = {};
params.Bucket  =BUCKET;
params.Key = 'hello_world.txt';

// action
s3.deleteObject(params, function(err,data) {
    if(err) {
        console.log(err,err.stack);
    }
    else {
        console.log(data);
    }
});
