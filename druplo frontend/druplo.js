var palo=["espada","basto","oro","copa"];
var numero=[1,2,3,4,5,6,7,10,11,12];
var fuerza={"1espada":14,"1basto":13,"7espada":12,"7oro":11,"3":10,"2":9,"1":8,"12":7,"11":6,"10":5,"7":4,"6":3,"5":2,"4":1};


function valorEnvido(carta) {
if (carta.numero >= 1 && carta.numero <= 7) {
    return carta.numero;}
else
    return 0;
}

var mazo=[];
for (var i=0;i<palos.length;i++){
    for (var j=0;j<numeros.length;j++){
        mazo[mazo.length]={numero:numeros[j],palo:palos[i]};
    }
}
function sacarCarta(){
var indice=Math.floor(Math.random()*mazo.length);
var carta=mazo[indice];
var nuevo=[];
for (var k=0;k<mazo.length;k++){
    if(k!==indice){
    nuevo[nuevo.length]=mazo[k];
    }
}
mazo=nuevo;
return carta;
}
var carta1=sacarCarta();
var carta2=sacarCarta();
var carta3=sacarCarta();
var mano=[carta1,carta2,carta3];
var texto="Tus cartas son:\n"+
carta1.numero+" de "+carta1.palo+"\n"+
carta2.numero+" de "+carta2.palo+"\n"+
carta3.numero+" de "+carta3.palo;
alert(texto);

function calcularEnvido(mano){
var carta1=mano[0];
var carta2=mano[1];
var carta3=mano[2];
var sumas=[];
if (carta1.palo===carta2.palo){
    sumas.push(valorEnvido(carta1)+valorEnvido(carta2)+20);}
if (carta1.palo===carta3.palo){
    sumas.push(valorEnvido(carta1)+valorEnvido(carta3)+20);}
if (carta2.palo===carta3.palo){
    sumas.push(valorEnvido(carta2)+valorEnvido(carta3)+20);}
if (sumas.length===0){
    return Math.max(valorEnvido(carta1),valorEnvido(carta2),valorEnvido(carta3));}
return Math.max.apply(null,sumas);
}
alert("envido: "+ calcularEnvido(mano))