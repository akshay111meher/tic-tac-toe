console.log("Start Tic-Tac-Toe");

var socket = io.connect('http://'+window.location.host);

socket.on('connect',function(data){
    $("#serverAlert").text("Connected to Server")
    $("#serverAlert").removeClass('alert-danger');
    $("#serverAlert").addClass('alert-success');
})
socket.on('handshake', function (data) {
    console.log(data);
    $("#serverAlert").text("Connected to Server")
    $("#serverAlert").removeClass('alert-danger');
    $("#serverAlert").addClass('alert-success');
});

socket.on("disconnect",function(){
    $("#serverAlert").text("Server Disconnected, Cannot play the game.")
    $("#serverAlert").removeClass('alert-success');
    $("#serverAlert").addClass('alert-danger');
    socket.connect();
})

socket.on('MarkTile',function(data){
    if(data.status != 200){
        $("#serverAlert").text(data.message)
        $("#serverAlert").removeClass('alert-success');
        $("#serverAlert").addClass('alert-danger');
    }else{
        socket.emit('sendGame',$.gameId);
    }
})

socket.on('createNewGame',function(data){
    //API or socket connection to create a new game
    //This console to check the transaction hashes on creation of new game
    // console.log(data)
    if(data.status != 200){
        $("#serverAlert").text(data.message)
        $("#serverAlert").removeClass('alert-success');
        $("#serverAlert").addClass('alert-danger');
        
    }else{
        socket.emit('sendGame', $.gameId)
    }
})

socket.on('getExistingGame',function(data){
    // console.log(data)
    if(data.players[0] == "0x0000000000000000000000000000000000000000"){
        $("#publicKey").append("<h5> No such game exists or Game is already finished <span class='badge badge-danger'>No game/ Game Over</span></h5>");
    }else if(data.players[0] == $.address || data.players[1] == $.address){
        socket.emit('sendGame',$.gameId);
    }else{
        while($.bettingAmount < data.bettingAmount){
            let newBettingAmount = prompt("The Minimum Bet amount for game "+$.gameId+" is "+data.bettingAmount+". Please enter new betting amount")
            if(newBettingAmount != null && (newBettingAmount == parseInt(newBettingAmount))){
                $.bettingAmount = parseInt(newBettingAmount);
            }else{
                $.bettingAmount = 0;
            }
        }
        socket.emit('joinExistingGame',{gameId:$.gameId, bettingAmount:$.bettingAmount})
    }
})

socket.on('joinExistingGame',function(data){
    //This console to check the transaction hashes on creation of join game
    // console.log(data)
    if(data.status != 200){
        $("#serverAlert").text(data.message)
        $("#serverAlert").removeClass('alert-success');
        $("#serverAlert").addClass('alert-danger');
        
    }else{
        socket.emit('sendGame', $.gameId)
    }
})
socket.on('sendGame',function(data){
    if(data.status == 200){
        $("#playersList").css("display","");
        $("#gameBoard").css("display","");
        $("#refresh").css("display","");
        console.log(data)
        // $("#player1").empty();
        $("#player1").text("Player 1: "+data.players[0].substring(0,12)+"...")

        // $("#player2").empty();
        $("#player2").text("Player 2: "+data.players[1].substring(0,12)+"...")

        if(data.players[0] == data.players[2]){
            $("#turnOf").removeClass("bg-dark");
            $("#turnOf").removeClass("bg-info");
            $("#turnOf").addClass("bg-warning");
        }else if(data.players[1] == data.players[2]){
            $("#turnOf").removeClass("bg-dark");
            $("#turnOf").removeClass("bg-warning");
            $("#turnOf").addClass("bg-info");
        }else{
            $("#turnOf").removeClass("bg-info");
            $("#turnOf").removeClass("bg-warning");
            $("#turnOf").addClass("bg-dark");
        }
        editBoard(data);
        
        // $("#turnOfText").empty();
        $("#turnOfText").text("Player Turn: "+data.players[2]);
        $("#bet").empty();
        $("#bet").text("Bet: "+data.bettingAmount);
        updateBalance($.address)
    }else{
        $("#serverAlert").removeClass('alert-success');
        $("#serverAlert").addClass('alert-danger');
        $("#serverAlert").empty();
        $("#serverAlert").text(data.message);
    }
})

$(function() {
    var PrivateKey = prompt("Load private key of your account, to play the game")
    $.post("/keys/loadPrivateKey",{PrivateKey})
    .done(function(data){
        $("#publicKey").append("<h5 id='address'>"+data.address+"<span id='balance' class='badge badge-secondary'>Balance</span></h5>");
        $.address = data.address
        $.post("/keys/balance",{Address:data.address})
            .done(function(data){
                $("#balance").text(Math.round(parseInt(data)/100000000000000)/10000)
                $("#placeBetHolder").append("<button onclick='placeBet()' id='placeBet' type='button' class='btn btn-success btn-block'>Start Game</button>")
            }).fail(function(){
                $("#balance").text("Invalid Account")
            })
    }).fail(function(data,err){
        $("#publicKey").append("<h5> Wrong Private Key/ or the container is already in use <span class='badge badge-danger'>Wrong Address/ In Use</span></h5>");
        $("#placeBetHolder").append("<button onclick='removeKey()' id='removeKey' type='button' class='btn btn-danger btn-block'>Remove Key</button>")
    })
    
});

