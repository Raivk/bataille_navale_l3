//We need socket.io to enable connection with server
require(['socket.io/socket.io.js']);


var socket = io.connect('localhost:8080');

var salon = false;

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-top-full-width",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};


inGameToastOptions = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-full-width",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};

//palette : http://www.palettable.io/99C2E1-FCF9F0-FEF88E-FFAB60-FFA07A

var couleurFin = "black";
var couleurCaseVide = "#99C2E1";
var couleurCaseBateau = "#FCF9F0";
var couleurRate = "#FEF88E";
var couleurTouche = "#FFAB60";
var couleurCoule = "#D45938";

//TOATSR : how to use :------------------------
/*
//INFO TOAST
toastr.info("title","message");

// Display a warning toast, with no title
toastr.warning('My name is Inigo Montoya. You killed my father, prepare to die!');

// Display a success toast, with a title
toastr.success('Have fun storming the castle!', 'Miracle Max Says');

// Display an error toast, with a title
toastr.error('I do not think that word means what you think it means.', 'Inconceivable!');

// Immediately remove current toasts without using animation
toastr.remove();

// Remove current toasts using animation
toastr.clear();
*/
//END TOASTR TUTO------------------------------

//OUTILS-------------------------------------

function switch_page(tohide, togo){
    document.getElementById(tohide).style.display = "none";
    document.getElementById(togo).style.display = "block";
    toastr.clear();
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
        socket.removeListener("not_found");
    });
    
    socket.on('found', function(){
        switch_page("mmr_search", "ready");
        menu_pret();
        socket.removeListener("not_found");
        socket.removeListener("found");
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
        document.getElementById("key").innerHTML = data["kc"];
        console.log(data.kc);
        switch_page("home","private_room_waiting");
        //ATTENTE DE JOUEUR
        socket.on('found_rival', function(){
            switch_page("private_room_waiting","ready");
            menu_pret();
            socket.removeListener("found_rival");
        });
        socket.removeListener('key_code');
    });
}


//RECHERCHE SALON PRIVE-------------------------------------

function rejoindre_prive(){
    //RECUPERER LES DONNEES DU CHAMPS DE CLE
    socket.emit("private_search", {'sal_key' : document.getElementById("room_key_input").value});
    socket.on("key_response", function(data){
        if(data.found){
            //PARTIE TROUVEE, FAIRE QUELQUE CHOSE
            switch_page("home","ready");
            menu_pret();
        }
        else{
            document.getElementById("room_key_input").value = "";
            toastr.error("Clé invalide !","Impossible de rejoindre une partie avec cette clé");
        }
        socket.removeListener("key_response");
    });
}

//READY-------------------------------------

function menu_pret(){
    socket.removeListener("player_left");
    socket.on("player_left", function(){
        console.log("other player left the game");
        
        switch_page("ready","home");
        document.getElementById("ready_bt").disabled = false;
        document.getElementById("other_ready_text").innerHTML = "Adversaire pas encore prêt...";
        socket.removeListener("other_cancel");
        socket.removeListener("other_ready");
        socket.removeListener("player_left");
    });
    socket.on("other_ready",function(){
        document.getElementById("other_ready_text").innerHTML = "Adversaire prêt !";
        socket.removeListener("other_ready");
    });
    socket.on("other_cancel",function(){
        document.getElementById("ready_bt").disabled = false;
        document.getElementById("other_ready_text").innerHTML = "Adversaire pas encore prêt...";
        switch_page("ready","home");
        socket.removeListener("other_cancel");
        toastr.info("L'adversaire a quitté la partie...");
    });
}

function annuler_pret(){
    document.getElementById("ready_bt").disabled = false;
    document.getElementById("other_ready_text").innerHTML = "Adversaire pas encore prêt...";
    socket.emit("cancel_ready");
    socket.removeListener("other_ready");
    socket.removeListener("other_cancel");
    socket.removeListener("go_party");
    switch_page("ready","home");
}

function declarer_pret(){
    document.getElementById("ready_bt").disabled = true;
    //AFFICHER QUELQUE CHOSE A L'ECRAN DU JOUEUR
    socket.emit("ready");
    //ATTENDRE LA REPONSE DU SERVEUR, si l'autre est pret, go en jeu
    socket.on("go_party",function(){
        document.getElementById("ready_bt").disabled = false;
        document.getElementById("other_ready_text").innerHTML = "Adversaire pas encore prêt...";
        switch_page("ready","ingame");
        start_game();
        socket.removeListener("go_party");
    });
}

//INGAME-------------------------------------

