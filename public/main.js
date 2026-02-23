function check(){
    const usuario = sessionStorage.getItem("usuarioActual");
    const id = sessionStorage.getItem("userID");
    if (usuario && id) {
        window.location.href = "/menu.html";
    }
}

check();