from flask import Flask, jsonify, send_from_directory
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_cors import CORS
from flask_session import Session
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flasgger import Swagger
from core import ApplicationConfig, UserRole, BrandingConfig
from models import db, ma, User
from utils.email import mail
from dotenv import load_dotenv
import os, logging, time
from routes import admin_bp, auth_bp, user_bp
from sqlalchemy import text
from middleware import metrics_collector, monitor_request, record_request_metrics, get_uptime

# CONSTANTS
load_dotenv()
ADMIN_MAIL = open("/run/secrets/ADMIN_MAIL").read().strip() if os.path.exists("/run/secrets/ADMIN_MAIL") else os.getenv('ADMIN_MAIL')
ADMIN_PASSWORD = open("/run/secrets/ADMIN_PASSWORD").read().strip() if os.path.exists("/run/secrets/ADMIN_PASSWORD") else os.getenv('ADMIN_PASSWORD')
FRONTEND_URL = os.getenv('FRONTEND_URL')

# Config App
app = Flask(__name__)
app.config.from_object(ApplicationConfig)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
CORS(app, origins=FRONTEND_URL, supports_credentials=True)
bcrypt = Bcrypt()
bcrypt.init_app(app)
server_session = Session(app)
csrf = CSRFProtect(app)
mail.init_app(app)

# Rate Limiter
limiter = Limiter(
  get_remote_address,
  app=app,
  default_limits=["100 per minute"],
  storage_uri="redis://redis:6379",
  enabled=app.config.get('RATELIMIT_ENABLED', True)
)

# Config logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.FileHandler("app.log"),logging.StreamHandler()]
)

# Track application start time for uptime monitoring
APP_START_TIME = time.time()

# Config BDD
db.init_app(app)
ma.init_app(app)
migrate = Migrate(app, db)

# Swagger API Documentation
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api/docs"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": BrandingConfig.API_TITLE,
        "description": BrandingConfig.API_DESCRIPTION,
        "version": BrandingConfig.API_VERSION,
        "contact": {
            "name": BrandingConfig.CONTACT_NAME,
            "url": BrandingConfig.CONTACT_URL,
            "email": BrandingConfig.CONTACT_EMAIL
        }
    },
    "host": os.environ.get("API_HOST", "localhost:5000"),
    "basePath": "/",
    "schemes": ["http", "https"],
    "securityDefinitions": {
        "SessionAuth": {
            "type": "apiKey",
            "name": "session",
            "in": "cookie",
            "description": "Session-based authentication using Flask-Session"
        },
        "CSRF": {
            "type": "apiKey",
            "name": "X-CSRFToken",
            "in": "header",
            "description": "CSRF token for state-changing requests"
        }
    }
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

# Register Blueprints
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)

# Security Headers - Protect against XSS, clickjacking, MIME sniffing, etc.
@app.after_request
def add_security_headers(response):
    """Add HTTP security headers to all responses"""
    # Content Security Policy - Prevent XSS attacks
    # Allow 'self', data: URIs, and popular CDNs for fonts and assets
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' localhost:5000; frame-ancestors 'self'"
    
    # Prevent MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Prevent clickjacking attacks
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    
    # Legacy XSS protection header for older browsers
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Referrer Policy - Control what referrer info is sent
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Permissions Policy - Disable browser features
    response.headers['Permissions-Policy'] = 'geolocation=(), camera=(), microphone=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()'
    
    # HSTS (HTTP Strict Transport Security) - Force HTTPS in production
    if app.config.get('FORCE_HTTPS', False):
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    
    return response

# Register monitoring middleware
@app.before_request
def before_request():
    monitor_request()

@app.after_request
def after_request(response):
    return record_request_metrics(response)

@app.route('/api/get_csrf_token', methods=['GET'])
def get_csrf_token():
    """
    Get CSRF Token
    ---
    tags:
      - Authentication
    responses:
      200:
        description: CSRF token generated successfully
        schema:
          type: object
          properties:
            csrf_token:
              type: string
              description: CSRF token for secure requests
    """
    token = generate_csrf()
    return jsonify({'csrf_token': token})

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health Check
    ---
    tags:
      - Monitoring
    responses:
      200:
        description: Application is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: healthy
            database:
              type: string
              example: connected
            redis:
              type: string
              example: connected
            uptime:
              type: object
              properties:
                seconds:
                  type: number
                formatted:
                  type: string
      503:
        description: Application is unhealthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: unhealthy
            error:
              type: string
    """
    try:
        # Check database connection
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'redis': 'connected',
            'uptime': get_uptime(APP_START_TIME)
        }), 200
    except Exception as e:
        logging.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 503

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """
    Application Metrics
    ---
    tags:
      - Monitoring
    responses:
      200:
        description: Application and system metrics
        schema:
          type: object
          properties:
            status:
              type: string
              example: success
            timestamp:
              type: string
              format: date-time
            uptime:
              type: object
            application:
              type: object
              properties:
                requests:
                  type: object
                performance:
                  type: object
                endpoints:
                  type: object
            system:
              type: object
              properties:
                cpu:
                  type: object
                memory:
                  type: object
                disk:
                  type: object
    """
    try:
        app_metrics = metrics_collector.get_metrics()
        system_metrics = metrics_collector.get_system_metrics()
        
        return jsonify({
            'status': 'success',
            'timestamp': time.time(),
            'uptime': get_uptime(APP_START_TIME),
            'application': app_metrics,
            'system': system_metrics
        }), 200
    except Exception as e:
        logging.error(f"Error retrieving metrics: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

def wait_for_db(max_retries=30, delay=2):
    """Wait for database to be ready with exponential backoff"""
    retries = 0
    while retries < max_retries:
        try:
            with app.app_context():
                # Try to execute a simple query
                db.session.execute(text('SELECT 1'))
                logging.info("Database connection established successfully")
                return True
        except Exception as e:
            retries += 1
            wait_time = delay * (1.5 ** (retries - 1))  # Exponential backoff
            logging.warning(f"Database connection attempt {retries}/{max_retries} failed: {e}")
            if retries < max_retries:
                logging.info(f"Retrying in {wait_time:.1f} seconds...")
                time.sleep(wait_time)
            else:
                logging.error("Max retries reached. Could not connect to database.")
                return False
    return False

# Wait for database to be ready
if wait_for_db():
    with app.app_context():
        db.create_all()
        # Create admin user if not exists
        try:
            table_empty = User.query.filter_by(email=ADMIN_MAIL).first() is None

            if table_empty:
                hashed_admin_password = bcrypt.generate_password_hash(ADMIN_PASSWORD).decode('utf-8')
                admin_user = User(first_name='Admin',last_name='Admin',email=ADMIN_MAIL,password=hashed_admin_password,role=UserRole.ADMIN)
                db.session.add(admin_user)
                db.session.commit()
                logging.info("Admin user created successfully")
        except Exception as e:
            logging.warning(f"Could not check/create admin user (run migrations): {e}")
else:
    logging.error("Failed to initialize database. Exiting...")
    exit(1)


# Serve uploaded files (avatars, documents)
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """
    Serve uploaded files
    ---
    tags:
      - Static Files
    parameters:
      - name: filename
        in: path
        type: string
        required: true
        description: Relative path to uploaded file
    responses:
      200:
        description: File served successfully
      404:
        description: File not found
    """
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    return send_from_directory(upload_folder, filename)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)