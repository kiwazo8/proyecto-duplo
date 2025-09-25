const palos = ["espada", "basto", "oro", "copa"];
const numeros = [1,2,3,4,5,6,7,10,11,12];
const fuerza = {"1espada":14,"1basto":13,"7espada":12,"7oro":11,"3":10,"2":9,"1":8,"12":7,"11":6,"10":5,"7":4,"6":3,"5":2,"4":1};

let mazo = [];
let manoJugador = [];
let manoBot = [];
let puntosJugador = 0;
let puntosBot = 0;
let turnoJugador = true;
let envidoCantado = false;
let trucoCantado = false; // indica si Truco fue cantado

// Envido
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

// Mazo
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

// Repartir cartas
function repartir() {
  crearMazo();
  manoJugador = [sacarCarta(), sacarCarta(), sacarCarta()];
  manoBot = [sacarCarta(), sacarCarta(), sacarCarta()];
  turnoJugador = true;
  envidoCantado = false;
  trucoCantado = false;

  document.getElementById("btnTruco").disabled = false;
  document.getElementById("btnEnvido").disabled = false;
  document.getElementById("btnRealEnvido").disabled = false;
  document.getElementById("btnFaltaEnvido").disabled = false;

  renderCartas();
  log(`Nueva mano repartida. Tu envido: ${calcularEnvido(manoJugador)}`);
}

// Renderizar cartas
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

// Jugar carta
function jugarCarta(i) {
  if(!turnoJugador) return alert("Es turno del bot");
  const carta = manoJugador.splice(i,1)[0];
  log(`Jugaste ${carta.numero} de ${carta.palo}`);
  turnoJugador = false;
  setTimeout(()=> turnoBot(carta),500);
}

// Turno del bot (simple)
function turnoBot(cartaJugador) {
  manoBot.sort((a,b)=>b.fuerza-a.fuerza);
  const cartaBot = manoBot.shift();
  log(`Bot jugó ${cartaBot.numero} de ${cartaBot.palo}`);
  turnoJugador=true;
  renderCartas();
}

// Truco y respuestas
function cantarTruco() {
  if(trucoCantado) return log("Truco ya cantado");
  trucoCantado = true;
  log("Cantaste Truco");
  responderTruco();
}
function responderTruco() {
  if(Math.random()<0.7) log("Bot quiere");
  else log("Bot no quiere");
}

// Envidos
function cantarEnvido() {
  if(envidoCantado) return log("Ya cantaste envido esta mano");
  envidoCantado=true;
  const envidoBot = calcularEnvido(manoBot);
  document.getElementById("btnEnvido").disabled = true;
  document.getElementById("btnRealEnvido").disabled = true;
  document.getElementById("btnFaltaEnvido").disabled = true;
  if(Math.random()<0.5) log(`Bot quiere Envido y tiene ${envidoBot} puntos`);
  else log("Bot no quiere Envido");
}
function cantarRealEnvido() {
  if(envidoCantado) return log("Ya cantaste envido esta mano");
  envidoCantado=true;
  const envidoBot = calcularEnvido(manoBot);
  document.getElementById("btnEnvido").disabled = true;
  document.getElementById("btnRealEnvido").disabled = true;
  document.getElementById("btnFaltaEnvido").disabled = true;
  if(Math.random()<0.5) log(`Bot quiere Real Envido y tiene ${envidoBot+3} puntos`);
  else log("Bot no quiere Real Envido");
}
function cantarFaltaEnvido() {
  if(envidoCantado) return log("Ya cantaste envido esta mano");
  envidoCantado=true;
  const totalFaltante = 30 - puntosBot;
  document.getElementById("btnEnvido").disabled = true;
  document.getElementById("btnRealEnvido").disabled = true;
  document.getElementById("btnFaltaEnvido").disabled = true;
  log(`Bot quiere Falta Envido y tiene ${totalFaltante} puntos`);
}

// Log
function log(texto) {
  const logDiv=document.getElementById("log");
  logDiv.innerHTML+=`<div>${texto}</div>`;
  logDiv.scrollTop = logDiv.scrollHeight;
}

document.addEventListener("DOMContentLoaded", repartir);