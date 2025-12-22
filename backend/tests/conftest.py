"""
Pytest configuration and shared fixtures.
"""
import pytest
import os
import sys
from datetime import datetime, timedelta

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Set environment variables before importing app
os.environ['TESTING'] = 'True'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['SECRET_KEY'] = 'test-secret-key'
os.environ['WTF_CSRF_ENABLED'] = 'False'
os.environ['REDIS_URL'] = 'redis://localhost:6379/1'
os.environ['MAIL_SUPPRESS_SEND'] = '1'  # Don't send emails in tests

from models import db, User, ActivityLog
from core import UserRole
import bcrypt


@pytest.fixture(scope='session')
def app():
    """Create and configure a test Flask application."""
    from flask import Flask
    from flask_bcrypt import Bcrypt
    from flask_wtf.csrf import CSRFProtect
    from flask_cors import CORS
    from flask_session import Session
    from models import db, ma
    from routes import admin_bp, auth_bp, user_bp
    
    app = Flask(__name__)
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'test-secret-key',
            'RATELIMIT_ENABLED': False,  # Disable rate limiting for tests
        'SESSION_TYPE': 'filesystem',
        'SESSION_PERMANENT': False,
        'SESSION_USE_SIGNER': True,
        'SESSION_COOKIE_HTTPONLY': True,
        'SESSION_COOKIE_SAMESITE': 'Lax',
    })
    
    # Initialize extensions
    bcrypt = Bcrypt(app)
    csrf = CSRFProtect(app)
    CORS(app, supports_credentials=True)
    Session(app)
    db.init_app(app)
    ma.init_app(app)
    
    # Register blueprints
    app.register_blueprint(admin_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture(scope='function')
def db_session(app):
    """Create a new database session for a test."""
    with app.app_context():
        # Clear all tables
        db.session.remove()
        db.drop_all()
        db.create_all()
        
        yield db
        
        db.session.remove()
        db.drop_all()
        db.create_all()


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        'first_name': 'Jean',
        'last_name': 'Dupont',
        'email': 'jean.dupont@example.com',
        'password': 'SecurePass123!',
        'role': UserRole.USER
    }


@pytest.fixture
def sample_admin_data():
    """Sample admin data for testing."""
    return {
        'first_name': 'Admin',
        'last_name': 'User',
        'email': 'admin@example.com',
        'password': 'AdminPass123!',
        'role': UserRole.ADMIN
    }


@pytest.fixture
def create_user(db_session):
    """Factory fixture to create users."""
    def _create_user(**kwargs):
        default_data = {
            'first_name': 'Test',
            'last_name': 'User',
            'email': f'test{datetime.now().timestamp()}@example.com',
            'password': bcrypt.hashpw('Password123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            'role': UserRole.USER,
            'email_verified': True
        }
        default_data.update(kwargs)
        
        user = User(**default_data)
        db.session.add(user)
        db.session.commit()
        return user
    
    return _create_user


@pytest.fixture
def authenticated_user(client, create_user, db_session):
    """Create and authenticate a regular user."""
    user = create_user(
        email='user@example.com',
        password=bcrypt.hashpw('Password123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    )
    
    with client.session_transaction() as session:
        session['user_id'] = user.id
        session['role'] = user.role
    
    return user


@pytest.fixture
def authenticated_admin(client, create_user, db_session):
    """Create and authenticate an admin user."""
    admin = create_user(
        email='admin@example.com',
        password=bcrypt.hashpw('AdminPass123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        role=UserRole.ADMIN
    )
    
    with client.session_transaction() as session:
        session['user_id'] = admin.id
        session['role'] = admin.role
    
    return admin


@pytest.fixture
def mock_email(mocker):
    """Mock email sending."""
    return mocker.patch('utils.email.send_email')


@pytest.fixture
def freeze_time(mocker):
    """Fixture to freeze time for testing."""
    class FrozenTime:
        def __init__(self):
            self.now = datetime.utcnow()
        
        def __call__(self):
            return self.now
        
        def advance(self, **kwargs):
            self.now += timedelta(**kwargs)
    
    frozen = FrozenTime()
    mocker.patch('datetime.datetime').utcnow = frozen
    return frozen
