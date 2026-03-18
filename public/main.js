const usuario = obtenerUsuario();
function check(){
    if (usuario) {
            window.location.href = 'menu.html';
            return;
        }
    }
check();