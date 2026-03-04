import { Router } from 'express';
import { query } from '../db/connections';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(verifyToken);

// PUT /api/autos/:id
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const autoId = req.params.id;
    const { patente, marca, modelo, año, problema, estado, usuario_id } = req.body;

    const result = await query(
      `UPDATE autos 
       SET patente=$1, marca=$2, modelo=$3, ano=$4, problema=$5, estado=$6
       WHERE id=$7 AND usuario_id=$8
       RETURNING id`,
      [
        patente.toUpperCase(),
        marca,
        modelo,
        año,
        problema,
        estado || 'pendiente',
        autoId,
        usuario_id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    res.json({ success: true, message: 'Auto actualizado' });
  } catch (error) {
    console.error('Error actualizando auto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/autos/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const autoId = req.params.id;
    const usuarioId = req.query.usuario_id;

    const result = await query(
      'DELETE FROM autos WHERE id=$1 AND usuario_id=$2',
      [autoId, usuarioId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    res.json({ success: true, message: 'Auto eliminado' });
  } catch (error) {
    console.error('Error eliminando auto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;