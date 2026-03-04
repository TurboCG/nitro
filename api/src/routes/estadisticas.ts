import { Router } from 'express';
import { query } from '../db/connections';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(verifyToken);

// GET /api/estadisticas/:usuario_id
router.get('/:usuario_id', async (req: AuthRequest, res) => {
  try {
    const usuarioId = req.params.usuario_id;

    // Total de autos
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM autos WHERE usuario_id = $1',
      [usuarioId]
    );

    // Autos por estado
    const estadosResult = await query(
      `SELECT estado, COUNT(*) as cantidad 
       FROM autos 
       WHERE usuario_id = $1 
       GROUP BY estado`,
      [usuarioId]
    );

    // Autos este mes
    const mesActualResult = await query(
      `SELECT COUNT(*) as cantidad 
       FROM autos 
       WHERE usuario_id = $1 
       AND EXTRACT(MONTH FROM fecha_ingreso) = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [usuarioId]
    );

    res.json({
      total_autos: parseInt(totalResult.rows[0]?.total || '0'),
      por_estado: estadosResult.rows,
      autos_este_mes: parseInt(mesActualResult.rows[0]?.cantidad || '0')
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;