function removeKey(){
    var privateKey = prompt("Enter the private key")
    $.post("/keys/remove",{PrivateKey: privateKey})
        .done(function(data){
            $("#publicKey").empty();
            $("#publicKey").append("<h5> Private Key removed successfully <span class='badge badge-success'>Success</span></h5>");
            $("#placeBetHolder").remove();
        }).fail(function(){
            $("#publicKey").empty();
            $("#publicKey").append("<h5> Private Key is not same the one in use currently <span class='badge badge-danger'>Wrong Key</span></h5>");
        })
}
function placeBet(e){
    var gameId
    var bettingAmount
    if(confirm("Do you want to join a game")){
        gameId = prompt("Enter game ID")
        if(gameId != null){
            bettingAmount = prompt("Enter betting amount. (If already joined, the amount wont be used, simply enter a non-zero value to over-ride this check)")
            $.gameId = gameId;
            $.bettingAmount = bettingAmount;
            joinExistingGame(gameId, bettingAmount)
        }
        else{
            alert("Game Id cannot be empty")
        }
        
    }else{
        gameId = prompt("Enter a new game ID")
        if(gameId != null){
            bettingAmount = prompt("Enter betting amount")
            $.gameId = gameId;
            $.bettingAmount = bettingAmount;
            createNewGame(gameId, bettingAmount)
        }
        else{
            alert("Game Id cannot be empty")
        }
    }
}

function joinExistingGame(gameId, bettingAmount){
    if(bettingAmount == 0 || bettingAmount == null){
        alert("Betting amount cannot be 0")
    }else{
        $("#placeBet").prop('disabled',true)
        $("#placeBetRow").remove()

        //API or socket connection to join the game
        socket.emit('getExistingGame', gameId)
    }
}

function createNewGame(gameId,bettingAmount){
    if(bettingAmount == 0 || bettingAmount == null){
        alert("Betting amount cannot be 0")
    }else{
        $("#placeBet").prop('disabled',true)
        $("#placeBetRow").remove()

        socket.emit('createNewGame',{gameId, bettingAmount})

    }
}

function clicked(elementPsuedoName){
    console.log(elementPsuedoName)
    if(elementPsuedoName == ".row11"){
        socket.emit('markTile',{row:1, column:1,gameId:$.gameId});
    }else if(elementPsuedoName == ".row12"){
        socket.emit('markTile',{row:1, column:2,gameId:$.gameId});
    }else if(elementPsuedoName == ".row13"){
        socket.emit('markTile',{row:1, column:3,gameId:$.gameId})
    }else if(elementPsuedoName == ".row21"){
        socket.emit('markTile',{row:2, column:1,gameId:$.gameId})
    }else if(elementPsuedoName == ".row22"){
        socket.emit('markTile',{row:2, column:2,gameId:$.gameId})
    }else if(elementPsuedoName == ".row23"){
        socket.emit('markTile',{row:2, column:3,gameId:$.gameId})
    }else if(elementPsuedoName == ".row31"){
        socket.emit('markTile',{row:3, column:1,gameId:$.gameId})
    }else if(elementPsuedoName == ".row32"){
        socket.emit('markTile',{row:3, column:2,gameId:$.gameId})
    }else if(elementPsuedoName == ".row33"){
        socket.emit('markTile',{row:3, column:3,gameId:$.gameId})
    }
}

function refresh(){
    console.log("refresh board")
    socket.connect();
    socket.emit('sendGame', $.gameId);
    socket.emit('handshake',"From client")
}

function editBoard(data){
    editColumn(data, 0, ".row11");
    editColumn(data, 1, ".row12");
    editColumn(data, 2, ".row13");
    editColumn(data, 3, ".row21");
    editColumn(data, 4, ".row22");
    editColumn(data, 5, ".row23");
    editColumn(data, 6, ".row31");
    editColumn(data, 7, ".row32");
    editColumn(data, 8, ".row33");
}

function editColumn(data, boardTile, className){
    if(data.players[0] == "0x0000000000000000000000000000000000000000"){
        $("#player1").removeClass("bg-warning")
        $("#player2").removeClass("bg-info")
        $("#player1").addClass("bg-dark")
        $("#player2").addClass("bg-dark")
        var uniquePlayers = data.board.filter(onlyUnique);

        if(data.board[boardTile] == uniquePlayers[0] && uniquePlayers[0] == $.address){
            $(className).removeClass("bg-info")
            $(className).removeClass("bg-dark")
            $(className).addClass("bg-warning")
        }else if(data.board[boardTile] == uniquePlayers[1] && uniquePlayers[1] == $.address){
            $(className).removeClass("bg-warning")
            $(className).removeClass("bg-dark")
            $(className).addClass("bg-info")
        }else{
            $(className).removeClass("bg-info")
            $(className).removeClass("bg-warning")
            $(className).addClass("bg-dark")
        }

    }else{
        if(data.board[boardTile] == data.players[0]){
            $(className).removeClass("bg-info")
            $(className).removeClass("bg-dark")
            $(className).addClass("bg-warning")
        }else if(data.board[boardTile] == data.players[1]){
            $(className).removeClass("bg-warning")
            $(className).removeClass("bg-dark")
            $(className).addClass("bg-info")
        }else{
            $(className).removeClass("bg-info")
            $(className).removeClass("bg-warning")
            $(className).addClass("bg-dark")
        }
    }
    
}

function onlyUnique(value, index, self) { 
    return (self.indexOf(value) === index && value != "0x0000000000000000000000000000000000000000");
}

function updateBalance(address){
    $.post("/keys/balance",{Address:address})
            .done(function(data){
                $("#balance").text(Math.round(parseInt(data)/100000000000000)/10000)
            }).fail(function(){
                $("#balance").text("Invalid Account")
            })
}