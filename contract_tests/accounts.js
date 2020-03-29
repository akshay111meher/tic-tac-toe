var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://68.183.87.16:8545"));
var fs = require("fs");
var password =  ""
let contractName = "GameBox"
var mainAccount = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"

let contractData = JSON.parse(fs.readFileSync("../Game-abibytecode.json","utf8"));
let contractDeploymentDetails = JSON.parse(fs.readFileSync("../Game.json","utf8"));

let MyContract = new web3.eth.Contract(JSON.parse(contractData.abi), contractDeploymentDetails.contractAddress);

web3.eth.getTransactionCount(mainAccount, function(err,nonce){

    var encoded = MyContract.methods.CreateGame(23).encodeABI()
    var tx = {
        to : contractDeploymentDetails.contractAddress,
        data : encoded,
        gas: 99999999,
        value: 1000000000,
        nonce: nonce
    }

    // web3.eth.accounts.signTransaction(tx, "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d").then(signed => {
    //     web3.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', console.log)
    // });

    web3.eth.accounts.signTransaction(tx, "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",function(err, response){
        if(err){
            console.log("err signing transaction")
        }else{
            web3.eth.sendSignedTransaction(response.rawTransaction,function(err,result){
                console.log(err,result)
            })
        }
    })
})