function explode(x, y) {
  var particles = 30,
    // explosion container and its reference to be able to delete it on animation end
    explosion = $('<div class="explosion"></div>');

  // put the explosion container into the body to be able to get it's size
  $('body').append(explosion);

  // position the container to be centered on click
  explosion.css('left', x - explosion.width() / 2);
  explosion.css('top', y - explosion.height() / 2);

  for (var i = 0; i < particles; i++) {
    // positioning x,y of the particle on the circle (little randomized radius)
    var x = (explosion.width() / 2) + rand(80, 150) * Math.cos(2 * Math.PI * i / rand(particles - 10, particles + 10)),
      y = (explosion.height() / 2) + rand(80, 150) * Math.sin(2 * Math.PI * i / rand(particles - 10, particles + 10)),
      color = 252 + ', ' + 101 + ', ' + 26, // randomize the color rgb
        // particle element creation (could be anything other than div)
      elm = $('<div class="particle" style="' +
        'background-color: rgb(' + color + ') ;' +
        'top: ' + y + 'px; ' +
        'left: ' + x + 'px"></div>');

    if (i == 0) { // no need to add the listener on all generated elements
      // css3 animation end detection
      elm.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
        explosion.remove(); // remove this explosion container when animation ended
      });
    }
    explosion.append(elm);
  }
}

// get random number between min and max value
function rand(min, max) {
  return Math.floor(Math.random() * (max + 1)) + min;
}

function hide_boat_placement(){
    document.getElementsByClassName("boats")[0].classList.add("hide_by_default");
    document.getElementById("show_bt").classList.remove("hide_by_default");
}

function show_boat_placement(){
    document.getElementsByClassName("boats")[0].classList.remove("hide_by_default");
    document.getElementById("show_bt").classList.add("hide_by_default");
}

function start_game(){
    createGrid();
    socket.on("player_left", function(){
        quitter_partie();
        socket.removeListener("player_left");
        toastr.info("L'adversaire a quitté la partie...");
    });
    socket.on("boat_placed", function(){
        toastr.info("L'adversaire a placé ses bateaux !");
        socket.removeListener("boat_placed");
    });
}

function quitter_partie(){
    switch_page("ingame","home");
    socket.emit("quit_game");
    reset();
}

var taille = 10;
var isdrag = false; //si un element est selectionner pour drag.
var valide = false; //si le bateau peut etre placé a la case.
var ajouer; //si le jouer a jouer.
var elem;
var div;
var gamefinie = false;

//c'eation de la grille de div
function createGrid() {
	var gridDivj = document.querySelectorAll('.grid-j');
	var gridDivb = document.querySelectorAll('.grid-b');
	for (var grid = 0; grid < gridDivj.length; grid++) {
		for (var i = 0; i < taille; i++) {
			for (var j = 0; j < taille ; j++) {
                gridj(gridDivj, grid, i, j);
                gridb(gridDivb, grid, i, j);
			}
		}
	}
    rotateimg();
}

//creation et ajout des attributs pour la grille cote joueur
function gridj(gridDiv, pos, i, j){
    var el = document.createElement('div');
    el.setAttribute('data-x', i);
    el.setAttribute('data-y', j);
    el.setAttribute('class', 'grid-cell player');

    el.setAttribute('vide', true);
    el.setAttribute('id', i + "" + j);

    el.self = this;
    el.addEventListener('click', eventclic, false);
    el.addEventListener('mouseover', placementMouseover, false);
    el.addEventListener('mouseout', placementMouseout, false);
    gridDiv[pos].appendChild(el);
}

//creation et ajout des attributs pour la grille cote "bot"/adversaire
function gridb(gridDiv, pos, i, j){
    var el = document.createElement('div');
    el.setAttribute('data-x', i);
    el.setAttribute('data-y', j);
    el.setAttribute('class', 'grid-cell bot');

    el.setAttribute('vide', true);
    el.setAttribute('id', i + "b" + j);

    el.self = this;
    gridDiv[pos].appendChild(el);
}

//ajout des listener sur les images de bateaux
function rotateimg() {
	var img = document.querySelectorAll('.boat');
	for (var i = 0; i < img.length; i++) {
        img[i].addEventListener('click', selection, false);
	}
}

// action effectuer lors du clic sur une image de bateau
function selection(j){
    if (isdrag && (elem.target.getAttribute('id') == j.target.getAttribute('id'))){
        isdrag = false;
        elem = null;
        j.target.classList.remove("boat_selected");
    } else {
        var img = document.querySelectorAll('.boat');
        for (var i = 0; i < img.length; i++) {
            img[i].classList.remove("boat_selected");
        }
        j.target.classList.add("boat_selected");
        isdrag = true;
        elem = j;
    }
}
 
