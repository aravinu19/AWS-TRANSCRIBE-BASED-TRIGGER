const aws = require('aws-sdk');
const sql_handler = require('./sql_handler');
const object_history_generator = require('./s3_object_history_generator');

aws.config.update({region:'us-east-1'});

var trans = new aws.TranscribeService({apiVersion: '2017-10-26'});
var s3 = new aws.S3();

var transcriber = function(app){
	
	app.post("/transcribe", (req, res) => {

		var name = req.body.name;

		var params = {
    LanguageCode: 'en-US', /* required */
    Media: { /* required */
      MediaFileUri: 'https://s3.amazonaws.com/cloudvoicebucket/' + name,
    },
    MediaFormat: 'mp3', /* required */
    TranscriptionJobName: '' + name, /* required */
    
    OutputBucketName: 'cloudvoicebucket',
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

  app.post("/getObjectHistory", (req, res) => {

    var month = req.body.month;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;

    if (month != null && start_date != null && end_date != null) {
      
      object_history_generator(month, start_date, end_date, (data_json) => {

        res.send(data_json);

      });

    }else{

      res.send('failed');

    }

  });

};


module.exports = transcriber;
