const aws = require('aws-sdk');
const sql_handler = require('./sql_handler');

aws.config.update({region:'us-east-1'});

var trans = new aws.TranscribeService({apiVersion: '2017-10-26'});
var s3 = new aws.S3();

var transcriber = function(app){
	
	app.post("/transcribe", (req, res) => {

		var name = req.body.name;

		var params = {
    LanguageCode: 'en-US', /* required */
    Media: { /* required */
      MediaFileUri: 'https://s3.amazonaws.com/cloudvoicepath/' + name,
    },
    MediaFormat: 'mp3', /* required */
    TranscriptionJobName: 'Trigger_' + name, /* required */
    
    OutputBucketName: 'cloudvoicepath',
    Settings: {
      ChannelIdentification: false,
      ShowSpeakerLabels: false
    }
  };
  
  trans.startTranscriptionJob(params, (err, data) =>{
      if(err){
          console.log(err);
      }
      
      console.log(data);

	res.json({job:data});
    
  });

	});

	app.post("/json", (req, res) => {

    var bucket_name = req.body.bucket;
    var file_name = req.body.name;
  
    var object_data = {
      Bucket: bucket_name,
      Key: file_name
    };

    s3.getObject(object_data, (err, data) => {

      if(err) {
        console.log(err);
        res.send(err);
      }
      else{

        var data_from_s3 = data.Body.toString();
        data_from_s3 = JSON.parse(data_from_s3).results;
        console.log(data_from_s3.transcripts[0].transcript);
        
        sql_handler.send_data_to_db(data_from_s3.transcripts[0].transcript, file_name.split('.json')[0], (recordset) => {
          console.log(recordset);
        });
        
        res.json(data_from_s3.transcripts[0].transcript);
      }

    })

  });

};


module.exports = transcriber;