// action effectuer lors du clic sur une div de la grille cote joueur
function eventclic(j){
    if (isdrag && valide) {
        if (verouiller(j.target)) {
            elem.target.classList.add("hide_by_default"); 
            elem = null;
            isdrag = false;
        }
    }
    if (document.querySelectorAll('.boat').length == 0) {
        iddrag = false;
    }
}


// action quand la souris passe sur une div de la grille joueur
function placementMouseover(j){
    if (isdrag == true) {
        div = j;
        coloriage(j.target, couleurCaseBateau);
    }
}

// action quand la souris sort du'une div de la grille
function placementMouseout(j){
    if (isdrag == true) {
        div = null;
        coloriage(j.target, couleurCaseVide);
    }
}

//calcul de la position d'une div 
function point(j, x, y) {
   return (document.getElementById('' + (parseInt(Math.floor(j.getAttribute('data-x')) + parseInt(Math.floor(x)))) + '' + (parseInt(Math.floor(j.getAttribute('data-y')) + parseInt(Math.floor(y))))));
}


//fait la liste des cases correspondant a une div
function listecase(j) {
    var tailleboat = elem.target.getAttribute('taille');
    var liste = [];
    valide = true;
    if (elem.target.getAttribute('pos') == 'h' 
    && ((-1 <= j.getAttribute('data-y')-tailleboat/2)
    && (j.getAttribute('data-y') < taille) 
    && (-1 < (parseInt(j.getAttribute('data-y'))+tailleboat/2))
    && (parseInt(j.getAttribute('data-y'))+tailleboat/2) < taille)) {
        for (var i = 0; i < tailleboat; i++) {
            liste[i] = point(j, 0, tailleboat/2 - i);
        }
    } else if (elem.target.getAttribute('pos') == 'v'
              && ((-1 <= j.getAttribute('data-x')-tailleboat/2)
    && (j.getAttribute('data-x') < taille) 
    && (-1 < (parseInt(j.getAttribute('data-x'))+tailleboat/2))
    && (parseInt(j.getAttribute('data-x'))+tailleboat/2) < taille)) {
        for (var i = 0; i < tailleboat; i++) {
            liste[i] = point(j, tailleboat/2 - i, 0);
        }
    }
    if (liste.length==0) {
        valide = false;
    }
    return liste;
}


//colore une div suivant une couleur passer dans les parametre
function coloriage(j, couleur) {
    if (elem == null) {
        j.style.backgroundColor = couleur;
    } else {
        var liste = listecase(j);
        if (estVerouiller(liste) == false) {
            for (var i = 0; i < liste.length; i++) {
                liste[i].style.backgroundColor = couleur;
            }
        }
    }
}

//si une liste comprend un element non vide alors elle est verouiller. la fonction renvoi alors true, false sinon
function estVerouiller(liste){
    var res = false;
    for (var i = 0; i < liste.length; i++) {
        if (liste[i].getAttribute('vide') != 'true'){
            res = true;
        }
    }
    return res;
}

//verrouille une case et confirme son verrouillage
function verouiller(j) {
    var res = true;
    var liste = listecase(j);
    if (estVerouiller(liste)) {
        res = false;
    } else {
        for (var i = 0; i < liste.length; i++) {
            coloriage(j, couleurCaseBateau);
            liste[i].setAttribute('vide', false);
            liste[i].setAttribute('boat', elem.target.getAttribute('id'));
        }
    }
    return res;
}


//permet la rotation d'un bateau lors de l'appui sur la touche "r"
document.onkeydown = function (e) {
    e=e || window.event;
    var code=e.keyCode || e.wihch;
    if (code == 82 && isdrag == true && div != null) {
        coloriage(div.target, couleurCaseVide);
        if (elem.target.getAttribute('pos') == "h"){
            elem.target.setAttribute('pos', 'v');
        } else {
            elem.target.setAttribute('pos', 'h');
        }
        coloriage(div.target, couleurCaseBateau);
    }
}

// verifi si tout les batteau sont placé pui lance le jeu
function jouer(){
    var bool = true;
    var img = document.getElementsByClassName("boat");
    for (var el = 0; el < img.length; el++) {
        if (!img[el].classList.contains("hide_by_default")) {
            bool = false;
        }
    }
    if(bool == false) {
        toastr.error("Vous n'avez pas placé tous vos bateaux...");
    } else {
        document.getElementById("gamestate").innerHTML = "Fin de phase de préparation";
        supprimg();
        socket.on("jouer", function() {
            debutaction();
        });
        socket.on("attendre", function() {
            debutattente();
        })
        socket.emit("boat_placed");
    }
}

