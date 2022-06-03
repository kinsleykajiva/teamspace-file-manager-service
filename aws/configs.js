const AWS = require('aws-sdk');
const awsConfig = require('aws-config');
require('dotenv').config();

const SECRETACCESSKEY = process.env.secretAccessKey;
const ACCESSKEYID = process.env.accessKeyId;
const REGION = process.env.region;
const BUCKET = process.env.bucket;


// demonstrating different sample usage at the individual service level
const s3Config = new AWS.S3(awsConfig({accessKeyId: ACCESSKEYID,region: REGION, secretAccessKey: SECRETACCESSKEY}));

// AWS.config = awsConfig();//

module.exports = {s3Config,BUCKET ,ACCESSKEYID,SECRETACCESSKEY,REGION};