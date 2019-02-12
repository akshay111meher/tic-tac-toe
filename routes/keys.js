var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/loadPrivateKey', function(req, res, next) {
    if(isKeyLoaded == false || ("0x"+req.body.PrivateKey) == privateKey){
        try {
            let publicKey
            publicKey = web3.eth.accounts.privateKeyToAccount("0x"+req.body.PrivateKey);
            isKeyLoaded = true;
            privateKey = publicKey.privateKey;
            address = publicKey.address;
            res.status(200).send(publicKey)
        } catch (error) {
            res.status(400).json({error:"Invalid Private Key"})
        }
    }else{
        res.status(400).json({error:"This Pod is already assigned"})
    }
});

router.post('/remove', function(req,res,next){
    let privKey = "0x"+req.body.PrivateKey;
    if(privKey == privateKey){
        isKeyLoaded = false;
        privateKey = "";
        address = "";
        res.status(200).send("Key removed successfully");
    }else{
        res.status(400).send("Failed Removing Key");
    }
})

router.post('/balance',function(req,res,next){
    try {
        web3.eth.getBalance(req.body.Address,function(err,data){
            res.status(200).send(data);
        })
    } catch (error) {
        res.status(400).json({error:"Invalid Address"})
    } 
})

module.exports = router;
