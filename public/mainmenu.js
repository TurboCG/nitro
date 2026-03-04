// mainmenu.js - Versión migrada a JWT
const nombreMecanico = document.getElementById('nombreMecanico');
const totalAutos = document.getElementById('cars');
const autosPendientes = document.getElementById('carsD');
var isPublished = false;
var tab = 0;

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', function() {
    const usuario = obtenerUsuario();
    if (!usuario) {
        window.location.href = 'index.html';
        return;
    }
    setProps();
    loadAutos(); // Cargar autos al iniciar
});

function setProps() {
    const opciones = ["¿Todo bien, ", "¿Qué onda, ", "¿Todo piola, ", "¿Como va eso, ", "¿Va todo joya, "];
    const indiceAleatorio = Math.floor(Math.random() * opciones.length);
    const seleccion = opciones[indiceAleatorio];
    document.getElementById("saludo").textContent = seleccion;
    
    const usuario = obtenerUsuario();
    if (usuario) {
        document.getElementById('nombreMecanico').textContent = usuario.nombre;
        document.getElementById('nombreMecanico2').textContent = usuario.nombre;
    }
    loadStats();
}

async function loadStats() {
    document.getElementById('spinnerStat').style.display = "block";
    document.getElementById('spinnerStat2').style.display = "block";
    
    try {
        const usuario = obtenerUsuario();
        if (!usuario) return;
        
        // ✅ Usar apiFetch que ya maneja tokens y URL base
        const stats = await apiFetch(`/api/estadisticas/${usuario.id}`);
        
        console.log('Estadísticas:', stats);
        
        if (totalAutos) totalAutos.textContent = stats.total_autos || 0;
        
        const listo = stats.por_estado?.find(e => 
            e.estado === 'listo' || e.estado === 'terminado'
        );
        
        if (autosPendientes) autosPendientes.textContent = listo ? listo.cantidad : 0;
        
    } catch(error) {
        console.error('Error cargando estadísticas:', error);
        if (error.message === 'Sesión expirada') {
            window.location.href = 'index.html';
        }
    } finally {
        document.getElementById('spinnerStat').style.display = "none";
        document.getElementById('spinnerStat2').style.display = "none";
    }
}

async function loadAutos() {
    try {
        const usuario = obtenerUsuario();
        if (!usuario) return;
        
        const autos = await apiFetch(`/api/autos?usuario_id=${usuario.id}`);
        renderAutos(autos);
        
    } catch(error) {
        console.error('Error cargando autos:', error);
    }
}

