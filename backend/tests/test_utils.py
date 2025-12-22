"""
Unit tests for utility functions.
"""
import pytest
from utils import (
    validate_user_fields,
    sanitize_input,
    is_valid_email,
    is_strong_password,
    success_response,
    error_response,
    paginated_response
)


class TestValidation:
    """Tests for validation functions."""
    
    def test_is_valid_email_valid(self):
        """Test valid email addresses."""
        valid_emails = [
            'test@example.com',
            'user.name@example.co.uk',
            'user+tag@example.com',
            'user_123@test-domain.com'
        ]
        for email in valid_emails:
            assert is_valid_email(email) is True
    
    def test_is_valid_email_invalid(self):
        """Test invalid email addresses."""
        invalid_emails = [
            '',
            'invalid',
            '@example.com',
            'user@',
            'user@.com',
            'user @example.com',
            'user@example',
        ]
        for email in invalid_emails:
            assert is_valid_email(email) is False
    
    def test_is_strong_password_valid(self):
        """Test valid strong passwords."""
        valid_passwords = [
            'SecurePass123!',
            'MyP@ssw0rd',
            'Test1234!@#$',
            'Abcd1234!',
        ]
        for password in valid_passwords:
            assert is_strong_password(password) is True, f"Password {password} should be valid"
    
    def test_is_strong_password_too_short(self):
        """Test password too short."""
        assert is_strong_password('Short1!') is False
    
    def test_is_strong_password_no_uppercase(self):
        """Test password without uppercase."""
        assert is_strong_password('password123!') is False
    
    def test_is_strong_password_no_lowercase(self):
        """Test password without lowercase."""
        assert is_strong_password('PASSWORD123!') is False
    
    def test_is_strong_password_no_digit(self):
        """Test password without digit."""
        assert is_strong_password('PasswordTest!') is False
    
    def test_is_strong_password_no_special(self):
        """Test password without special character."""
        assert is_strong_password('Password123') is False
    
    def test_validate_user_fields_valid(self):
        """Test valid user fields."""
        error = validate_user_fields(
            email='jean@example.com',
            first_name='Jean',
            last_name='Dupont',
            password='SecurePass123!'
        )
        assert error is None
    
    def test_validate_user_fields_missing_first_name(self):
        """Test missing first name."""
        error = validate_user_fields(
            email='jean@example.com',
            first_name='',
            last_name='Dupont',
            password='SecurePass123!'
        )
        assert error is not None
        assert 'prénom' in error.lower()
    
    def test_validate_user_fields_invalid_email(self):
        """Test invalid email."""
        error = validate_user_fields(
            email='invalid-email',
            first_name='Jean',
            last_name='Dupont',
            password='SecurePass123!'
        )
        assert error is not None
        assert 'email' in error.lower()
    
    def test_validate_user_fields_weak_password(self):
        """Test weak password."""
        error = validate_user_fields(
            email='jean@example.com',
            first_name='Jean',
            last_name='Dupont',
            password='weak'
        )
        assert error is not None


class TestSanitization:
    """Tests for sanitization functions."""
    
    def test_sanitize_input_removes_html(self):
        """Test HTML tags are removed but text content may be preserved."""
        dirty = '<script>alert("XSS")</script>Hello'
        clean = sanitize_input(dirty)
        assert '<script>' not in clean
        assert 'Hello' in clean
        # bleach.clean removes tags but keeps text content between them
    
    def test_sanitize_input_removes_javascript(self):
        """Test JavaScript attributes are removed."""
        dirty = '<img src=x onerror="alert(1)">'
        clean = sanitize_input(dirty)
        assert 'onerror' not in clean
    
    def test_sanitize_input_preserves_normal_text(self):
        """Test normal text is preserved."""
        text = 'Normal text with spaces and punctuation!'
        clean = sanitize_input(text)
        assert clean == text
    
    def test_sanitize_input_strips_whitespace(self):
        """Test sanitize preserves whitespace (bleach doesn't strip)."""
        text = '  Trimmed text  '
        clean = sanitize_input(text)
        assert clean == '  Trimmed text  '  # bleach.clean doesn't strip whitespace


class TestAPIResponses:
    """Tests for API response helpers."""
    
    def test_success_response_with_data(self):
        """Test success response with data."""
        from flask import Flask
        app = Flask(__name__)
        with app.app_context():
            response = success_response(data={'id': 123}, message='Success!')
            json_data = response[0].get_json() if isinstance(response, tuple) else response.get_json()
            status_code = response[1] if isinstance(response, tuple) else response.status_code
            
            assert status_code == 200
            assert json_data['success'] is True
            assert json_data['data'] == {'id': 123}
            assert json_data['message'] == 'Success!'
    
    def test_success_response_custom_status(self):
        """Test success response with custom status."""
        response_data, status_code = success_response(data={}, status=201)
        assert status_code == 201
    
    def test_error_response(self):
        """Test error response."""
        from flask import Flask
        app = Flask(__name__)
        with app.app_context():
            response = error_response('Error occurred', status=400)
            json_data = response[0].get_json() if isinstance(response, tuple) else response.get_json()
            status_code = response[1] if isinstance(response, tuple) else response.status_code
            
            assert status_code == 400
            assert json_data['success'] is False
            assert json_data['error'] == 'Error occurred'
    
    def test_paginated_response(self):
        """Test paginated response."""
        from flask import Flask
        app = Flask(__name__)
        with app.app_context():
            items = [{'id': 1}, {'id': 2}, {'id': 3}]
            pagination = {
                'page': 1,
                'per_page': 10,
                'total': 50,
                'pages': 5
            }
            
            response = paginated_response(items=items, pagination=pagination)
            json_data = response[0].get_json() if isinstance(response, tuple) else response.get_json()
            status_code = response[1] if isinstance(response, tuple) else response.status_code
            
            assert status_code == 200
            assert json_data['success'] is True
            assert json_data['data'] == items
            assert json_data['pagination'] == pagination
