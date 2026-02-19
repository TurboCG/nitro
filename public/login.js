const API_URL = 'https://nitro-api-0hw3.onrender.com'; // Producción
function mostrarError(mensaje) {
    alert('❌ ' + mensaje);
}

function mostrarExito(mensaje) {
    alert('✅ ' + mensaje);
}
async function login() {
    try {
        const dniEmail = document.getElementById('dniEmail').value.trim();
        const password = document.getElementById('password').value;
        
        if (!dniEmail || !password) {
            mostrarError('Completa todos los campos');
            return;
        }
        
        console.log("🔍 Intentando login con:", dniEmail);
        
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                dniEmail: dniEmail,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            usuarioActual = data.user;
            
            // Ocultar login, mostrar dashboard
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            
            // Mostrar nombre del mecánico
            document.getElementById('nombreMecanico').textContent = 
                `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`;
            
            // Cargar datos
            cargarAutos();
            cargarEstadisticas();
            
            // Limpiar campo de login
            document.getElementById('dniEmail').value = '';
            document.getElementById('password').value = '';
            
            mostrarExito(`¡Bienvenido ${usuarioActual.nombre}!`);
        } else {
            mostrarError(data.error || 'Credenciales incorrectas');
        }
    } catch(error) {
        console.error('❌ Error en login:', error);
        mostrarError('Error de conexión: ' + error.message);
    }
}

document.getElementById("button").onclick = login;