import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// En tu código Python no tenías JWT, esto es una mejora de seguridad
export interface AuthRequest extends Request {
  usuarioId?: number;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { usuarioId: number };
    req.usuarioId = decoded.usuarioId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};