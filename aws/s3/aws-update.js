/*
  UPDATE an existing S3 object
  Relies on  ~/.aws/credentials
*/

// modules
var AWS = require('aws-sdk');
var awsConfig = require('aws-config');
const {s3Config} = require("../configs");
var s3 = s3Config;

// params
var params = {};
params.Bucket = 'node-sdk-sample-8a616993-e756-4f3f-8d25-2a04aa756b39';
params.Key = 'hello_world.txt';
params.Body = 'hello, again!';

// action
s3.putObject(params, function(err,data) {
    if(err) {
        console.log(err,err.stack);
    }
    else {
        console.log(data);
    }
});

