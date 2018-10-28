const aws = require('aws-sdk');
aws.config.update({region:'us-east-1'});
var s3 = new aws.S3();

var params = {
    Bucket: "cloudvoicepath"
};

var data_json = "[";

var files_in_days = new Array(31).fill(0);

var object_history_generator = function(required_month, start_date, end_date, callback){

    s3.listObjects(params, (err, data) => {

        if (err) {
            console.log(err);
        } else {
            
            var list = data.Contents;
            var count = 0;

            list.forEach(single_object => {

                if (single_object.Key.split(".")[1] == "mp3" && single_object.Key.split(".")[2] != "json" && single_object.LastModified.getMonth() == required_month) {
                    
                    console.log(single_object.Key + "       " + single_object.LastModified.toString().split(" ") + " MONTH: " + single_object.LastModified.getMonth());
                    count++;

                    files_in_days[single_object.LastModified.getDate()]++;

                }

            });

            console.log(`Total Files Counts to ${count}`);

            for(var index = start_date; index <= end_date; index++){

                data_json += create_data(index, files_in_days[index], "OCT"); //Month needs method to change according to request month data

            }

            data_json += "]";

            callback(data_json);

        }

    });

};


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

module.exports = object_history_generator;