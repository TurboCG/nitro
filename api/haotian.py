import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import psycopg
from psycopg.extras import RealDictCursor
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'clave-secreta-para-taller')  # Cambiar en producción
CORS(app, origins=['https://nitro-f68k.onrender.com/', "https://nitro-api-0hw3.onrender.com/"])

# Configuración de la base de datos (NeonDB)
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    """Conectar a NeonDB con psycopg 3.x"""
    try:
        conn = psycopg.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Error conectando a DB: {e}")
        return None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "API del Taller Mecánico funcionando! 🚗",
        "status": "online",
        "database": "conectada a NeonDB"
    })

@app.route('/api/login', methods=['POST'])
def login():
    """Login de mecánicos"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"success": False, "error": "Email y contraseña requeridos"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"success": False, "error": "Error de conexión a DB"}), 500
        
        # En psycopg 3, usamos row_factory para obtener diccionarios
        cur = conn.cursor(row_factory=dict_row)
        cur.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        user = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if user and check_password_hash(user['password'], password):
            # No enviar la contraseña
            del user['password']
            return jsonify({
                "success": True,
                "user": user,
                "message": f"Bienvenido {user['nombre']}"
            })
        else:
            return jsonify({
                "success": False, 
                "error": "Email o contraseña incorrectos"
            }), 401
            
    except Exception as e:
        logger.error(f"Error en login: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/autos', methods=['GET'])
def get_autos():
    """Obtener autos de un mecánico"""
    try:
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            return jsonify({"error": "Se requiere usuario_id"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión"}), 500
        
        cur = conn.cursor(row_factory=dict_row)
        cur.execute("""
            SELECT * FROM autos 
            WHERE usuario_id = %s 
            ORDER BY fecha_ingreso DESC
        """, (usuario_id,))
        autos = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Formatear fechas para JSON
        for auto in autos:
            if auto['fecha_ingreso']:
                auto['fecha_ingreso'] = auto['fecha_ingreso'].isoformat()
        
        return jsonify(autos)
        
    except Exception as e:
        logger.error(f"Error obteniendo autos: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/autos', methods=['POST'])
def crear_auto():
    """Agregar nuevo auto al taller"""
    try:
        data = request.json
        required_fields = ['usuario_id', 'patente', 'marca', 'modelo', 'año', 'problema']
        
        # Verificar campos requeridos
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Falta campo: {field}"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión"}), 500
        
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO autos 
            (usuario_id, patente, marca, modelo, año, problema, estado) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data['usuario_id'],
            data['patente'].upper(),
            data['marca'],
            data['modelo'],
            data['año'],
            data['problema'],
            data.get('estado', 'pendiente')
        ))
        
        auto_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "id": auto_id,
            "message": "Auto agregado correctamente"
        }), 201
        
    except Exception as e:
        logger.error(f"Error creando auto: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/autos/<int:auto_id>', methods=['PUT'])
def update_auto(auto_id):
    """Actualizar datos de un auto"""
    try:
        data = request.json
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión"}), 500
        
        cur = conn.cursor()
        cur.execute("""
            UPDATE autos 
            SET patente=%s, marca=%s, modelo=%s, año=%s, problema=%s, estado=%s
            WHERE id=%s AND usuario_id=%s
        """, (
            data['patente'].upper(),
            data['marca'],
            data['modelo'],
            data['año'],
            data['problema'],
            data.get('estado', 'pendiente'),
            auto_id,
            data['usuario_id']
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Auto actualizado"})
        
    except Exception as e:
        logger.error(f"Error actualizando auto: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/autos/<int:auto_id>', methods=['DELETE'])
def delete_auto(auto_id):
    """Eliminar un auto"""
    try:
        usuario_id = request.args.get('usuario_id')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión"}), 500
        
        cur = conn.cursor()
        cur.execute("DELETE FROM autos WHERE id=%s AND usuario_id=%s", 
                   (auto_id, usuario_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Auto eliminado"})
        
    except Exception as e:
        logger.error(f"Error eliminando auto: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    """Registrar nuevo mecánico"""
    try:
        data = request.json
        nombre = data.get('nombre')
        email = data.get('email')
        password = data.get('password')
        
        if not all([nombre, email, password]):
            return jsonify({"error": "Todos los campos son requeridos"}), 400
        
        # Hashear contraseña
        hashed_password = generate_password_hash(password)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión"}), 500
        
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO usuarios (nombre, email, password) 
                VALUES (%s, %s, %s)
                RETURNING id, nombre, email
            """, (nombre, email, hashed_password))
            
            new_user = cur.fetchone()
            conn.commit()
            
            return jsonify({
                "success": True,
                "user": {"id": new_user[0], "nombre": new_user[1], "email": new_user[2]},
                "message": "Usuario creado correctamente"
            }), 201
            
        except psycopg.errors.UniqueViolation:  # 👈 Cambio aquí
            return jsonify({"error": "El email ya está registrado"}), 400
        finally:
            cur.close()
            conn.close()
        
    except Exception as e:
        logger.error(f"Error registrando usuario: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/estadisticas/<int:usuario_id>', methods=['GET'])
def get_estadisticas(usuario_id):
    """Estadísticas del taller"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión"}), 500
        
        cur = conn.cursor(row_factory=dict_row)
        
        # Total de autos
        cur.execute("SELECT COUNT(*) as total FROM autos WHERE usuario_id = %s", (usuario_id,))
        total = cur.fetchone()
        
        # Autos por estado
        cur.execute("""
            SELECT estado, COUNT(*) as cantidad 
            FROM autos 
            WHERE usuario_id = %s 
            GROUP BY estado
        """, (usuario_id,))
        estados = cur.fetchall()
        
        # Autos este mes
        cur.execute("""
            SELECT COUNT(*) as cantidad 
            FROM autos 
            WHERE usuario_id = %s 
            AND EXTRACT(MONTH FROM fecha_ingreso) = EXTRACT(MONTH FROM CURRENT_DATE)
        """, (usuario_id,))
        mes_actual = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return jsonify({
            "total_autos": total['total'] if total else 0,
            "por_estado": estados,
            "autos_este_mes": mes_actual['cantidad'] if mes_actual else 0
        })
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)