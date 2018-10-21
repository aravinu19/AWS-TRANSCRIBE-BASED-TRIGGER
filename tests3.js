const aws = require('aws-sdk');
aws.config.update({region:'us-east-1'});
var s3 = new aws.S3();

var paras = {
    Bucket: "cloudvoicepath"
}

s3.listObjects(paras, (err, data) => {
    if(err) console.log(err);
    else{
        //console.log(data);
        var list = data.Contents;

        var count = 0;

        list.forEach(element => {
            console.log(element.Key);
            count++;
        });

        console.log(`\n\nTotal Files Count ${count}`);

    }
})
