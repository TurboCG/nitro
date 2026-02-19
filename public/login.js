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
            // Guardar datos del usuario en sessionStorage para usarlos en menu.html
            sessionStorage.setItem('usuarioActual', JSON.stringify(data.user));
            
            // Mostrar mensaje de bienvenida
            mostrarExito(`¡Bienvenido ${data.user.nombre}!`);
            
            // Redirigir al menú principal
            window.location.href = 'menu.html';
        } else {
            mostrarError(data.error || 'Credenciales incorrectas');
        }
    } catch(error) {
        console.error('Error en login:', error);
        mostrarError('Error de conexión: ' + error.message);
    }
}
document.getElementById("button").onclick = login;