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
    document.getElementById('nombreMecanico2').textContent = usuario.nombre;
    } else {
        // window.location.href = 'index.html';
    }
    loadStats();
}

async function loadStats() {
    try {
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
        const listo = stats.por_estado?.find(e => e.estado === 'listo' || e.estado === 'terminado');
        if (autosPendientes) autosPendientes.textContent = listo ? listo.cantidad : 0;
        autosPendientes.classList.remove("blurLabel");
        totalAutos.classList.remove("blurLabel");
    } catch(error) {
        console.error('Error cargando estadísticas:', error);  
    }
}
function showHideMenuProfile() {
    const menu = document.getElementById("accountOptionsMenu");
    menu.classList.toggle("hidden");
    document.getElementById("accountOptionsMenu").classList.toggle("openxpp");
    document.getElementById("blackBlurBg").classList.toggle("blurbg");
}

function showHideAddCar() {
    if (document.getElementById("inputInf").style.display == "none"){
        document.getElementById("inputInf").style.display = "flex";
        document.getElementById("inputInfConfirm").style.display = "none";
    }

    const menu = document.getElementById("carOptionsMenu");
    menu.classList.toggle("hidden");
    document.getElementById("carOptionsMenu").classList.toggle("openxpp");
    document.getElementById("blackBlurBg").classList.toggle("blurbg");
}

function loadCacheConfirm() {
    document.getElementById("inputInf").style.display = "none"
    document.getElementById("inputInfConfirm").style.display = "flex"
}

async function loadCars() {
    try {
        const response = await fetch(`${API_URL}/api/autos?usuario_id=${usuarioActual.id}`);
        const autos = await response.json();
        
        let html = '';
        autos.forEach(auto => {
            const fecha = new Date(auto.fecha_ingreso).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                
            `;
        });
        
        listaAutos.innerHTML = html || '<p class="no-autos">No hay autos registrados</p>';
        
    } catch(error) {
        mostrarError('Error cargando autos: ' + error.message);
    }
}


const button = document.getElementById('invokeDate');
const dateInput = document.getElementById('dateInput');
const dateInputLabel = document.getElementById("spanDateLabelButton")
button.addEventListener('click', () => {
// Esto invoca el diálogo del date input directamente
    dateInput.showPicker(); 
});

// Opcional: ver qué fecha eligió el usuario
dateInput.addEventListener('change', () => {
    dateInputLabel.textContent = dateInput.value
});
setProps();

function closeSession() {

}
document.getElementById("ProfileButton").onclick = showHideMenuProfile;
document.getElementById("backk").onclick = showHideMenuProfile;
document.getElementById("backAddCar").onclick = showHideAddCar;
document.getElementById("addCarPiolaButton").onclick = showHideAddCar;
document.getElementById("confirmButtonToNext").onclick = loadCacheConfirm;