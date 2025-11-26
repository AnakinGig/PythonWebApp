from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, User, UserSchema
from utils import validate_user_fields, sanitize_input
from constants import UserRole, ErrorMessages, SuccessMessages, RateLimits
import logging

# Create a Blueprint for authentication-related routes
auth_bp = Blueprint('auth_bp', __name__)

bcrypt = Bcrypt()

# Get current user info
@auth_bp.route("/@me", methods=['GET'])
def get_current_user():
    user_id = session.get("user_id")
    
    if not user_id:
        return jsonify({"user": None}), 401
    
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"user": None}), 401
    
    user_schema = UserSchema()
    return user_schema.jsonify(user)

# Register route
@auth_bp.route("/register", methods=["POST"])
def register():
    # Rate limiting handled by decorator in app.py
    from app import limiter
    limiter.limit(RateLimits.REGISTER)(lambda: None)()
    
    email = sanitize_input(request.json["email"])
    first_name = sanitize_input(request.json["first_name"])
    last_name = sanitize_input(request.json["last_name"])
    password = request.json["password"]  # Don't sanitize passwords
    
    user_already_exists = User.query.filter_by(email=email).first() is not None

    if user_already_exists:
        return jsonify({"error": ErrorMessages.USER_EXISTS}), 409
    
    error = validate_user_fields(email, first_name, last_name, password, role=None)
    if error:
        return jsonify({"error": error}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email,first_name=first_name,last_name=last_name,password=hashed_password,role=UserRole.USER)
    db.session.add(new_user)
    db.session.commit()
    logging.info(f"Nouvel utilisateur enregistré: {new_user.email} (id: {new_user.id})")
    
    session["user_id"] = new_user.id
    
    user_schema = UserSchema()
    return user_schema.jsonify(new_user)

# Login route
@auth_bp.route("/login", methods=["POST"])
def login_user():
    # Rate limiting handled by decorator in app.py
    from app import limiter
    limiter.limit(RateLimits.LOGIN)(lambda: None)()
    
    email = sanitize_input(request.json["email"])
    password = request.json["password"]  # Don't sanitize passwords
    
    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": ErrorMessages.INVALID_EMAIL}), 401
    
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": ErrorMessages.INVALID_PASSWORD}), 401
    
    session["user_id"] = user.id
    
    user_schema = UserSchema()
    return user_schema.jsonify(user)

# Logout route
@auth_bp.route("/logout", methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": SuccessMessages.LOGGED_OUT}), 200
