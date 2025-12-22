"""
Tests for security features: CSRF protection, rate limiting, XSS prevention, SQL injection protection.
"""
import pytest
import time
from models import User, db


class TestCSRFProtection:
    """Test CSRF token validation."""

    def test_get_csrf_token(self, client):
        """Test CSRF token generation endpoint."""
        response = client.get('/api/get_csrf_token')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'csrf_token' in data
        assert len(data['csrf_token']) > 0

    def test_post_without_csrf_token_fails(self, client):
        """Test that POST requests without CSRF token are rejected."""
        # Try to register without CSRF token
        response = client.post('/api/auth/register', json={
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        
        # Should be rejected (either 400 or 403)
        assert response.status_code in [400, 403]

    def test_post_with_invalid_csrf_token_fails(self, client):
        """Test that POST with invalid CSRF token is rejected."""
        response = client.post(
            '/api/auth/register',
            json={
                'first_name': 'Test',
                'last_name': 'User',
                'email': 'test@example.com',
                'password': 'TestPass123!'
            },
            headers={'X-CSRFToken': 'invalid_token_12345'}
        )
        
        # Should be rejected
        assert response.status_code in [400, 403]

    def test_post_with_valid_csrf_token_succeeds(self, client, mocker):
        """Test that POST with valid CSRF token succeeds."""
        # Mock email sending
        mocker.patch('utils.email.send_verification_email')
        
        # Get CSRF token
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Make request with valid token
        response = client.post(
            '/api/auth/register',
            json={
                'first_name': 'Test',
                'last_name': 'User',
                'email': 'newuser@example.com',
                'password': 'TestPass123!'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Should succeed (either 200 or 201)
        assert response.status_code in [200, 201]


class TestRateLimiting:
    """Test rate limiting protection against brute force attacks."""

    def test_login_rate_limit(self, client, auth_user, mocker):
        """Test that excessive login attempts are rate limited."""
        # Mock CSRF to focus on rate limiting
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        # Get CSRF token
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Attempt multiple failed logins
        for i in range(6):  # Exceeds 5/minute limit
            response = client.post(
                '/api/auth/login',
                json={
                    'email': auth_user.email,
                    'password': 'WrongPassword123!'
                },
                headers={'X-CSRFToken': csrf_token}
            )
            
            if i < 5:
                # First 5 should process (even if they fail auth)
                assert response.status_code in [401, 429]
            else:
                # 6th request should be rate limited
                assert response.status_code == 429
                data = response.get_json()
                assert 'trop' in data.get('message', '').lower() or 'limit' in data.get('message', '').lower()

    def test_registration_rate_limit(self, client, mocker):
        """Test that excessive registration attempts are rate limited."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        mocker.patch('utils.email.send_verification_email')
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Attempt multiple registrations
        for i in range(6):
            response = client.post(
                '/api/auth/register',
                json={
                    'first_name': 'Test',
                    'last_name': f'User{i}',
                    'email': f'user{i}@example.com',
                    'password': 'TestPass123!'
                },
                headers={'X-CSRFToken': csrf_token}
            )
            
            if i < 5:
                assert response.status_code in [200, 201, 400, 429]
            else:
                # Should be rate limited
                assert response.status_code == 429

    def test_password_reset_rate_limit(self, client, auth_user, mocker):
        """Test that password reset requests are rate limited."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        mocker.patch('utils.email.send_password_reset_email')
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Attempt multiple password resets
        for i in range(6):
            response = client.post(
                '/api/user/request-password-reset',
                json={'email': auth_user.email},
                headers={'X-CSRFToken': csrf_token}
            )
            
            if i >= 5:
                # Should eventually be rate limited
                assert response.status_code == 429


class TestXSSPrevention:
    """Test XSS (Cross-Site Scripting) prevention."""

    def test_sanitize_user_input_in_registration(self, client, mocker):
        """Test that user input is sanitized to prevent XSS."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        mocker.patch('utils.email.send_verification_email')
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Try to register with XSS payload in name
        response = client.post(
            '/api/auth/register',
            json={
                'first_name': '<script>alert("XSS")</script>',
                'last_name': '<img src=x onerror=alert(1)>',
                'email': 'xsstest@example.com',
                'password': 'TestPass123!'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        if response.status_code in [200, 201]:
            # Verify user was created with sanitized data
            user = User.query.filter_by(email='xsstest@example.com').first()
            assert user is not None
            # Should not contain script tags
            assert '<script>' not in user.first_name
            assert 'onerror' not in user.last_name

    def test_sanitize_profile_update(self, client, auth_user, mocker):
        """Test that profile updates sanitize XSS attempts."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Try to update with XSS payload
        response = client.put(
            '/api/user/profile',
            json={
                'first_name': 'Safe Name',
                'last_name': '<svg/onload=alert(1)>'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Refresh user from database
        db.session.refresh(auth_user)
        
        # Verify no script injection
        assert '<svg' not in auth_user.last_name
        assert 'onload' not in auth_user.last_name


class TestSQLInjectionPrevention:
    """Test SQL injection prevention."""

    def test_login_sql_injection_attempt(self, client, mocker):
        """Test that SQL injection in login is prevented."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Try SQL injection payloads
        sql_payloads = [
            "admin' OR '1'='1",
            "admin'--",
            "admin' OR 1=1--",
            "' OR ''='",
        ]
        
        for payload in sql_payloads:
            response = client.post(
                '/api/auth/login',
                json={
                    'email': payload,
                    'password': 'anything'
                },
                headers={'X-CSRFToken': csrf_token}
            )
            
            # Should fail authentication, not cause SQL error
            assert response.status_code in [400, 401]
            data = response.get_json()
            # Should not expose SQL errors
            assert 'SQL' not in str(data).upper()
            assert 'SYNTAX' not in str(data).upper()

    def test_user_search_sql_injection(self, client, admin_user, mocker):
        """Test that admin user search prevents SQL injection."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        # Try SQL injection in search parameter
        response = client.get('/api/admin/users?search=\' OR 1=1--')
        
        # Should return safely, not expose SQL error
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.get_json()
            # Should not return all users or cause error
            assert 'SQL' not in str(data).upper()


class TestInputValidation:
    """Test input validation and sanitization."""

    def test_email_validation(self, client, mocker):
        """Test that invalid emails are rejected."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        mocker.patch('utils.email.send_verification_email')
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        invalid_emails = [
            'notanemail',
            'missing@domain',
            '@nodomain.com',
            'spaces in@email.com',
            'special!chars@domain.com'
        ]
        
        for email in invalid_emails:
            response = client.post(
                '/api/auth/register',
                json={
                    'first_name': 'Test',
                    'last_name': 'User',
                    'email': email,
                    'password': 'TestPass123!'
                },
                headers={'X-CSRFToken': csrf_token}
            )
            
            # Should reject invalid email
            assert response.status_code == 400
            data = response.get_json()
            assert 'email' in data.get('message', '').lower()

    def test_password_strength_validation(self, client, mocker):
        """Test that weak passwords are rejected."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        weak_passwords = [
            'short',           # Too short
            'alllowercase',    # No uppercase
            'ALLUPPERCASE',    # No lowercase
            'NoNumbers!',      # No numbers
            'NoSpecial123',    # No special chars
        ]
        
        for password in weak_passwords:
            response = client.post(
                '/api/auth/register',
                json={
                    'first_name': 'Test',
                    'last_name': 'User',
                    'email': f'test{password}@example.com',
                    'password': password
                },
                headers={'X-CSRFToken': csrf_token}
            )
            
            # Should reject weak password
            assert response.status_code == 400
            data = response.get_json()
            assert 'mot de passe' in data.get('message', '').lower()

    def test_name_length_validation(self, client, mocker):
        """Test that excessively long names are rejected."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Try with very long names
        response = client.post(
            '/api/auth/register',
            json={
                'first_name': 'A' * 100,  # Too long
                'last_name': 'B' * 100,   # Too long
                'email': 'longname@example.com',
                'password': 'TestPass123!'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Should reject (names limited to 50 chars)
        assert response.status_code == 400


class TestAdminProtection:
    """Test admin role protection mechanisms."""

    def test_cannot_delete_last_admin(self, client, admin_user, mocker):
        """Test that the last admin cannot be deleted."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        # Try to delete the only admin
        response = client.delete(f'/api/admin/users/{admin_user.id}')
        
        # Should be prevented
        assert response.status_code == 403
        data = response.get_json()
        assert 'dernier administrateur' in data.get('message', '').lower()

    def test_cannot_change_last_admin_role(self, client, admin_user, mocker):
        """Test that last admin's role cannot be changed to user."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Try to change admin role to user
        response = client.put(
            f'/api/admin/users/{admin_user.id}',
            json={'role': 'Utilisateur'},
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Should be prevented
        assert response.status_code in [400, 403]

    def test_non_admin_cannot_access_admin_routes(self, client, auth_user):
        """Test that regular users cannot access admin routes."""
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id
        
        # Try to access admin endpoints
        admin_endpoints = [
            '/api/admin/users',
            '/api/admin/activity-logs',
            f'/api/admin/users/{auth_user.id}'
        ]
        
        for endpoint in admin_endpoints:
            response = client.get(endpoint)
            assert response.status_code in [403, 401]
            data = response.get_json()
            assert 'administrateur' in data.get('message', '').lower() or 'autorisé' in data.get('message', '').lower()
