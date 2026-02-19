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
        
        // 🔥 DEBUG: Ver qué se envía exactamente
        const payload = {
            dniEmail: dniEmail,
            password: password
        };
        console.log("📦 Payload a enviar:", JSON.stringify(payload, null, 2));
        
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        console.log("📥 Response status:", response.status);
        
        // Leer la respuesta como texto primero para debug
        const textResponse = await response.text();
        console.log("📄 Respuesta raw:", textResponse);
        
        // Intentar parsear como JSON
        try {
            const data = JSON.parse(textResponse);
            console.log("✅ Data parseada:", data);
            
            if (response.ok && data.success) {
                usuarioActual = data.user;
                document.getElementById('loginForm').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                document.getElementById('nombreMecanico').textContent = 
                    `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`;
                cargarAutos();
                cargarEstadisticas();
                document.getElementById('dniEmail').value = '';
                document.getElementById('password').value = '';
                mostrarExito(`¡Bienvenido ${usuarioActual.nombre}!`);
            } else {
                mostrarError(data.error || 'Error en login');
            }
        } catch(e) {
            console.error("❌ No es JSON válido:", textResponse);
            mostrarError('Error inesperado del servidor');
        }
        
    } catch(error) {
        console.error('❌ Error en login:', error);
        mostrarError('Error de conexión: ' + error.message);
    }
}