const nombreMecanico = document.getElementById('nombreMecanico');
const totalAutos = document.getElementById('cars');
const autosPendientes = document.getElementById('carsD');
var isPublished = false;
var tab = 0;
let globalAutos = [];
const mapaMarcas = {
        'alfa romeo': 'alfa-romeo.svg',
        'alfa-romeo': 'alfa-romeo.svg',
        'audi': 'audi.svg',
        'bmw': 'bmw.svg',
        'chevrolet': 'chevrolet.svg',
        'citroen': 'citroen.svg',
        'dodge': 'dodge.svg',
        'fiat': 'fiat.svg',
        'ford': 'ford.svg',
        'honda': 'honda.svg',
        'hyundai': 'hyundai.svg',
        'jeep': 'jeep.svg',
        'jmc': 'jmc.svg',
        'kia': 'kia.svg',
        'mazda': 'mazda.svg',
        'mini cooper': 'mini_cooper.svg',
        'mini': 'mini_cooper.svg',
        'mitsubishi': 'mitsubishi.svg',
        'nissan': 'nissan.svg',
        'peugeot': 'peugeot.svg',
        'renault': 'renault.svg',
        'saab': 'saab.svg',
        'subaru': 'subaru.svg',
        'toyota': 'toyota.svg',
        'volkswagen': 'volkswagen.svg',
        'xiaomi': 'xiaomi.svg'
    };
// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', function() {
    const usuario = obtenerUsuario();
    if (!usuario) {
        //window.location.href = 'index.html';
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
        // ✅ Usar apiFetch que ya maneja tokens y URL base
        const stats = await apiFetch("/api/estadisticas/globales");
        
        console.log('Estadísticas:', stats);
        
        if (totalAutos) totalAutos.textContent = stats.total_autos || 0;
        
        const listo = stats.por_estado?.find(e => 
            e.estado === 'listo' || e.estado === 'progreso'
        );
        
        if (autosPendientes) autosPendientes.textContent = listo ? listo.cantidad : 0;
        
    } catch(error) {
        console.error('Error cargando estadísticas:', error);
        if (error.message === 'Sesión expirada') {
            //window.location.href = 'index.html';
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
        globalAutos = autos;
        renderUltimosTresAutos(autos);
        renderAutos(autos);
    } catch(error) {
        console.error('Error cargando autos:', error);
    }}


