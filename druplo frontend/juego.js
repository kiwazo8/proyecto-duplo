const palos = ["espada", "basto", "oro", "copa"];
const numeros = [1,2,3,4,5,6,7,10,11,12];
const fuerza = {"1espada":14,"1basto":13,"7espada":12,"7oro":11,"3":10,"2":9,"1":8,"12":7,"11":6,"10":5,"7":4,"6":3,"5":2,"4":1};

let mazo = [];
let manoJugador = [];
let manoBot = [];
let puntosJugador = 0;
let puntosBot = 0;
let turnoJugador = true;
let cartaJugadaJugador = false;
let rondaTerminada = false;
let bazaJugador = 0;
let bazaBot = 0;
let bazaEmpatada = 0;
let cartasJugadas = 0;
let trucoNivel = 0;
let envidoCantado = false;
let jugadorMano = true;

function valorEnvido(carta){ return carta.numero<=7? carta.numero:0; }

function calcularEnvido(mano){
  const [c1,c2,c3] = mano;
  let sumas = [];
  if(c1.palo===c2.palo) sumas.push(valorEnvido(c1)+valorEnvido(c2)+20);
  if(c1.palo===c3.palo) sumas.push(valorEnvido(c1)+valorEnvido(c3)+20);
  if(c2.palo===c3.palo) sumas.push(valorEnvido(c2)+valorEnvido(c3)+20);
  if(sumas.length===0) return Math.max(valorEnvido(c1),valorEnvido(c2),valorEnvido(c3));
  return Math.max(...sumas);
}

function crearMazo(){
  mazo=[];
  for(let p of palos) for(let n of numeros) mazo.push({numero:n,palo:p,fuerza:fuerza[`${n}${p}`]||fuerza[n]});
}

function sacarCarta(){ const i=Math.floor(Math.random()*mazo.length); return mazo.splice(i,1)[0]; }

function repartir(){
  crearMazo();
  manoJugador = [sacarCarta(),sacarCarta(),sacarCarta()];
  manoBot = [sacarCarta(),sacarCarta(),sacarCarta()];
  turnoJugador = jugadorMano;
  cartaJugadaJugador = false;
  rondaTerminada = false;
  bazaJugador = 0; bazaBot = 0; bazaEmpatada = 0; cartasJugadas = 0;
  trucoNivel = 0;
  envidoCantado = false;
  document.getElementById("btnTruco").disabled=false;
  document.getElementById("btnRetruco").disabled=true;
  document.getElementById("btnVale4").disabled=true;
  document.getElementById("btnEnvido").disabled=false;
  document.getElementById("btnRealEnvido").disabled=false;
  document.getElementById("btnFaltaEnvido").disabled=false;
  renderCartas();
  log("Nueva mano repartida.");
}

function renderCartas(){
  const tusDiv = document.getElementById("tusCartas");
  tusDiv.innerHTML="";
  manoJugador.forEach((c,i)=>{
    const div = document.createElement("div");
    div.className="carta";
    div.textContent=`${c.numero} de ${c.palo}`;
    div.onclick = ()=> jugarCarta(i);
    tusDiv.appendChild(div);
  });

  const botDiv = document.getElementById("cartasBot");
  botDiv.innerHTML="";
  manoBot.forEach(()=>{ 
    const div = document.createElement("div");
    div.className="carta bot"; 
    div.textContent="?"; 
    botDiv.appendChild(div);
  });
}

function jugarCarta(i){
  if(!turnoJugador || rondaTerminada) return;
  const carta = manoJugador.splice(i,1)[0];
  cartaJugadaJugador = true;
  document.getElementById("btnEnvido").disabled=true;
  document.getElementById("btnRealEnvido").disabled=true;
  document.getElementById("btnFaltaEnvido").disabled=true;
  log(`Jugaste ${carta.numero} de ${carta.palo}`);
  turnoJugador=false;
  renderCartas();
  setTimeout(()=> turnoBot(carta),700);
}

function turnoBot(cartaJugador){
  let cartaBot = manoBot.find(c => c.fuerza > cartaJugador.fuerza) || manoBot[0];
  manoBot = manoBot.filter(c => c !== cartaBot);
  log(`Bot jugó ${cartaBot.numero} de ${cartaBot.palo}`);
  cartasJugadas++;

  let ganadorBaza = null;
  if(cartaJugador.fuerza > cartaBot.fuerza){ bazaJugador++; ganadorBaza='jugador'; }
  else if(cartaBot.fuerza > cartaJugador.fuerza){ bazaBot++; ganadorBaza='bot'; }
  else{ bazaEmpatada++; ganadorBaza='empate'; }

  renderCartas();

  if(cartasJugadas===2){
    if(bazaJugador===2 || bazaBot===2){ acabarMano(); return; }
    else if(bazaEmpatada===1){ log("Empate primera baza, la segunda define la mano."); }
  } else if(cartasJugadas===3){ acabarMano(); return; }

  if(cartasJugadas===1 && ganadorBaza==='bot' && manoJugador.length>0){
    turnoJugador=false;
    const cartaSiguiente = manoBot.splice(0,1)[0];
    log(`Bot juega siguiente carta por ganar la primera baza: ${cartaSiguiente.numero} de ${cartaSiguiente.palo}`);
    cartasJugadas++;
    if(cartasJugadas===2){
      let ganador = cartaSiguiente.fuerza > manoJugador[0].fuerza ? 'bot' : 'jugador';
      if(ganador==='bot') bazaBot++; else if(ganador==='jugador') bazaJugador++; else bazaEmpatada++;
    }
  }

  if(ganadorBaza==='jugador') turnoJugador=true;
  else if(ganadorBaza==='bot') turnoJugador=false;
  else turnoJugador=jugadorMano;
}

