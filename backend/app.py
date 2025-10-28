from flask import Flask, request, jsonify, session, redirect, url_for
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_cors import CORS
from flask_session import Session
from flask_marshmallow import Marshmallow
from config import ApplicationConfig
from models import db, ma, User, UserSchema
from dotenv import load_dotenv
from functools import wraps
import os, logging
from routes.admin import admin_bp
from routes.auth import auth_bp

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

# Config logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.FileHandler("app.log"),logging.StreamHandler()]
)

# Config BDD
db.init_app(app)
ma.init_app(app)

# Register Blueprints
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)

@app.route('/get_csrf_token', methods=['GET'])
def get_csrf_token():
    token = generate_csrf()
    return jsonify({'csrf_token': token})

with app.app_context():
    db.create_all()
    # Créer le 1er admin si la table users est vide.
    table_empty = User.query.filter_by(email=ADMIN_MAIL).first() is None

    if table_empty:
        hashed_admin_password = bcrypt.generate_password_hash(ADMIN_PASSWORD)
        admin_user = User(first_name='Admin',last_name='Admin',email=ADMIN_MAIL,password=hashed_admin_password,role='Administrateur')
        db.session.add(admin_user)
        db.session.commit()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)