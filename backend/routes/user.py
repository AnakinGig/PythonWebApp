"""
User profile and account management routes
Includes password reset, email verification, and profile management
"""
from flask import Blueprint, request, session, current_app
from flask_wtf import FlaskForm
from models import db, User, UserSchema
from utils import (
    success_response, error_response, sanitize_input, validate_user_fields,
    send_password_reset_email, send_email_verification, send_welcome_email,
    save_avatar, delete_avatar
)
from middleware import log_activity_with_details
from core import ErrorMessages, SuccessMessages
from datetime import datetime, timedelta
import secrets
import bcrypt
import os

user_bp = Blueprint('user', __name__, url_prefix='/api/user')
user_schema = UserSchema()

@user_bp.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    """
    Request password reset email
    ---
    tags:
      - User
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - email
          properties:
            email:
              type: string
              example: user@example.com
    responses:
      200:
        description: Reset email sent (always returns success for security)
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
    """
    try:
        data = request.get_json()
        email = sanitize_input(data.get('email', '').strip().lower())
        
        if not email:
            # For security, always return success message even if email doesn't exist
            return success_response(message="Si cet email existe, un lien de réinitialisation a été envoyé.")
        
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            user.reset_token = reset_token
            user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
            
            db.session.commit()
            
            # Send reset email
            send_password_reset_email(user, reset_token)
            
            log_activity_with_details(
                user_id=user.id,
                action="Demande de réinitialisation de mot de passe",
                details=f"Token envoyé à {email}"
            )
        
        # Always return success for security (don't reveal if email exists)
        return success_response(message="Si cet email existe, un lien de réinitialisation a été envoyé.")
        
    except Exception as e:
        return error_response(str(e), status=500)

@user_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    """
    Reset password with token
    ---
    tags:
      - User
    parameters:
      - name: token
        in: path
        required: true
        type: string
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - password
          properties:
            password:
              type: string
              example: NewSecurePass123!
    responses:
      200:
        description: Password reset successful
      400:
        description: Invalid or expired token
    """
    try:
        data = request.get_json() or {}
        # Support both 'new_password' and 'password' keys
        new_password = (data.get('new_password') or data.get('password') or '').strip()
        
        if not new_password:
            return error_response("Le mot de passe est requis.", status=400)
        
        # Validate password strength
        from utils.helpers import is_strong_password
        if not is_strong_password(new_password):
            return error_response(ErrorMessages.WEAK_PASSWORD, status=400)
        
        # Find user by reset token
        user = User.query.filter_by(reset_token=token).first()
        
        if not user or not user.reset_token_expiry:
            return error_response("Lien de réinitialisation invalide ou expiré.", status=400)
        
        # Check if token is expired
        if datetime.utcnow() > user.reset_token_expiry:
            return error_response("Ce lien de réinitialisation a expiré.", status=400)
        
        # Check if new password is the same as current password
        if bcrypt.checkpw(new_password.encode('utf-8'), user.password.encode('utf-8')):
            return error_response("Le nouveau mot de passe doit être différent de votre mot de passe actuel.", status=400)
        
        # Hash new password
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        user.password = hashed_password.decode('utf-8')
        
        # Clear reset token
        user.reset_token = None
        user.reset_token_expiry = None
        
        db.session.commit()
        
        log_activity_with_details(
            user_id=user.id,
            action="Mot de passe réinitialisé",
            details="Réinitialisation réussie via email"
        )
        
        return success_response(message="Votre mot de passe a été réinitialisé avec succès.")
        
    except Exception as e:
        return error_response(str(e), status=500)

@user_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    """
    Verify email with token
    ---
    tags:
      - User
    parameters:
      - name: token
        in: path
        required: true
        type: string
    responses:
      200:
        description: Email verified successfully
      400:
        description: Invalid or expired token
    """
    try:
        # Find user by verification token
        user = User.query.filter_by(verification_token=token).first()
        
        if not user or not user.verification_token_expiry:
            return error_response("Lien de vérification invalide ou expiré.", status=400)
        
        # Check if token is expired
        if datetime.utcnow() > user.verification_token_expiry:
            return error_response("Ce lien de vérification a expiré.", status=400)
        
        # Check if already verified
        if user.email_verified:
            return error_response("Cet email est déjà vérifié.", status=400)
        
        # Mark as verified
        user.email_verified = True
        user.verification_token = None
        user.verification_token_expiry = None
        
        db.session.commit()
        
        # Send welcome email
        send_welcome_email(user)
        
        log_activity_with_details(
            user_id=user.id,
            action="Email vérifié",
            details=f"Email {user.email} vérifié avec succès"
        )
        
        return success_response(message="Votre email a été vérifié avec succès ! Bienvenue !")
        
    except Exception as e:
        return error_response(str(e), status=500)

