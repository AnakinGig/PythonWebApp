"""
Tests for avatar upload and image processing functionality.
"""
import pytest
import io
from PIL import Image
from flask import session
from models import User, db


class TestAvatarUploadBasic:
    """Test avatar upload functionality."""

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

    def test_upload_avatar_no_file(self, client, authenticated_user):
        """Test avatar upload without file."""
        response = client.post('/api/user/avatar')
        
        assert response.status_code == 400
        assert response.get_json()['success'] is False

    def test_delete_avatar_unauthenticated(self, client):
        """Test avatar deletion without authentication."""
        response = client.delete('/api/user/avatar')

        assert response.status_code == 401
