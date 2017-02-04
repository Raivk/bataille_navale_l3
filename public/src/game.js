//We need socket.io to enable connection with server
require(['socket.io/socket.io.js']);


var socket = io.connect('localhost:8080');

var salon = false;

//OUTILS-------------------------------------

function switch_page(tohide, togo){
    document.getElementById(tohide).style.display = "none";
    document.getElementById(togo).style.display = "block";
}

//MMR-------------------------------------

function annuler_recherche(){
    socket.emit('cancel_search',{sal_state:salon});
    salon = false;
    switch_page("mmr_search","home");
}

function demarrer_mmr(){
    switch_page("home","mmr_search");
    switch_page("attente","rech");
    
    socket.emit("mmr_search");
    
    socket.on('not_found', function(){
        //OUVERTURE D'UN SALON
        salon = true;
        switch_page("rech","attente");
    });
    
    socket.on('found', function(){
        switch_page("mmr_search", "ready");
        menu_pret();
        //FAIRE QUELQUE CHOSE ?
        //PARTIE TROUVEE
    });
}

//SALON PRIVE-------------------------------------

function annuler_salon_prive(){
    //PREVENIR LE SERVEUR DE LA FERMETURE DU SALON PRIVE
    socket.emit("cancel_private");
    switch_page("private_room_waiting","home");
}

function demarrer_salon(){
    socket.emit('private_init');
    socket.on('key_code', function(data){
        document.getElementById("key").innerHTML = data.kc;
        switch_page("home","private_room_waiting");
        //ATTENTE DE JOUEUR
        socket.on('found_rival', function(){
            switch_page("private_room_waiting","ready");
            menu_pret();
        });
    });
}


//RECHERCHE SALON PRIVE-------------------------------------

function rejoindre_prive(){
    //RECUPERER LES DONNEES DU CHAMPS DE CLE
    socket.emit("private_search", {sal_key : 0123});
    socket.on("key_response", function(data){
        if(data.found){
            //PARTIE TROUVEE, FAIRE QUELQUE CHOSE
            switch_page("home","ready");
            menu_pret();
        }
        else{
            console.log("clée invalide");
        }
    });
}

//READY-------------------------------------

function menu_pret(){
    socket.on("other_ready",function(){
        console.log("l'autre est prêt");
    });
    socket.on("other_cancel",function(){
        console.log("l'autre annule la partie au menu pret");
        switch_page("ready","home");
    })
}

function annuler_pret(){
    socket.emit("cancel_ready");
    switch_page("ready","home");
}

function declarer_pret(){
    console.log("PRET !");
    //AFFICHER QUELQUE CHOSE A L'ECRAN DU JOUEUR
    socket.emit("ready");
    //ATTENDRE LA REPONSE DU SERVEUR, si l'autre est pret, go en jeu
    socket.on("go_party",function(){
       switch_page("ready","ingame"); 
    });
}

//INGAME-------------------------------------

function quitter_partie(){
    socket.emit("quit_game");
    switch_page("ingame","home");
}