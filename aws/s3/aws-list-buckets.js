/*
  LIST S3 buckets for this credential pair
  Relies on  ~/.aws/credentials
*/

// modules
var AWS = require('aws-sdk');
const {s3Config, BUCKET} = require("../configs");
var s3 = s3Config;

// params
var params = {};

// action
s3.listBuckets(params, function(err,data) {
    if(err) {
        console.log(err,err.stack);
    }
    else {
        console.log(data);
    }
});
