

//Initialize the game with Quintus
var Q = Quintus({audioSupported: [ 'wav','mp3' ]})
      .include('Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio')
      .setup({ maximize: true })
      .enableSound();

//Setup controls : both azerty + qwerty + arrows
Q.input.keyboardControls({
                           90: "up",
                           87: "up",
                           81: "left",
                           65: "left",
                           83: "down",
                           68: "right",
                           UP: "up",
                           LEFT: "left",
                           RIGHT: "right",
                           DOWN: "down",
                           32: "fire"
                         });
//Enable mouse controls
Q.input.mouseControls({cursor:true});

//No gravity, topdown game
Q.gravityY = 0;

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