@user_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """
    Resend email verification link to the authenticated user
    ---
    tags:
      - User
    security:
      - SessionAuth: []
      - CSRF: []
    responses:
      200:
        description: Verification email sent
      401:
        description: Not authenticated
    """
    try:
        user_id = session.get("user_id")
        
        if not user_id:
            return error_response(ErrorMessages.UNAUTHORIZED, status=401)
        
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return error_response(ErrorMessages.USER_NOT_FOUND, status=404)
        
        if user.email_verified:
            return error_response("Votre email est déjà vérifié.", status=400)
        
        # Generate new verification token
        verification_token = secrets.token_urlsafe(32)
        user.verification_token = verification_token
        user.verification_token_expiry = datetime.utcnow() + timedelta(hours=24)
        
        db.session.commit()
        
        # Send verification email
        send_email_verification(user, verification_token)
        
        log_activity_with_details(
            user_id=user.id,
            action="Nouveau lien de vérification demandé",
            details=f"Token renvoyé à {user.email}"
        )
        
        return success_response(message="Un nouveau lien de vérification a été envoyé.")
        
    except Exception as e:
        return error_response(str(e), status=500)

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    """
    Get current user profile
    ---
    tags:
      - User
    security:
      - SessionAuth: []
    responses:
      200:
        description: User profile retrieved
        schema:
          type: object
          properties:
            success:
              type: boolean
            data:
              type: object
      401:
        description: Not authenticated
    """
    try:
        user_id = session.get("user_id")
        
        if not user_id:
            return error_response(ErrorMessages.UNAUTHORIZED, status=401)
        
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return error_response(ErrorMessages.USER_NOT_FOUND, status=404)
        
        user_data = user_schema.dump(user)
        # Remove sensitive fields
        user_data.pop('password', None)
        user_data.pop('reset_token', None)
        user_data.pop('verification_token', None)
        
        return success_response(data=user_data)
        
    except Exception as e:
        return error_response(str(e), status=500)

@user_bp.route('/profile', methods=['PUT', 'PATCH'])
def update_profile():
    """
    Update current user profile
    ---
    tags:
      - User
    security:
      - SessionAuth: []
      - CSRF: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            first_name:
              type: string
            last_name:
              type: string
            current_password:
              type: string
              description: Required if changing password
            new_password:
              type: string
    responses:
      200:
        description: Profile updated successfully
      400:
        description: Validation error
      401:
        description: Not authenticated
    """
    try:
        user_id = session.get("user_id")
        
        if not user_id:
            return error_response(ErrorMessages.UNAUTHORIZED, status=401)
        
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return error_response(ErrorMessages.USER_NOT_FOUND, status=404)
        
        data = request.get_json()
        updated_fields = []
        
        # Update first name
        if 'first_name' in data:
            first_name = sanitize_input(data['first_name'].strip())
            if first_name:
                user.first_name = first_name
                updated_fields.append('prénom')
        
        # Update last name
        if 'last_name' in data:
            last_name = sanitize_input(data['last_name'].strip())
            if last_name:
                user.last_name = last_name
                updated_fields.append('nom')
        
        # Update email (only if verified)
        if 'email' in data:
            new_email = sanitize_input(data['email'].strip().lower())
            if new_email and new_email != user.email:
                if not user.email_verified:
                    return error_response("Vous devez d'abord vérifier votre email actuel avant de pouvoir le modifier.", status=400)
                
                # Check if new email already exists
                existing_user = User.query.filter_by(email=new_email).first()
                if existing_user:
                    return error_response("Cet email est déjà utilisé.", status=400)
                
                # Validate email format
                from utils.helpers import is_valid_email
                if not is_valid_email(new_email) or len(new_email) > 345:
                    return error_response(ErrorMessages.EMAIL_INVALID_FORMAT, status=400)
                
                user.email = new_email
                user.email_verified = False  # Require re-verification
                
                # Generate new verification token
                verification_token = secrets.token_urlsafe(32)
                user.verification_token = verification_token
                user.verification_token_expiry = datetime.utcnow() + timedelta(hours=24)
                
                updated_fields.append('email')
                
                # Send verification email for new email
                send_email_verification(user, verification_token)
        
        # Update password
        if 'new_password' in data:
            current_password = data.get('current_password', '')
            new_password = data.get('new_password', '').strip()
            
            if not current_password:
                return error_response("Le mot de passe actuel est requis.", status=400)
            
            # Verify current password
            if not bcrypt.checkpw(current_password.encode('utf-8'), user.password.encode('utf-8')):
              return error_response("Le mot de passe actuel est incorrect.", status=401)
            
            # Check if new password is the same as current password
            if bcrypt.checkpw(new_password.encode('utf-8'), user.password.encode('utf-8')):
                return error_response("Le nouveau mot de passe doit être différent de votre mot de passe actuel.", status=400)
            
            # Validate new password strength
            from utils.helpers import is_strong_password
            if not is_strong_password(new_password):
                return error_response(ErrorMessages.WEAK_PASSWORD, status=400)
            
            # Hash and update password
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            user.password = hashed_password.decode('utf-8')
            updated_fields.append('mot de passe')
        
        if not updated_fields:
            return error_response("Aucune modification fournie.", status=400)
        
        db.session.commit()
        
        log_activity_with_details(
            user_id=user.id,
            action="Profil mis à jour",
            details=f"Champs modifiés: {', '.join(updated_fields)}"
        )
        
        user_data = user_schema.dump(user)
        user_data.pop('password', None)
        user_data.pop('reset_token', None)
        user_data.pop('verification_token', None)
        
        return success_response(
            data=user_data,
            message=f"Profil mis à jour avec succès ({', '.join(updated_fields)})."
        )
        
    except Exception as e:
        return error_response(str(e), status=500)


