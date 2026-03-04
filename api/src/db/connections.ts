import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔌 Configurando conexión a NeonDB...');

// ✅ Configuración específica para Render + NeonDB
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    // Timeouts más largos para Render
    connectionTimeoutMillis: 30000, // 30 segundos
    idleTimeoutMillis: 30000,
    // Permitir hasta 20 conexiones simultáneas
    max: 20,
    // Mantener conexiones vivas
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
});

// Evento cuando se conecta
pool.on('connect', () => {
    console.log('✅ Conectado a NeonDB');
});

// Evento cuando hay error
pool.on('error', (err) => {
    console.error('❌ Error en pool de NeonDB:', err.message);
});

// Intentar conexión inicial
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a NeonDB:');
        console.error('Mensaje:', err.message);
        console.error('Código:', err.code);
        
        // Sugerencias según el error
        if (err.message.includes('timeout')) {
            console.log('⏱️  Timeout - Posibles soluciones:');
        }
    } else {
        console.log('✅ Conectado exitosamente a NeonDB');
        release();
    }
});

export async function query(text: string, params?: any[]) {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.error('❌ Error en query:', error);
        throw error;
    }
}

export { pool };