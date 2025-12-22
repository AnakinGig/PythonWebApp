"""
Unit tests for user account routes.
"""
import pytest
import bcrypt
from datetime import datetime, timedelta
from models import User


class TestUserProfile:
    """Tests for user profile endpoints."""
    
    def test_get_profile_authenticated(self, client, authenticated_user):
        """Test getting profile when authenticated."""
        response = client.get('/api/user/profile')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        assert json_data['data']['email'] == authenticated_user.email
        assert json_data['data']['first_name'] == authenticated_user.first_name
    
    def test_get_profile_not_authenticated(self, client, db_session):
        """Test getting profile when not authenticated."""
        response = client.get('/api/user/profile')
        json_data = response.get_json()
        
        assert response.status_code == 401
        assert json_data['success'] is False
    
    def test_update_profile_name(self, client, authenticated_user, db_session):
        """Test updating profile name."""
        data = {
            'first_name': 'UpdatedFirst',
            'last_name': 'UpdatedLast'
        }
        
        response = client.patch('/api/user/profile', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify database was updated
        db_session.session.refresh(authenticated_user)
        assert authenticated_user.first_name == 'UpdatedFirst'
        assert authenticated_user.last_name == 'UpdatedLast'
    
    def test_update_profile_email(self, client, authenticated_user, db_session, mock_email):
        """Test updating profile email triggers verification."""
        new_email = 'newemail@example.com'
        data = {'email': new_email}
        
        response = client.patch('/api/user/profile', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify email was updated and verification required
        db_session.session.refresh(authenticated_user)
        assert authenticated_user.email == new_email
        assert authenticated_user.email_verified is False
        assert authenticated_user.verification_token is not None
    
    def test_update_profile_password(self, client, authenticated_user, db_session):
        """Test updating password."""
        old_password = 'Password123!'
        new_password = 'NewSecurePass456!'
        
        # Set known password
        authenticated_user.password = bcrypt.hashpw(old_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db_session.session.commit()
        
        data = {
            'current_password': old_password,
            'new_password': new_password
        }
        
        response = client.patch('/api/user/profile', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify password was changed
        db_session.session.refresh(authenticated_user)
        assert bcrypt.checkpw(new_password.encode('utf-8'), authenticated_user.password.encode('utf-8'))
    
    def test_update_profile_wrong_current_password(self, client, authenticated_user, db_session):
        """Test updating password with wrong current password."""
        data = {
            'current_password': 'WrongPassword123!',
            'new_password': 'NewSecurePass456!'
        }
        
        response = client.patch('/api/user/profile', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 401
        assert json_data['success'] is False
    
    def test_update_profile_same_password(self, client, authenticated_user, db_session):
        """Test updating to same password is prevented."""
        password = 'SamePass123!'
        
        # Set known password
        authenticated_user.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db_session.session.commit()
        
        data = {
            'current_password': password,
            'new_password': password
        }
        
        response = client.patch('/api/user/profile', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False


class TestEmailVerification:
    """Tests for email verification."""
    
    def test_verify_email_valid_token(self, client, db_session, create_user, mock_email):
        """Test email verification with valid token."""
        token = 'valid-verification-token'
        user = create_user(
            email_verified=False,
            verification_token=token,
            verification_token_expiry=datetime.utcnow() + timedelta(hours=24)
        )
        
        response = client.get(f'/api/user/verify-email/{token}')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify user is marked as verified
        db_session.session.refresh(user)
        assert user.email_verified is True
        assert user.verification_token is None
    
    def test_verify_email_invalid_token(self, client, db_session):
        """Test email verification with invalid token."""
        response = client.get('/api/user/verify-email/invalid-token')
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False
    
    def test_verify_email_expired_token(self, client, db_session, create_user):
        """Test email verification with expired token."""
        token = 'expired-token'
        user = create_user(
            email_verified=False,
            verification_token=token,
            verification_token_expiry=datetime.utcnow() - timedelta(hours=1)  # Expired
        )
        
        response = client.get(f'/api/user/verify-email/{token}')
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False
    
    def test_resend_verification_authenticated(self, client, authenticated_user, db_session, mock_email):
        """Test resending verification email when authenticated."""
        authenticated_user.email_verified = False
        db_session.session.commit()
        
        response = client.post('/api/user/resend-verification')
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify new token was generated
        db_session.session.refresh(authenticated_user)
        assert authenticated_user.verification_token is not None


class TestPasswordReset:
    """Tests for password reset."""
    
    def test_request_password_reset(self, client, db_session, create_user, mock_email):
        """Test requesting password reset."""
        user = create_user(email='user@example.com')
        
        data = {'email': user.email}
        response = client.post('/api/user/request-password-reset', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify reset token was generated
        db_session.session.refresh(user)
        assert user.reset_token is not None
        assert user.reset_token_expiry is not None
    
    def test_request_password_reset_nonexistent_email(self, client, db_session):
        """Test requesting password reset for non-existent email."""
        data = {'email': 'nonexistent@example.com'}
        response = client.post('/api/user/request-password-reset', json=data)
        json_data = response.get_json()
        
        # Should still return success for security (don't reveal if email exists)
        assert response.status_code == 200
        assert json_data['success'] is True
    
    def test_reset_password_valid_token(self, client, db_session, create_user):
        """Test resetting password with valid token."""
        old_password = 'OldPass123!'
        new_password = 'NewPass456!'
        token = 'valid-reset-token'
        
        user = create_user(
            email='user@example.com',
            password=bcrypt.hashpw(old_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            reset_token=token,
            reset_token_expiry=datetime.utcnow() + timedelta(hours=1)
        )
        
        data = {'new_password': new_password}
        response = client.post(f'/api/user/reset-password/{token}', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 200
        assert json_data['success'] is True
        
        # Verify password was changed
        db_session.session.refresh(user)
        assert bcrypt.checkpw(new_password.encode('utf-8'), user.password.encode('utf-8'))
        assert user.reset_token is None
    
    def test_reset_password_invalid_token(self, client, db_session):
        """Test resetting password with invalid token."""
        data = {'new_password': 'NewPass456!'}
        response = client.post('/api/user/reset-password/invalid-token', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False
    
    def test_reset_password_expired_token(self, client, db_session, create_user):
        """Test resetting password with expired token."""
        token = 'expired-token'
        user = create_user(
            reset_token=token,
            reset_token_expiry=datetime.utcnow() - timedelta(hours=1)  # Expired
        )
        
        data = {'new_password': 'NewPass456!'}
        response = client.post(f'/api/user/reset-password/{token}', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False
    
    def test_reset_password_same_as_old(self, client, db_session, create_user):
        """Test resetting to same password is prevented."""
        password = 'SamePass123!'
        token = 'valid-reset-token'
        
        user = create_user(
            password=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            reset_token=token,
            reset_token_expiry=datetime.utcnow() + timedelta(hours=1)
        )
        
        data = {'new_password': password}
        response = client.post(f'/api/user/reset-password/{token}', json=data)
        json_data = response.get_json()
        
        assert response.status_code == 400
        assert json_data['success'] is False


class TestAvatarUpload:
    """Tests for avatar upload."""
    
    def test_upload_avatar_not_authenticated(self, client, db_session):
        """Test uploading avatar when not authenticated."""
        response = client.post('/api/user/avatar')
        json_data = response.get_json()
        
        assert response.status_code == 401
        assert json_data['success'] is False
    
    def test_delete_avatar_not_authenticated(self, client, db_session):
        """Test deleting avatar when not authenticated."""
        response = client.delete('/api/user/avatar')
        json_data = response.get_json()
        
        assert response.status_code == 401
        assert json_data['success'] is False
