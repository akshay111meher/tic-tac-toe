pragma solidity ^0.4.22;

contract GameBox {
    address public owner;
    constructor() public{
        owner = msg.sender;
    }

    struct Game{
        address player1;
        address player2;
        address playerTurn;
        uint256 bettingAmount;
        uint256 lastBlockUsed;
        address[] tic_tac;
    }

    mapping(uint256 => Game) public gameList;

    function CreateGame(uint256 gameId) public payable returns (bool) {
        require(gameList[gameId].player1 == address(0) && msg.value > 1000000);
        Game memory game;
        address[] memory tic_tac = new address[](9);
        game = Game(msg.sender,address(0),msg.sender, msg.value, block.number, tic_tac);
        gameList[gameId] = game;
        return true;
    }
    
    function JoinGame(uint256 gameId) public payable returns (bool){
        require(gameList[gameId].player1 != address(0) && gameList[gameId].player2 == address(0) && msg.value >= gameList[gameId].bettingAmount);
        gameList[gameId].player2 = msg.sender;
        return true;
    }
    
    function GetGame(uint256 gameId) public view returns (address[]){
        return gameList[gameId].tic_tac;
    }
    function GetGamePlayers(uint256 gameId) public view returns (address,address,address){
        Game memory game = gameList[gameId];
        return (game.player1, game.player2, game.playerTurn);
    }
    function GetGameBet(uint256 gameId) public view returns (uint256){
        Game memory game = gameList[gameId];
        return game.bettingAmount;
    }
    function MarkTile(uint256 gameId, uint256 row, uint256 column) public returns (address){
        require(gameList[gameId].player1  == msg.sender || gameList[gameId].player2 == msg.sender);
        require(gameList[gameId].playerTurn == msg.sender);
        require(row > 0 && row < 4 && column > 0 && column < 4);
        require(gameList[gameId].tic_tac[(row-1)*3 + (column-1)] == address(0));
        gameList[gameId].tic_tac[(row-1)*3 + (column-1)] = msg.sender;
        address winner = checkWinCondition(gameId);
        
        if(winner == address(0)){
            if(gameList[gameId].playerTurn == gameList[gameId].player1){
                gameList[gameId].playerTurn = gameList[gameId].player2;
            }else{
                gameList[gameId].playerTurn = gameList[gameId].player1;
            }
            return winner;
        }else{
            winner.transfer(2*gameList[gameId].bettingAmount);
            gameList[gameId].playerTurn = address(0);
            return winner;
        }
    }
    
    function checkWinCondition(uint256 gameId) view internal returns (address){
        Game memory game;
        game = gameList[gameId];

        if(game.tic_tac[0] == game.tic_tac[1] && game.tic_tac[0] == game.tic_tac[2] && game.tic_tac[0] != address(0)){
            return game.tic_tac[0];
        }else if(game.tic_tac[3] == game.tic_tac[4] && game.tic_tac[3] == game.tic_tac[5] && game.tic_tac[3] != address(0)){
            return game.tic_tac[3];
        }else if(game.tic_tac[6] == game.tic_tac[7] && game.tic_tac[6] == game.tic_tac[8] && game.tic_tac[6] != address(0)){
            return game.tic_tac[6];
        }else if(game.tic_tac[0] == game.tic_tac[4] && game.tic_tac[0] == game.tic_tac[8] && game.tic_tac[0] != address(0)){
            return game.tic_tac[0];        
        }else if(game.tic_tac[2] == game.tic_tac[4] && game.tic_tac[2] == game.tic_tac[6] && game.tic_tac[2] != address(0)){
            return game.tic_tac[2];
        }else if(game.tic_tac[0] == game.tic_tac[3] && game.tic_tac[0] == game.tic_tac[6] && game.tic_tac[0] != address(0)){
            return game.tic_tac[0];
        }else if(game.tic_tac[1] == game.tic_tac[4] && game.tic_tac[1] == game.tic_tac[7] && game.tic_tac[1] != address(0)){
            return game.tic_tac[1];
        }else if(game.tic_tac[2] == game.tic_tac[5] && game.tic_tac[2] == game.tic_tac[8] && game.tic_tac[2] != address(0)){
            return game.tic_tac[2];
        }else{
            return address(0);
        }
    
    }
    
    modifier onlyOwner {
        if (msg.sender == owner) 
            _;
    }
}