//debut dun tour pour un joueur si la partie n'est pas finie et que c'est a lui de jouer
function debutaction() {
    if (!gamefinie) {
        document.getElementById("gamestate").innerHTML = "C'est à vous de jouer";
    }
    ajouer = false;
    initlistener();
}


//place le joueur en mode attente si la partie n'est pas finie
function debutattente() {
    removelistener();
    if (!gamefinie) {
        document.getElementById("gamestate").innerHTML = "C'est au tour de l'adversaire";
    }
    socket.on("player_attack", function(data) {
        socket.emit("result_attack", isVide(data));
        socket.removeListener("player_attack");
        debutaction();
    });
}


//retourne l'id des cellules d'un bateau
function getboat(j) {
    var listeb = [];
    var bateau = j.getAttribute("boat");
    var gridDiv = document.querySelectorAll('.player');
    for (var grid = 0; grid < gridDiv.length; grid++) {
        if (gridDiv[grid].getAttribute("boat") == bateau) {
            listeb.push(gridDiv[grid].getAttribute("data-x") + "b" + gridDiv[grid].getAttribute("data-y"))
        }
    }
    return listeb;
}

//appelée en fin de partie, animation de destruction du plateau du perdant, et départ sur l'écran de revanche / pret
function destroy(cells, ind, max) {
    coloriage(cells[ind], couleurFin);
    var rect = cells[ind].getBoundingClientRect();
    explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
    if((ind + 1) < max) {
        setTimeout(destroy, 75, cells, ind+1, max);
    } else {
        $("body").effect("shake");
        setTimeout(function() {
            reset();
            switch_page("ingame","ready");
            toastr.info("Une revanche ?");
            menu_pret();
        }, 5000);
    }
}

//fonction d'attente du joueur. attend les informations d'attaque de l'adversaire et agit en fonction
function isVide(j) {
    var part1 = document.getElementById(j).getAttribute("vide");
    var res = [part1];
    if (part1 == "false") {
        part1 = 1;
        document.getElementById(j).setAttribute('toucher', true);
        coloriage(document.getElementById(j), couleurTouche);
        res = [part1];
        if (iscouler(document.getElementById(j))) {
            part1 = 2;
            var part2 = getboat(document.getElementById(j));
            if (isFin()) {
                toastr.error("Vous avez perdu...", "Dommage !", inGameToastOptions);
                part1 = 3;
                var gridDiv = document.querySelectorAll('.bot');
                for (var grid = 0; grid < gridDiv.length; grid++) {
                    coloriage(gridDiv[grid], couleurFin);
                }
                fingame(".player");
            } else {
                toastr.error("Un de vos bateaux a coulé...", "Attaque ennemie !", inGameToastOptions);
            }
            res = [part1, part2];
        } else {
            var rect = document.getElementById(j).getBoundingClientRect();
            explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
            toastr.warning("Un de vos bateaux a été touché...", "Attaque ennemie !", inGameToastOptions);
        }
    } else {
        toastr.success("L'ennemi a raté son tir !", "Attaque ennemie !", inGameToastOptions);
        part1 = 0;
        res = [part1];
        coloriage(document.getElementById(j), couleurRate);
    }
    return res;
}

// dit si la partie est finie ou non
function isFin() {
    var gridDiv = document.querySelectorAll('.player');
    var taillecoul = 0;
    for (var grid = 0; grid < gridDiv.length; grid++) {
        if (gridDiv[grid].getAttribute("couler") == "true") {
            taillecoul++;
        }
    }
    if (taillecoul == 17) {
        return true;
    }
    return false;
}

//verifi si un bateau est couler et le colore si c'est le cas
function iscouler(j) {
    var gridDiv = document.querySelectorAll('.player');
    var bateau = j.getAttribute("boat");
    var tailletouch = 0;
	for (var grid = 0; grid < gridDiv.length; grid++) {
        if (gridDiv[grid].getAttribute("boat") == bateau && gridDiv[grid].getAttribute("toucher") == "true") {
            tailletouch++;
        }
    }
    if (tailletouch == document.getElementById(bateau).getAttribute("taille")) {
        for (var grid = 0; grid < gridDiv.length; grid++) {
            if (gridDiv[grid].getAttribute("boat") == bateau && gridDiv[grid].getAttribute("toucher") == "true") {
                coloriage(gridDiv[grid], couleurCoule);
                gridDiv[grid].setAttribute("couler", "true");
                tailletouch++;
                var rect = gridDiv[grid].getBoundingClientRect();
                explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
            }
        }
        $("body").effect("shake");
        return true;
    }
    return false;
}

