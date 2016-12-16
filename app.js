var fs = require('fs');
var pg = require('pg');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/Chrome', function(req, res) {

    var base64Data = req.body.data.replace(/^data:;base64,/, "");


    fs.writeFile("mhtml/" + req.body.file_name + ".mhtml", base64Data, 'base64', function(err) {
        if (err) {
            return console.log(err);
        }

        var rootpath = __dirname.replace(/\\/g,"/") ;
        
        console.log(req.body.file_name);
        res.send(rootpath);
    });

});

app.listen(3000);