function renderAutos(autos) {
    const container = document.getElementById('autosContainer'); // Asegúrate de tener este contenedor
    if (!container) return;
    
    container.innerHTML = '';
    
    autos.forEach(auto => {
        const autoCard = document.createElement('div');
        autoCard.className = 'auto-card';
        autoCard.innerHTML = `
            <div class="auto-header">
                <h3>${auto.patente}</h3>
                <span class="estado ${auto.estado}">${auto.estado}</span>
            </div>
            <div class="auto-details">
                <p><strong>Marca:</strong> ${auto.marca}</p>
                <p><strong>Modelo:</strong> ${auto.modelo}</p>
                <p><strong>Año:</strong> ${auto.ano}</p>
                <p><strong>KM:</strong> ${auto.kilometraje}</p>
                <p><strong>Problema:</strong> ${auto.problema}</p>
                <p><strong>Ingreso:</strong> ${new Date(auto.fecha_ingreso).toLocaleDateString()}</p>
            </div>
            <div class="auto-actions">
                <button onclick="editarAuto(${auto.id})">Editar</button>
                <button onclick="eliminarAuto(${auto.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(autoCard);
    });
}

async function addCar() {
    isPublished = true;
    showSpinnerButtonPub();
    
    try {
        const usuario = obtenerUsuario();
        if (!usuario) {
            window.location.href = 'index.html';
            return;
        }
        
        const auto = {
            usuario_id: usuario.id,
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
            console.error("Campos incompletos");
            hideSpinnerButtonPub();
            mostrarError('Completa todos los campos');
            return;
        }

        // ✅ Usar apiFetch
        const result = await apiFetch('/api/autos', {
            method: 'POST',
            body: JSON.stringify(auto)
        });
        
        if(result.success) {
            // Limpiar formulario
            document.getElementById('patenteInput').value = '';
            document.getElementById('marcaInput').value = '';
            document.getElementById('modeloInput').value = '';
            document.getElementById('kilometrajeInput').value = '';
            document.getElementById('arreglosInput').value = '';
            document.getElementById('anoInput').value = '';
            
            showHideAddCar();
            mostrarExito('Auto agregado correctamente');
            loadAutos(); // Recargar lista
            loadStats(); // Actualizar estadísticas
        }
        
    } catch(error) {
        console.error('Error agregando auto:', error);
        mostrarError('Error al agregar auto');
    } finally {
        hideSpinnerButtonPub();
        isPublished = false;
    }
}

async function eliminarAuto(autoId) {
    if (!confirm('¿Estás seguro de eliminar este auto?')) return;
    
    try {
        const usuario = obtenerUsuario();
        const result = await apiFetch(`/api/autos/${autoId}?usuario_id=${usuario.id}`, {
            method: 'DELETE'
        });
        
        if (result.success) {
            mostrarExito('Auto eliminado');
            loadAutos();
            loadStats();
        }
        
    } catch(error) {
        console.error('Error eliminando auto:', error);
        mostrarError('Error al eliminar auto');
    }
}

async function editarAuto(autoId) {
    // Implementar según tu UI
    console.log('Editar auto:', autoId);
}

// Funciones de UI (sin cambios)
function showHideAddCar() {
    const inputInf = document.getElementById("inputInf");
    const inputInfConfirm = document.getElementById("inputInfConfirm");
    
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
    refreshVerify();
    document.getElementById("inputInf").style.display = "none";
    document.getElementById("inputInfConfirm").style.display = "flex";
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

function refreshVerify() {
    const fields = {
        'patenteInput': 'patentePreview',
        'marcaInput': 'marcaPreview',
        'modeloInput': 'modeloPreview',
        'kilometrajeInput': 'kilometrajePreview',
        'arreglosInput': 'arreglosPreview',
        'anoInput': 'añoPreview',
        'statusInput': 'estadoPreview',
        'dateInput': 'datePreview'
    };
    
    Object.entries(fields).forEach(([inputId, previewId]) => {
        const inputElement = document.getElementById(inputId);
        const previewElement = document.getElementById(previewId);

        if (inputElement && previewElement) {
            const valor = inputElement.value.trim();
            previewElement.textContent = valor || "(sin establecer)";
        }
    });
}

function hideShowVerifyPub() {
    const inputInf = document.getElementById("inputInf");
    if (inputInf.style.display === "none" || inputInf.style.display === "") {
        inputInf.style.display = "flex";
        inputInfConfirm.style.display = "none";
    } else {
        showHideAddCar();
    }
}

// Spinner functions
function showSpinnerButtonPub() {
    document.getElementById("spinner").style.display = "block";
    document.getElementById("labelButton").style.display = "none";
}

function hideSpinnerButtonPub() {
    document.getElementById("spinner").style.display = "none";
    document.getElementById("labelButton").style.display = "block";
}

// Date picker
const button = document.getElementById('invokeDate');
const dateInput = document.getElementById('dateInput');
const dateInputLabel = document.getElementById("spanDateLabelButton");

if (button && dateInput) {
    button.addEventListener('click', () => {
        dateInput.showPicker();
    });

    dateInput.addEventListener('change', () => {
        if (dateInputLabel) dateInputLabel.textContent = dateInput.value;
    });
}

// Touch animations
['backk', 'backAddCar', 'ProfileButton', 'addCarPiolaButton'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('touchstart', () => {
            el.classList.remove('unscalle');
            el.classList.add('scalle');
        });
    }
});

// Event listeners
document.getElementById("ProfileButton").onclick = showHideMenuProfile;
document.getElementById("backk").onclick = showHideMenuProfile;
document.getElementById("backAddCar").onclick = hideShowVerifyPub;
document.getElementById("addCarPiolaButton").onclick = showHideAddCar;
document.getElementById("confirmButtonToNext").onclick = loadCacheConfirm;
document.getElementById("buttonCheckPost").onclick = addCar;
document.getElementById("historyButton").onclick = historyT;
document.getElementById("homeButton").onclick = mainT;
document.getElementById("historialPiolaAutosButton").onclick = historyT;

// Tab functions
function updateContent() {
    if (tab == 0) {
        document.getElementById("mainTabContent").style.display = "flex";
        document.getElementById("historyTabContent").style.display = "none";
        document.getElementById("homeButton").style.opacity = 1;
        document.getElementById("historyButton").style.opacity = 0.5;
    } else {
        document.getElementById("mainTabContent").style.display = "none";
        document.getElementById("historyTabContent").style.display = "flex";
        document.getElementById("homeButton").style.opacity = 0.5;
        document.getElementById("historyButton").style.opacity = 1;
    }
}

function historyT() {
    tab = 1;
    updateContent();
    loadAutos(); // Cargar autos para el historial si es necesario
}

function mainT() {
    tab = 0;
    updateContent();
}

// Cerrar sesión
function logout() {
    cerrarSesion();
}