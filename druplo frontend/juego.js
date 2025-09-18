// juego.js - carga después del DOM (script al final del body)
console.log("juego.js cargado");

let puntos = 0;
function actualizarPuntos() {
  const el = document.getElementById("score");
  if (el) el.textContent = puntos;
}
function sumarPuntos(c) { puntos += c; actualizarPuntos(); }

function setAction(id, fn) {
  const el = document.getElementById(id);
  if (!el) { console.warn("No existe:", id); return; }
  el.addEventListener("click", fn);
}

document.addEventListener("DOMContentLoaded", () => {
  // Referencias
  const btnTruco = document.getElementById("btnBottom1");
  const btnRetruco = document.getElementById("btnBottom2");
  const btnVale4 = document.getElementById("btnBottom3");

  if (!btnTruco || !btnRetruco || !btnVale4) {
    console.error("Faltan botones en el HTML (btnBottom1/2/3).");
    return;
  }

  // Estado inicial: ocultar retruco y vale cuatro
  btnRetruco.classList.add("hidden");
  btnVale4.classList.add("hidden");

  // TRUCO -> muestra RETRUCO
  setAction("btnBottom1", () => {
    console.log("CANTO TRUCO");
    sumarPuntos(1);
    // si ya está visible, no hacemos nada; si no, mostrar
    btnRetruco.classList.remove("hidden");
  });

  // RETRUCO -> muestra VALE CUATRO
  setAction("btnBottom2", () => {
    // si alguien hace click cuando está oculto, no sucede nada (imposible por display:none)
    console.log("CANTO RETRUCO");
    sumarPuntos(2);
    btnVale4.classList.remove("hidden");
  });

  // VALE CUATRO -> suma y reinicia la secuencia
  setAction("btnBottom3", () => {
    console.log("CANTO VALE CUATRO");
    sumarPuntos(4);
    // ocultamos retruco y vale cuatro para reiniciar
    btnRetruco.classList.add("hidden");
    btnVale4.classList.add("hidden");
    // (opcional) si querés que truco también desaparezca, descomenta:
    // btnTruco.classList.add("hidden");
  });

  // Resto de botones: ejemplos
  setAction("btnBottom4", () => { console.log("ENVIDO"); sumarPuntos(2); });
  setAction("btnBottom5", () => { console.log("REAL ENVIDO"); sumarPuntos(3); });
  setAction("btnBottom6", () => { console.log("FALTA ENVIDO"); sumarPuntos(5); });

  setAction("btnRight1", () => alert("QUIERO"));
  setAction("btnRight2", () => alert("NO QUIERO"));

  // aseguramos que el marcador muestre valor inicial
  actualizarPuntos();
});
