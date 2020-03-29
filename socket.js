io.on('connection', function (socket) {
    socket.emit('handshake', { data: 'Socket Connection Established' });
    socket.on('handshake',function(data){
        //On Data Connection Established from Client
        socket.emit('handshake', { data: 'Socket Connection Established' });
    })

    socket.on('createNewGame',function(data){

        let gameId = data.gameId;
        let bettingAmount = data.bettingAmount;
        
        web3.eth.getTransactionCount(address, function(err,nonce){

            var encoded = MyContract.methods.CreateGame((gameId)).encodeABI()
            var tx = {
                to : contractDeploymentDetails.contractAddress,
                data : encoded,
                gas: 200000,
                value: parseInt(bettingAmount),
                nonce: nonce
            }
        
            web3.eth.accounts.signTransaction(tx, privateKey,function(err, response){
                if(err){
                    socket.emit('createNewGame',{staus:400, message:"Error Signing Transaction"});
                }else{
                    web3.eth.sendSignedTransaction(response.rawTransaction,function(err,result){
                        console.log(err,result)
                        if(err){
                            socket.emit('createNewGame',{staus:400, message:"Failed at Contract/ Check Balance/ Contract Rules Incompatible/ Change GameId - GameId may be already allocated"});       
                        }else{
                            socket.emit('createNewGame',{status:200,result: result})
                        }
                        
                    })
                }
            })
        })
    })

    socket.on('sendGame',function(data){
        MyContract.methods.GetGame(data).call({}, function(err, result1){
            // console.log(err,result1);
            if(err){
                socket.emit('sendGame',{status:400, message:"Failed fetchind data from contract"})
            }else{
                MyContract.methods.GetGamePlayers(data).call({}, function(err, result2){
                    if(err){
                        socket.emit('sendGame',{status:400, message:"Failed fetchind data from contract"})
                    }else{
                        MyContract.methods.GetGameBet(data).call({}, function(err, result3){
                            if(err){
                                socket.emit('sendGame',{status:400, message:"Failed fetchind data from contract"})
                            }else{
                                socket.emit('sendGame',{status:200,board:result1,players:result2,bettingAmount:result3})
                            }
                        })
                    }
                })
            }
            
        })
    })
    socket.on('getExistingGame',function(data){
        MyContract.methods.GetGame(data).call({}, function(err, result1){
            // console.log(err,result1);
            if(err){
                socket.emit('getExistingGame',{status:400, message:"Failed fetchind data from contract"})
            }else{
                MyContract.methods.GetGamePlayers(data).call({}, function(err, result2){
                    if(err){
                        socket.emit('getExistingGame',{status:400, message:"Failed fetchind data from contract"})
                    }else{
                        MyContract.methods.GetGameBet(data).call({}, function(err, result3){
                            if(err){
                                socket.emit('getExistingGame',{status:400, message:"Failed fetchind data from contract"})
                            }else{
                                socket.emit('getExistingGame',{status:200,board:result1,players:result2,bettingAmount:result3})
                            }
                        })
                    }
                })
            }
            
        })
    })

    socket.on('joinExistingGame',function(data){
        let bettingAmount = data.bettingAmount;
        let gameId = data.gameId;

        web3.eth.getTransactionCount(address, function(err,nonce){

            var encoded = MyContract.methods.JoinGame(gameId).encodeABI()
            var tx = {
                to : contractDeploymentDetails.contractAddress,
                data : encoded,
                gas: 200000,
                value: bettingAmount,
                nonce: nonce
            }
        
            web3.eth.accounts.signTransaction(tx, privateKey,function(err, response){
                if(err){
                    socket.emit('joinExistingGame',{staus:400, message:"Error Signing Transaction"});
                }else{
                    web3.eth.sendSignedTransaction(response.rawTransaction,function(err,result){
                        // console.log(err,result)
                        if(err){
                            socket.emit('joinExistingGame',{staus:400, message:"Failed at Contract/ Check Balance/ Betting Balance too less/ This game has already finished "});       
                        }else{
                            socket.emit('joinExistingGame',{status:200,result: result})
                        }
                        
                    })
                }
            })
        })
    })

    socket.on('markTile',function(data){
        let row = data.row;
        let column = data.column;
        let gameId = data.gameId;

        web3.eth.getTransactionCount(address, function(err,nonce){

            var encoded = MyContract.methods.MarkTile(gameId, row, column).encodeABI()
            var tx = {
                to : contractDeploymentDetails.contractAddress,
                data : encoded,
                gas: 200000,
                nonce: nonce
            }
        
            web3.eth.accounts.signTransaction(tx, privateKey,function(err, response){
                if(err){
                    socket.emit('MarkTile',{staus:400, message:"Error Signing Transaction"});
                }else{
                    web3.eth.sendSignedTransaction(response.rawTransaction,function(err,result){
                        // console.log(err,result)
                        if(err){
                            socket.emit('MarkTile',{staus:400, message:"Failed at Contract/ Check Balance/ Not Your Turn/ Match is already finished "});       
                        }else{
                            socket.emit('MarkTile',{status:200,result: result})
                        }
                        
                    })
                }
            })
        })
    })
 });