// fonction d'action du joueur. envoi a l'adversaire un id de div et agit en fonction du retour de celui-ci
function fire(j){
    var pos = "" + j.target.getAttribute("data-x") + j.target.getAttribute("data-y");
    document.getElementById(j.target.getAttribute("data-x") + "b" + j.target.getAttribute("data-y")).setAttribute("toucher", true);
    socket.emit("player_attack", pos);
    socket.on("result_attack", function(data) {
        if (data[0] == 1) {
            toastr.success("Touché !", "Résultat de votre attaque", inGameToastOptions);
            coloriage(j.target, couleurTouche);
            var rect = j.target.getBoundingClientRect();
            explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
        } else  if (data[0] == 2) {
            toastr.success("Coulé !", "Résultat de votre attaque", inGameToastOptions);
            coloriage(j.target, couleurTouche);
            for (var i = 0; i < data[1].length; i++) {
                coloriage(document.getElementById(data[1][i]), couleurCoule);
                document.getElementById(data[1][i]).setAttribute("couler","true");
                var rect = document.getElementById(data[1][i]).getBoundingClientRect();
                explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
            }
            $("body").effect("shake");
        } else if (data[0] == 3) {
            toastr.success("Victoire !", "Félicitations !", inGameToastOptions);
            coloriage(j.target, couleurTouche);
            for (var i = 0; i < data[1].length; i++) {
                coloriage(document.getElementById(data[1][i]), couleurCoule);
                document.getElementById(data[1][i]).setAttribute("couler","true");
            }
            var gridDiv = document.querySelectorAll('.player');
            for (var grid = 0; grid < gridDiv.length; grid++) {
                coloriage(gridDiv[grid], couleurFin);
            }
            socket.emit("revenge");
            fingame(".bot");
        } else {
            toastr.info("Raté !", "Résultat de votre attaque", inGameToastOptions);
            coloriage(j.target, couleurRate);
        }
        socket.removeListener("result_attack");
        debutattente();
    });
}

// creer les listener sur les div de la grille "bot"/adversaire
function initlistener() {
    if (!gamefinie) {
        var gridDiv = document.querySelectorAll('.bot');
        for (var grid = 0; grid < gridDiv.length; grid++) {
            if ( gridDiv[grid].getAttribute('toucher') != "true" ) {
                gridDiv[grid].addEventListener('click', fire, false);
            }
        }
	}
}

//enleve les listener sur la grille "bot"/adversaire
function removelistener() {
    var gridDiv = document.querySelectorAll('.bot');
    for (var grid = 0; grid < gridDiv.length; grid++) {
        gridDiv[grid].removeEventListener('click', fire, false);
    }
}

//cache les images de bateaux et leur enleve les listener
function supprimg() {
    document.getElementById("show_bt").classList.add("hide_by_default");
    document.querySelector('.boats').classList.add("hide_by_default");
    elem = null;
    var gridDiv = document.querySelectorAll('.player');
	for (var grid = 0; grid < gridDiv.length; grid++) {
        gridDiv[grid].removeEventListener('click', eventclic, false);
        gridDiv[grid].removeEventListener('mouseover', placementMouseover, false);
        gridDiv[grid].removeEventListener('mouseout', placementMouseout, false);
	}
}

//fini la partie
function fingame(destroy_selector) {
    if (!gamefinie) {
        gamefinie = true;
        removelistener();
        document.getElementById("gamestate").innerHTML = "Partie terminée !";
        
        var gridDiv = document.querySelectorAll(destroy_selector);
        destroy(gridDiv, 0, gridDiv.length);
    }
}

// detruit toutes les cellules de la page et les recrée
function reset() {
    gamefinie = false;
    var gridDiv = document.querySelectorAll('.grid-cell');
    for (var grid = 0; grid < gridDiv.length; grid++) {
        gridDiv[grid].remove();
    }
    document.getElementsByClassName("boats")[0].classList.remove("hide_by_default");
    var img = document.getElementsByClassName("boat");
    for (var el = 0; el < img.length; el++) {
        img[el].classList.remove("hide_by_default");
        img[el].classList.remove("boat_selected");
    }
    document.getElementById("show_bt").classList.add("hide_by_default");
    document.getElementById("gamestate").innerHTML = "Phase de préparation";
    socket.removeListener("player_left");
    socket.removeListener("boat_placed");
    socket.removeListener("player_attack");
    socket.removeListener("result_attack");
}