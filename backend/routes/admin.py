from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from models import db, User, UserSchema
from functools import wraps
import logging
from utils import validate_user_fields, sanitize_input
from constants import UserRole, ErrorMessages, SuccessMessages
from api_response import success_response, error_response, paginated_response

# Create a Blueprint for admin-related routes
admin_bp = Blueprint('admin_bp', __name__, url_prefix='/admin')

bcrypt = Bcrypt()
        
# Admin role required decorator           
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return error_response(ErrorMessages.UNAUTHORIZED, status=401)
        
        user = User.query.filter_by(id=user_id).first()
        if user.role != UserRole.ADMIN:
            return error_response(ErrorMessages.FORBIDDEN, status=403)
        
        return f(*args, **kwargs)
    return decorated_function

### ADMIN ROUTES ###

# Get all users info route with pagination
@admin_bp.route("/@all", methods=['GET'])
@admin_required
def get_all_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Limit per page to prevent abuse
    per_page = min(per_page, 100)
    
    pagination = User.query.paginate(page=page, per_page=per_page, error_out=False)
    user_schema = UserSchema(many=True)
    user_data = user_schema.dump(pagination.items)
    
    return paginated_response(
        items=user_data,
        pagination={
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    )

# Add new user route
@admin_bp.route("/add-user", methods=["POST"])
@admin_required
def add_user():
    email = sanitize_input(request.json["email"])
    first_name = sanitize_input(request.json["first_name"])
    last_name = sanitize_input(request.json["last_name"])
    password = request.json["password"]  # Don't sanitize passwords
    role = request.json["role"]
    
    # Verify if the username already exists.
    user_already_exists = User.query.filter_by(email=email).first() is not None

    if user_already_exists:
        return error_response(ErrorMessages.USER_EXISTS, status=409)
    
    error = validate_user_fields(email, first_name, last_name, password, role)
    if error:
        return error_response(error, status=400)
    
    # Create the new user with the hashed password.
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email,first_name=first_name,last_name=last_name,password=hashed_password,role=role)
    db.session.add(new_user)
    db.session.commit()
    logging.info(f"Admin {session.get('user_id')} a créé un nouvel utilisateur: {new_user.email} (id: {new_user.id}, rôle: {new_user.role})")
    
    return success_response(data={"id": new_user.id}, message=SuccessMessages.USER_CREATED, status=201)

# Modify user route
@admin_bp.route("/modify-user/<user_id>", methods=['POST'])
@admin_required
def modify_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return error_response(ErrorMessages.USER_NOT_FOUND, status=404)
    
    new_email = sanitize_input(request.json["email"])
    new_first_name = sanitize_input(request.json["first_name"])
    new_last_name = sanitize_input(request.json["last_name"])
    new_password = request.json.get("password")  # Don't sanitize passwords
    new_role = request.json["role"]
    
    # Prevent modification of the last admin's role
    if user.role == UserRole.ADMIN:
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        if admin_count <= 1 and new_role != UserRole.ADMIN:
            return error_response(ErrorMessages.CANNOT_MODIFY_LAST_ADMIN_ROLE, status=403)

    # Prevent modification of own admin role
    if user.id == session.get("user_id") and new_role != UserRole.ADMIN:
        return error_response(ErrorMessages.CANNOT_MODIFY_SELF_ROLE, status=403)
    
    if new_email != user.email: 
        email_already_exists = User.query.filter_by(email=new_email).first() is not None
        if email_already_exists:
            return error_response(ErrorMessages.USER_EXISTS, status=409)
        
    error = validate_user_fields(new_email, new_first_name, new_last_name, new_password, new_role)
    if error:
        return error_response(error, status=400)
    
    user.email = new_email
    user.first_name = new_first_name
    user.last_name = new_last_name
    user.role = new_role
    
    if new_password:
        new_hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = new_hashed_password
    
    db.session.commit()
    logging.info(f"Admin {session.get('user_id')} a modifié l'utilisateur: {user.email} (id: {user.id}, rôle: {user.role})")
    
    return success_response(data={"id": user.id}, message=SuccessMessages.USER_MODIFIED)
    
# Delete user route
@admin_bp.route("/delete-user/<user_id>", methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return error_response(ErrorMessages.USER_NOT_FOUND, status=404)
    
    # Prevent deletion of own admin account
    current_user_id = session.get("user_id")
    if user.id == current_user_id:
        return error_response(ErrorMessages.CANNOT_DELETE_SELF, status=403)

    # Prevent deletion of the last admin
    if user.role == UserRole.ADMIN:
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        if admin_count <= 1:
            return error_response(ErrorMessages.CANNOT_DELETE_LAST_ADMIN, status=403)
    
    User.query.filter_by(id=user_id).delete()
    db.session.commit()
    logging.info(f"Admin {session.get('user_id')} a supprimé l'utilisateur: {user.email} (id: {user.id})")
    
    return success_response(message=SuccessMessages.USER_DELETED)

# Get user info route
@admin_bp.route('/user-info/<user_id>', methods=['GET'])
@admin_required
def get_user_info(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return error_response(ErrorMessages.USER_NOT_FOUND, status=404)
    return success_response(data={
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role
    })
