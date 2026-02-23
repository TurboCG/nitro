function check(){
    if (sessionStorage.getItem("usuarioActual") && sessionStorage.getItem("userID")){
        location.href = "/menu.html"
    }
}

check();