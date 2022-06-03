/*
  ADD a new object to an existing bucket
  Relies on  ~/.aws/credentials
*/

const {s3Config, BUCKET} = require("../configs");


// params
let params = {};
params.Bucket =BUCKET;
params.Key = 'another_record.txt';
params.Body = 'hello, another!';

// action
s3Config.putObject(params, function(err,data) {
    if(err) {
        console.log(err,err.stack);
    }
    else {
        console.log(data);
    }
});