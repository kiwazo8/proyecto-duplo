const palos = ["espada", "basto", "oro", "copa"];
const numeros = [1,2,3,4,5,6,7,10,11,12];
const fuerza = {"1espada":14,"1basto":13,"7espada":12,"7oro":11,"3":10,"2":9,"1":8,"12":7,"11":6,"10":5,"7":4,"6":3,"5":2,"4":1};

let mazo = [];
let manoJugador = [];
let manoBot = [];
let puntosJugador = 0;
let puntosBot = 0;

let turnoJugador = true; 
let empiezaJugador = true; // 👈 se alterna cada mano
let envidoCantado = false;
let trucoNivel = -1;
let cartaJugadaJugador = false;
let rondaTerminada = false;
let bazasGanadasJugador = 0;
let bazasGanadasBot = 0;

function valorEnvido(carta) {
  return carta.numero >= 1 && carta.numero <= 7 ? carta.numero : 0;
}
function calcularEnvido(mano) {
  let sumas = [];
  const [c1,c2,c3] = mano;
  if(c1.palo===c2.palo) sumas.push(valorEnvido(c1)+valorEnvido(c2)+20);
  if(c1.palo===c3.palo) sumas.push(valorEnvido(c1)+valorEnvido(c3)+20);
  if(c2.palo===c3.palo) sumas.push(valorEnvido(c2)+valorEnvido(c3)+20);
  if(sumas.length===0) return Math.max(valorEnvido(c1),valorEnvido(c2),valorEnvido(c3));
  return Math.max(...sumas);
}

function crearMazo() {
  mazo = [];
  for (let p of palos) {
    for (let n of numeros) {
      mazo.push({ numero: n, palo: p, fuerza: fuerza[`${n}${p}`] || fuerza[n] });
    }
  }
}
function sacarCarta() {
  const i = Math.floor(Math.random()*mazo.length);
  return mazo.splice(i,1)[0];
}

function repartir() {
  crearMazo();
  manoJugador = [sacarCarta(), sacarCarta(), sacarCarta()];
  manoBot = [sacarCarta(), sacarCarta(), sacarCarta()];
  envidoCantado = false;
  trucoNivel = -1;
  cartaJugadaJugador = false;
  rondaTerminada = false;
  bazasGanadasJugador = 0;
  bazasGanadasBot = 0;

  // 👇 alterna mano cada ronda
  empiezaJugador = !empiezaJugador;
  turnoJugador = empiezaJugador;

  document.getElementById("btnTruco").disabled = false;
  document.getElementById("btnEnvido").disabled = false;
  document.getElementById("btnRealEnvido").disabled = false;
  document.getElementById("btnFaltaEnvido").disabled = false;
  document.getElementById("btnMazo").disabled = false;

  renderCartas();
  log(`Nueva mano. ${(empiezaJugador ? "Vos" : "Bot")} sos mano.`);
  
  // 👇 Si el bot empieza, juega automáticamente
  if (!empiezaJugador) {
    setTimeout(() => turnoBotPrimero(), 1000);
  }
}

function renderCartas() {
  const tusDiv = document.getElementById("tusCartas");
  tusDiv.innerHTML = "";
  manoJugador.forEach((c,i)=>{
    const div=document.createElement("div");
    div.className="carta";
    div.textContent=`${c.numero} de ${c.palo}`;
    div.onclick = () => jugarCarta(i);
    tusDiv.appendChild(div);
  });

  const botDiv=document.getElementById("cartasBot");
  botDiv.innerHTML="";
  manoBot.forEach(()=> {
    const div=document.createElement("div");
    div.className="carta bot";
    div.textContent="?";
    botDiv.appendChild(div);
  });
}

function jugarCarta(i) {
  if(!turnoJugador || rondaTerminada) return;
  const carta = manoJugador.splice(i,1)[0];
  cartaJugadaJugador = true;
  document.getElementById("btnEnvido").disabled = true;
  document.getElementById("btnRealEnvido").disabled = true;
  document.getElementById("btnFaltaEnvido").disabled = true;

  log(`Jugaste ${carta.numero} de ${carta.palo}`);
  turnoJugador = false;
  setTimeout(()=> turnoBot(carta),700);
}

function turnoBot(cartaJugador) {
  manoBot.sort((a,b)=>a.fuerza - b.fuerza);
  let cartaBot = manoBot.find(c => c.fuerza > cartaJugador.fuerza);
  if (!cartaBot) cartaBot = manoBot[0];

  manoBot = manoBot.filter(c => c !== cartaBot);
  log(`Bot jugó ${cartaBot.numero} de ${cartaBot.palo}`);

  // 🏆 Determinar ganador de la baza
  let ganaJugador = cartaJugador.fuerza > cartaBot.fuerza;
  let ganaBot = cartaJugador.fuerza < cartaBot.fuerza;

  if (ganaJugador) {
    bazasGanadasJugador++;
    log("Ganaste la baza.");
  } else if (ganaBot) {
    bazasGanadasBot++;
    log("Bot ganó la baza.");
  } else {
    log("Baza empatada.");
  }

  if (bazasGanadasJugador === 2 || bazasGanadasBot === 2) {
    terminarTruco();
    return;
  }

  if (manoJugador.length === 0 || manoBot.length === 0) {
    terminarTruco();
  } else {
    // 👇 Quien gana la baza empieza
    if (ganaJugador) {
      turnoJugador = true;
      renderCartas();
    } else if (ganaBot) {
      turnoJugador = false;
      renderCartas();
      setTimeout(() => turnoBotPrimero(), 1000);
    } else {
      // En caso de empate: quien fue mano tira primero
      turnoJugador = empiezaJugador;
      renderCartas();
      if (!turnoJugador) setTimeout(() => turnoBotPrimero(), 1000);
    }
  }
}

