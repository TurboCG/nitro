const API_URL = 'https://nitro-api-0hw3.onrender.com'; 
const nombreMecanico = document.getElementById('nombreMecanico');
const totalAutos = document.getElementById('cars');
const autosPendientes = document.getElementById('carsD');
const usuarioStr = sessionStorage.getItem('usuarioActual');
const usuarioActual = sessionStorage.getItem("userID")
function setProps() {
    const opciones = ["¿Todo bien, ", "¿Qué onda, ", "¿Todo piola, ", "¿Como va eso, ", "¿Va todo joya, "];
    const indiceAleatorio = Math.floor(Math.random() * opciones.length);
    const seleccion = opciones[indiceAleatorio];
    document.getElementById("saludo").textContent = seleccion;
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
        // window.location.href = 'index.html';
    }
    loadStats();
}

async function loadStats() {
    try {
        // Obtener usuario del sessionStorage
        const usuarioStr = sessionStorage.getItem('usuarioActual');
        if (!usuarioStr) {
            console.log('No hay usuario logueado');
            return;
        }
        
        const usuario = JSON.parse(usuarioStr);
        const userId = usuario.id; 
        
        console.log('Cargando stats para usuario:', userId);
        
        const response = await fetch(`${API_URL}/api/estadisticas/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        console.log('Estadísticas recibidas:', stats);

        if (totalAutos) totalAutos.textContent = stats.total_autos || 0;
        
        // Buscar estado 'listo' (o el nombre que uses en tu DB)
        const listo = stats.por_estado?.find(e => e.estado === 'listo' || e.estado === 'terminado');
        if (autosPendientes) autosPendientes.textContent = listo ? listo.cantidad : 0;
        autosPendientes.classList.remove("blurLabel");
        totalAutos.classList.remove("blurLabel");
    } catch(error) {
        console.error('Error cargando estadísticas:', error);
        // Opcional: mostrar mensaje amigable al usuario
        
    }
}
function showHideMenuProfile() {
    const menu = document.getElementById("accountOptionsMenu");
    menu.classList.toggle("hidden");
    document.getElementById("accountOptionsMenu").classList.toggle("openxpp");
    document.getElementById("blackBlurBg").classList.toggle("blurbg");
}
setProps();

document.getElementById("ProfileButton").onclick = showHideMenuProfile;
document.getElementById("backk").onclick = showHideMenuProfile;