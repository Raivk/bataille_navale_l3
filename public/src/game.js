//We need socket.io to enable connection with server
require(['socket.io/socket.io.js']);


var socket = io.connect('localhost:8080');


function ready(){
    socket.emit('ready',{exemple:"myname"});
}

socket.on('connected', function (data) {
    console.log("Connected");
});

socket.on('ready_other', function(data){
    console.log("Someone is ready " + data.exemple); 
});