
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
        var r=Math.floor(Math.random()*2);
        if(r==0){
            debutaction();
        }
        else{
            debutattente();
        }
    }
}

function debutaction() {
    ajouer = false;
    console.log("c'est mon tour");
    initlistener();
}

function debutattente() {
    removelistener();
    console.log("ce n'est pas mon tour");
    debutaction();
}

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

function isVide(j) {
    var part1 = document.getElementById(j).getAttribute("vide");
    var res = [part1];
    if (part1 == "false") {
        part1 = 1;
        document.getElementById(j).setAttribute('toucher', true);
        coloriage(document.getElementById(j), 'red');
        res = [part1];
        if (iscouler(document.getElementById(j))) {
            part1 = 2;
            var part2 = getboat(document.getElementById(j));
            if (isFin()) {
                part1 = 3;
                var gridDiv = document.querySelectorAll('.player');
                for (var grid = 0; grid < gridDiv.length; grid++) {
                    coloriage(gridDiv[grid], "black");
                }
                var gridDiv = document.querySelectorAll('.bot');
                for (var grid = 0; grid < gridDiv.length; grid++) {
                    coloriage(gridDiv[grid], "black");
                }
                fingame();
            }
            res = [part1, part2];
        }
    } else {
        part1 = 0;
        res = [part1];
        coloriage(document.getElementById(j), 'blue');
    }
    return res;
}

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
            coloriage(gridDiv[grid], "black");
            gridDiv[grid].setAttribute("couler", "true");
            tailletouch++;
        }
    }
        return true;
    }
    return false;
}

function fire(j){
    var pos = "" + j.target.getAttribute("data-x") + j.target.getAttribute("data-y");
        if (data[0] == 1) {
            coloriage(j.target, 'purple');
        } else  if (data[0] == 2) {
            coloriage(j.target, 'purple');
            for (var i = 0; i < data[1].length; i++) {
                coloriage(document.getElementById(data[1][i]), "black");
                document.getElementById(data[1][i]).setAttribute("couler","true");
            }
        } else if (data[0] == 3) {
            coloriage(j.target, 'purple');
            for (var i = 0; i < data[1].length; i++) {
                coloriage(document.getElementById(data[1][i]), "black");
                document.getElementById(data[1][i]).setAttribute("couler","true");
            }
            var gridDiv = document.querySelectorAll('.player');
            for (var grid = 0; grid < gridDiv.length; grid++) {
                coloriage(gridDiv[grid], "black");
            }
            var gridDiv = document.querySelectorAll('.bot');
            for (var grid = 0; grid < gridDiv.length; grid++) {
                coloriage(gridDiv[grid], "black");
            }
            fingame();
        } else {
            coloriage(j.target, 'yellow');
        }
        debutattente();
}

function initlistener() {
    if (!gamefinie) {
        var gridDiv = document.querySelectorAll('.bot');
        for (var grid = 0; grid < gridDiv.length; grid++) {
            gridDiv[grid].setAttribute('vide', true);
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

function fingame() {
    gamefinie = true;
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
    var r1=Math.floor(Math.random()*taille);
    var r2=Math.floor(Math.random()*taille);
    var cell=document.getElementById(r1+""+r2);
    fire(cell);
       
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
                    cell.setAttribute('vide', false);
                    coloriage(cell, "black");
                });
            }
        }
    }
}


start_game();