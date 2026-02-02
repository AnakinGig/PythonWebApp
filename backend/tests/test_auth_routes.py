"""
Unit tests for authentication routes.
"""
import pytest
import bcrypt
from models import User
from core import UserRole, ErrorMessages


class TestRegister:
    """Tests for user registration."""
    
    def test_register_success(self, client, db_session, mock_email):
        """Test successful user registration."""
        data = {
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'email': 'jean@example.com',
            'password': 'SecurePass123!'
        }
        
        response = client.post('/api/auth/register', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert 'id' in json_data['data']
        
        # Verify user was created in database
        user = db_session.session.query(User).filter_by(email=data['email']).first()
        assert user is not None
        assert user.first_name == data['first_name']
        assert user.last_name == data['last_name']
        assert user.email_verified is False
        assert user.verification_token is not None
    
    def test_register_duplicate_email(self, client, db_session, create_user):
        """Test registration with duplicate email."""
        existing_user = create_user(email='existing@example.com')
        
        data = {
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'email': existing_user.email,
            'password': 'SecurePass123!'
        }
        
        response = client.post('/api/auth/register', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 409
        assert json_data['success'] is False
        assert 'utilisée' in json_data['error'].lower()
    
    def test_register_invalid_email(self, client, db_session):
        """Test registration with invalid email."""
        data = {
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'email': 'invalid-email',
            'password': 'SecurePass123!'
        }
        
        response = client.post('/api/auth/register', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False
    
    def test_register_weak_password(self, client, db_session):
        """Test registration with weak password."""
        data = {
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'email': 'jean@example.com',
            'password': 'weak'
        }
        
        response = client.post('/api/auth/register', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False
    
    def test_register_missing_fields(self, client, db_session):
        """Test registration with missing fields."""
        data = {
            'first_name': 'Jean',
            'email': 'jean@example.com'
            # Missing last_name and password
        }
        
        response = client.post('/api/auth/register', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False


class TestLogin:
    """Tests for user login."""
    
    def test_login_success(self, client, db_session, create_user):
        """Test successful login."""
        password = 'SecurePass123!'
        user = create_user(
            email='user@example.com',
            password=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            email_verified=True
        )
        
        data = {
            'email': 'user@example.com',
            'password': password
        }
        
        response = client.post('/api/auth/login', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert json_data['data']['email'] == user.email
        
        # Verify session was created
        with client.session_transaction() as session:
            assert session.get('user_id') == user.id
    
    def test_login_invalid_email(self, client, db_session):
        """Test login with non-existent email."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'SecurePass123!'
        }
        
        response = client.post('/api/auth/login', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 401
        assert json_data['success'] is False
    
    def test_login_wrong_password(self, client, db_session, create_user):
        """Test login with wrong password."""
        password = 'CorrectPass123!'
        user = create_user(
            email='user@example.com',
            password=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        )
        
        data = {
            'email': user.email,
            'password': 'WrongPass123!'
        }
        
        response = client.post('/api/auth/login', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 401
        assert json_data['success'] is False
    
    def test_login_missing_fields(self, client, db_session):
        """Test login with missing fields."""
        data = {
            'email': 'user@example.com'
            # Missing password
        }
        
        response = client.post('/api/auth/login', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False


class TestLogout:
    """Tests for user logout."""
    
    def test_logout_success(self, client, authenticated_user):
        """Test successful logout."""
        response = client.post('/api/auth/logout')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify session was cleared
        with client.session_transaction() as session:
            assert session.get('user_id') is None
    
    def test_logout_not_authenticated(self, client, db_session):
        """Test logout when not authenticated."""
        response = client.post('/api/auth/logout')
        
        # Should still return success (idempotent operation)
        assert response.status_code == 200


class TestCurrentUser:
    """Tests for current user endpoint."""
    
    def test_current_user_authenticated(self, client, authenticated_user):
        """Test getting current user when authenticated."""
        response = client.get('/api/auth/current-user')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert json_data['data']['email'] == authenticated_user.email
        assert json_data['data']['id'] == authenticated_user.id
    
    def test_current_user_not_authenticated(self, client, db_session):
        """Test getting current user when not authenticated."""
        response = client.get('/api/auth/current-user')
        json_data = response.get_json()
        
        assert response.status_code == 401
        assert json_data['success'] is False
