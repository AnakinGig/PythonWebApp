"""
File Upload Utilities

Handles file validation, processing, and storage for user uploads.
Supports avatar images with size and format restrictions.
"""

import os
import imghdr
from uuid import uuid4
from werkzeug.utils import secure_filename
from PIL import Image

# Allowed extensions for different file types
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
AVATAR_SIZE = (200, 200)  # Avatar dimensions


def allowed_file(filename, allowed_extensions):
    """Check if file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def validate_image(file_stream):
    """
    Validate that the uploaded file is a real image.
    
    Args:
        file_stream: File object to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check file size
    file_stream.seek(0, os.SEEK_END)
    file_size = file_stream.tell()
    file_stream.seek(0)
    
    if file_size > MAX_IMAGE_SIZE:
        return False, f"L'image est trop volumineuse. Maximum {MAX_IMAGE_SIZE // (1024*1024)}MB."
    
    if file_size == 0:
        return False, "Le fichier est vide."
    
    # Verify it's actually an image
    try:
        image = Image.open(file_stream)
        image.verify()
        file_stream.seek(0)
        return True, None
    except Exception:
        return False, "Le fichier n'est pas une image valide."


def save_avatar(file, user_id, upload_folder):
    """
    Save and process avatar image.
    
    Args:
        file: FileStorage object from request.files
        user_id: User ID for filename
        upload_folder: Base upload directory path
        
    Returns:
        tuple: (success, filename_or_error)
    """
    if not file or file.filename == '':
        return False, "Aucun fichier sélectionné."
    
    # Check file extension
    if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        return False, f"Format non supporté. Utilisez: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
    
    # Validate image
    is_valid, error = validate_image(file.stream)
    if not is_valid:
        return False, error
    
    # Create avatar directory if it doesn't exist
    avatar_dir = os.path.join(upload_folder, 'avatars')
    os.makedirs(avatar_dir, exist_ok=True)
    
    # Generate unique filename
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{user_id}_{uuid4().hex[:8]}.{file_ext}"
    filepath = os.path.join(avatar_dir, filename)
    
    try:
        # Open and process image
        image = Image.open(file.stream)
        
        # Convert RGBA to RGB if necessary (for JPEG)
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Resize to avatar dimensions (maintaining aspect ratio)
        image.thumbnail(AVATAR_SIZE, Image.Resampling.LANCZOS)
        
        # Create a square image (center crop)
        width, height = image.size
        if width != height:
            size = min(width, height)
            left = (width - size) // 2
            top = (height - size) // 2
            right = left + size
            bottom = top + size
            image = image.crop((left, top, right, bottom))
        
        # Save optimized image
        image.save(filepath, optimize=True, quality=85)
        
        return True, f"avatars/{filename}"
    
    except Exception as e:
        return False, f"Erreur lors du traitement de l'image: {str(e)}"


def delete_avatar(avatar_path, upload_folder):
    """
    Delete an avatar file.
    
    Args:
        avatar_path: Relative path to avatar (e.g., "avatars/user123.jpg")
        upload_folder: Base upload directory path
        
    Returns:
        bool: True if deleted or doesn't exist, False on error
    """
    if not avatar_path:
        return True
    
    try:
        full_path = os.path.join(upload_folder, avatar_path)
        if os.path.exists(full_path):
            os.remove(full_path)
        return True
    except Exception as e:
        print(f"Error deleting avatar: {e}")
        return False
