const palos = ["espada","basto","oro","copa"];
const numeros = [1,2,3,4,5,6,7,10,11,12];
const fuerza = {"1espada":14,"1basto":13,"7espada":12,"7oro":11,"3":10,"2":9,"1":8,"12":7,"11":6,"10":5,"7":4,"6":3,"5":2,"4":1};

let mazo = [];
let manoJugador = [];
let manoBot = [];
let puntosJugador = 0;
let puntosBot = 0;

let empiezaJugador = true;
let turnoJugador = true;
let trucoNivel = -1;
let envidoCantado = false;
let rondaTerminada = false;

let bazasJugador = 0;
let bazasBot = 0;

let playedPlayer = null;
let playedBot = null;

function valorEnvido(carta){ return carta && carta.numero >=1 && carta.numero <=7 ? carta.numero : 0; }
function calcularEnvido(mano){
  const a = mano[0], b = mano[1], c = mano[2];
  const sums = [];
  if (a && b && a.palo===b.palo) sums.push(valorEnvido(a)+valorEnvido(b)+20);
  if (a && c && a.palo===c.palo) sums.push(valorEnvido(a)+valorEnvido(c)+20);
  if (b && c && b.palo===c.palo) sums.push(valorEnvido(b)+valorEnvido(c)+20);
  if (sums.length===0) return Math.max(valorEnvido(a), valorEnvido(b), valorEnvido(c));
  return Math.max(...sums);
}

function crearMazo(){
  mazo = [];
  for(const p of palos) for(const n of numeros) mazo.push({numero:n,palo:p,fuerza:fuerza[`${n}${p}`] || fuerza[n] || 0});
}
function sacarCarta(){ const i=Math.floor(Math.random()*mazo.length); return mazo.splice(i,1)[0]; }

function repartir(){
  crearMazo();
  manoJugador = [sacarCarta(), sacarCarta(), sacarCarta()];
  manoBot    = [sacarCarta(), sacarCarta(), sacarCarta()];
  empiezaJugador = !empiezaJugador;
  turnoJugador = empiezaJugador;
  trucoNivel = -1;
  envidoCantado = false;
  rondaTerminada = false;
  playedPlayer = null;
  playedBot = null;
  bazasJugador = 0;
  bazasBot = 0;
  safeDisable("btnTruco", false);
  safeDisable("btnRetruco", true);
  safeDisable("btnVale4", true);
  safeDisable("btnEnvido", false);
  safeDisable("btnRealEnvido", false);
  safeDisable("btnFaltaEnvido", false);
  safeDisable("btnMazo", false);
  renderCartas();
  log(`Nueva mano. ${empiezaJugador ? "Vos sos mano" : "Bot es mano"}.`);
  if(!empiezaJugador) setTimeout(()=> botPlayFirst(), 700);
}

function safeDisable(id, v){ const el=document.getElementById(id); if(el) el.disabled = v; }

function renderCartas(){
  const tus = document.getElementById("tusCartas");
  tus.innerHTML = "";
  manoJugador.forEach((c,i)=>{
    const d = document.createElement("div");
    d.className = "carta";
    d.textContent = `${c.numero} de ${c.palo}`;
    d.onclick = ()=> playerPlay(i);
    tus.appendChild(d);
  });
  const bot = document.getElementById("cartasBot");
  bot.innerHTML = "";
  manoBot.forEach(()=> {
    const d = document.createElement("div");
    d.className = "carta bot";
    d.textContent = "?";
    bot.appendChild(d);
  });
}

function playerPlay(i){
  if(!turnoJugador || rondaTerminada) return;
  const carta = manoJugador.splice(i,1)[0];
  playedPlayer = carta;
  safeDisable("btnEnvido", true);
  safeDisable("btnRealEnvido", true);
  safeDisable("btnFaltaEnvido", true);
  log(`Jugaste ${carta.numero} de ${carta.palo}`);
  if(playedBot){
    resolveBaza();
  } else {
    turnoJugador = false;
    setTimeout(()=> botRespondToPlayer(carta), 600);
  }
  renderCartas();
}

function botPlayFirst(){
  if(rondaTerminada || manoBot.length===0) return;
  const cartaBot = chooseBotCardWhenStarting();
  const idx = manoBot.indexOf(cartaBot);
  if(idx>=0) manoBot.splice(idx,1);
  playedBot = cartaBot;
  log(`Bot jugó ${cartaBot.numero} de ${cartaBot.palo}`);
  turnoJugador = true;
  renderCartas();
}

function chooseBotCardWhenStarting(){
  let min = manoBot[0];
  for(const c of manoBot) if(c.fuerza < min.fuerza) min = c;
  return min;
}

