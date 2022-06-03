/*
  CREATE new bucket and add an object
  Relies on  ~/.aws/credentials
*/

// modules
var uuid = require('node-uuid');
var AWS = require('aws-sdk');
const {s3Config, BUCKET} = require("../configs");
var s3 = s3Config;

// params
var bucketName = 'node-sdk-sample-' + uuid.v4();
var keyName = 'hello_world.txt';
var body = 'Hello, World!';

var bucketParams = {};
bucketParams.Bucket = bucketName;

var objectParams = {};
objectParams.Bucket  =BUCKET;
objectParams.Key = keyName;
objectParams.Body = body;

// action
s3.createBucket(bucketParams, function() {
    s3.putObject(objectParams, function(err, data) {
        if (err)
            console.log(err)
        else
            console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
    });
});