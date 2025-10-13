const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
usuarios.push({ usuario, contrasena });
localStorage.setItem("usuarios", JSON.stringify(usuarios));