var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var password =  ""
let contractName = process.argv[3]
const fs = require("fs");
const solc = require('solc')

let source = fs.readFileSync(process.argv[2]+'.sol', 'utf8');
let compiledContract = solc.compile(source, 1);

let abi = compiledContract.contracts[':'+contractName].interface;
let bytecode = '0x' + compiledContract.contracts[':'+contractName].bytecode;


let gasEstimate = web3.eth.estimateGas({data:bytecode});
let MyContract = new web3.eth.Contract(JSON.parse(abi));

fs.writeFile(process.argv[2]+'-abibytecode.json', JSON.stringify({abi,bytecode},null,2),function(err){
    if(err) throw err;
    console.log(process.argv[2],"abi bytecode saved")
})

web3.eth.getAccounts(function(err,accounts){
    web3.eth.personal.unlockAccount(accounts[0], password, 100000, function(err2,data){
        // console.log(err2,data)
        if(err2){
            console.log("Account password wrong")
            process.exit(0)
        }

        MyContract.deploy({
            data: bytecode
        })
        .send({
            from: accounts[0],
            gas: 99999999,
            gasPrice: 0
        }, function(error, transactionHash){
            // console.log(error)
         })
        .on('error', function(error){ 
            console.log(error)
         })
        .on('transactionHash', function(transactionHash){
            console.log(contractName+": "+transactionHash)
         })
        .on('receipt', function(receipt){
            fs.writeFile(process.argv[2]+'.json', JSON.stringify(receipt,null,2), function (err) {
                if (err) throw err;
                console.log(contractName,":",process.argv[2],' details Saved!');
              });
            
        })
        .then(function(newContractInstance){

        }).catch(function(){
    
        });
    })

})