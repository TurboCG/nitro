// Configuración - Cambia esto cuando subas a Render
// const API_URL = 'https://tu-api.onrender.com'; // Producción

let usuarioActual = null;

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const dashboard = document.getElementById('dashboard');
const listaAutos = document.getElementById('listaAutos');
const nombreMecanico = document.getElementById('nombreMecanico');
const totalAutos = document.getElementById('totalAutos');
const autosPendientes = document.getElementById('autosPendientes');

// Funciones de UI
function mostrarError(mensaje) {
    alert('❌ ' + mensaje);
}

function mostrarExito(mensaje) {
    alert('✅ ' + mensaje);
}

// Login
async function login() {
    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            mostrarError('Completa todos los campos');
            return;
        }
        
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        
        const data = await response.json();
        
        if(data.success) {
            usuarioActual = data.user;
            loginForm.classList.add('hidden');
            dashboard.classList.remove('hidden');
            nombreMecanico.textContent = usuarioActual.nombre;
            cargarAutos();
            cargarEstadisticas();
        } else {
            mostrarError(data.error || 'Error al iniciar sesión');
        }
    } catch(error) {
        mostrarError('Error de conexión: ' + error.message);
    }
}

// Cargar autos
async function cargarAutos() {
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
                <div class="auto-card ${auto.estado}">
                    <div class="auto-header">
                        <strong>${auto.marca} ${auto.modelo} (${auto.año})</strong>
                        <span class="estado-badge estado-${auto.estado}">${auto.estado}</span>
                    </div>
                    <p><strong>Patente:</strong> ${auto.patente}</p>
                    <p><strong>Problema:</strong> ${auto.problema}</p>
                    <p><small>📅 Ingresado: ${fecha}</small></p>
                    <div class="auto-actions">
                        <button onclick="editarAuto(${auto.id})" class="btn-edit">✏️ Editar</button>
                        <button onclick="eliminarAuto(${auto.id})" class="btn-delete">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });
        
        listaAutos.innerHTML = html || '<p class="no-autos">No hay autos registrados</p>';
        
    } catch(error) {
        mostrarError('Error cargando autos: ' + error.message);
    }
}

// Agregar auto
async function agregarAuto() {
    try {
        const auto = {
            usuario_id: usuarioActual.id,
            patente: document.getElementById('patente').value,
            marca: document.getElementById('marca').value,
            modelo: document.getElementById('modelo').value,
            año: parseInt(document.getElementById('año').value),
            problema: document.getElementById('problema').value,
            estado: 'pendiente'
        };

        // Validaciones básicas
        if (!auto.patente || !auto.marca || !auto.modelo || !auto.año || !auto.problema) {
            mostrarError('Completa todos los campos');
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
            document.getElementById('patente').value = '';
            document.getElementById('marca').value = '';
            document.getElementById('modelo').value = '';
            document.getElementById('año').value = '';
            document.getElementById('problema').value = '';
            
            mostrarExito('Auto agregado correctamente');
            cargarAutos();
            cargarEstadisticas();
        } else {
            mostrarError(result.error || 'Error al guardar');
        }
    } catch(error) {
        mostrarError('Error al guardar: ' + error.message);
    }
}

// Eliminar auto
async function eliminarAuto(autoId) {
    if(!confirm('¿Estás seguro de eliminar este auto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/autos/${autoId}?usuario_id=${usuarioActual.id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if(result.success) {
            mostrarExito('Auto eliminado');
            cargarAutos();
            cargarEstadisticas();
        } else {
            mostrarError(result.error || 'Error al eliminar');
        }
    } catch(error) {
        mostrarError('Error: ' + error.message);
    }
}

// Editar auto (simplificado - puedes expandir después)
function editarAuto(autoId) {
    alert('Función de editar - próximo paso! 🚧');
}

// Cargar estadísticas
async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}/api/estadisticas/${usuarioActual.id}`);
        const stats = await response.json();
        
        if (totalAutos) totalAutos.textContent = stats.total_autos;
        
        // Buscar estado pendiente
        const pendiente = stats.por_estado.find(e => e.estado === 'pendiente');
        if (autosPendientes) autosPendientes.textContent = pendiente ? pendiente.cantidad : 0;
        
    } catch(error) {
        console.log('Error cargando estadísticas:', error);
    }
}

// Logout
function logout() {
    usuarioActual = null;
    loginForm.classList.remove('hidden');
    dashboard.classList.add('hidden');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

// Event listeners cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Enter en password para login
    document.getElementById('password').addEventListener('keypress', function(e) {
        if(e.key === 'Enter') login();
    });
});