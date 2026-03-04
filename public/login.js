function mostrarError(mensaje) {
    alert('❌ ' + mensaje);
}

function hideSpinner() {
    document.getElementById("spinner").style.display = "none";
    document.getElementById("labelButton").style.display = "block";
}

function showSpinner() {
    document.getElementById("spinner").style.display = "block";
    document.getElementById("labelButton").style.display = "none";
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
        
        showSpinner();
        
        // ⚠️ CAMBIO IMPORTANTE: Ya no usamos credentials: 'include'
        const response = await fetch(`${CONFIG.API_URL}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                dniEmail: dniEmail,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // ✅ NUEVO: Guardar token y usuario en localStorage
            guardarSesion(data.token, data.user);
            
            mostrarExito(`¡Bienvenido ${data.user.nombre}!`);
            hideSpinner();
            window.location.href = 'menu.html';
        } else {
            document.getElementById("errorPassw").style.display = "flex";
            hideSpinner();
        }
    } catch(error) {
        console.error('Error en login:', error);
        mostrarError('Error de conexión: ' + error.message);
        hideSpinner();
    }
}

// Vincular evento
document.getElementById("button").onclick = login;
