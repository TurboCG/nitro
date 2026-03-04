import { Router } from 'express';
import bcrypt from 'bcrypt'; // o bcrypt
import jwt from 'jsonwebtoken';
import { query } from '../db/connections';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { dniEmail, password } = req.body;
        
        console.log('🔐 Intento de login:', { dniEmail, password: '***' });
        
        if (!dniEmail || !password) {
            console.log('❌ Faltan credenciales');
            return res.status(400).json({
                success: false,
                error: 'DNI/Email y contraseña requeridos'
            });
        }

        // Buscar usuario
        const result = await query(
            'SELECT * FROM usuarios WHERE email = $1 OR dni = $1',
            [dniEmail]
        );

        const user = result.rows[0];
        console.log('👤 Usuario encontrado:', user ? {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            tienePassword: !!user.password
        } : 'No encontrado');

        if (!user) {
            console.log('❌ Usuario no existe');
            return res.status(401).json({
                success: false,
                error: 'DNI/Email o contraseña incorrectos'
            });
        }

        // Verificar contraseña
        console.log('🔑 Verificando contraseña...');
        const passwordValid = await bcrypt.compare(password, user.password);
        console.log('🔑 Contraseña válida?:', passwordValid);

        if (!passwordValid) {
            console.log('❌ Contraseña incorrecta');
            return res.status(401).json({
                success: false,
                error: 'DNI/Email o contraseña incorrectos'
            });
        }

        // Generar token
        const token = jwt.sign(
            { 
                usuarioId: user.id,
                email: user.email,
                nombre: user.nombre
            },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );
        console.log('🎟️ Token generado');

        // Quitar password de la respuesta
        const { password: _, ...userWithoutPassword } = user;

        console.log('✅ Login exitoso para:', user.email);
        
        res.json({
            success: true,
            user: userWithoutPassword,
            token,
            message: `Bienvenido ${user.nombre}`
        });

    } catch (error) {
        console.error('💥 Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        console.log('📝 Intento de registro:', req.body);
        
        const { nombre, apellido, email, dni, password } = req.body;

        // Validaciones básicas
        if (!nombre || !email || !password) {
            console.log('❌ Faltan campos requeridos');
            return res.status(400).json({ 
                success: false, 
                error: 'Todos los campos son requeridos' 
            });
        }

        // Verificar si el email ya existe
        const existingUser = await query(
            'SELECT id FROM usuarios WHERE email = $1 OR dni = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log('❌ Email ya registrado:', email);
            return res.status(400).json({ 
                success: false, 
                error: 'El email ya está registrado' 
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔑 Hash generado');

        // Insertar usuario
        const result = await query(
            `INSERT INTO usuarios (nombre, apellido, dni, email, password) 
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, nombre, apellido, dni, email`,
            [nombre, apellido || null, dni || null, email, hashedPassword]
        );

        const newUser = result.rows[0];
        console.log('✅ Usuario creado:', newUser.email);

        res.status(201).json({
            success: true,
            user: newUser,
            message: 'Usuario creado correctamente'
        });

    } catch (error) {
        console.error('💥 Error en registro:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
});


export default router;