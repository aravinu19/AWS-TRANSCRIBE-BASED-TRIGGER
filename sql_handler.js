const sql = require('mssql');

var config = {
    user: 'sasidharan',
    password: 'Tcs#1234',
    server: 'transcribeapi.colsfl0djwbl.us-east-1.rds.amazonaws.com',
    database: 'transcribeoutput'
};

var send_data_to_db = function(voice_data, voice_file_name, callback){

    sql.connect(config, (err) => {

        if(err) console.log(err);
    
        var request = new sql.Request();
    
        request.query(`INSERT INTO speechoutput(filename, filedata) VALUES(${voice_file_name.toString()}, ${voice_data})`, (errs, recordset)=>{
            if(err) console.log(errs);
    
            callback(recordset);

            console.log(recordset);
        });
    
    });

};

module.exports.send_data_to_db = send_data_to_db;