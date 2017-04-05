toastr.options = {
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

var listeBoatJoueur = new Map();
var listeBoatBot = new Map();
var r;
var a_joue = false;
var bateau_taille = [["porte-avion", 5], ["croiseur", 4], ["contre-torpilleur", 3], ["sous-marin", 3], ["torpilleur", 2]];

var taille_bateaux = new Map(bateau_taille);

//palette : http://www.palettable.io/99C2E1-FCF9F0-FEF88E-FFAB60-FFA07A

var couleurFin = "black";
var couleurCaseVide = "#99C2E1";
var couleurCaseBateau = "#FCF9F0";
var couleurRate = "#FEF88E";
var couleurTouche = "#FFAB60";
var couleurCoule = "#D45938";

listeBoatBot.set("porte-avion", 0);
listeBoatBot.set("croiseur", 0);
listeBoatBot.set("contre-torpilleur", 0);
listeBoatBot.set("sous-marin", 0);
listeBoatBot.set("torpilleur", 0);

listeBoatJoueur.set("porte-avion", 0);
listeBoatJoueur.set("croiseur", 0);
listeBoatJoueur.set("contre-torpilleur", 0);
listeBoatJoueur.set("sous-marin", 0);
listeBoatJoueur.set("torpilleur", 0);

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
    placeboat_IA();
}

var taille = 10;
var isdrag = false; //si un element est selectionner pour drag.
var valide = false; //si le bateau peut etre placé a la case.
var ajouer; //si le jouer a jouer.
var elem;
var div;
var gamefinie = false;

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

function gridj(gridDiv, pos, i, j){
    var el = document.createElement('div');
    el.setAttribute('data-x', i);
    el.setAttribute('data-y', j);
    el.setAttribute('class', 'grid-cell player');

    el.setAttribute('vide', true);
    el.setAttribute('id', i + "" + j);
    el.setAttribute('toucher','false');

    el.self = this;
    el.addEventListener('click', eventclic, false);
    el.addEventListener('mouseover', placementMouseover, false);
    el.addEventListener('mouseout', placementMouseout, false);
    gridDiv[pos].appendChild(el);
}

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
function rotateimg() {
	var img = document.querySelectorAll('.boat');
	for (var i = 0; i < img.length; i++) {
        img[i].addEventListener('click', selection, false);
	}
}

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
                                
function eventclic(j) {
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

function placementMouseover(j){
    if (isdrag == true) {
        div = j;
        coloriage(j.target, couleurCaseBateau);
    }
}

function placementMouseout(j){
    if (isdrag == true) {
        div = null;
        coloriage(j.target, couleurCaseVide)
    }
}

function point(j, x, y) {
   return (document.getElementById('' + (parseInt(Math.floor(j.getAttribute('data-x')) + parseInt(Math.floor(x)))) + '' + (parseInt(Math.floor(j.getAttribute('data-y')) + parseInt(Math.floor(y))))));
}

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

function estVerouiller(liste) {
    var res = false;
    for (var i = 0; i < liste.length; i++) {
        if (liste[i].getAttribute('vide') != 'true') {
            res = true;
        }
    }
    return res;
}


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
        supprimg();
        r=Math.floor(Math.random()*2);
        if(r == 0){
            debutaction();
        }
        else{
            debutattente();
        }
    }
}

function debutaction() {
    if (!gamefinie) { 
        document.getElementById("gamestate").innerHTML = "C'est à vous de jouer"; 
    }
    initlistener();
    
}

function debutattente() {
    if (!gamefinie) {
        document.getElementById("gamestate").innerHTML = "C'est au tour de l'adversaire";
    }
    removelistener();
    setTimeout(play_IA, 2000);
}





function fire(j, tour){
	if(tour != undefined){
		//jouerBot
        if(j.getAttribute('vide')=="false"){
            coloriage(j, couleurTouche);
            j.setAttribute('toucheB',true);
            listeBoatJoueur.set(j.getAttribute('boat'), listeBoatJoueur.get(j.getAttribute('boat'))+1);
            toastr.warning("L'ennemi a touché votre "+j.getAttribute("boat")+".");
            if(listeBoatJoueur.get(j.getAttribute("boat")) == taille_bateaux.get(j.getAttribute("boat"))) {
                let bateauxCoules = document.querySelector('.grid-j').querySelectorAll('[boat='+j.getAttribute("boat")+']');
                bateauxCoules.forEach(function(element){
                    coloriage(element, couleurCoule);
                    element.getAttribute("couler", true);
                    toastr.error("L'ennemi a coulé votre "+j.getAttribute("boat")+".");
                    var rect = element.getBoundingClientRect();
                    explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
                })
                $("body").effect("shake");
            } else {
                var rect = j.getBoundingClientRect();
                explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
            }
        }
        else{
            coloriage(j, couleurRate);
        }
        j.setAttribute('toucher',true);
        test_Game();
        debutaction();
	}
	else{
		//jouer joueur
		var pos = "" + j.target.getAttribute("data-x") +"b"+ j.target.getAttribute("data-y");
		var cell = document.getElementById(pos);
		if(cell.getAttribute('toucher') == undefined){
			if(cell.getAttribute('vide')=="false"){
				coloriage(cell, couleurTouche);
				cell.setAttribute('toucheB',true);
                listeBoatBot.set(cell.getAttribute('boat'), listeBoatBot.get(cell.getAttribute('boat'))+1);
                toastr.info("Vous avez touché un bateau !");
                if(listeBoatBot.get(cell.getAttribute("boat")) == taille_bateaux.get(cell.getAttribute("boat"))) {
                    let bateauxCoules = document.querySelector('.grid-b').querySelectorAll('[boat='+cell.getAttribute("boat")+']');
                    bateauxCoules.forEach(function(element){
                        coloriage(element, couleurCoule);
                        element.getAttribute("couler", true);
                        var rect = element.getBoundingClientRect();
                        explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
                    })
                    $("body").effect( "shake" );
                    toastr.success("Vous avez coulé le "+cell.getAttribute("boat")+ " ennemi.");
                } else {
                    var rect = cell.getBoundingClientRect();
                    explode(rect.left + (Math.abs(rect.left - rect.right) / 2), rect.top + (Math.abs(rect.top - rect.bottom) / 2));
                }
			}
			else{
				coloriage(cell, couleurRate);
                toastr.warning("C'est loupé !");
			}
			cell.setAttribute('toucher',true);
			cell.removeEventListener('click', fire, false);
		}
        test_Game();
        debutattente();
	}
    
}

