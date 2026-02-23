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
    const blurBg = document.getElementById("blackBlurBg");
    if (menu.classList.contains("openxpp")) {
        menu.classList.remove("openxpp");
        menu.classList.add("closexpp");
        blurBg.classList.add("unblurbg");
        blurBg.classList.remove("blurbg");
        menu.addEventListener('animationend', function alTerminar() {
            if (menu.classList.contains('closexpp')) {
            }
            
            menu.removeEventListener('animationend', alTerminar);
        });

    } else {
        menu.classList.remove("closexpp");
        menu.classList.add("openxpp");
        menu.style.display = "block";
        blurBg.classList.add("blurbg");
        blurBg.classList.remove("unblurbg");
    }
}

function showHideAddCar() {
    const menu = document.getElementById("carOptionsMenu");
    const inputInf = document.getElementById("inputInf");
    const inputInfConfirm = document.getElementById("inputInfConfirm");
    const blurBg = document.getElementById("blackBlurBg");
    if (inputInf.style.display == "none") {
        inputInf.style.display = "flex";
        inputInfConfirm.style.display = "none";
    }
    if (menu.classList.contains("openxpp")) {
        menu.classList.remove("openxpp");
        menu.classList.add("closexpp");
        blurBg.classList.add("unblurbg");
        blurBg.classList.remove("blurbg");
        menu.addEventListener('animationend', () => {
            closeCard(menu); 
        }, { once: true });
        menu.addEventListener('animationend', function alTerminar() {
            if (menu.classList.contains('closexpp')) {
            }
            menu.removeEventListener('animationend', alTerminar);
        });

    } else {
        menu.classList.remove("closexpp");
        menu.classList.add("openxpp");
        menu.style.display = "block";
        blurBg.classList.add("blurbg");
        blurBg.classList.remove("unblurbg");
        blurBg.classList.remove("hidden");
    }
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
    dateInput.showPicker(); 
});

// Opcional: ver qué fecha eligió el usuario
dateInput.addEventListener('change', () => {
    dateInputLabel.textContent = dateInput.value
});
setProps();
function closeCard(element) {
    console.log("Ocultando", element)
    element.style.display = "none";
}
async function addCar() {
    try {
        const auto = {
            usuario_id: usuarioActual,
            patente: document.getElementById('patenteInput').value,
            marca: document.getElementById('marcaInput').value,
            modelo: document.getElementById('modeloInput').value,
            kilometraje: parseInt(document.getElementById('kilometrajeInput').value),
            ano: parseInt(document.getElementById('anoInput').value),
            problema: document.getElementById('arreglosInput').value,
            estado: document.getElementById("statusInput").value
        };

        // Validaciones básicas
        if (!auto.patente || !auto.marca || !auto.kilometraje || !auto.modelo || !auto.ano || !auto.problema || !auto.estado) {
            console.log("Error 311");
            return;
        }

        const response = await fetch(`${API_URL}/api/autos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(auto)
        });
        
        const result = await response.json();
        
        if(result.success) {
            // Limpiar formulario
            document.getElementById('patenteInput').value = '';
            document.getElementById('marcaInput').value = '';
            document.getElementById('modeloInput').value = '';
            document.getElementById('kilometrajeInput').value = '';
            document.getElementById('arreglosInput').value = '';
            document.getElementById('anoInput').value = '';
        } else {
            console.log("Error 351");
        }
    } catch(error) {
        console.log("Error 677");
    }
}
document.getElementById("ProfileButton").onclick = showHideMenuProfile;
document.getElementById("backk").onclick = showHideMenuProfile;
document.getElementById("backAddCar").onclick = showHideAddCar;
document.getElementById("addCarPiolaButton").onclick = showHideAddCar;
document.getElementById("confirmButtonToNext").onclick = loadCacheConfirm;
document.getElementById("buttonCheckPost").onclick = addCar;