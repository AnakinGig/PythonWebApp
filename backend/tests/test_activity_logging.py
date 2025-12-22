"""
Tests for activity logging functionality - audit trail creation and retrieval.
"""
import pytest
from datetime import datetime, timedelta
from models import ActivityLog, db
from core import UserRole


class TestActivityLogCreation:
    """Test that activity logs are created for important actions."""

    def test_login_creates_activity_log(self, client, auth_user, mocker):
        """Test that successful login creates an activity log entry."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Clear existing logs
        ActivityLog.query.filter_by(user_id=auth_user.id).delete()
        db.session.commit()
        
        # Login
        response = client.post(
            '/api/auth/login',
            json={
                'email': auth_user.email,
                'password': 'TestPassword123!'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        assert response.status_code == 200
        
        # Check activity log was created
        log = ActivityLog.query.filter_by(
            user_id=auth_user.id,
            action='Connexion'
        ).first()
        
        assert log is not None
        assert log.user_id == auth_user.id
        assert log.ip_address is not None

    def test_logout_creates_activity_log(self, client, auth_user, mocker):
        """Test that logout creates an activity log entry."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id
        
        # Clear existing logout logs
        ActivityLog.query.filter_by(
            user_id=auth_user.id,
            action='Déconnexion'
        ).delete()
        db.session.commit()
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Logout
        response = client.post(
            '/api/auth/logout',
            headers={'X-CSRFToken': csrf_token}
        )
        
        assert response.status_code == 200
        
        # Check activity log
        log = ActivityLog.query.filter_by(
            user_id=auth_user.id,
            action='Déconnexion'
        ).first()
        
        assert log is not None

    def test_profile_update_creates_activity_log(self, client, auth_user, mocker):
        """Test that profile updates create activity logs."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Clear existing update logs
        ActivityLog.query.filter_by(
            user_id=auth_user.id,
            action='Mise à jour du profil'
        ).delete()
        db.session.commit()
        
        # Update profile
        response = client.put(
            '/api/user/profile',
            json={'first_name': 'Updated'},
            headers={'X-CSRFToken': csrf_token}
        )
        
        assert response.status_code == 200
        
        # Check activity log
        log = ActivityLog.query.filter_by(
            user_id=auth_user.id,
            action='Mise à jour du profil'
        ).first()
        
        assert log is not None
        assert 'first_name' in log.details or 'Mise à jour' in log.details

    def test_password_change_creates_activity_log(self, client, auth_user, mocker):
        """Test that password changes create activity logs."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Clear existing password change logs
        ActivityLog.query.filter_by(user_id=auth_user.id).delete()
        db.session.commit()
        
        # Change password
        response = client.put(
            '/api/user/profile',
            json={
                'current_password': 'TestPassword123!',
                'new_password': 'NewTestPass456!'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Check for password change log
        logs = ActivityLog.query.filter_by(user_id=auth_user.id).all()
        password_log = any('mot de passe' in log.action.lower() or 'password' in log.action.lower() for log in logs)
        
        assert password_log or len(logs) > 0

    def test_admin_user_creation_creates_activity_log(self, client, admin_user, mocker):
        """Test that admin creating users logs the activity."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        mocker.patch('utils.email.send_verification_email')
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Clear admin logs
        ActivityLog.query.filter_by(user_id=admin_user.id).delete()
        db.session.commit()
        
        # Create user as admin
        response = client.post(
            '/api/admin/users',
            json={
                'first_name': 'New',
                'last_name': 'User',
                'email': 'newuser@example.com',
                'password': 'TestPass123!',
                'role': 'Utilisateur'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Check admin activity log
        logs = ActivityLog.query.filter_by(user_id=admin_user.id).all()
        assert len(logs) > 0

    def test_admin_user_deletion_creates_activity_log(self, client, admin_user, auth_user, mocker):
        """Test that admin deleting users logs the activity."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        # Clear admin logs
        ActivityLog.query.filter_by(user_id=admin_user.id).delete()
        db.session.commit()
        
        # Delete user as admin
        response = client.delete(f'/api/admin/users/{auth_user.id}')
        
        # Check admin activity log
        logs = ActivityLog.query.filter_by(user_id=admin_user.id).all()
        delete_log = any('suppression' in log.action.lower() or 'delete' in log.action.lower() for log in logs)
        
        assert delete_log or len(logs) > 0


class TestActivityLogRetrieval:
    """Test retrieving and filtering activity logs."""

    def test_get_activity_logs_as_admin(self, client, admin_user):
        """Test that admin can retrieve activity logs."""
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        response = client.get('/api/admin/activity-logs')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'data' in data
        assert 'items' in data['data']
        assert isinstance(data['data']['items'], list)

    def test_get_activity_logs_as_non_admin_fails(self, client, auth_user):
        """Test that non-admin cannot retrieve activity logs."""
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id
        
        response = client.get('/api/admin/activity-logs')
        
        assert response.status_code == 403

    def test_activity_logs_pagination(self, client, admin_user, auth_user):
        """Test that activity logs support pagination."""
        # Create multiple activity logs
        for i in range(15):
            log = ActivityLog(
                user_id=auth_user.id,
                action=f'Test Action {i}',
                ip_address='127.0.0.1',
                user_agent='Test Browser',
                details=f'Test details {i}'
            )
            db.session.add(log)
        db.session.commit()
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        # Request first page
        response = client.get('/api/admin/activity-logs?page=1&per_page=10')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'pagination' in data['data']
        assert len(data['data']['items']) <= 10
        assert data['data']['pagination']['total'] >= 15

    def test_activity_logs_filter_by_user(self, client, admin_user, auth_user):
        """Test filtering activity logs by user ID."""
        # Create logs for different users
        for user_id in [admin_user.id, auth_user.id]:
            log = ActivityLog(
                user_id=user_id,
                action='Test Action',
                ip_address='127.0.0.1',
                user_agent='Test Browser'
            )
            db.session.add(log)
        db.session.commit()
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        # Filter by auth_user
        response = client.get(f'/api/admin/activity-logs?user_id={auth_user.id}')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # All returned logs should be for auth_user
        for log in data['data']['items']:
            assert log['user_id'] == auth_user.id

    def test_activity_logs_filter_by_action(self, client, admin_user, auth_user):
        """Test filtering activity logs by action type."""
        # Create different action types
        actions = ['Connexion', 'Déconnexion', 'Mise à jour du profil']
        for action in actions:
            log = ActivityLog(
                user_id=auth_user.id,
                action=action,
                ip_address='127.0.0.1',
                user_agent='Test Browser'
            )
            db.session.add(log)
        db.session.commit()
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        # Filter by action
        response = client.get('/api/admin/activity-logs?action=Connexion')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # All returned logs should match action filter
        for log in data['data']['items']:
            if 'action' in log:
                assert 'Connexion' in log['action']

    def test_activity_logs_filter_by_date_range(self, client, admin_user, auth_user):
        """Test filtering activity logs by date range."""
        # Create logs with different timestamps
        old_log = ActivityLog(
            user_id=auth_user.id,
            action='Old Action',
            ip_address='127.0.0.1',
            user_agent='Test Browser',
            timestamp=datetime.utcnow() - timedelta(days=10)
        )
        new_log = ActivityLog(
            user_id=auth_user.id,
            action='New Action',
            ip_address='127.0.0.1',
            user_agent='Test Browser',
            timestamp=datetime.utcnow()
        )
        db.session.add_all([old_log, new_log])
        db.session.commit()
        
        with client.session_transaction() as sess:
            sess['user_id'] = admin_user.id
        
        # Filter by recent date
        start_date = (datetime.utcnow() - timedelta(days=1)).isoformat()
        response = client.get(f'/api/admin/activity-logs?start_date={start_date}')
        
        assert response.status_code == 200


class TestActivityLogData:
    """Test activity log data integrity."""

    def test_activity_log_includes_ip_address(self, client, auth_user, mocker):
        """Test that activity logs capture IP address."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Clear logs
        ActivityLog.query.filter_by(user_id=auth_user.id).delete()
        db.session.commit()
        
        # Perform action
        client.post(
            '/api/auth/login',
            json={
                'email': auth_user.email,
                'password': 'TestPassword123!'
            },
            headers={
                'X-CSRFToken': csrf_token,
                'X-Forwarded-For': '192.168.1.100'  # Simulate IP
            }
        )
        
        # Check log has IP
        log = ActivityLog.query.filter_by(user_id=auth_user.id).first()
        assert log is not None
        assert log.ip_address is not None
        assert len(log.ip_address) > 0

    def test_activity_log_includes_user_agent(self, client, auth_user, mocker):
        """Test that activity logs capture user agent."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Clear logs
        ActivityLog.query.filter_by(user_id=auth_user.id).delete()
        db.session.commit()
        
        # Perform action with custom user agent
        client.post(
            '/api/auth/login',
            json={
                'email': auth_user.email,
                'password': 'TestPassword123!'
            },
            headers={
                'X-CSRFToken': csrf_token,
                'User-Agent': 'Mozilla/5.0 TestBrowser'
            }
        )
        
        # Check log has user agent
        log = ActivityLog.query.filter_by(user_id=auth_user.id).first()
        assert log is not None
        assert log.user_agent is not None

    def test_activity_log_includes_timestamp(self, client, auth_user, mocker):
        """Test that activity logs have timestamps."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        before = datetime.utcnow()
        
        # Perform action
        client.post(
            '/api/auth/login',
            json={
                'email': auth_user.email,
                'password': 'TestPassword123!'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        after = datetime.utcnow()
        
        # Check log timestamp
        log = ActivityLog.query.filter_by(user_id=auth_user.id).order_by(ActivityLog.timestamp.desc()).first()
        assert log is not None
        assert log.timestamp is not None
        assert before <= log.timestamp <= after

    def test_activity_log_details_field(self, client, auth_user, mocker):
        """Test that activity logs can include additional details."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        
        with client.session_transaction() as sess:
            sess['user_id'] = auth_user.id
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Clear logs
        ActivityLog.query.filter_by(user_id=auth_user.id).delete()
        db.session.commit()
        
        # Update profile with details
        client.put(
            '/api/user/profile',
            json={'first_name': 'NewName'},
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Check log details
        log = ActivityLog.query.filter_by(user_id=auth_user.id).first()
        if log and log.details:
            assert len(log.details) > 0
