import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Configuración específica para NeonDB
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para NeonDB
    },
    // Timeouts para evitar esperas innecesarias
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});

// Función helper con mejor logging
export async function query(text: string, params?: any[]) {
    const start = Date.now();
    try {
        console.log('📤 Ejecutando query:', { text, params });
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📥 Query completada:', { 
            rows: res.rowCount, 
            duration: `${duration}ms` 
        });
        return res;
    } catch (error) {
        console.error('❌ Error en query:', {
            text,
            params,
            error: error instanceof Error ? error.message : error
        });
        throw error;
    }
}

// Para depuración: probar conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a NeonDB:', err.message);
        console.log('📌 Verifica que DATABASE_URL en .env sea correcta');
    } else {
        console.log('✅ Conectado exitosamente a NeonDB');
        release();
    }
});

export { pool };