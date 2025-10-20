import { subscribeGETEvent, subscribePOSTEvent, realTimeEvent, startServer } from "soquetic"; 
import fs from "fs";
startServer(3000);

var registro= JSON.parse(fs.readFileSync("Usuarios.json", "utf-8"))
subscribePOSTEvent("iniciarsesion", Logueo);
var lista = registro
var UsuarioR = null
var NiñoR= null
function Iniciar(data)
{
    for (var i =0; i<registro.length;i++)
    {
        if (data.NOMBRE === registro[i].NOMBRE && data.APELLIDO === registro[i].APELLIDO)
        {
            console.log ("El bolo debe ser un número")
            var cuentacreada = false
        } else if (/\d/.test(data.NOMBREniño))
        {
            console.log ("El nombre del niño no puede contener números")
            var cuentacreada = false
        } else if (/\d/.test(data.NOMBRE))
        {
            console.log ("El nombre no puede contener números")
            var cuentacreada = false
        }
        else if (/\d/.test(data.APELLIDO))
        {
                console.log ("El apellido no puede contener números")
                var cuentacreada = false
        }
    }
        if (cuentacreada === true)
            {
            lista.push ({
                "NOMBRE": data.NOMBRE ,
                "APELLIDO": data.APELLIDO ,
                "CONTRASENA": data.CONTRASENA ,
                "NOMBREniño": data.NOMBREniño,
                "CONTRASENAniño": data.CONTRASENAniño
            })
            fs.writeFileSync('Usuarios.json', JSON.stringify(lista, null, 2))
            console.log("Usuario registrado con éxito")
        }
        return cuentacreada

}
export {Iniciar};
function LogueoAdultos(data)
{

  for (var i =0; i<registro.length;i++)
    {
        if (data.NOMBRE === registro[i].NOMBRE && data.APELLIDO === registro[i].APELLIDO && data.CONTRASENA === registro[i].CONTRASENA)
        {
            console.log ("Has iniciado sesión correctamente")
            var encontrado = true
            var logueado = true
            var contra=true 
            UsuarioR = registro[i] 
        } else if (data.NOMBRE === registro[i].NOMBRE && data.APELLIDO === registro[i].APELLIDO && data.CONTRASENA != registro[i].CONTRASENA)
        {
            console.log ("La contraseña es incorrecta")
            var encontrado = true
            var logueado = false
            var contra=false
        } else if (data.NOMBRE != registro[i].NOMBRE || data.APELLIDO != registro[i].APELLIDO)
        {
            var encontrado = false
            var logueado = false
            console.log ("No se ha encontrado una cuenta con ese nombre y apellido")
            var contra=false
        }
  
    }
  return [logueado,encontrado,contra, UsuarioR];
}