"""
Tests for security features: validation, sanitization, and authorization.
"""
import pytest
from models import User, db


class TestInputValidation:
    """Test input validation in security-critical operations."""

    def test_weak_password_rejected(self, client, mocker):
        """Test that weak passwords are rejected during registration."""
        mocker.patch('utils.email.send_email_verification')
        
        weak_passwords = ['weak', 'nouppercase123!', 'NOLOWERCASE123!', 'NoDigit!', 'NoSpecial123']
        
        for pwd in weak_passwords:
            response = client.post(
                '/api/auth/register',
                json={
                    'first_name': 'Test',
                    'last_name': 'User',
                    'email': f'test{pwd}@example.com',
                    'password': pwd
                }
            )
            assert response.status_code == 400

    def test_invalid_email_rejected(self, client, mocker):
        """Test that invalid emails are rejected."""
        mocker.patch('utils.email.send_email_verification')
        
        response = client.post(
            '/api/auth/register',
            json={
                'first_name': 'Test',
                'last_name': 'User',
                'email': 'invalid-email',
                'password': 'TestPass123!'
            }
        )
        assert response.status_code == 400


class TestXSSPrevention:
    """Test XSS (Cross-Site Scripting) prevention."""

    def test_sanitize_user_input_in_registration(self, client, mocker):
        """Test that user input is sanitized to prevent XSS."""
        mocker.patch('utils.email.send_email_verification')
        
        response = client.post(
            '/api/auth/register',
            json={
                'first_name': '<script>alert("XSS")</script>',
                'last_name': '<img src=x onerror=alert(1)>',
                'email': 'xsstest@example.com',
                'password': 'TestPass123!'
            }
        )
        
        if response.status_code in [200, 201]:
            user = User.query.filter_by(email='xsstest@example.com').first()
            assert user is not None
            assert '<script>' not in user.first_name
            assert 'onerror' not in user.last_name

    def test_sanitize_profile_update(self, client, authenticated_user):
        """Test that profile updates sanitize XSS attempts."""
        response = client.put(
            '/api/user/profile',
            json={
                'first_name': 'Safe Name',
                'last_name': '<img src=x onerror=alert(1)>User'
            }
        )
        
        assert response.status_code == 200
        db.session.refresh(authenticated_user)
        assert '<img' not in authenticated_user.last_name


class TestSQLInjectionPrevention:
    """Test SQL Injection prevention."""

    def test_login_sql_injection_attempt(self, client):
        """Test that SQL injection in login is prevented."""
        response = client.post(
            '/api/auth/login',
            json={
                'email': "' OR '1'='1",
                'password': "' OR '1'='1"
            }
        )
        
        # Should not bypass authentication with SQL injection
        assert response.status_code == 401
        assert response.get_json()['success'] is False


class TestAdminProtection:
    """Test admin role protection."""

    def test_cannot_delete_last_admin(self, client, authenticated_admin, create_user):
        """Test that the last admin cannot be deleted."""
        regular_user = create_user(email='regular@example.com', role='Utilisateur')
        
        # Try to delete the last admin (should fail)
        response = client.delete(f'/api/admin/users/{authenticated_admin.id}')
        assert response.status_code == 403

    def test_non_admin_cannot_access_admin_routes(self, client, authenticated_user):
        """Test that regular users cannot access admin endpoints."""
        response = client.get('/api/admin/users')
        
        # Should be forbidden
        assert response.status_code == 403
        assert response.get_json()['success'] is False


class TestAuthenticationSecurity:
    """Test authentication security features."""

    def test_password_hashing(self, client, create_user):
        """Test that passwords are hashed, not stored in plain text."""
        user = create_user(email='hashtest@example.com')
        
        # Password should not be stored in plain text
        assert user.password != 'Password123!'
        assert len(user.password) > 20  # Bcrypt hashes are long
        
    def test_session_security(self, client, authenticated_user):
        """Test that session management is secure."""
        with client.session_transaction() as sess:
            assert 'user_id' in sess
            assert sess['user_id'] == authenticated_user.id