function botRespondToPlayer(cartaJugador){
  if(rondaTerminada) return;
  let choice = manoBot.find(c => c.fuerza > cartaJugador.fuerza);
  if(!choice) choice = manoBot.reduce((a,b)=> a.fuerza < b.fuerza ? a : b);
  manoBot.splice(manoBot.indexOf(choice),1);
  playedBot = choice;
  log(`Bot jugó ${choice.numero} de ${choice.palo}`);
  resolveBaza();
  renderCartas();
}

function resolveBaza(){
  if(!playedPlayer || !playedBot) return;
  const fp = playedPlayer.fuerza;
  const fb = playedBot.fuerza;
  let ganador = null;
  if(fp > fb){ ganador = "player"; bazasJugador++; log("Ganaste la baza."); }
  else if(fb > fp){ ganador = "bot"; bazasBot++; }
  else { ganador = "tie"; log("Baza empatada."); }
  playedPlayer = null;
  playedBot = null;
  if(bazasJugador === 2 || bazasBot === 2){ finishHandByBazas(); return; }
  let siguiente;
  if(ganador === "player") siguiente = "player";
  else if(ganador === "bot") siguiente = "bot";
  else siguiente = (empiezaJugador ? "player" : "bot");
  if(siguiente === "player"){ turnoJugador = true; renderCartas(); }
  else { turnoJugador = false; setTimeout(()=> { if(rondaTerminada) return; botPlayFirst(); }, 600); }
}

function finishHandByBazas(){
  rondaTerminada = true;
  let pts = 1;
  if(trucoNivel === 0) pts = 1;
  else if(trucoNivel === 1) pts = 2;
  else if(trucoNivel === 2) pts = 3;
  if(bazasJugador > bazasBot){
    puntosJugador += pts;
    log(`Ganaste la mano (+${pts})`);
    empiezaJugador = true;
  } else if(bazasBot > bazasJugador){
    puntosBot += pts;
    log(`Bot gana la mano (+${pts})`);
    empiezaJugador = false;
  } else {
    if(empiezaJugador){ puntosJugador += pts; log(`Empate: gana quien es mano (Vos) (+${pts})`); }
    else { puntosBot += pts; log(`Empate: gana quien es mano (Bot) (+${pts})`); }
  }
  actualizarPuntos();
  setTimeout(()=> repartir(), 1200);
}

function irseAlMazo(){
  if(rondaTerminada) return;
  rondaTerminada = true;
  let pts = 1;
  if(trucoNivel === 0) pts = 1;
  else if(trucoNivel === 1) pts = 2;
  else if(trucoNivel === 2) pts = 3;
  puntosBot += pts;
  log(`Te fuiste al mazo. Bot obtiene ${pts} punto(s).`);
  actualizarPuntos();
  safeDisable("btnMazo", true);
  setTimeout(()=> repartir(), 1200);
}

function cantarTruco(){
  if(trucoNivel >= 0 || rondaTerminada) return log("Truco ya cantado");
  trucoNivel = 0;
  log("Cantas Truco");
  safeDisable("btnTruco", true);
  safeDisable("btnRetruco", false);
  safeDisable("btnVale4", true);
  safeDisable("btnEnvido", true);
  safeDisable("btnRealEnvido", true);
  safeDisable("btnFaltaEnvido", true);
  const sum = manoBot.reduce((s,c)=>s+c.fuerza,0);
  const quiere = sum >= 24 ? Math.random() < 0.95 : Math.random() < 0.6;
  if(quiere) log("Bot quiere Truco");
  else {
    log("Bot no quiere Truco");
    puntosJugador += 1;
    actualizarPuntos();
    rondaTerminada = true;
    setTimeout(()=> repartir(), 1000);
  }
}

function cantarRetruco(){
  if(trucoNivel !== 0 || rondaTerminada) return log("No puedes cantar Retruco aún");
  trucoNivel = 1;
  log("Cantas Retruco");
  safeDisable("btnRetruco", true);
  safeDisable("btnVale4", false);
  const sum = manoBot.reduce((s,c)=>s+c.fuerza,0);
  const quiere = sum >= 26 ? Math.random() < 0.95 : Math.random() < 0.5;
  if(quiere) log("Bot quiere Retruco");
  else {
    log("Bot no quiere Retruco");
    puntosJugador += 2;
    actualizarPuntos();
    rondaTerminada = true;
    setTimeout(()=> repartir(), 1000);
  }
}

