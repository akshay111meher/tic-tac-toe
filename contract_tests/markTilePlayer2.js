let row = process.argv[2] || 2;
let column = process.argv[3] || 2;
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://68.183.87.16:8545"));
var fs = require("fs");
var password =  ""
let contractName = "GameBox"
var secondryAccount = "0xffcf8fdee72ac11b5c542428b35eef5769c409f0"

let contractData = JSON.parse(fs.readFileSync("../Game-abibytecode.json","utf8"));
let contractDeploymentDetails = JSON.parse(fs.readFileSync("../Game.json","utf8"));

let MyContract = new web3.eth.Contract(JSON.parse(contractData.abi), contractDeploymentDetails.contractAddress);

MyContract.methods.MarkTile(0,row,column).send({
    from:secondryAccount,
    gas: 9999999
},function(err, result){
    console.log(err,result)
})
