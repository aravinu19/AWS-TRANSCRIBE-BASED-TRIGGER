const aws = require('aws-sdk');
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
        console.log(data.Body.toJSON());
        res.json(JSON.parse(data.Body.toString()));
      }

    })

  });

};


module.exports = transcriber;
