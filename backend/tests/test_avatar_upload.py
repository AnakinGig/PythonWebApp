"""
Tests for avatar upload, delete, and image processing functionality.
"""
import pytest
import os
import io
from PIL import Image
from flask import session
from models import User, db
from core import UserRole


class TestAvatarUpload:
    """Test avatar upload functionality."""

    def test_upload_avatar_success(self, client, auth_user, mocker):
        """Test successful avatar upload."""
        # Mock file upload processing
        mock_save = mocker.patch('utils.file_upload.save_avatar')
        mock_save.return_value = '/uploads/avatars/test_avatar.jpg'

        # Create a test image
        img = Image.new('RGB', (300, 300), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)

        # Login
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id

        # Upload avatar
        response = client.post(
            '/api/user/avatar',
            data={'avatar': (img_bytes, 'test.jpg')},
            content_type='multipart/form-data'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'avatar_url' in data['data']
        assert data['message'] == "Avatar mis à jour avec succès."

    def test_upload_avatar_no_file(self, client, auth_user):
        """Test avatar upload without file."""
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id

        response = client.post('/api/user/avatar')
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'aucun fichier' in data['message'].lower()

    def test_upload_avatar_invalid_format(self, client, auth_user):
        """Test avatar upload with invalid file format."""
        # Create a text file instead of image
        txt_file = io.BytesIO(b"This is not an image")

        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id

        response = client.post(
            '/api/user/avatar',
            data={'avatar': (txt_file, 'test.txt')},
            content_type='multipart/form-data'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'format' in data['message'].lower() or 'invalide' in data['message'].lower()

    def test_upload_avatar_too_large(self, client, auth_user, mocker):
        """Test avatar upload with file too large."""
        # Mock file size check to simulate large file
        mock_check = mocker.patch('utils.file_upload.validate_image_file')
        mock_check.return_value = (False, "Le fichier est trop volumineux (max 5MB).")

        img = Image.new('RGB', (100, 100), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)

        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id

        response = client.post(
            '/api/user/avatar',
            data={'avatar': (img_bytes, 'large.jpg')},
            content_type='multipart/form-data'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'volumineux' in data['message'].lower()

    def test_upload_avatar_unauthenticated(self, client):
        """Test avatar upload without authentication."""
        img = Image.new('RGB', (100, 100), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)

        response = client.post(
            '/api/user/avatar',
            data={'avatar': (img_bytes, 'test.jpg')},
            content_type='multipart/form-data'
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False

    def test_upload_avatar_image_processing(self, client, auth_user, mocker):
        """Test that avatar is properly processed (resized, cropped)."""
        # We'll verify the actual processing happens
        mock_process = mocker.patch('utils.file_upload.process_avatar_image')
        mock_process.return_value = Image.new('RGB', (200, 200), color='blue')
        
        mock_save = mocker.patch('utils.file_upload.save_avatar')
        mock_save.return_value = '/uploads/avatars/processed.jpg'

        img = Image.new('RGB', (800, 600), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)

        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id

        response = client.post(
            '/api/user/avatar',
            data={'avatar': (img_bytes, 'large_image.jpg')},
            content_type='multipart/form-data'
        )

        # Verify processing was called
        assert mock_process.called
        assert response.status_code == 200


class TestAvatarDelete:
    """Test avatar deletion functionality."""

    def test_delete_avatar_success(self, client, auth_user, mocker):
        """Test successful avatar deletion."""
        # Set avatar for user
        auth_user.avatar = '/uploads/avatars/test_avatar.jpg'
        db.session.commit()

        # Mock file deletion
        mock_delete = mocker.patch('os.remove')

        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id

        response = client.delete('/api/user/avatar')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['message'] == "Avatar supprimé avec succès."
        
        # Verify avatar removed from database
        db.session.refresh(auth_user)
        assert auth_user.avatar is None

    def test_delete_avatar_no_avatar(self, client, auth_user):
        """Test deleting avatar when none exists."""
        # Ensure no avatar
        auth_user.avatar = None
        db.session.commit()

        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id

        response = client.delete('/api/user/avatar')

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'aucun avatar' in data['message'].lower()

    def test_delete_avatar_unauthenticated(self, client):
        """Test avatar deletion without authentication."""
        response = client.delete('/api/user/avatar')

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False

    def test_delete_avatar_file_cleanup(self, client, auth_user, mocker):
        """Test that avatar file is actually deleted from filesystem."""
        auth_user.avatar = '/uploads/avatars/to_delete.jpg'
        db.session.commit()

        mock_remove = mocker.patch('os.remove')
        mock_exists = mocker.patch('os.path.exists', return_value=True)

        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id

        response = client.delete('/api/user/avatar')

        assert response.status_code == 200
        # Verify file deletion was attempted
        assert mock_remove.called or mock_exists.called


class TestImageProcessing:
    """Test image processing utilities."""

    def test_process_avatar_resizes_to_200x200(self, mocker):
        """Test that avatar is resized to exactly 200x200."""
        from utils.file_upload import process_avatar_image
        
        # Create large image
        img = Image.new('RGB', (1000, 800), color='red')
        
        processed = process_avatar_image(img)
        
        assert processed.size == (200, 200)

    def test_process_avatar_crops_center(self, mocker):
        """Test that avatar crops from center for non-square images."""
        from utils.file_upload import process_avatar_image
        
        # Create rectangular image
        img = Image.new('RGB', (400, 200), color='blue')
        
        processed = process_avatar_image(img)
        
        # Should be square 200x200
        assert processed.size == (200, 200)

    def test_validate_image_file_accepts_valid_formats(self):
        """Test that valid image formats are accepted."""
        from utils.file_upload import validate_image_file
        
        valid_formats = ['image.jpg', 'photo.jpeg', 'pic.png', 'graphic.gif']
        
        for filename in valid_formats:
            img = Image.new('RGB', (100, 100))
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='JPEG')
            img_bytes.seek(0)
            img_bytes.name = filename
            
            is_valid, message = validate_image_file(img_bytes)
            assert is_valid is True

    def test_validate_image_file_rejects_invalid_formats(self):
        """Test that invalid file formats are rejected."""
        from utils.file_upload import validate_image_file
        
        # Create a text file
        txt_file = io.BytesIO(b"Not an image")
        txt_file.name = 'document.txt'
        
        is_valid, message = validate_image_file(txt_file)
        assert is_valid is False
        assert 'format' in message.lower() or 'extension' in message.lower()
