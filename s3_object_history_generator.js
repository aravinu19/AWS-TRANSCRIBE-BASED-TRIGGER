const aws = require('aws-sdk');
aws.config.update({region:'us-east-1'});
var s3 = new aws.S3();

var params = {
    Bucket: "connect-4b82db31f184",
    prefix: "connect/ContactCenterTechnologyCOE/CallRecordings/"
};

var object_history_generator = function(required_month, start_date, end_date, callback){

    var params = {
        Bucket: "connect-4b82db31f184",
        prefix: "connect/ContactCenterTechnologyCOE/CallRecordings/" + "2018" + start_date
    };

    var data_json = "[";

    var files_in_days = new Array(31).fill(0);

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

                data_json += prepare_data_for_d3_graph(index, files_in_days[index], required_month); //Month needs method to change according to request month data

            }

            data_json += "]";

            callback(data_json);

        }

    });

};


function create_data(date, files_count, month, bar_color){
    if (files_count > 0) {
        return `{
            "Dag":"vrijdag",
            "Datum":"${date} ${month}.",
            "Slaapeffi": ${bar_color},
            "Slaapuren":${files_count},
            "Beginslapen":"${files_count} Files"
        },`
    }else{
        return `{
            "Dag":"vrijdag",
            "Datum":"${date} ${month}.",
            "Slaapeffi":0.85,
            "Slaapuren":${files_count}
        },`
    }
}

function prepare_data_for_d3_graph(date, files_count, month){

    var requested_month = get_selected_month_string(month);

    var bar_color = get_color_based_on_files_count(files_count);

    return create_data(date, files_count, requested_month, bar_color);

}

function get_selected_month_string(month){

    switch(month){
        case 0: return "JAN"; 
        case 1: return "FEB"; 
        case 2: return "MAR";
        case 3: return "APR";
        case 4: return "MAY";
        case 5: return "JUN";
        case 6: return "JUL";
        case 7: return "AUG";
        case 8: return "SEP";
        case 9: return "OCT";
        case 10: return "NOV";
        case 11: return "DEC";
        default: return "OCT";
    }

}

function get_color_based_on_files_count(files_count){

    if (files_count <= 5) {
        return (0.1);
    }else if(files_count <= 10){
        return (1);
    }else{
        return (0.85);
    }

}

module.exports = object_history_generator;