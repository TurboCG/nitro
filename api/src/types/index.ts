// Equivalentes a los modelos implícitos de Python
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string | null;
  dni: string | null;
  email: string;
  password?: string; // Solo para backend
}

export interface Auto {
  id: number;
  usuario_id: number;
  patente: string;
  marca: string;
  modelo: string;
  kilometraje: number;
  ano: number;
  problema: string;
  estado: 'pendiente' | 'en reparacion' | 'terminado' | 'entregado';
  fecha_ingreso: string;
}

export interface LoginRequest {
  dniEmail: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido?: string;
  email: string;
  dni?: string;
  password: string;
}