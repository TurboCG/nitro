// menu.js - Este es NUEVO

document.addEventListener('DOMContentLoaded', function() {
    if (!estaAutenticado()) {
        // Si no hay token, redirigir a login
        window.location.href = 'index.html';
        return;
    }
    
    // Mostrar nombre del usuario
    const usuario = obtenerUsuario();
    if (usuario) {
        document.getElementById('nombreUsuario').textContent = usuario.nombre;
    }
    
    // Cargar datos iniciales
    cargarAutos();
    cargarEstadisticas();
});

async function cargarAutos() {
    try {
        const usuario = obtenerUsuario();
        if (!usuario) return;
        
        // ✅ Usamos apiFetch que ya incluye el token automáticamente
        const autos = await apiFetch(`/api/autos?usuario_id=${usuario.id}`);
        
        // Renderizar autos (tu código actual de renderizado)
        renderizarAutos(autos);
        
    } catch(error) {
        console.error('Error cargando autos:', error);
        mostrarError('Error al cargar los autos');
    }
}

async function cargarEstadisticas() {
    try {
        const usuario = obtenerUsuario();
        if (!usuario) return;
        
        const stats = await apiFetch(`/api/estadisticas/${usuario.id}`);
        
        // Actualizar UI con estadísticas
        document.getElementById('totalAutos').textContent = stats.total_autos;
        document.getElementById('autosMes').textContent = stats.autos_este_mes;
        
        // Renderizar gráfico de estados (si existe)
        if (stats.por_estado) {
            actualizarGraficoEstados(stats.por_estado);
        }
        
    } catch(error) {
        console.error('Error cargando estadísticas:', error);
    }
}

async function crearAuto(autoData) {
    try {
        const usuario = obtenerUsuario();
        const nuevoAuto = await apiFetch('/api/autos', {
            method: 'POST',
            body: JSON.stringify({
                ...autoData,
                usuario_id: usuario.id
            })
        });
        
        if (nuevoAuto.success) {
            mostrarExito('Auto agregado correctamente');
            cargarAutos(); // Recargar lista
            return true;
        }
    } catch(error) {
        mostrarError('Error al crear auto: ' + error.message);
        return false;
    }
}

async function actualizarAuto(autoId, autoData) {
    try {
        const usuario = obtenerUsuario();
        const resultado = await apiFetch(`/api/autos/${autoId}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...autoData,
                usuario_id: usuario.id
            })
        });
        
        if (resultado.success) {
            mostrarExito('Auto actualizado');
            cargarAutos();
            return true;
        }
    } catch(error) {
        mostrarError('Error al actualizar: ' + error.message);
        return false;
    }
}

async function eliminarAuto(autoId) {
    if (!confirm('¿Eliminar este auto?')) return;
    
    try {
        const usuario = obtenerUsuario();
        const resultado = await apiFetch(`/api/autos/${autoId}?usuario_id=${usuario.id}`, {
            method: 'DELETE'
        });
        
        if (resultado.success) {
            mostrarExito('Auto eliminado');
            cargarAutos();
        }
    } catch(error) {
        mostrarError('Error al eliminar: ' + error.message);
    }
}

// Función para logout
function logout() {
    if (confirm('¿Cerrar sesión?')) {
        cerrarSesion();
    }
}