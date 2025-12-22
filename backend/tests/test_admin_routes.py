"""
Unit tests for admin routes.
"""
import pytest
import bcrypt
from models import User, ActivityLog
from core import UserRole


class TestAdminUsersList:
    """Tests for admin users list endpoint."""
    
    def test_list_users_as_admin(self, client, authenticated_admin, db_session, create_user):
        """Test listing users as admin."""
        # Create some test users
        create_user(email='user1@example.com')
        create_user(email='user2@example.com')
        
        response = client.get('/api/admin/users')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert 'data' in json_data
        assert len(json_data['data']) >= 2  # At least the 2 we created
    
    def test_list_users_as_regular_user(self, client, authenticated_user, db_session):
        """Test listing users as regular user (should fail)."""
        response = client.get('/api/admin/users')
        json_data = response.get_json()
        
        assert response.status_code == 403
        assert json_data['success'] is False
    
    def test_list_users_not_authenticated(self, client, db_session):
        """Test listing users when not authenticated."""
        response = client.get('/api/admin/users')
        json_data = response.get_json()
        
        assert response.status_code == 401
        assert json_data['success'] is False
    
    def test_list_users_pagination(self, client, authenticated_admin, db_session, create_user):
        """Test user list pagination."""
        # Create many users
        for i in range(25):
            create_user(email=f'user{i}@example.com')
        
        response = client.get('/api/admin/users?page=1&per_page=10')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert 'pagination' in json_data
        assert json_data['pagination']['per_page'] == 10


class TestAdminCreateUser:
    """Tests for admin create user endpoint."""
    
    def test_create_user_as_admin(self, client, authenticated_admin, db_session, mock_email):
        """Test creating user as admin."""
        data = {
            'first_name': 'New',
            'last_name': 'User',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'role': UserRole.USER
        }
        
        response = client.post('/api/admin/users', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 201
        assert json_data['success'] is True
        assert 'id' in json_data['data']
        
        # Verify user was created
        user = db_session.session.query(User).filter_by(email=data['email']).first()
        assert user is not None
        assert user.first_name == data['first_name']
    
    def test_create_user_as_regular_user(self, client, authenticated_user, db_session):
        """Test creating user as regular user (should fail)."""
        data = {
            'first_name': 'New',
            'last_name': 'User',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!'
        }
        
        response = client.post('/api/admin/users', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 403
        assert json_data['success'] is False
    
    def test_create_user_duplicate_email(self, client, authenticated_admin, db_session, create_user):
        """Test creating user with duplicate email."""
        existing = create_user(email='existing@example.com')
        
        data = {
            'first_name': 'New',
            'last_name': 'User',
            'email': existing.email,
            'password': 'SecurePass123!',
            'role': 'Utilisateur'
        }
        
        response = client.post('/api/admin/users', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 409
        assert json_data['success'] is False


class TestAdminGetUser:
    """Tests for admin get user endpoint."""
    
    def test_get_user_as_admin(self, client, authenticated_admin, db_session, create_user):
        """Test getting user details as admin."""
        user = create_user(email='targetuser@example.com')
        
        response = client.get(f'/api/admin/users/{user.id}')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert json_data['data']['email'] == user.email
    
    def test_get_user_not_found(self, client, authenticated_admin, db_session):
        """Test getting non-existent user."""
        response = client.get('/api/admin/users/nonexistent-id')
        json_data = response.get_json()
        
        assert response.status_code == 404
        assert json_data['success'] is False


class TestAdminUpdateUser:
    """Tests for admin update user endpoint."""
    
    def test_update_user_as_admin(self, client, authenticated_admin, db_session, create_user):
        """Test updating user as admin."""
        user = create_user(email='user@example.com', first_name='OldName')
        
        data = {
            'email': user.email,
            'first_name': 'NewName',
            'last_name': 'UpdatedLast',
            'role': user.role
        }
        
        response = client.patch(f'/api/admin/users/{user.id}', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify update
        db_session.session.refresh(user)
        assert user.first_name == 'NewName'
        assert user.last_name == 'UpdatedLast'
    
    def test_update_user_role(self, client, authenticated_admin, db_session, create_user):
        """Test updating user role."""
        user = create_user(role=UserRole.USER)
        
        data = {
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': UserRole.ADMIN
        }
        
        response = client.patch(f'/api/admin/users/{user.id}', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify role update
        db_session.session.refresh(user)
        assert user.role == UserRole.ADMIN
    
    def test_admin_cannot_modify_own_role(self, client, authenticated_admin, db_session):
        """Test admin cannot modify their own role."""
        data = {
            'email': authenticated_admin.email,
            'first_name': authenticated_admin.first_name,
            'last_name': authenticated_admin.last_name,
            'role': UserRole.USER
        }
        
        response = client.patch(f'/api/admin/users/{authenticated_admin.id}', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 403
        assert json_data['success'] is False


class TestAdminDeleteUser:
    """Tests for admin delete user endpoint."""
    
    def test_delete_user_as_admin(self, client, authenticated_admin, db_session, create_user):
        """Test deleting user as admin."""
        user = create_user(email='todelete@example.com')
        user_id = user.id
        
        response = client.delete(f'/api/admin/users/{user_id}')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify user was deleted
        deleted_user = db_session.session.query(User).filter_by(id=user_id).first()
        assert deleted_user is None
    
    def test_delete_last_admin_prevented(self, client, authenticated_admin, db_session):
        """Test deleting last admin is prevented."""
        # authenticated_admin is the only admin
        response = client.delete(f'/api/admin/users/{authenticated_admin.id}')
        json_data = response.get_json()
        
        assert response.status_code == 403
        assert json_data['success'] is False
        assert 'admin' in json_data['error'].lower()
    
    def test_delete_user_not_found(self, client, authenticated_admin, db_session):
        """Test deleting non-existent user."""
        response = client.delete('/api/admin/users/nonexistent-id')
        json_data = response.get_json()
        
        assert response.status_code == 404
        assert json_data['success'] is False


class TestAdminActivityLogs:
    """Tests for admin activity logs endpoint."""
    
    def test_get_activity_logs_as_admin(self, client, authenticated_admin, db_session, create_user):
        """Test getting activity logs as admin."""
        user = create_user()
        
        # Create some activity logs
        log1 = ActivityLog(user_id=user.id, action='Test Action 1')
        log2 = ActivityLog(user_id=user.id, action='Test Action 2')
        db_session.session.add_all([log1, log2])
        db_session.session.commit()
        
        response = client.get('/api/admin/activity-logs')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert 'data' in json_data
        assert len(json_data['data']) >= 2
    
    def test_get_activity_logs_as_regular_user(self, client, authenticated_user, db_session):
        """Test getting activity logs as regular user (should fail)."""
        response = client.get('/api/admin/activity-logs')
        json_data = response.get_json()
        
        assert response.status_code == 403
        assert json_data['success'] is False
    
    def test_activity_logs_pagination(self, client, authenticated_admin, db_session, create_user):
        """Test activity logs pagination."""
        user = create_user()
        
        # Create many logs
        for i in range(25):
            log = ActivityLog(user_id=user.id, action=f'Action {i}')
            db_session.session.add(log)
        db_session.session.commit()
        
        response = client.get('/api/admin/activity-logs?page=1&per_page=10')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert 'pagination' in json_data
        assert json_data['pagination']['per_page'] == 10
