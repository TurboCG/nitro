// config.js
const CONFIG = {
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? ''  // API local
        : 'https://nitro-api-adms.onrender.com', // API producción
    
    // Keys para localStorage
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data'
};

// Funciones de utilidad para autenticación
function guardarSesion(token, user) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

function cerrarSesion() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    window.location.href = 'index.html'; // o login.html
}

function obtenerToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
}

function obtenerUsuario() {
    const userStr = localStorage.getItem(CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

function estaAutenticado() {
    return !!obtenerToken();
}

// Wrapper para fetch con token automático
async function apiFetch(endpoint, options = {}) {
    const token = obtenerToken();
    const url = `${CONFIG.API_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    });
    
    // Si el token expiró o es inválido
    if (response.status === 401 || response.status === 403) {
        cerrarSesion();
        throw new Error('Sesión expirada');
    }
    
    return response.json();
}