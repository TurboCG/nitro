import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import psycopg
from psycopg.rows import dict_row
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
import logging
from flask_jwt_extended import create_access_token, JWTManager, get_jwt_identity, jwt_required
from datetime import timedelta
import datetime
# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'g*(3)e4m%7h*waro0(hr9f_(ys$pzy*ju&3&=9mti#8_k47b6_')  # Cambiar en producción
CORS(app, origins=['https://nitro-f68k.onrender.com'], supports_credentials=True, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'])
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-cambiar-en-produccion')
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = True  # Solo HTTPS
app.config['JWT_COOKIE_HTTPONLY'] = True  # No accesible desde JS
app.config['JWT_COOKIE_SAMESITE'] = 'Lax'  # Protección CSRF básica
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)  # Sesión de 8 horas
app.config['JWT_COOKIE_DOMAIN'] = None  # Ajusta si usas subdom
jwt = JWTManager(app)
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
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'preflight'})
        response.headers.add('Access-Control-Allow-Origin', 'https://nitro-f68k.onrender.com')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Max-Age', '3600')
        return response, 200
    
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "API del Taller Mecánico funcionando! 🚗",
        "status": "online",
        "database": "conectada a NeonDB"
    })

@app.route('/api/login', methods=['POST'])
@app.route('/api/login', methods=['POST'])
def login():
    """Login de mecánicos con cookie HttpOnly y Secure"""
    try:
        data = request.json
        print("📥 Datos recibidos en API:", data)
        
        dniEmail = data.get('dniEmail')
        password = data.get('password')
        
        if not dniEmail or not password:
            return jsonify({
                "success": False, 
                "error": "DNI/Email y contraseña requeridos"
            }), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"success": False, "error": "Error de conexión a DB"}), 500
        
        cur = conn.cursor(row_factory=dict_row)
        cur.execute("""
            SELECT * FROM usuarios 
            WHERE email = %s OR dni = %s
        """, (dniEmail, dniEmail))
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if user and check_password_hash(user['password'], password):
            # Crear token JWT con información del usuario
            access_token = create_access_token(
                identity=str(user['id']),
                additional_claims={
                    'nombre': user['nombre'],
                    'email': user['email'],
                    'dni': user['dni']
                }
            )
            
            # No enviar la contraseña
            del user['password']
            
            # Crear respuesta
            response = jsonify({
                "success": True,
                "user": user,
                "message": f"Bienvenido {user['nombre']}"
            })
            
            # Establecer cookie HttpOnly y Secure
            response.set_cookie(
                'access_token_cookie',
                value=access_token,
                httponly=True,
                secure=True,  # Solo HTTPS
                samesite='Lax',
                max_age=28800,  # 8 horas en segundos
                path='/'
            )
            
            return response
        else:
            return jsonify({
                "success": False, 
                "error": "DNI/Email o contraseña incorrectos"
            }), 401
            
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/api/verify-session', methods=['GET'])
@jwt_required()
def verify_session():
    """Verificar si la sesión es válida"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión"}), 500
        
        cur = conn.cursor(row_factory=dict_row)
        cur.execute("SELECT id, nombre, email, dni FROM usuarios WHERE id = %s", (user_id,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if user:
            return jsonify({
                "success": True,
                "user": user
            })
        else:
            return jsonify({"success": False, "error": "Usuario no encontrado"}), 401
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Cerrar sesión eliminando la cookie"""
    response = jsonify({"success": True, "message": "Sesión cerrada"})
    response.delete_cookie('access_token_cookie', path='/', secure=True, httponly=True, samesite='Lax')
    return response


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
        required_fields = ['usuario_id', 'patente', 'marca', 'modelo', 'kilometraje', 'ano', 'problema', 'fecha_ingreso']
        
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
            (usuario_id, patente, marca, modelo, kilometraje, ano, problema, estado, fecha_ingreso) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data['usuario_id'],
            data['patente'].upper(),
            data['marca'],
            data['modelo'],
            data['kilometraje'],
            data['ano'],
            data['problema'],
            data.get('estado', 'pendiente'),
            data['fecha_ingreso']
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
            SET patente=%s, marca=%s, modelo=%s, ano=%s, problema=%s, estado=%s
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
        apellido = data.get('apellido')
        email = data.get('email')
        dni = data.get('dni')
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
                INSERT INTO usuarios (nombre, apellido, dni, email, password) 
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, nombre, apellido, dni, email
            """, (nombre, apellido, dni, email, hashed_password))
            
            new_user = cur.fetchone()
            conn.commit()
            
            return jsonify({
                "success": True,
                "user": {"id": new_user[0], "nombre": new_user[1], "apellido": new_user[2], "dni": new_user[3], "email": new_user[4],},
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
def get_estadisticas():
    try:
        usuario_id = get_jwt_identity()
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión"}), 500
        cur = conn.cursor(row_factory=dict_row)
        cur.execute("SELECT COUNT(*) as total FROM autos WHERE usuario_id = %s", (usuario_id,))
        total = cur.fetchone()
        cur.execute("""
            SELECT estado, COUNT(*) as cantidad 
            FROM autos 
            WHERE usuario_id = %s 
            GROUP BY estado
        """, (usuario_id,))
        estados = cur.fetchall()
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