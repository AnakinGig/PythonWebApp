from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, User, UserSchema
from utils import validate_user_fields, sanitize_input
from constants import UserRole, ErrorMessages, SuccessMessages, RateLimits
from api_response import success_response, error_response
from activity_logger import log_activity_with_details
import logging

# Create a Blueprint for authentication-related routes
auth_bp = Blueprint('auth_bp', __name__)

bcrypt = Bcrypt()

# Get current user info
@auth_bp.route("/current-user", methods=['GET'])
def get_current_user():
    """
    Get Current User
    ---
    tags:
      - Authentication
    security:
      - SessionAuth: []
    responses:
      200:
        description: Current user information
        schema:
          type: object
          properties:
            id:
              type: string
            email:
              type: string
            first_name:
              type: string
            last_name:
              type: string
            role:
              type: string
      401:
        description: Not authenticated
    """
    user_id = session.get("user_id")
    
    if not user_id:
        return error_response(ErrorMessages.UNAUTHORIZED, status=401)
    
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return error_response(ErrorMessages.UNAUTHORIZED, status=401)
    
    user_schema = UserSchema()
    return user_schema.jsonify(user)

# Register route
@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register New User
    ---
    tags:
      - Authentication
    security:
      - CSRF: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - first_name
            - last_name
            - password
          properties:
            email:
              type: string
              format: email
            first_name:
              type: string
            last_name:
              type: string
            password:
              type: string
              format: password
    responses:
      200:
        description: User registered successfully
      400:
        description: Invalid input
      409:
        description: User already exists
    """
    # Rate limiting handled by decorator in app.py
    from app import limiter
    limiter.limit(RateLimits.REGISTER)(lambda: None)()
    
    email = sanitize_input(request.json["email"])
    first_name = sanitize_input(request.json["first_name"])
    last_name = sanitize_input(request.json["last_name"])
    password = request.json["password"]  # Don't sanitize passwords
    
    user_already_exists = User.query.filter_by(email=email).first() is not None

    if user_already_exists:
        return error_response(ErrorMessages.USER_EXISTS, status=409)
    
    error = validate_user_fields(email, first_name, last_name, password, role=None)
    if error:
        return error_response(error, status=400)
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email,first_name=first_name,last_name=last_name,password=hashed_password,role=UserRole.USER)
    db.session.add(new_user)
    db.session.commit()
    logging.info(f"Nouvel utilisateur enregistré: {new_user.email} (id: {new_user.id})")
    
    session["user_id"] = new_user.id
    
    # Log registration activity
    log_activity_with_details("Inscription", f"Nouvel utilisateur: {email}")
    
    user_schema = UserSchema()
    return user_schema.jsonify(new_user)

# Login route
@auth_bp.route("/login", methods=["POST"])
def login_user():
    """
    Login User
    ---
    tags:
      - Authentication
    security:
      - CSRF: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              format: email
            password:
              type: string
              format: password
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """
    # Rate limiting handled by decorator in app.py
    from app import limiter
    limiter.limit(RateLimits.LOGIN)(lambda: None)()
    
    email = sanitize_input(request.json["email"])
    password = request.json["password"]  # Don't sanitize passwords
    
    user = User.query.filter_by(email=email).first()

    if user is None:
        return error_response(ErrorMessages.INVALID_EMAIL, status=401)
    
    if not bcrypt.check_password_hash(user.password, password):
        return error_response(ErrorMessages.INVALID_PASSWORD, status=401)
    
    session["user_id"] = user.id
    
    # Log login activity
    log_activity_with_details("Connexion", f"Connexion réussie")
    
    user_schema = UserSchema()
    return user_schema.jsonify(user)

# Logout route
@auth_bp.route("/logout", methods=['POST'])
def logout():
    """
    Logout User
    ---
    tags:
      - Authentication
    security:
      - SessionAuth: []
      - CSRF: []
    responses:
      200:
        description: Logout successful
    """
    # Log logout activity before clearing session
    user_id = session.get('user_id')
    if user_id:
        log_activity_with_details("Déconnexion", "Déconnexion réussie")
    
    session.pop('user_id', None)
    return success_response(message=SuccessMessages.LOGGED_OUT)