function cantarVale4(){
  if(trucoNivel !== 1 || rondaTerminada) return log("No puedes cantar Vale 4 aún");
  trucoNivel = 2;
  log("Cantas Vale 4");
  safeDisable("btnVale4", true);
  const sum = manoBot.reduce((s,c)=>s+c.fuerza,0);
  const quiere = sum >= 30 ? Math.random() < 0.98 : Math.random() < 0.4;
  if(quiere) log("Bot quiere Vale 4");
  else {
    log("Bot no quiere Vale 4");
    puntosJugador += 3;
    actualizarPuntos();
    rondaTerminada = true;
    setTimeout(()=> repartir(), 1000);
  }
}

function cantarEnvido(){
  if(envidoCantado || playedPlayer || playedBot || rondaTerminada) return;
  envidoCantado = true;
  safeDisable("btnEnvido", true);
  safeDisable("btnRealEnvido", true);
  safeDisable("btnFaltaEnvido", true);
  const eJ = calcularEnvido(manoJugador);
  const eB = calcularEnvido(manoBot);
  const quiere = eB >= 26 ? true : (eB <= 19 ? false : Math.random() < 0.6);
  if(quiere){
    log(`Bot quiere Envido. Vos: ${eJ} - Bot: ${eB}`);
    if(eJ > eB){ puntosJugador += 2; log("Ganaste el Envido (+2)"); }
    else if(eB > eJ){ puntosBot += 2; log("Bot gana el Envido (+2)"); }
    else { if(empiezaJugador){ puntosJugador += 2; log("Empate en Envido: gana quien es mano (Vos) (+2)"); } else { puntosBot += 2; log("Empate en Envido: gana quien es mano (Bot) (+2)"); } }
  } else {
    log("Bot no quiere Envido");
    puntosJugador += 1;
  }
  actualizarPuntos();
}

function cantarRealEnvido(){
  if(envidoCantado || playedPlayer || playedBot || rondaTerminada) return;
  envidoCantado = true;
  safeDisable("btnEnvido", true);
  safeDisable("btnRealEnvido", true);
  safeDisable("btnFaltaEnvido", true);
  const eJ = calcularEnvido(manoJugador);
  const eB = calcularEnvido(manoBot);
  const quiere = eB >= 27 ? true : (eB <= 20 ? false : Math.random() < 0.6);
  if(quiere){
    log(`Bot quiere Real Envido. Vos: ${eJ} - Bot: ${eB}`);
    if(eJ > eB){ puntosJugador += 3; log("Ganaste Real Envido (+3)"); }
    else if(eB > eJ){ puntosBot += 3; log("Bot gana Real Envido (+3)"); }
    else { if(empiezaJugador){ puntosJugador += 3; log("Empate en Real Envido: gana quien es mano (Vos) (+3)"); } else { puntosBot += 3; log("Empate en Real Envido: gana quien es mano (Bot) (+3)"); } }
  } else {
    log("Bot no quiere Real Envido");
    puntosJugador += 1;
  }
  actualizarPuntos();
}

function cantarFaltaEnvido(){
  if(envidoCantado || playedPlayer || playedBot || rondaTerminada) return;
  envidoCantado = true;
  safeDisable("btnEnvido", true);
  safeDisable("btnRealEnvido", true);
  safeDisable("btnFaltaEnvido", true);
  const eJ = calcularEnvido(manoJugador);
  const eB = calcularEnvido(manoBot);
  const falta = 30 - Math.max(puntosJugador, puntosBot);
  const quiere = eB >= 28 ? true : Math.random() < 0.5;
  if(quiere){
    log(`Bot quiere Falta Envido. Vos: ${eJ} - Bot: ${eB}`);
    if(eJ > eB){ puntosJugador += falta; log(`Ganaste Falta Envido (+${falta})`); }
    else if(eB > eJ){ puntosBot += falta; log(`Bot gana Falta Envido (+${falta})`); }
    else { if(empiezaJugador){ puntosJugador += falta; log(`Empate Falta Envido: gana quien es mano (Vos) (+${falta})`); } else { puntosBot += falta; log(`Empate Falta Envido: gana quien es mano (Bot) (+${falta})`); } }
  } else {
    log("Bot no quiere Falta Envido");
    puntosJugador += 1;
  }
  actualizarPuntos();
}

function actualizarPuntos(){
  const a = document.getElementById("puntosJugador");
  const b = document.getElementById("puntosBot");
  if(a) a.textContent = puntosJugador;
  if(b) b.textContent = puntosBot;
}

function log(txt){
  const d = document.getElementById("log");
  if(!d) return;
  d.innerHTML += `<div>${txt}</div>`;
  d.scrollTop = d.scrollHeight;
}

document.addEventListener("DOMContentLoaded", repartir);