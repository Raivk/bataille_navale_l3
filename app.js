//Setup base variables for the server to work
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var rooms = [];

//We'll use the public folder, so we tell the server to place public in front of each path (avoid repetitions)
app.use(express.static(__dirname + '/public'));

//We use a simple one page app, so tell the server to render the index
app.get('/', function(req, res){
  res.render('/index.html');
});

//Code executed on each new connection
io.on('connection', function (socket) {
    console.log("Connection");
    
    //Event received after player clicked ready
    socket.on('ready', function(data){
        console.log("ready " + data.exemple );
        socket.broadcast.emit("ready_other", data);
    });
    
    //Someone disconnected
    socket.on('disconnect', function(){
        console.log("Disconnect");
    });
});

//port = process.env.PORT
port = 8080
server.listen(port);
console.log("Multiplayer app listening on port "+port);
