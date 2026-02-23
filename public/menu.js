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

function setProps() {
    const opciones = ["¿Todo bien, ", "¿Qué onda, ", "¿Todo piola, ", "¿Como va eso, ", "¿Va todo joya, "];
    const indiceAleatorio = Math.floor(Math.random() * opciones.length);
    const seleccion = opciones[indiceAleatorio];
    document.getElementById("saludo").textContent = seleccion;
    if (usuarioUI) {        
        document.getElementById('nombreMecanico').textContent = usuarioUI.nombre;
        document.getElementById('nombreMecanico2').textContent = usuarioUI.nombre;
        if (usuarioUI.apellido) {
            // document.getElementById('apellidoMecanico').textContent = usuarioUI.apellido;
        }
    } else {
        console.warn('No hay datos de usuario, redirigiendo...');
        window.location.href = 'index.html';
    }
    loadStats();
}


async function loadStats() {
    document.getElementById('spinnerStat').style.display = "block";
    document.getElementById('spinnerStat2').style.display = "block";
    try {
        const response = await fetch(`${API_URL}/api/estadisticas`, {
            credentials: 'include'
        });
        document.getElementById('spinnerStat').style.display = "none";
        document.getElementById('spinnerStat2').style.display = "none";
         if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        const stats = await response.json();
        console.log('stat:', stats);

        if (totalAutos) totalAutos.textContent = stats.total_autos || 0;
        
        const listo = stats.por_estado?.find(e => e.estado === 'listo' || e.estado === 'terminado');
        if (autosPendientes) autosPendientes.textContent = listo ? listo.cantidad : 0;
    } catch(error) {
        console.error('Error cargando estadísticas:', error);  
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
        const response = await fetch(`${API_URL}/api/verify-session`, {
            credentials: 'include'  // Envía la cookie HttpOnly automáticamente
        });
        
        if (response.ok) {
            const data = await response.json();
            // Si hay sesión pero no datos UI, los recreamos
            if (!usuarioUI && data.user) {
                usuarioUI = {
                    nombre: data.user.nombre,
                    apellido: data.user.apellido || '',
                    email: data.user.email
                };
                sessionStorage.setItem('userUI', JSON.stringify(usuarioUI));
                setProps(); // Re-ejecutar la UI
            }
        } else {
            // Sesión inválida, redirigir
            window.location.href = 'index.html';
        }
    } catch(error) {
        console.error('Error verificando sesión:', error);
        // Si hay error de red, no redirigir inmediatamente
        // pero mostrar un mensaje
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
        sessionStorage.removeItem('userInfo');
        window.location.href = 'index.html';
    } catch(error) {
        console.error('Error en logout:', error);
        // Forzar logout local
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