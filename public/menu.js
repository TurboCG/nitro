const nombreMecanico = document.getElementById('nombreMecanico');

const usuarioStr = sessionStorage.getItem('usuarioActual');

function setProps() {
    if (usuarioStr) {
    const usuario = JSON.parse(usuarioStr);
    console.log('Nombre:', usuario.nombre);
    console.log('Apellido:', usuario.apellido);
    console.log('Email:', usuario.email);
    console.log('DNI:', usuario.dni);
    console.log('ID:', usuario.id);
    
    // Mostrar en el HTML
    document.getElementById('nombreMecanico').textContent = usuario.nombre;
    } else {
        window.location.href = 'index.html';
    }
}

setProps();