function test_Game(){
    let testGameB = true;
    let testGameJ = true;
    
    listeBoatBot.forEach(function(cle, valeur, map){
        if(cle != taille_bateaux.get(valeur)){
            testGameJ = false;
        }
    });
    
    listeBoatJoueur.forEach(function(cle, valeur, map){
        
        if(cle != taille_bateaux.get(valeur)){
            testGameB = false;
        }
    });
    
    
    if(testGameB){
        fingame("bot");
    }
    else if(testGameJ){
        fingame("joueur");
    }
}

function initlistener() {
    if (!gamefinie) {
        var gridDiv = document.querySelectorAll('.bot');
        for (var grid = 0; grid < gridDiv.length; grid++) {
            //gridDiv[grid].setAttribute('vide', true);
            gridDiv[grid].addEventListener('click', fire, false);
        }
	}
}

function removelistener() {
    var gridDiv = document.querySelectorAll('.bot');
    for (var grid = 0; grid < gridDiv.length; grid++) {
        gridDiv[grid].removeEventListener('click', fire, false);
    }
}

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

function fingame(player) {
    document.getElementById("gamestate").innerHTML = "Partie terminée !";
    if (!gamefinie) {
        gamefinie = true;
        if(player == "joueur"){
            toastr.success("Félicitations !","Victoire !");
        }
        else{
            toastr.error("Défaite...","Dommage !");
        }
        setTimeout(function() {  
            window.location.href = "index.html";
        }, 5000);
        removelistener();
    }
}

function reset() {
    var gridDiv = document.querySelectorAll('.grid-cell');
    for (var grid = 0; grid < gridDiv.length; grid++) {
        gridDiv[grid].remove();
    }
    document.getElementsByClassName("boats")[0].classList.remove("hide_by_default");
    var img = document.getElementsByClassName("boat");
    for (var el = 0; el < img.length; el++) {
        img[el].classList.remove("hide_by_default");
    }
}


function play_IA(){
    let liste_cellules = document.querySelector('.grid-j').querySelectorAll('[toucher=false]');
    var r1=Math.floor(Math.random() * (liste_cellules.length - 1));
    var cell=liste_cellules[r1];
    fire(cell,"bot");
}

function placeboat_IA() {
    var img = document.getElementsByClassName("boat");
    for (var el = 0; el < img.length; el++) {
        let liste_posOK = [];
        let taille_boat = parseInt(img[el].getAttribute('taille'));
        while (liste_posOK.length != taille_boat) {
            let r1 = Math.floor(Math.random() * taille);
            let r2 = Math.floor(Math.random() * taille);
            let r3 = Math.floor(Math.random() * 2);
            if (document.getElementById(r1 + 'b' + r2).getAttribute('vide') == "true") {
                liste_posOK.push(r1+'b'+r2);
                if (r3 == 0) {
                    for (x = 1; x < taille_boat; x++) {
                        if (document.getElementById((r1+x) + 'b' + r2) != undefined){
                            if (document.getElementById((r1 + x) + 'b' + r2).getAttribute('vide') == "true") {
                                liste_posOK.push((r1 + x) + 'b' + r2);
                            }
                            else{
                                liste_posOK = [];
                                break;
                            }
                        }
                        else{
                            liste_posOK = [];
                            break;
                        }
                    }
                }
                else{
                    for(x = 1; x<taille_boat; x++){
                        if (document.getElementById(r1 + 'b' + (r2 + x)) != undefined){
                            if(document.getElementById(r1 + 'b' + (r2 + x)).getAttribute('vide') == "true"){
                                liste_posOK.push(r1+'b'+(r2+x));
                            }
                            else{
                                liste_posOK = [];
                                break;
                            }
                        }
                        else{
                            liste_posOK = [];
                            break;
                        }
                    }
                }
            }

            if(liste_posOK.length == taille_boat){
                liste_posOK.forEach(function(element){
                    let cell = document.getElementById(element);
                    cell.setAttribute('vide', "false");
                    cell.setAttribute('boat', img[el].getAttribute('id'));
                });
            }
        }
    }
}


start_game();
