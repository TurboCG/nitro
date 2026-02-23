const API_URL = 'https://nitro-api-0hw3.onrender.com'; // Producción
function mostrarError(mensaje) {
    alert('❌ ' + mensaje);
}
function hideSpinner() {
    document.getElementById("spinner").style.display = "none"
    document.getElementById("labelButton").style.display = "block"
}
function showSpinner() {
    document.getElementById("spinner").style.display = "block"
    document.getElementById("labelButton").style.display = "none"
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
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ dniEmail, password }),
            credentials: 'include' 
        });
        
        const data = await response.json();
        
        if (data.success) {
            const userUI = {
                nombre: data.user.nombre,
                apellido: data.user.apellido || '',
                email: data.user.email,
                id: data.user.id  // Guardar ID también
            };
            sessionStorage.setItem('userUI', JSON.stringify(userUI));
            sessionStorage.removeItem('usuarioActual');
            sessionStorage.removeItem('userID');
            hideSpinner();
            window.location.href = 'menu.html';
        } else {
            document.getElementById("errorPassw").style.display = "flex"
            hideSpinner();
        }
    } catch(error) {
        console.error('Error en login:', error);
        mostrarError('Error de conexión: ' + error.message);
        hideSpinner();
    }
}
document.getElementById("button").onclick = login;