function turnoBotPrimero() {
  if (rondaTerminada || manoBot.length === 0) return;
  const cartaBot = manoBot.shift();
  log(`Bot jugó ${cartaBot.numero} de ${cartaBot.palo}`);
  turnoJugador = true;
}

function terminarTruco() {
  rondaTerminada = true;
  let puntos = [1, 2, 3][trucoNivel + 1] || 1;
  if (bazasGanadasJugador > bazasGanadasBot) {
    puntosJugador += puntos;
    log(`Ganaste el truco (+${puntos})`);
  } else {
    puntosBot += puntos;
    log(`Bot ganó el truco (+${puntos})`);
  }
  actualizarPuntos();
  setTimeout(repartir, 2000);
}

function irseAlMazo() {
  if (rondaTerminada) return;
  rondaTerminada = true;
  let puntos = [1, 2, 3][trucoNivel + 1] || 1;
  puntosBot += puntos;
  log(`Te fuiste al mazo. Bot gana el truco (+${puntos})`);
  actualizarPuntos();
  document.getElementById("btnMazo").disabled = true;
  setTimeout(repartir, 2000);
}

// ---- TRUCO ----
function cantarTruco(){
  if(trucoNivel>=0 || rondaTerminada) return log("Truco ya cantado");
  trucoNivel=0;
  log("Cantaste Truco");
  document.getElementById("btnTruco").disabled=true;
  document.getElementById("btnEnvido").disabled=true;
  document.getElementById("btnRealEnvido").disabled=true;
  document.getElementById("btnFaltaEnvido").disabled=true;
  if(Math.random()<0.7) log("Bot quiere Truco"); 
  else { log("Bot no quiere. Sumás 1 punto."); puntosJugador+=1; actualizarPuntos(); acabarMano(); }
}

// ---- ENVIDOS ----
function cantarEnvido() {
  if(envidoCantado || cartaJugadaJugador) return;
  envidoCantado = true;
  const eJ = calcularEnvido(manoJugador);
  const eB = calcularEnvido(manoBot);
  document.getElementById("btnEnvido").disabled = true;
  document.getElementById("btnRealEnvido").disabled = true;
  document.getElementById("btnFaltaEnvido").disabled = true;

  if(Math.random()<0.6) {
    log(`Bot quiere Envido. Vos: ${eJ} - Bot: ${eB}`);
    if (eJ > eB) { puntosJugador += 2; log("Ganaste el Envido (+2)"); }
    else { puntosBot += 2; log("Bot ganó el Envido (+2)"); }
  } else {
    log("Bot no quiere. Sumás 1 punto.");
    puntosJugador += 1;
  }
  actualizarPuntos();
}

function cantarRealEnvido() {
  if(envidoCantado || cartaJugadaJugador) return;
  envidoCantado = true;
  const eJ = calcularEnvido(manoJugador);
  const eB = calcularEnvido(manoBot);
  document.getElementById("btnEnvido").disabled = true;
  document.getElementById("btnRealEnvido").disabled = true;
  document.getElementById("btnFaltaEnvido").disabled = true;

  if(Math.random()<0.6) {
    log(`Bot quiere Real Envido. Vos: ${eJ} - Bot: ${eB}`);
    if (eJ > eB) { puntosJugador += 3; log("Ganaste el Real Envido (+3)"); }
    else { puntosBot += 3; log("Bot ganó el Real Envido (+3)"); }
  } else {
    log("Bot no quiere. Sumás 1 punto.");
    puntosJugador += 1;
  }
  actualizarPuntos();
}

function cantarFaltaEnvido() {
  if(envidoCantado || cartaJugadaJugador) return;
  envidoCantado = true;
  const eJ = calcularEnvido(manoJugador);
  const eB = calcularEnvido(manoBot);
  const falta = 30 - Math.max(puntosJugador, puntosBot);
  document.getElementById("btnEnvido").disabled = true;
  document.getElementById("btnRealEnvido").disabled = true;
  document.getElementById("btnFaltaEnvido").disabled = true;

  if(Math.random()<0.5) {
    log(`Bot quiere Falta Envido. Vos: ${eJ} - Bot: ${eB}`);
    if (eJ > eB) { puntosJugador += falta; log(`Ganaste la Falta Envido (+${falta})`); }
    else { puntosBot += falta; log(`Bot ganó la Falta Envido (+${falta})`); }
  } else {
    log("Bot no quiere. Sumás 1 punto.");
    puntosJugador += 1;
  }
  actualizarPuntos();
}

function acabarMano() {
  rondaTerminada = true;
  setTimeout(repartir,1500);
}

function actualizarPuntos() {
  document.getElementById("puntosJugador").textContent = puntosJugador;
  document.getElementById("puntosBot").textContent = puntosBot;
}

function log(texto) {
  const logDiv=document.getElementById("log");
  logDiv.innerHTML+=`<div>${texto}</div>`;
  logDiv.scrollTop = logDiv.scrollHeight;
}

document.addEventListener("DOMContentLoaded", repartir);