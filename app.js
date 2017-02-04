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
    
    //MMR-------------------------------
    
    socket.on('mmr_search', function(){
        console.log("demarrage d'une recherche");
        //RECHERCHER SALON
        
        //TROUVE
        console.log("partie trouvee");
        socket.emit('found');
        
        socket.on('cancel_search',function(data){
            if(data.sal_state){
                //SUPPRESION DU SALON
                console.log("cancel recherche adversaire");
            }
            else{
                //ARRET DE LA RECHERCHE
                console.log("cancel recherche salon");                
            }
        });
        
        //PAS TROUVE
        //OUVRIR UN SALON PUBLIC
        //console.log("partie pas trouvee, ouverture de salon public");
        //socket.emit('not_found');
    });
    
    //SALON PRIVE-------------------------------
    
    socket.on('private_init', function(){
        //CALCULER UNE CLE
        console.log("ouverture d'un salon prive");
        var key = 0123;
        socket.emit('key_code',{kc:key});
        
        socket.on('cancel_private',function(){
            //SUPPRESSION DU SALON PRIVE
            console.log("cancel private");
        })
        
        //RIVAL TROUVE
        //socket.emit('found_rival');
    });
    
    //RECHERCHE SALON PRIVE-------------------------------
    
    socket.on("private_search", function(data){
        //attribut en question : data.sal_key
        console.log("recherche de salon pour la clé "+data.sal_key);
        var temporary = 0123;
        if(data.sal_key == temporary){
            //CHANGER LE TEST POUR UN PARCOURS DES CLES
            //ICI C'EST QUAND ON A TROUVE LA CLE QUI CORRESPOND
            //TESTER SI IL Y A DE LA PLACE DANS LE SALON
            console.log("cle valide, preparation de partie");
            socket.emit("key_response",{found:true});
        }
        else{
            //PAS VALIDE
            console.log("clee invalide");
            socket.emit("key_response",{found:false});
        }
    })
    
    //READY-------------------------------
    
    socket.on("ready",function(){
        //PREVENIR L'ADVERSAIRE
        //SI LES DEUX SON PRET
        console.log("quelqu'un est pret");
        var both_ready = true;
        if(both_ready){
            console.log("on demarre la partie");
            socket.emit("go_party");
            //PREVENIR L'AUTRE : DEMMARER LA PARTIE
        }
        else{
            console.log("l'autre joueur n'est pas pret")
            //l'autre est pas prêt, attendre sa réponse
        }
    });
    
    socket.on("cancel_ready",function(){
        //PREVENIR L'AUTRE QUE C'EST FOUTU
        //evenement "other_cancel" à envoyer à l'autre joueur
        console.log("annulation de partie au menu pret");
    });
    
    //INGAME-------------------------------
    
    socket.on("quit_game",function(){
        //PREVENIR L'AUTRE QUE SON ADVERSAIRE A QUITTE LA PARTIE
        console.log("partie quitee");
    })
    
    //DISCONNECT-------------------------------
    socket.on('disconnect', function(){
        console.log("Disconnect");
    });
});

//port = process.env.PORT
port = 8080
server.listen(port);
console.log("Multiplayer app listening on port "+port);
