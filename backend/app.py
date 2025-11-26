from flask import Flask, request, jsonify, session, redirect, url_for
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_cors import CORS
from flask_session import Session
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import ApplicationConfig
from models import db, ma, User, UserSchema
from constants import UserRole
from dotenv import load_dotenv
from functools import wraps
import os, logging, time
from routes.admin import admin_bp
from routes.auth import auth_bp
from sqlalchemy import text
from monitoring import metrics_collector, monitor_request, record_request_metrics, get_uptime

# CONSTANTS
load_dotenv()
ADMIN_MAIL = open("/run/secrets/ADMIN_MAIL").read() if os.path.exists("/run/secrets/ADMIN_MAIL") else os.getenv('ADMIN_MAIL')
ADMIN_PASSWORD = open("/run/secrets/ADMIN_PASSWORD").read() if os.path.exists("/run/secrets/ADMIN_PASSWORD") else os.getenv('ADMIN_PASSWORD')

# Config App
app = Flask(__name__)
app.config.from_object(ApplicationConfig)
CORS(app, origins=os.environ.get("FRONTEND_URL"), supports_credentials=True)
bcrypt = Bcrypt()
bcrypt.init_app(app)
server_session = Session(app)
csrf = CSRFProtect(app)

# Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per minute"],
    storage_uri="redis://redis:6379"
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

# Register Blueprints
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)

# Register monitoring middleware
@app.before_request
def before_request():
    monitor_request()

@app.after_request
def after_request(response):
    return record_request_metrics(response)

@app.route('/get_csrf_token', methods=['GET'])
def get_csrf_token():
    token = generate_csrf()
    return jsonify({'csrf_token': token})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
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

@app.route('/metrics', methods=['GET'])
def get_metrics():
    """Get application metrics"""
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
        table_empty = User.query.filter_by(email=ADMIN_MAIL).first() is None

        if table_empty:
            hashed_admin_password = bcrypt.generate_password_hash(ADMIN_PASSWORD).decode('utf-8')
            admin_user = User(first_name='Admin',last_name='Admin',email=ADMIN_MAIL,password=hashed_admin_password,role=UserRole.ADMIN)
            db.session.add(admin_user)
            db.session.commit()
            logging.info("Admin user created successfully")
else:
    logging.error("Failed to initialize database. Exiting...")
    exit(1)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)