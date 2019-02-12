var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require("fs");
var password =  ""
let contractName = "GameBox"


let contractData = JSON.parse(fs.readFileSync("../Game-abibytecode.json","utf8"));
let contractDeploymentDetails = JSON.parse(fs.readFileSync("../Game.json","utf8"));

let MyContract = new web3.eth.Contract(JSON.parse(contractData.abi), contractDeploymentDetails.contractAddress);

MyContract.methods.GetGame(123111).call({}, function(err, result){
    console.log(err,result);
})

MyContract.methods.GetGamePlayers(123111).call({}, function(err, result){
    console.log(err,result);
})