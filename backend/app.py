from flask import Flask, request, jsonify, session, redirect, url_for
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
from flask_marshmallow import Marshmallow
from config import ApplicationConfig
from models import db, ma, User, UserSchema
from dotenv import load_dotenv
from functools import wraps
import os

# Constantes
ADMIN_MAIL = os.getenv('ADMIN_MAIL')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')

# Config App
app = Flask(__name__)
app.config.from_object(ApplicationConfig)
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)
server_session = Session(app)

# Config BDD
db.init_app(app)
ma.init_app(app)

with app.app_context():
    db.create_all()
    # Créer le 1er admin si la table users est vide.
    table_empty = User.query.filter_by(email=ADMIN_MAIL).first() is None

    if table_empty:
        hashed_admin_password = bcrypt.generate_password_hash(ADMIN_PASSWORD)
        admin_user = User(first_name='Admin',last_name='Admin',email=ADMIN_MAIL,password=hashed_admin_password,role='Administrateur')
        db.session.add(admin_user)
        db.session.commit()
        
### ADMIN ROUTES ###
# Admin role required decorator           
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        
        user = User.query.filter_by(id=user_id).first()
        if user.role != 'Administrateur':
            return jsonify({"error": "Forbidden"}), 403
        
        return f(*args, **kwargs)
    return decorated_function

# Get all users info route
@app.route("/@all", methods=['GET'])
@admin_required
def get_all_users():
    users = User.query.all()
    user_schema = UserSchema(many=True)
    user_data = user_schema.dump(users)
    return jsonify(data=user_data)

# Add new user route
@app.route("/add-user", methods=["POST"])
@admin_required
def add_user():
    email = request.json["email"]
    first_name = request.json["first_name"]
    last_name = request.json["last_name"]
    password = request.json["password"]
    role = request.json["role"]
    
    # Vérification si le nom d'utilisateur existe déjà.
    user_already_exists = User.query.filter_by(email=email).first() is not None

    if user_already_exists:
        return jsonify({"error": "User already exists"})
    
    # Création du nouvel utilisateur du mot de passe.
    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email,first_name=first_name,last_name=last_name,password=hashed_password,role=role)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        "id": new_user.id
    })

# Modify user route
@app.route("/modify-user/<user_id>", methods=['POST'])
@admin_required
def modify_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    new_email = request.json["email"]
    new_first_name = request.json["first_name"]
    new_last_name = request.json["last_name"]
    new_password = request.json.get("password")
    new_role = request.json["role"]
    
    if new_email != user.email: 
        email_already_exists = User.query.filter_by(email=new_email).first() is not None
        if email_already_exists:
            return jsonify({"error": "Email already exists"})
    
    user.email = new_email
    user.first_name = new_first_name
    user.last_name = new_last_name
    user.role = new_role
    
    if new_password:
        new_hashed_password = bcrypt.generate_password_hash(new_password)
        user.password = new_hashed_password
    
    db.session.commit()
    
    return jsonify({
        "id": user.id
    })
    
# Delete user route
@app.route("/delete-user/<user_id>", methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    User.query.filter_by(id=user_id).delete()
    db.session.commit()
    
    return jsonify({
        "200": "User successfully deleted."
    })

### User routes ###

# Get user info route
@app.route('/user-info/<user_id>', methods=['POST'])
def get_user_info(user_id):
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role
    })

# Get current user info
@app.route("/@me", methods=['GET'])
def get_current_user():
    user_id = session.get("user_id")
    
    if not user_id:
        return jsonify({"error": "Not connected"})
    
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role
    })

# Home route
@app.route("/")
def home():
    return {}    

# Signup route
@app.route("/register", methods=["POST"])
def register():
    email = request.json["email"]
    first_name = request.json["first_name"]
    last_name = request.json["last_name"]
    password = request.json["password"]
    
    # Vérification si le nom d'utilisateur existe déjà.
    user_already_exists = User.query.filter_by(email=email).first() is not None

    if user_already_exists:
        return jsonify({"error": "User already exists"})
    
    # Création du nouvel utilisateur du mot de passe.
    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email,first_name=first_name,last_name=last_name,password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    session["user_id"] = new_user.id
    
    return jsonify({
        "id": new_user.id
    })

# Login route
@app.route("/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]
    
    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Unauthorized"}), 401
    
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
    
    session["user_id"] = user.id
    
    return jsonify({
        "id": user.id,
        "email": user.email
    })

# Logout route
@app.route("/logout", methods=['POST'])
def logout():
    if session['user_id']:
        session.pop('user_id')
        return "200"
    return jsonify({"error": "No sessions found"}), 500

if __name__ == "__main__":
    app.run(debug=True)