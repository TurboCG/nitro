import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// ✅ Importar las rutas correctamente
import authRoutes from './routes/auth';
import autosRoutes from './routes/autos';
import estadisticasRoutes from './routes/estadisticas';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    'https://nitro-f68k.onrender.com',  // Sin barra al final
    'https://nitro-api-0hw3.onrender.com', // Si es necesario
    'http://localhost:5000'
];
// Middlewares
app.use(cors({
    origin: 'https://nitro-f68k.onrender.com', // Sin barra al final
    credentials: true
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true
}));
app.use(express.json());

// Servir frontend
const publicPath = path.join(__dirname, '../../public');
console.log('📁 Sirviendo frontend desde:', publicPath);
app.use(express.static(publicPath));

// ✅ Usar las rutas importadas directamente
app.use('/api', authRoutes);
app.use('/api/autos', autosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// Catch-all para frontend
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(publicPath, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});