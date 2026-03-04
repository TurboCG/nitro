function hideSpinner() {
    document.getElementById("spinner").style.display = "none";
    document.getElementById("labelButton").style.display = "block";
}

function showSpinner() {
    document.getElementById("spinner").style.display = "block";
    document.getElementById("labelButton").style.display = "none";
}

function mostrarError(mensaje) {
    alert('❌ ' + mensaje);
}

function mostrarExito(mensaje) {
    alert('✅ ' + mensaje);
}

async function registrarMecanico() {
    try {
        const nombre = document.getElementById('regNombre').value;
        const apellido = document.getElementById('regApellido').value;
        const dni = document.getElementById('regDNI').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regPassword2').value;
        
        // Validaciones (igual que antes)
        if (!nombre || !email || !password) {
            mostrarError('Todos los campos son requeridos');
            return;
        }
        
        if (password !== confirmPassword) {
            mostrarError('Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 8) {
            mostrarError('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        showSpinner();
        
        // ⚠️ CAMBIO: register NO requiere autenticación
        const response = await fetch(`/api/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('✅ Registrado correctamente, vuelve al inicio para iniciar sesión.');
            
            // Limpiar formulario
            document.getElementById('regNombre').value = '';
            document.getElementById('regApellido').value = '';
            document.getElementById('regDNI').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regPassword2').value = '';
            
            // Ocultar formulario de registro y mostrar login
            document.getElementById('registroForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        } else {
            mostrarError(data.error || 'Error al registrar');
        }
    } catch(error) {
        mostrarError('Error de conexión: ' + error.message);
    } finally {
        hideSpinner();
    }
}

// Funciones para mostrar/ocultar formularios
function mostrarRegistro() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registroForm').classList.remove('hidden');
}

function mostrarLogin() {
    document.getElementById('registroForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Vincular evento
document.getElementById("registerBtn").onclick = registrarMecanico;