@user_bp.route('/avatar', methods=['POST'])
def upload_avatar():
    """
    Upload user avatar image
    ---
    tags:
      - User
    consumes:
      - multipart/form-data
    parameters:
      - name: avatar
        in: formData
        type: file
        required: true
        description: Avatar image file (max 5MB, PNG/JPG/GIF/WEBP)
    responses:
      200:
        description: Avatar uploaded successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
              properties:
                avatar:
                  type: string
                  description: Relative path to avatar
      400:
        description: Invalid file or validation error
      401:
        description: Not authenticated
    """
    # Check authentication
    if 'user_id' not in session:
        return error_response("Non authentifié", status=401)
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user:
        return error_response("Utilisateur non trouvé", status=404)
    
    # Check if file was uploaded
    if 'avatar' not in request.files:
        return error_response("Aucun fichier fourni", status=400)
    
    file = request.files['avatar']
    
    # Get upload folder
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    
    # Save avatar
    success, result = save_avatar(file, user_id, upload_folder)
    
    if not success:
        return error_response(result, status=400)
    
    # Delete old avatar if exists
    if user.avatar:
        delete_avatar(user.avatar, upload_folder)
    
    # Update user avatar path
    user.avatar = result
    db.session.commit()
    
    # Log activity
    log_activity_with_details(
        action="Avatar mis à jour",
        details=f"Nouvelle photo de profil uploadée"
    )
    
    return success_response(
        data={"avatar": result},
        message="Avatar mis à jour avec succès"
    )


@user_bp.route('/avatar', methods=['DELETE'])
def delete_avatar_endpoint():
    """
    Delete user avatar image
    ---
    tags:
      - User
    responses:
      200:
        description: Avatar deleted successfully
      401:
        description: Not authenticated
      404:
        description: No avatar to delete
    """
    # Check authentication
    if 'user_id' not in session:
        return error_response("Non authentifié", status=401)
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user:
        return error_response("Utilisateur non trouvé", status=404)
    
    if not user.avatar:
        return error_response("Aucun avatar à supprimer", status=404)
    
    # Get upload folder
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    
    # Delete avatar file
    delete_avatar(user.avatar, upload_folder)
    
    # Remove avatar from database
    user.avatar = None
    db.session.commit()
    
    # Log activity
    log_activity_with_details(
        action="Avatar supprimé",
        details="Photo de profil supprimée"
    )
    
    return success_response(message="Avatar supprimé avec succès")
