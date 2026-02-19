const API_URL = 'https://nitro-api-0hw3.onrender.com'; 
const nombreMecanico = document.getElementById('nombreMecanico');
const totalAutos = document.getElementById('cars');
const usuarioStr = sessionStorage.getItem('usuarioActual');
const usuarioActual = sessionStorage.getItem("userID")
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
    loadStats();
}

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/estadisticas/${usuarioActual}`);
        const stats = await response.json();

        if (totalAutos) totalAutos.textContent = stats.total_autos;
        
        const listo = stats.por_estado.find(e => e.estado === 'listo');
        if (autosPendientes) autosPendientes.textContent = listo ? listo.cantidad : 0;
        
    } catch(error) {
        console.log('Error cargando estadísticas:', error);
    }
}

setProps();