"""
Unit tests for database models.
"""
import pytest
import bcrypt
from datetime import datetime, timedelta
from models import User, ActivityLog
from core import UserRole


class TestUserModel:
    """Tests for User model."""
    
    def test_create_user(self, db_session, sample_user_data):
        """Test creating a user."""
        user = User(
            first_name=sample_user_data['first_name'],
            last_name=sample_user_data['last_name'],
            email=sample_user_data['email'],
            password=bcrypt.hashpw(sample_user_data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            role=sample_user_data['role']
        )
        db_session.session.add(user)
        db_session.session.commit()
        
        assert user.id is not None
        assert user.first_name == sample_user_data['first_name']
        assert user.last_name == sample_user_data['last_name']
        assert user.email == sample_user_data['email']
        assert user.role == UserRole.USER
        assert user.email_verified is False
    
    def test_user_default_role(self, db_session):
        """Test user default role is 'Utilisateur'."""
        user = User(
            first_name='Test',
            last_name='User',
            email='test@example.com',
            password=bcrypt.hashpw('Pass123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        )
        db_session.session.add(user)
        db_session.session.commit()
        
        assert user.role == UserRole.USER
    
    def test_user_password_hashing(self, db_session):
        """Test password is properly hashed."""
        plain_password = 'SecurePass123!'
        user = User(
            first_name='Test',
            last_name='User',
            email='test@example.com',
            password=bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        )
        db_session.session.add(user)
        db_session.session.commit()
        
        # Password should not be stored in plain text
        assert user.password != plain_password
        
        # Should be able to verify with bcrypt
        assert bcrypt.checkpw(plain_password.encode('utf-8'), user.password.encode('utf-8'))
    
    def test_user_unique_email(self, db_session, create_user):
        """Test email uniqueness constraint."""
        email = 'duplicate@example.com'
        create_user(email=email)
        
        # Try to create another user with same email
        with pytest.raises(Exception):  # SQLAlchemy IntegrityError
            create_user(email=email)
            db_session.session.commit()
    
    def test_user_email_verification_token(self, db_session, create_user):
        """Test email verification token generation."""
        user = create_user(email_verified=False)
        
        token = 'test-verification-token'
        expiry = datetime.utcnow() + timedelta(hours=24)
        
        user.verification_token = token
        user.verification_token_expiry = expiry
        db_session.session.commit()
        
        assert user.verification_token == token
        assert user.verification_token_expiry == expiry
    
    def test_user_password_reset_token(self, db_session, create_user):
        """Test password reset token generation."""
        user = create_user()
        
        token = 'test-reset-token'
        expiry = datetime.utcnow() + timedelta(hours=1)
        
        user.reset_token = token
        user.reset_token_expiry = expiry
        db_session.session.commit()
        
        assert user.reset_token == token
        assert user.reset_token_expiry == expiry
    
    def test_user_avatar_field(self, db_session, create_user):
        """Test avatar field."""
        user = create_user()
        
        avatar_path = 'avatars/test-avatar.jpg'
        user.avatar = avatar_path
        db_session.session.commit()
        
        assert user.avatar == avatar_path


class TestActivityLogModel:
    """Tests for ActivityLog model."""
    
    def test_create_activity_log(self, db_session, create_user):
        """Test creating an activity log."""
        user = create_user()
        
        log = ActivityLog(
            user_id=user.id,
            action='Test Action',
            details='Test details',
            ip_address='127.0.0.1',
            user_agent='Test Browser'
        )
        db_session.session.add(log)
        db_session.session.commit()
        
        assert log.id is not None
        assert log.user_id == user.id
        assert log.action == 'Test Action'
        assert log.details == 'Test details'
        assert log.ip_address == '127.0.0.1'
        assert log.user_agent == 'Test Browser'
        assert log.timestamp is not None
    
    def test_activity_log_relationship(self, db_session, create_user):
        """Test user-activity log relationship."""
        user = create_user()
        
        log1 = ActivityLog(user_id=user.id, action='Action 1')
        log2 = ActivityLog(user_id=user.id, action='Action 2')
        db_session.session.add_all([log1, log2])
        db_session.session.commit()
        
        # Refresh user to load relationships
        db_session.session.refresh(user)
        
        assert len(user.activity_logs) == 2
        assert log1 in user.activity_logs
        assert log2 in user.activity_logs
    
    def test_activity_log_cascade_delete(self, db_session, create_user):
        """Test activity logs are deleted when user is deleted."""
        user = create_user()
        
        log = ActivityLog(user_id=user.id, action='Test Action')
        db_session.session.add(log)
        db_session.session.commit()
        
        log_id = log.id
        
        # Delete user
        db_session.session.delete(user)
        db_session.session.commit()
        
        # Activity log should be deleted
        deleted_log = db_session.session.query(ActivityLog).filter_by(id=log_id).first()
        assert deleted_log is None
