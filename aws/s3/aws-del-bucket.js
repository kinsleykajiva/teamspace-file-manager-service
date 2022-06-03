/*
  DELETE an empty S3 bucket
  Relies on  ~/.aws/credentials
*/

// modules
var AWS = require('aws-sdk');
const {s3Config, BUCKET} = require("../configs");
var s3 = s3Config;

// params
var params = {};
params.Bucket  =BUCKET;

// action
s3.deleteBucket(params, function(err,data) {
    if(err) {
        console.log(err,err.stack);
    }
    else {
        console.log(data);
    }
});
