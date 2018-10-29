const aws = require('aws-sdk');
aws.config.update({region:'us-east-1'});
var s3 = new aws.S3();

var paras = {
    Bucket: "cloudvoicebucket"
}

var data_json = "[";

var files_in_a_day = new Array(30).fill(0);

s3.listObjects(paras, (err, data) => {
    if(err) console.log(err);
    else{
        //console.log(data);
        var list = data.Contents;

        var count = 0;

        list.forEach(element => {
            if(element.Key.split(".")[1] == "mp3" && element.Key.split(".")[2] != "json"){
                console.log(element.Key + "     " + element.LastModified.toString().split(" ") + " MONTH : " + element.LastModified.getMonth());
                count++;

                files_in_a_day[element.LastModified.getDate()]++;// = files_in_a_day[element.LastModified.toString().split(" ")[2]] + 1;

            }
        });

        console.log(`\n\nTotal Files Count ${count}`);

        for(var index = 0; index < 30; index++){
            
            if(files_in_a_day[index] > 0){
                console.log(files_in_a_day[index]);
            }

            data_json += create_data(index+1, files_in_a_day[index], "OCTOBER");
            
        }

        data_json += "]";

        console.log(data_json);

    }
})

function create_data(date, files_count, month){
    return `{
        "Dag":"vrijdag",
        "Datum":"${date} ${month}.",
        "Slaapeffi":0.85,
        "Slaapuren":${files_count},
        "Beginslapen":"01:52",
        "Eindslapen":"08:58",
    },`
}