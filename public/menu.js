const API_URL = 'https://nitro-api-0hw3.onrender.com'; 
const nombreMecanico = document.getElementById('nombreMecanico');
const totalAutos = document.getElementById('cars');
const autosPendientes = document.getElementById('carsD');
const usuarioStr = sessionStorage.getItem('usuarioActual');
const usuarioActual = sessionStorage.getItem("userID");
var isPublished = false;
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
        }else{
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
        }   
    } catch(error) {
        console.error('Error cargando estadísticas:', error);  
    }

}
function showHideAddCar() {
    const inputInf = document.getElementById("inputInf");
    const inputInfConfirm = document.getElementById("inputInfConfirm");
    
    // Tu lógica de negocio específica
    if (inputInf.style.display === "none" || inputInf.style.display === "") {
        inputInf.style.display = "flex";
        inputInfConfirm.style.display = "none";
    }

    toggleMenu("carOptionsMenu", "openxpp", "closexpp");
}

function showHideMenuProfile() {
    toggleMenu("accountOptionsMenu", "openxpp", "closexpp");
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
    element.style.display = "none";
}

function toggleMenu(menuId, openClass, closeClass) {
    const menu = document.getElementById(menuId);
    const blurBg = document.getElementById("blackBlurBg");

    if (menu.classList.contains(openClass)) {
        menu.classList.remove(openClass);
        menu.classList.add(closeClass);
        blurBg.classList.replace("blurbg", "unblurbg");

        menu.addEventListener('animationend', () => {
            if (menu.classList.contains(closeClass)) {
                menu.style.display = "none";
                blurBg.classList.add("hidden");
            }
        }, { once: true });

    } else {
        menu.style.display = "block";
        menu.style.opacity = "0";
        setTimeout(() => {
            menu.classList.remove(closeClass);
            menu.classList.add(openClass);
            menu.style.opacity = "1";
            blurBg.style.display = "block";
            blurBg.classList.remove("hidden", "unblurbg");
            blurBg.classList.add("blurbg");
        }, 10);
    }
}

async function addCar() {
    isPublished = true;
    showSpinnerButtonPub()
    try {
        const auto = {
            usuario_id: usuarioActual,
            patente: document.getElementById('patenteInput').value,
            marca: document.getElementById('marcaInput').value,
            modelo: document.getElementById('modeloInput').value,
            kilometraje: parseInt(document.getElementById('kilometrajeInput').value),
            ano: parseInt(document.getElementById('anoInput').value),
            problema: document.getElementById('arreglosInput').value,
            estado: document.getElementById("statusInput").value,
            fecha_ingreso: document.getElementById("dateInput").value
        };

        // Validaciones básicas
        if (!auto.patente || !auto.marca || !auto.kilometraje || !auto.modelo || !auto.ano || !auto.problema || !auto.estado || !auto.fecha_ingreso) {
            console.log("Error 311");
            hideSpinnerButtonPub()
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
            showHideAddCar();
            hideSpinnerButtonPub();
            isPublished = false;
        } else {
            hideSpinnerButtonPub()
            console.log("Error 351");
        }
    } catch(error) {
        hideSpinnerButtonPub()
        console.log("Error 677");
    }
}

function showSpinnerButtonPub(){
    document.getElementById("spinner").style.display = "block";
    document.getElementById("labelButton").style.display = "none";
}
function hideSpinnerButtonPub(){
    document.getElementById("spinner").style.display = "none";
    document.getElementById("labelButton").style.display = "block";
}
document.getElementById("ProfileButton").onclick = showHideMenuProfile;
document.getElementById("backk").onclick = showHideMenuProfile;
document.getElementById("backAddCar").onclick = showHideAddCar;
document.getElementById("addCarPiolaButton").onclick = showHideAddCar;
document.getElementById("confirmButtonToNext").onclick = loadCacheConfirm;
document.getElementById("buttonCheckPost").onclick = addCar;