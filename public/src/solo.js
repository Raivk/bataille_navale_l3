//INGAME-------------------------------------


//START

start_game();

//START

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
}

function quitter_partie(){
    document.getElementById("show_bt").classList.add("hide_by_default");
    switch_page("ingame","home");
    reset();
}

var taille = 10;
var isdrag = false; //si un element est selectionner pour drag.
var valide = false; //rien pour le moment.
var elem;
var div;

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
    el.setAttribute('id', i + "" + j);

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
                                
function eventclic(j){
    if (isdrag) {
        verouiller(j);
        elem.target.classList.add("hide_by_default"); 
        elem = null;
        isdrag = false;
    }
    if (document.querySelectorAll('.boat').length == 0) {
        iddrag = false;
    }
}

function placementMouseover(j){
    if (isdrag == true) {
        div = j;
        coloriage(j, 'black');
    }
}

function placementMouseout(j){
    if (isdrag == true) {
        div = null;
        coloriage(j, '#99C2E1')
    }
}

function point(j, x, y) {
   return (document.getElementById('' + (parseInt(Math.floor(j.target.getAttribute('data-x')) + parseInt(Math.floor(x)))) + '' + (parseInt(Math.floor(j.target.getAttribute('data-y')) + parseInt(Math.floor(y))))));
}

function listecase(j) {
    var tailleboat = elem.target.getAttribute('taille');
    var liste = [];
    lui = j.target;
    if (elem.target.getAttribute('pos') == 'h' 
    && ((-1 <= lui.getAttribute('data-y')-tailleboat/2)
    && (lui.getAttribute('data-y') < taille) 
    && (-1 < (parseInt(lui.getAttribute('data-y'))+tailleboat/2))
    && (parseInt(lui.getAttribute('data-y'))+tailleboat/2) < taille)) {
        for (var i = 0; i < tailleboat; i++) {
            liste[i] = point(j, 0, tailleboat/2 - i);
        }
    } else if (elem.target.getAttribute('pos') == 'v'
              && ((-1 <= lui.getAttribute('data-x')-tailleboat/2)
    && (lui.getAttribute('data-x') < taille) 
    && (-1 < (parseInt(lui.getAttribute('data-x'))+tailleboat/2))
    && (parseInt(lui.getAttribute('data-x'))+tailleboat/2) < taille)) {
        for (var i = 0; i < tailleboat; i++) {
            liste[i] = point(j, tailleboat/2 - i, 0);
        }
    }
    return liste;
}

function coloriage(j, couleur) {
    if (elem == null) {
        j.target.style.backgroundColor = couleur;
    } else {
        var liste = listecase(j);
        if (estVerouiller(liste) == false) {
            for (var i = 0; i < liste.length; i++) {
                liste[i].style.backgroundColor = couleur;
            }
        }
    }
}

function estVerouiller(liste){
    var res = false;
    for (var i = 0; i < liste.length; i++) {
        if (liste[i].getAttribute('vide') != 'true'){
            res = true;
        }
    }
    return res;
}

function verouiller(j) {
    var liste = listecase(j);
    for (var i = 0; i < liste.length; i++) {
        coloriage(j, 'green');
        liste[i].setAttribute('vide', false);
        liste[i].setAttribute('boat', elem.target.getAttribute('id'));
    }
}

document.onkeydown = function (e) {
    e=e || window.event;
    var code=e.keyCode || e.wihch;
    if (code == 82 && isdrag == true && div != null) {
        coloriage(div, '#99C2E1');
        if (elem.target.getAttribute('pos') == "h"){
            elem.target.setAttribute('pos', 'v');
        } else {
            elem.target.setAttribute('pos', 'h');
        }
        coloriage(div, 'black');
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
        alert("tous les bateau ne sont pas placés");
    } else {
        supprimg();
        initlistener();
    }
}

function fire(j){
    if (j.target.getAttribute('boat') != null) {
        coloriage(j, 'purple');
    } else {
        coloriage(j, 'yellow');
    }
}

function initlistener() {
    var gridDiv = document.querySelectorAll('.bot');
	for (var grid = 0; grid < gridDiv.length; grid++) {
        gridDiv[grid].setAttribute('vide', true);
        gridDiv[grid].addEventListener('click', fire, false);
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
        gridDiv[grid].setAttribute('vide', true);
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

start_game();