function renderAutos(autos) {
    const container = document.getElementById('historyContainer');
    if (!container) return;
    
    container.innerHTML = '';
    let imgGeneric = "resources/car-brands/other.svg"
        autos.forEach(auto => {
        const autoCard = document.createElement('div');
        
        let imagenSrc = 'other.svg';
        
        if (auto.marca) {
            const marcaNormalizada = auto.marca.toLowerCase().trim();
            
            if (mapaMarcas[marcaNormalizada]) {
                imagenSrc = mapaMarcas[marcaNormalizada];
            } else {
                let encontrado = false;
                for (const [key, value] of Object.entries(mapaMarcas)) {
                    if (marcaNormalizada.includes(key) || key.includes(marcaNormalizada)) {
                        imagenSrc = value;
                        encontrado = true;
                        break;
                    }
                }
                if (!encontrado) {
                    imagenSrc = 'other.svg';
                }
            }
        }
        
        autoCard.className = 'auto-card';
        autoCard.innerHTML = `
            <div class="carEntry historyEntry">
                <div class="logoCover">
                    <img src="resources/car-brands/${imagenSrc}" class="carIcEntry brandingCarHistory" style="filter: brightness(100);">  
                </div>
                <div class="doubleText marginTextDouble">
                    <h2 class="titleEntry">${auto.marca || 'Marca no especificada'}</h2>
                    <h3 class="subEntry">Patente: ${auto.patente}</h3>
                    <h3 class="subEntry">Modelo: ${auto.modelo || 'No especificado'}</h3>
                    <h3 class="subEntry">Fecha: ${new Date(auto.fecha_ingreso).toLocaleDateString()}</h3>
                    <h3 class="subEntry">${auto.estado || 'Estado no especificado'}</h3>
                    <button class="historyDetailButton">Ver más</button>
                </div>
            </div>
        `;
        
        const button = autoCard.querySelector('.historyDetailButton');
        if (button) {
            button.onclick = (e) => {
                e.stopPropagation();
                hideShowDetails(auto.id);
            };
        }
        
        container.appendChild(autoCard);
    });
}
function renderUltimosTresAutos(autos) {
    const container = document.getElementById('carContainer'); 
    if (!container) return;
    
    container.innerHTML = '';
    
    const autosOrdenados = [...autos].sort((a, b) => {
        return new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso);
    });
    let imgGeneric = "resources/car-brands/other.svg"
    const ultimosTres = autosOrdenados.slice(0, 3);
    

    ultimosTres.forEach(auto => {
        const autoCard = document.createElement('div');
        autoCard.className = 'auto-card';
        
        autoCard.onclick = () => verDetalleAuto(auto.id, auto.patente);
        if (auto.marca) {
            const marcaNormalizada = auto.marca.toLowerCase().trim();
            if (mapaMarcas[marcaNormalizada]) {
                imagenSrc = `resources/car-brands/${mapaMarcas[marcaNormalizada]}`;
            } else {
                for (const [key, value] of Object.entries(mapaMarcas)) {
                    if (marcaNormalizada.includes(key) || key.includes(marcaNormalizada)) {
                        imagenSrc = `resources/car-brands/${value}`;
                        break;
                    }
                }
            }
        }
        autoCard.innerHTML = `
            <div class="carEntry">
                <img src="${imagenSrc}" class="carIcEntry" style="filter: brightness(0);">  
                <div class="doubleText">
                    <h2 class="titleEntry">${auto.patente}</h2>
                    <h3 class="subEntry">${new Date(auto.fecha_ingreso).toLocaleDateString()}</h3>
                </div>
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
            //window.location.href = 'index.html';
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
document.getElementById("backDetailsCar").onclick = hideShowDetails;

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
    switchTab(1);
}

function mainT() {
    switchTab(0);
}

// Cerrar sesión
function logout() {
    cerrarSesion();
}

function switchTab(targetTab) {
    if (targetTab == 0){
        document.getElementById("mainTabContent").style.display = "flex";
        document.getElementById("historyTabContent").style.display = "none";
        document.getElementById("historyButton").style.opacity = 0.5;
        document.getElementById("homeButton").style.opacity = 1;
    }else{
        document.getElementById("mainTabContent").style.display = "none";
        document.getElementById("historyTabContent").style.display = "flex";
        document.getElementById("historyButton").style.opacity = 1;
        document.getElementById("homeButton").style.opacity = 0.5;
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const mainTab = document.getElementById('mainTabContent');
    const historyTab = document.getElementById('historyTabContent');
    
    mainTab.style.display = 'flex';
    historyTab.style.display = 'none';
    tab = 0;
});

function hideShowDetails(autoid) {
    const mainTab = document.getElementById('carDetails');
    mainTab.style.display = mainTab.style.display === "none" || mainTab.style.display === "" ? "block" : "none";
    if (!mainTab) {
        console.error('Elemento carDetails no encontrado');
        return;
    }

    if (!globalAutos || !Array.isArray(globalAutos)) {
        console.error('globalAutos no está definido o no es un array');
        return;
    }
    
    const auto = globalAutos.find(a => a.id === autoid);
    
    if (!auto) {
        console.error('Auto no encontrado con ID:', autoid);
        return;
    }
    
    console.log("Auto detectado: ", auto);
    console.log("Mostrando detalles de:", auto.patente);
    
    const updateElement = (id, value, defaultValue = 'No especificado') => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || defaultValue;
        } else {
            console.warn(`Elemento ${id} no encontrado en el DOM`);
        }
    };
    let imagenSrc = 'other.svg';
        if (auto.marca) {
            const marcaNormalizada = auto.marca.toLowerCase().trim();
            
            if (mapaMarcas[marcaNormalizada]) {
                imagenSrc = mapaMarcas[marcaNormalizada];
            } else {
                let encontrado = false;
                for (const [key, value] of Object.entries(mapaMarcas)) {
                    if (marcaNormalizada.includes(key) || key.includes(marcaNormalizada)) {
                        imagenSrc = value;
                        encontrado = true;
                        break;
                    }
                }
                if (!encontrado) {
                    imagenSrc = 'other.svg';
                }
            }
        }
    document.getElementById("carLogo").src = imagenSrc;
    updateElement("marcaDetail", `Marca: ${auto.marca || 'No especificada'}`);
    updateElement("modeloDetail", `Modelo: ${auto.modelo || 'No especificado'}`);
    updateElement("fechaDetail", `Fecha de entrada: ${auto.fecha_ingreso ? new Date(auto.fecha_ingreso).toLocaleDateString() : 'No especificada'}`);
    updateElement("anoDetail", `Año: ${auto.ano || 'No especificado'}`);
    updateElement("patenteDetail", `Patente: ${auto.patente || 'No especificada'}`);
    updateElement("estadoDetail", `Estado: ${auto.estado || 'No especificado'}`);
    updateElement("kilometrajeDetail", `Kilometraje: ${auto.kilometraje ? auto.kilometraje.toLocaleString() + ' km' : 'No especificado'}`);
    updateElement("arreglosDetail", `Arreglos: ${auto.problema || auto.arreglos || 'Sin arreglos registrados'}`);
}