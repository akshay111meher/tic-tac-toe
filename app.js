var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Web3 = require('web3');
    web3 = new Web3(new Web3.providers.HttpProvider("http://68.183.87.16:8545"));

    contractData = JSON.parse(fs.readFileSync("Game-abibytecode.json","utf8"));
    contractDeploymentDetails = JSON.parse(fs.readFileSync("Game.json","utf8"));

     MyContract = new web3.eth.Contract(JSON.parse(contractData.abi), contractDeploymentDetails.contractAddress);
    
     privateKey = "";
     address = "";
     isKeyLoaded = false;
    
var app = express();
var indexRouter = require('./routes/index');
var keysRouter = require('./routes/keys');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/keys', keysRouter);


module.exports = app;
