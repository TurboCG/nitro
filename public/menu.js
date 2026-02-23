const API_URL = 'https://nitro-api-0hw3.onrender.com'; 
const nombreMecanico = document.getElementById('nombreMecanico');
const totalAutos = document.getElementById('cars');
const autosPendientes = document.getElementById('carsD');
const usuarioStr = sessionStorage.getItem('usuarioActual');
const usuarioActual = sessionStorage.getItem("userID");
const userUIStr = sessionStorage.getItem('userUI');
let usuarioUI = null;
var isPublished = false;
if (userUIStr) {
    usuarioUI = JSON.parse(userUIStr);
} else {
    checkAuth();
}
async function init() {
    const sessionValid = await checkAuth();
    if (!sessionValid) {
        window.location.href = 'index.html';
        return;
    }
    loadUserFromStorage();
    setProps();
    await loadStats();
}

function setProps() {
    const opciones = ["¿Todo bien, ", "¿Qué onda, ", "¿Todo piola, ", "¿Cómo va eso, ", "¿Va todo joya, "];
    const indiceAleatorio = Math.floor(Math.random() * opciones.length);
    const seleccion = opciones[indiceAleatorio];
    const saludoEl = document.getElementById("saludo");
    if (saludoEl) saludoEl.textContent = seleccion;
    if (usuarioUI) {
        console.log('👤 Mostrando usuario:', usuarioUI);
        const nombreEl = document.getElementById('nombreMecanico');
        const nombre2El = document.getElementById('nombreMecanico2');
        if (nombreEl) nombreEl.textContent = usuarioUI.nombre;
        if (nombre2El) nombre2El.textContent = usuarioUI.nombre;
        if (usuarioUI.apellido) {
            const apellidoEl = document.getElementById('apellidoMecanico');
            if (apellidoEl) apellidoEl.textContent = usuarioUI.apellido;
        }
    } else {
        console.warn('⚠️ No hay datos de usuario en setProps');
    }
}


async function loadStats() {
    const spinnerStat = document.getElementById('spinnerStat');
    const spinnerStat2 = document.getElementById('spinnerStat2');
    
    if (spinnerStat) spinnerStat.style.display = "block";
    if (spinnerStat2) spinnerStat2.style.display = "block";
    
    try {
        console.log('📊 Cargando estadísticas...');
        const response = await fetch(`${API_URL}/api/estadisticas`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (spinnerStat) spinnerStat.style.display = "none";
        if (spinnerStat2) spinnerStat2.style.display = "none";
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const stats = await response.json();
        console.log('📊 Estadísticas:', stats);

        if (totalAutos) totalAutos.textContent = stats.total_autos || 0;
        
        const listo = stats.por_estado?.find(e => e.estado === 'listo' || e.estado === 'terminado');
        if (autosPendientes) autosPendientes.textContent = listo ? listo.cantidad : 0;
        
    } catch(error) {
        console.error('❌ Error cargando estadísticas:', error);
        if (spinnerStat) spinnerStat.style.display = "none";
        if (spinnerStat2) spinnerStat2.style.display = "none";
        if (totalAutos) totalAutos.textContent = '0';
        if (autosPendientes) autosPendientes.textContent = '0';
    }
}
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
function loadUserFromStorage() {
    const userUIStr = sessionStorage.getItem('userUI');
    if (userUIStr) {
        usuarioUI = JSON.parse(userUIStr);
        console.log('✅ Usuario cargado de storage:', usuarioUI);
    } else {
        console.warn('⚠️ No hay userUI en storage');
    }
}


function loadCacheConfirm() {
    document.getElementById("inputInf").style.display = "none"
    document.getElementById("inputInfConfirm").style.display = "flex"
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
    if (!usuarioUI || !usuarioUI.id) {
        console.error('❌ No hay usuario autenticado');
        return;
    }
    
    isPublished = true;
    showSpinnerButtonPub();
    
    try {
        const auto = {
            usuario_id: usuarioUI.id,  // ✅ Usar el ID de usuarioUI
            patente: document.getElementById('patenteInput')?.value || '',
            marca: document.getElementById('marcaInput')?.value || '',
            modelo: document.getElementById('modeloInput')?.value || '',
            kilometraje: parseInt(document.getElementById('kilometrajeInput')?.value) || 0,
            año: parseInt(document.getElementById('anoInput')?.value) || new Date().getFullYear(),
            problema: document.getElementById('arreglosInput')?.value || '',
            estado: document.getElementById("statusInput")?.value || 'pendiente',
            fecha_ingreso: document.getElementById("dateInput")?.value || new Date().toISOString().split('T')[0]
        };

        // Validaciones
        if (!auto.patente || !auto.marca || !auto.modelo || !auto.problema) {
            console.log("❌ Campos requeridos faltantes");
            hideSpinnerButtonPub();
            isPublished = false;
            return;
        }

        const response = await fetch(`${API_URL}/api/autos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(auto),
            credentials: 'include'
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
            await loadStats(); // Recargar estadísticas
        } else {
            console.log("❌ Error en respuesta:", result);
        }
    } catch(error) {
        console.error("❌ Error en addCar:", error);
    } finally {
        hideSpinnerButtonPub();
        isPublished = false;
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
function hideShowVerifyPub(){
    if (inputInf.style.display === "none" || inputInf.style.display === "") {
        inputInf.style.display = "flex";
        inputInfConfirm.style.display = "none";
    }else{
        showHideAddCar();
    }
}
async function checkAuth() {
    try {
        console.log('🔍 Verificando sesión...');
        const response = await fetch(`${API_URL}/api/verify-session`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📥 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Sesión válida:', data);
            
            if (data.success && data.user) {
                // Guardar en memoria y storage
                usuarioUI = {
                    nombre: data.user.nombre,
                    apellido: data.user.apellido || '',
                    email: data.user.email,
                    id: data.user.id
                };
                sessionStorage.setItem('userUI', JSON.stringify(usuarioUI));
                return true;
            }
        }
        
        console.warn('❌ Sesión inválida');
        return false;
        
    } catch(error) {
        console.error('❌ Error verificando sesión:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        document.getElementById('userName').textContent = user.nombre;
    }
});
async function logout() {
    try {
        await fetch(`${API_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch(error) {
        console.error('Error en logout:', error);
    } finally {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}
document.getElementById("backk").addEventListener('touchstart', () => {
    document.getElementById("backk").classList.remove('unscalle');
    document.getElementById("backk").classList.add('scalle');
});
document.getElementById("backAddCar").addEventListener('touchstart', () => {
    document.getElementById("backAddCar").classList.remove('unscalle');
    document.getElementById("backAddCar").classList.add('scalle');
});
document.getElementById("ProfileButton").addEventListener('touchstart', () => {
    document.getElementById("ProfileButton").classList.remove('unscalle');
    document.getElementById("ProfileButton").classList.add('scalle');
});
document.getElementById("addCarPiolaButton").addEventListener('touchstart', () => {
    document.getElementById("addCarPiolaButton").classList.remove('unscalle');
    document.getElementById("addCarPiolaButton").classList.add('scalle');
});
document.getElementById("ProfileButton").onclick = showHideMenuProfile;
document.getElementById("backk").onclick = showHideMenuProfile;
document.getElementById("backAddCar").onclick = hideShowVerifyPub;
document.getElementById("addCarPiolaButton").onclick = showHideAddCar;
document.getElementById("confirmButtonToNext").onclick = loadCacheConfirm;
document.getElementById("buttonCheckPost").onclick = addCar;