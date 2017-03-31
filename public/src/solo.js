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

var listeBoatJoueur = new Map();
var listeBoatBot = new Map();
var r;
var a_joue = false;
var bateau_taille = [["porte-avion", 5], ["croiseur", 4], ["contre-torpilleur", 3], ["sous-marin", 3], ["torpilleur", 2]];

var taille_bateaux = new Map(bateau_taille);

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
    } else {
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
        coloriage(j.target, 'black');
    }
}

function placementMouseout(j){
    if (isdrag == true) {
        div = null;
        coloriage(j.target, '#99C2E1')
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
            coloriage(j, 'green');
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
        coloriage(div.target, '#99C2E1');
        if (elem.target.getAttribute('pos') == "h"){
            elem.target.setAttribute('pos', 'v');
        } else {
            elem.target.setAttribute('pos', 'h');
        }
        coloriage(div.target, 'black');
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
    console.log("c'est mon tour");
    initlistener();
    
}

function debutattente() {
    removelistener();
    play_IA();
}





function fire(j, tour){
	if(tour != undefined){
        console.log("bot joue");
		//jouerBot
        if(j.getAttribute('vide')=="false"){
            coloriage(j, 'purple');
            j.setAttribute('toucheB',true);
            listeBoatJoueur.set(j.getAttribute('boat'), listeBoatJoueur.get(j.getAttribute('boat'))+1);
            if(listeBoatJoueur.get(j.getAttribute("boat")) == taille_bateaux.get(j.getAttribute("boat"))) {
                let bateauxCoules = document.querySelector('.grid-j').querySelectorAll('[boat='+j.getAttribute("boat")+']');
                bateauxCoules.forEach(function(element){
                    coloriage(element, "black");
                    element.getAttribute("couler", true);
                })
            }
        }
        else{
            coloriage(j, 'yellow');
        }
        j.setAttribute('toucher',true);
        test_Game();
        debutaction();
	}
	else{
		//jouer joueur
        console.log("joueur joue");
		var pos = "" + j.target.getAttribute("data-x") +"b"+ j.target.getAttribute("data-y");
		var cell = document.getElementById(pos);
		if(cell.getAttribute('toucher') == undefined){
			if(cell.getAttribute('vide')=="false"){
				coloriage(cell, 'purple');
				cell.setAttribute('toucheB',true);
                listeBoatBot.set(cell.getAttribute('boat'), listeBoatBot.get(cell.getAttribute('boat'))+1);
                if(listeBoatBot.get(cell.getAttribute("boat")) == taille_bateaux.get(cell.getAttribute("boat"))) {
                    let bateauxCoules = document.querySelector('.grid-b').querySelectorAll('[boat='+cell.getAttribute("boat")+']');
                    bateauxCoules.forEach(function(element){
                        coloriage(element, "black");
                        element.getAttribute("couler", true);
                    })
                }
			}
			else{
                console.log("ca va dans l'eau");
				coloriage(cell, 'yellow');
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
    gamefinie = true;
    if(player == "joueur"){
        alert("GG WP");
        window.location.href = "index.html";
    }
    else{
        alert("Vous êtes mauvais ! Vous avez perdu !");
        //window.location.href = "index.html";
    }
    removelistener();
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
    console.log("FEUUUUU !");
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
                    coloriage(cell, "black");
                });
            }
        }
    }
}


start_game();
