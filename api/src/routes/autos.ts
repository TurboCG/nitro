import { Router } from 'express';
import { query } from '../db/connections';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Todas las rutas de autos requieren autenticación
router.use(verifyToken);

// GET /api/autos - Obtener autos de un mecánico
router.get('/', async (req: AuthRequest, res) => {
  try {
    const usuarioId = req.query.usuario_id || req.usuarioId;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'Se requiere usuario_id' });
    }

    const result = await query(
      'SELECT * FROM autos WHERE usuario_id = $1 ORDER BY fecha_ingreso DESC',
      [usuarioId]
    );

    const autos = result.rows.map(auto => ({
      ...auto,
      fecha_ingreso: auto.fecha_ingreso?.toISOString()
    }));

    res.json(autos);
  } catch (error) {
    console.error('Error obteniendo autos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/autos - Crear nuevo auto
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { usuario_id, patente, marca, modelo, kilometraje, ano, problema, fecha_ingreso } = req.body;
    
    // Validar campos requeridos
    const requiredFields = ['usuario_id', 'patente', 'marca', 'modelo', 'kilometraje', 'ano', 'problema', 'fecha_ingreso'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `Falta campo: ${field}` });
      }
    }

    const result = await query(
      `INSERT INTO autos 
       (usuario_id, patente, marca, modelo, kilometraje, ano, problema, estado, fecha_ingreso) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        usuario_id,
        patente.toUpperCase(),
        marca,
        modelo,
        kilometraje,
        ano,
        problema,
        req.body.estado || 'pendiente',
        fecha_ingreso
      ]
    );

    res.status(201).json({
      success: true,
      id: result.rows[0].id,
      message: 'Auto agregado correctamente'
    });
  } catch (error) {
    console.error('Error creando auto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;