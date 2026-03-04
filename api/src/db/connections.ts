import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔌 Configurando conexión a NeonDB...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
});

pool.on('connect', () => {
    console.log('✅ Conectado a NeonDB');
});

pool.on('error', (err) => {
    console.error('❌ Error en pool de NeonDB:', err.message);
});

// ✅ CORREGIDO: Usar los tipos correctos
pool.connect((err: Error | undefined, client, release) => {
    if (err) {
        console.error('❌ Error conectando a NeonDB:', err.message);
        
        if (err.message.includes('timeout')) {
            console.log('⏱️  Timeout - Posibles soluciones:');
            console.log('   1. En Render, agrega variable: PGSSLMODE=require');
            console.log('   2. En Neon Dashboard → Settings → IP Allow:');
            console.log('      Agrega "0.0.0.0/0" (temporal)');
            console.log('   3. Verifica que la URL de DATABASE_URL es correcta');
        }
    } else if (client) {
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