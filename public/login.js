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
            guardarSesion(data.token, data.user);
            
            hideSpinner();
            window.location.href = 'menu.html';
        } else {
            document.getElementById("errorPassw").style.display = "flex";
            hideSpinner();
        }
    } catch(error) {
        console.error('Error en login:', error);
        document.getElementById("errorPassw").style.display = "flex";
        
        hideSpinner();
    }
}

// Vincular evento
document.getElementById("button").onclick = login;
