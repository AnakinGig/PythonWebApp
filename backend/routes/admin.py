from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, User, UserSchema
from functools import wraps
import logging
from utils import validate_user_fields, sanitize_input
from constants import UserRole, ErrorMessages, SuccessMessages

# Create a Blueprint for admin-related routes
admin_bp = Blueprint('admin_bp', __name__, url_prefix='/admin')

bcrypt = Bcrypt()
        
# Admin role required decorator           
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": ErrorMessages.UNAUTHORIZED}), 401
        
        user = User.query.filter_by(id=user_id).first()
        if user.role != UserRole.ADMIN:
            return jsonify({"error": ErrorMessages.FORBIDDEN}), 403
        
        return f(*args, **kwargs)
    return decorated_function

### ADMIN ROUTES ###

# Get all users info route with pagination
@admin_bp.route("/@all", methods=['GET'])
@admin_required
def get_all_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    pagination = User.query.paginate(page=page, per_page=per_page, error_out=False)
    user_schema = UserSchema(many=True)
    user_data = user_schema.dump(pagination.items)
    
    return jsonify({
        'data': user_data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    })

# Add new user route
@admin_bp.route("/add-user", methods=["POST"])
@admin_required
def add_user():
    email = sanitize_input(request.json["email"])
    first_name = sanitize_input(request.json["first_name"])
    last_name = sanitize_input(request.json["last_name"])
    password = request.json["password"]  # Don't sanitize passwords
    role = request.json["role"]
    
    # Vérification si le nom d'utilisateur existe déjà.
    user_already_exists = User.query.filter_by(email=email).first() is not None

    if user_already_exists:
        return jsonify({"error": ErrorMessages.USER_EXISTS}), 409
    
    error = validate_user_fields(email, first_name, last_name, password, role)
    if error:
        return jsonify({"error": error}), 400
    
    # Création du nouvel utilisateur du mot de passe.
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email,first_name=first_name,last_name=last_name,password=hashed_password,role=role)
    db.session.add(new_user)
    db.session.commit()
    logging.info(f"Admin {session.get('user_id')} a créé un nouvel utilisateur: {new_user.email} (id: {new_user.id}, rôle: {new_user.role})")
    
    return jsonify({
        "id": new_user.id
    })

# Modify user route
@admin_bp.route("/modify-user/<user_id>", methods=['POST'])
@admin_required
def modify_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": ErrorMessages.USER_NOT_FOUND}), 404
    
    new_email = sanitize_input(request.json["email"])
    new_first_name = sanitize_input(request.json["first_name"])
    new_last_name = sanitize_input(request.json["last_name"])
    new_password = request.json.get("password")  # Don't sanitize passwords
    new_role = request.json["role"]
    
    # Empêcher la modification du rôle du dernier admin
    if user.role == UserRole.ADMIN:
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        if admin_count <= 1 and new_role != UserRole.ADMIN:
            return jsonify({"error": ErrorMessages.CANNOT_MODIFY_LAST_ADMIN_ROLE}), 403

    # Empêcher la modification de son propre rôle admin
    if user.id == session.get("user_id") and new_role != UserRole.ADMIN:
        return jsonify({"error": ErrorMessages.CANNOT_MODIFY_SELF_ROLE}), 403
    
    if new_email != user.email: 
        email_already_exists = User.query.filter_by(email=new_email).first() is not None
        if email_already_exists:
            return jsonify({"error": ErrorMessages.USER_EXISTS}), 409
        
    error = validate_user_fields(new_email, new_first_name, new_last_name, new_password, new_role)
    if error:
        return jsonify({"error": error}), 400
    
    user.email = new_email
    user.first_name = new_first_name
    user.last_name = new_last_name
    user.role = new_role
    
    if new_password:
        new_hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = new_hashed_password
    
    db.session.commit()
    logging.info(f"Admin {session.get('user_id')} a modifié l'utilisateur: {user.email} (id: {user.id}, rôle: {user.role})")
    
    return jsonify({
        "id": user.id
    })
    
# Delete user route
@admin_bp.route("/delete-user/<user_id>", methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": ErrorMessages.USER_NOT_FOUND}), 404
    
    # Empêcher la suppression de son propre compte admin
    current_user_id = session.get("user_id")
    if user.id == current_user_id:
        return jsonify({"error": ErrorMessages.CANNOT_DELETE_SELF}), 403

    # Empêcher la suppression du dernier admin
    if user.role == UserRole.ADMIN:
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        if admin_count <= 1:
            return jsonify({"error": ErrorMessages.CANNOT_DELETE_LAST_ADMIN}), 403
    
    User.query.filter_by(id=user_id).delete()
    db.session.commit()
    logging.info(f"Admin {session.get('user_id')} a supprimé l'utilisateur: {user.email} (id: {user.id})")
    
    return jsonify({
        "message": SuccessMessages.USER_DELETED
    })

# Get user info route
@admin_bp.route('/user-info/<user_id>', methods=['GET'])
@admin_required
def get_user_info(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": ErrorMessages.USER_NOT_FOUND}), 404
    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role
    })
