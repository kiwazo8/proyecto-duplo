import { subscribeGETEvent, subscribePOSTEvent, startServer } from "soquetic";
import fs from "fs";

startServer(3000);

let usuarios = JSON.parse(fs.readFileSync("usuarios.json", "utf-8") || "[]");

subscribePOSTEvent("registrar", (data) => {
  const { usuario, contrasena } = data;

  if (!usuario || !contrasena) {
    console.log("Faltan datos para registrar.");
    return { ok: false, mensaje: "Faltan datos." };
  }

  const existe = usuarios.some(u => u.usuario === usuario);
  if (existe) {
    console.log("El usuario ya existe.");
    return { ok: false, mensaje: "El usuario ya existe." };
  }

  usuarios.push({ usuario, contrasena });
  fs.writeFileSync("usuarios.json", JSON.stringify(usuarios, null, 2));
  console.log(`Usuario ${usuario} registrado.`);
  return { ok: true, mensaje: "Usuario registrado correctamente." };
});

subscribePOSTEvent("iniciarsesion", (data) => {
  const { usuario, contrasena } = data;

  const encontrado = usuarios.find(
    u => u.usuario === usuario && u.contrasena === contrasena
  );

  if (encontrado) {
    console.log(`Usuario ${usuario} inició sesión correctamente.`);
    return { ok: true, mensaje: "Inicio de sesión exitoso." };
  } else {
    console.log(`Fallo al iniciar sesión: ${usuario}`);
    return { ok: false, mensaje: "Usuario o contraseña incorrectos." };
  }
});

subscribeGETEvent("usuarios", () => {
  return usuarios;
});

console.log("Servidor corriendo en http://localhost:3000");