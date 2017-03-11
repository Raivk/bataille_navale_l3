//Setup base variables for the server to work
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var KeyGenerator = require('uuid-key-generator');

var keygen = new KeyGenerator();

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
        if(rooms.length == 0){
            console.log("no rooms 1");
            rooms.push({
                'socket1' : socket,
                'private' : false
            });
            socket.emit('not_found');
        }
        else{
            
            console.log("no rooms 2");
            salonFound = rooms.find(function(element){
                return element.socket2 == undefined && element.private == false;
            });
            
            if(salonFound == undefined){
                rooms.push({
                    'socket1' : socket,
                    'private' : false
                });
                socket.emit('not_found');
                console.log("partie solo cree");
            }
            else{
                salonFound.socket2 = socket;
                console.log("partie rejointe");
                socket.emit('found');
                salonFound.socket1.emit('found');
                salonFound.ready2 = false;
            }
        }
        
        socket.on('cancel_search',function(data){
            if(data.sal_state){
                //SUPPRESION DU SALON
                console.log("cancel recherche adversaire");
                rooms.splice(rooms.findIndex(function(element){
                    return element.socket1 == socket;
                }), 1);
            }
            else{
                //ARRET DE LA RECHERCHE
                console.log("cancel recherche salon");                
            }
        });
    });
    
    //SALON PRIVE-------------------------------
    
    socket.on('private_init', function(){
        //CALCULER UNE CLE
        console.log("ouverture d'un salon prive");
        var key = keygen.generateKey();
        rooms.push({
            'socket1' : socket,
            'key' : key,
            'private' : true
        })
        socket.emit('key_code',{'kc':key});
        console.log(key);
        socket.on('cancel_private',function(){
            //SUPPRESSION DU SALON PRIVE
            console.log("cancel private");
            rooms.splice(rooms.findIndex(function(element){
                return element.key == key;
            }), 1);
        })
        
        //RIVAL TROUVE
        //socket.emit('found_rival');
    });
    
    //RECHERCHE SALON PRIVE-------------------------------
    
    socket.on("private_search", function(data){
        //attribut en question : data.sal_key
        console.log("recherche de salon pour la clé "+data.sal_key);
        salonPrivate = rooms.find(function(element){
            return element.key == data.sal_key;
        })
        if(salonPrivate != undefined){
            //CHANGER LE TEST POUR UN PARCOURS DES CLES
            //ICI C'EST QUAND ON A TROUVE LA CLE QUI CORRESPOND
            //TESTER SI IL Y A DE LA PLACE DANS LE SALON
            console.log("cle valide, preparation de partie");
            salonPrivate.socket2 = socket;
            socket.emit("key_response",{found:true});
            salonPrivate.socket1.emit('found_rival');
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
        //SI LES DEUX SONT PRET
        console.log("quelqu'un est pret");
        
        salonFound = rooms.find(function(element){
            return element.socket1 == socket;
        })
        
        
        if(salonFound == undefined){
            salonFound = rooms.find(function(element){
                return element.socket2 == socket;
            })
            if(salonFound != undefined){
                salonFound.ready2 = true;
                salonFound.socket1.emit("other_ready");
            }
        }
        else{
            salonFound.ready1 = true;
                salonFound.socket2.emit("other_ready");
        }
        
        
        if(salonFound.ready1 && salonFound.ready2){
            console.log("on demarre la partie");
            salonFound.socket1.emit("go_party");
            salonFound.socket2.emit("go_party");
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
        
        salonFound = rooms.find(function(element){
            return element.socket1 == socket;
        })
        
        
        if(salonFound == undefined){
            salonFound = rooms.find(function(element){
                return element.socket2 == socket;
            })
            if(salonFound != undefined){
                salonFound.ready2 = false;
                salonFound.socket1.emit('other_cancel');
            }
            
        }
        else{
            salonFound.ready1 = false;
            salonFound.socket2.emit('other_cancel');
        }
        
        
        
    });
    
    //INGAME-------------------------------
    
    socket.on("quit_game",function(){
        //PREVENIR L'AUTRE QUE SON ADVERSAIRE A QUITTE LA PARTIE
        
        salonFound = rooms.find(function(element){
            return element.socket1 == socket;
        })
        
        if(salonFound != undefined){
            if(salonFound.socket2 == undefined){
                rooms.splice(rooms.findIndex(function(element){
                    return element.socket1 == socket;
                }), 1);
                console.log("partie terminee")
            }
            else{
                salonFound.socket1 = undefined;
                salonFound.socket2.emit('player_left');
                console.log("partie quittee");
            }
        }
        else{
            salonFound = rooms.find(function(element){
                return element.socket2 == socket;
            })
            if(salonFound != undefined){
                if(salonFound.socket1 == undefined){
                    rooms.splice(rooms.findIndex(function(element){
                        return element.socket2 == socket;
                    }), 1);
                    console.log("partie terminee");
                }
                else{
                    salonFound.socket2 = undefined;
                    salonFound.socket1.emit('player_left');
                    console.log('partie quittee')
                }
            }
            else{
                console.log("player not found");
            }
        }
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