function acabarMano(){
  let puntosTruco = [1,2,3][trucoNivel] || 1;
  if(bazaJugador > bazaBot){ puntosJugador+=puntosTruco; log(`Ganaste la mano (+${puntosTruco})`); jugadorMano=true; }
  else if(bazaBot > bazaJugador){ puntosBot+=puntosTruco; log(`Bot gana la mano (+${puntosTruco})`); jugadorMano=false; }
  else log("Mano empatada");
  actualizarPuntos();
  rondaTerminada=true;
  setTimeout(repartir,1500);
}

function cantarTruco(){
  if(trucoNivel>0 || rondaTerminada) return log("Truco ya cantado");
  trucoNivel=0;
  log("Cantas Truco");
  document.getElementById("btnRetruco").disabled=false;
}

function cantarRetruco(){
  if(trucoNivel!==0 || rondaTerminada) return log("No puedes cantar Retruco aún");
  trucoNivel=1;
  log("Cantas Retruco");
  document.getElementById("btnVale4").disabled=false;
}

function cantarVale4(){
  if(trucoNivel!==1 || rondaTerminada) return log("No puedes cantar Vale 4 aún");
  trucoNivel=2;
  log("Cantas Vale 4");
}

function cantarEnvido(){
  if(envidoCantado || cartaJugadaJugador) return;
  envidoCantado=true;
  document.getElementById("btnEnvido").disabled=true;
  document.getElementById("btnRealEnvido").disabled=true;
  document.getElementById("btnFaltaEnvido").disabled=true;
  const eJ=calcularEnvido(manoJugador);
  const eB=calcularEnvido(manoBot);
  if(Math.random()<0.6){ log(`Bot quiere Envido. Vos: ${eJ} - Bot: ${eB}`);
    if(eJ>eB){ puntosJugador+=2; log("Ganaste el Envido (+2)"); }
    else{ puntosBot+=2; log("Bot ganó el Envido (+2)"); }
  } else { log("Bot no quiere. Sumás 1 punto."); puntosJugador+=1; }
  actualizarPuntos();
}

function cantarRealEnvido(){
  if(envidoCantado || cartaJugadaJugador) return;
  envidoCantado=true;
  document.getElementById("btnEnvido").disabled=true;
  document.getElementById("btnRealEnvido").disabled=true;
  document.getElementById("btnFaltaEnvido").disabled=true;
  const eJ=calcularEnvido(manoJugador);
  const eB=calcularEnvido(manoBot);
  if(Math.random()<0.6){ log(`Bot quiere Real Envido. Vos: ${eJ} - Bot: ${eB}`);
    if(eJ>eB){ puntosJugador+=3; log("Ganaste Real Envido (+3)"); }
    else{ puntosBot+=3; log("Bot ganó Real Envido (+3)"); }
  } else { log("Bot no quiere. Sumás 1 punto."); puntosJugador+=1; }
  actualizarPuntos();
}

function cantarFaltaEnvido(){
  if(envidoCantado || cartaJugadaJugador) return;
  envidoCantado=true;
  document.getElementById("btnEnvido").disabled=true;
  document.getElementById("btnRealEnvido").disabled=true;
  document.getElementById("btnFaltaEnvido").disabled=true;
  const eJ=calcularEnvido(manoJugador);
  const eB=calcularEnvido(manoBot);
  const falta = 30 - Math.max(puntosJugador, puntosBot);
  if(Math.random()<0.5){ log(`Bot quiere Falta Envido. Vos: ${eJ} - Bot: ${eB}`);
    if(eJ>eB){ puntosJugador+=falta; log(`Ganaste Falta Envido (+${falta})`);}
    else{ puntosBot+=falta; log(`Bot ganó Falta Envido (+${falta})`);}
  } else { log("Bot no quiere. Sumás 1 punto."); puntosJugador+=1; }
  actualizarPuntos();
}

function actualizarPuntos(){
  document.getElementById("puntosJugador").textContent=puntosJugador;
  document.getElementById("puntosBot").textContent=puntosBot;
}

function log(txt){
  const div=document.getElementById("log");
  div.innerHTML+=`<div>${txt}</div>`;
  div.scrollTop=div.scrollHeight;
}

document.addEventListener("DOMContentLoaded", repartir);