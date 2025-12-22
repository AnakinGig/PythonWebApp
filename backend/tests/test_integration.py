"""
Integration tests for complete user workflows.
Tests end-to-end user journeys across authentication, profile, and admin features.
"""

import pytest
from flask import json
from datetime import datetime, timedelta

from core import ErrorMessages, SuccessMessages
from models import db, User, ActivityLog


class TestUserRegistrationVerificationLoginFlow:
    """Test complete flow: Register → Verify Email → Login → Access Profile"""

    def test_user_registration_to_profile_access(self, client, app, mock_email):
        """Complete user registration and profile access workflow"""
        register_response = client.post(
            '/api/auth/register',
            data=json.dumps({
                'first_name': 'Integration',
                'last_name': 'Test',
                'email': 'integration@example.com',
                'password': 'IntegrationTest123!'
            }),
            content_type='application/json'
        )

        assert register_response.status_code == 200
        assert register_response.json['success']
        assert 'Vérifiez votre email' in register_response.json['message']

        with app.app_context():
            user = User.query.filter_by(email='integration@example.com').first()
            assert user is not None
            assert not user.email_verified
            assert user.verification_token is not None
            assert user.verification_token_expiry > datetime.utcnow()
            verification_token = user.verification_token

        verify_response = client.get(f'/api/user/verify-email/{verification_token}')
        assert verify_response.status_code == 200
        assert verify_response.json['success']

        with app.app_context():
            verified_user = User.query.filter_by(email='integration@example.com').first()
            assert verified_user.email_verified
            assert verified_user.verification_token is None

        login_response = client.post(
            '/api/auth/login',
            data=json.dumps({
                'email': 'integration@example.com',
                'password': 'IntegrationTest123!'
            }),
            content_type='application/json'
        )
        assert login_response.status_code == 200
        assert login_response.json['success']
        assert login_response.json['data']['email'] == 'integration@example.com'

        profile_response = client.get('/api/user/profile')
        assert profile_response.status_code == 200
        assert profile_response.json['success']
        assert profile_response.json['data']['email_verified']

    def test_user_registration_email_not_verified_on_login(self, client, app, mock_email):
        """Profile stays marked as unverified until email confirmation"""
        register_response = client.post(
            '/api/auth/register',
            data=json.dumps({
                'first_name': 'Unverified',
                'last_name': 'User',
                'email': 'unverified@example.com',
                'password': 'UnverifiedTest123!'
            }),
            content_type='application/json'
        )
        assert register_response.status_code == 200

        login_response = client.post(
            '/api/auth/login',
            data=json.dumps({
                'email': 'unverified@example.com',
                'password': 'UnverifiedTest123!'
            }),
            content_type='application/json'
        )
        assert login_response.status_code == 200
        assert login_response.json['success']

        profile_response = client.get('/api/user/profile')
        assert profile_response.status_code == 200
        assert profile_response.json['success']
        assert not profile_response.json['data']['email_verified']

        with app.app_context():
            user = User.query.filter_by(email='unverified@example.com').first()
            assert user is not None
            assert not user.email_verified
            assert user.verification_token is not None


class TestPasswordResetFlow:
    """Test password reset workflow: Request → Token Validation → Reset"""

    def test_complete_password_reset_flow(self, client, app, authenticated_user, mock_email):
        """Complete password reset workflow"""
        reset_request = client.post(
            '/api/user/request-password-reset',
            data=json.dumps({'email': authenticated_user.email}),
            content_type='application/json'
        )
        assert reset_request.status_code == 200
        assert reset_request.json['success']

        with app.app_context():
            user = User.query.filter_by(email=authenticated_user.email).first()
            assert user.reset_token is not None
            assert user.reset_token_expiry is not None
            assert user.reset_token_expiry > datetime.utcnow()
            reset_token = user.reset_token

        reset_response = client.post(
            f'/api/user/reset-password/{reset_token}',
            data=json.dumps({'password': 'NewSecurePassword123!'}),
            content_type='application/json'
        )
        assert reset_response.status_code == 200
        assert reset_response.json['success']

        with app.app_context():
            user = User.query.filter_by(email=authenticated_user.email).first()
            assert user.reset_token is None
            assert user.reset_token_expiry is None

        old_login_response = client.post(
            '/api/auth/login',
            data=json.dumps({
                'email': authenticated_user.email,
                'password': 'Password123!'
            }),
            content_type='application/json'
        )
        assert old_login_response.status_code == 401
        assert not old_login_response.json['success']

        login_response = client.post(
            '/api/auth/login',
            data=json.dumps({
                'email': authenticated_user.email,
                'password': 'NewSecurePassword123!'
            }),
            content_type='application/json'
        )
        assert login_response.status_code == 200
        assert login_response.json['success']

    def test_cannot_reuse_same_password_on_reset(self, client, app, authenticated_user, mock_email):
        """User cannot reset password to their current password"""
        client.post(
            '/api/user/request-password-reset',
            data=json.dumps({'email': authenticated_user.email}),
            content_type='application/json'
        )

        with app.app_context():
            user = User.query.filter_by(email=authenticated_user.email).first()
            reset_token = user.reset_token

        reset_response = client.post(
            f'/api/user/reset-password/{reset_token}',
            data=json.dumps({'password': 'Password123!'}),
            content_type='application/json'
        )

        assert reset_response.status_code == 400
        assert reset_response.json['error'] == "Le nouveau mot de passe doit être différent de votre mot de passe actuel."

    def test_reset_password_rejects_expired_token(self, client, app, authenticated_user, mock_email):
        """Expired reset tokens are rejected"""

        with app.app_context():
            user = User.query.filter_by(email=authenticated_user.email).first()
            user.reset_token = 'expired-token'
            user.reset_token_expiry = datetime.utcnow() - timedelta(minutes=1)
            db.session.commit()

        reset_response = client.post(
            '/api/user/reset-password/expired-token',
            data=json.dumps({'password': 'AnotherSecurePass123!'}),
            content_type='application/json'
        )

        assert reset_response.status_code == 400
        assert reset_response.json['error'] == "Lien de réinitialisation invalide ou expiré."


class TestAdminUserManagementFlow:
    """Test admin user management: Create → Read → Update → Delete users"""

    def test_admin_user_crud_workflow(self, client, app, authenticated_admin, mock_email):
        """Complete admin CRUD workflow for users"""
        create_payload = {
            'first_name': 'NewUser',
            'last_name': 'Created',
            'email': 'newuser@example.com',
            'password': 'SecurePassword123!',
            'role': 'Utilisateur'
        }

        create_response = client.post(
            '/api/admin/users',
            data=json.dumps(create_payload),
            content_type='application/json'
        )

        assert create_response.status_code == 201
        assert create_response.json['success']
        assert create_response.json['message'] == SuccessMessages.USER_CREATED
        new_user_id = create_response.json['data']['id']

        read_response = client.get(f'/api/admin/users/{new_user_id}')
        assert read_response.status_code == 200
        assert read_response.json['data']['first_name'] == create_payload['first_name']
        assert read_response.json['data']['email'] == create_payload['email']

        update_payload = {
            'first_name': 'UpdatedUser',
            'last_name': 'Created',
            'email': 'newuser@example.com',
            'role': 'Utilisateur'
        }

        update_response = client.patch(
            f'/api/admin/users/{new_user_id}',
            data=json.dumps(update_payload),
            content_type='application/json'
        )

        assert update_response.status_code == 200
        assert update_response.json['success']
        assert update_response.json['data']['id'] == new_user_id
        assert update_response.json['message'] == SuccessMessages.USER_MODIFIED

        verify_updated = client.get(f'/api/admin/users/{new_user_id}')
        assert verify_updated.status_code == 200
        assert verify_updated.json['data']['first_name'] == 'UpdatedUser'

        list_response = client.get('/api/admin/users')
        assert list_response.status_code == 200
        assert list_response.json['success']
        assert 'pagination' in list_response.json
        user_emails = [u['email'] for u in list_response.json['data']]
        assert update_payload['email'] in user_emails

        delete_response = client.delete(f'/api/admin/users/{new_user_id}')
        assert delete_response.status_code == 200
        assert delete_response.json['success']
        assert delete_response.json['message'] == SuccessMessages.USER_DELETED

        verify_delete = client.get(f'/api/admin/users/{new_user_id}')
        assert verify_delete.status_code == 404

    def test_admin_cannot_delete_last_admin(self, client, app, authenticated_admin):
        """Admin protection: Cannot delete the last admin user"""

        with app.app_context():
            last_admin = User.query.filter_by(role='Administrateur').first()
            admin_id = last_admin.id

        delete_response = client.delete(f'/api/admin/users/{admin_id}')
        assert delete_response.status_code == 403
        assert delete_response.json['error'] in {
            ErrorMessages.CANNOT_DELETE_LAST_ADMIN,
            ErrorMessages.CANNOT_DELETE_SELF
        }


class TestAdminDashboardAccessFlow:
    """Test admin dashboard access and metrics"""

    def test_admin_dashboard_access_and_metrics(self, client, app, authenticated_admin):
        """Admin can access admin endpoints and activity logs"""

        client.post(
            '/api/admin/users',
            data=json.dumps({
                'first_name': 'Log',
                'last_name': 'Target',
                'email': 'logtarget@example.com',
                'password': 'SecurePassword123!',
                'role': 'Utilisateur'
            }),
            content_type='application/json'
        )

        users_response = client.get('/api/admin/users')
        assert users_response.status_code == 200
        assert users_response.json['success']
        assert isinstance(users_response.json['data'], list)
        assert 'pagination' in users_response.json

        logs_response = client.get('/api/admin/activity-logs')
        assert logs_response.status_code == 200
        assert logs_response.json['success']
        assert isinstance(logs_response.json['data'], list)
        assert 'pagination' in logs_response.json
        assert any(log['action'] for log in logs_response.json['data'])

    def test_regular_user_cannot_access_admin_endpoints(self, client, app, authenticated_user):
        """Regular users cannot access admin endpoints"""

        response = client.get('/api/admin/users')
        assert response.status_code == 403
        assert response.json['error'] == ErrorMessages.FORBIDDEN

        response = client.get('/api/admin/activity-logs')
        assert response.status_code == 403
        assert response.json['error'] == ErrorMessages.FORBIDDEN


class TestActivityLoggingIntegration:
    """Test activity logging for user actions"""

    def test_user_actions_are_logged(self, client, app, authenticated_user):
        """User actions are logged in activity log"""

        client.patch(
            '/api/user/profile',
            data=json.dumps({'first_name': 'Updated'}),
            content_type='application/json'
        )

        with app.app_context():
            log_entries = ActivityLog.query.filter_by(user_id=authenticated_user.id).order_by(ActivityLog.timestamp.desc()).all()
            assert len(log_entries) >= 1
            assert log_entries[0].action == 'Profil mis à jour'
            assert log_entries[0].details is not None

    def test_admin_actions_are_logged(self, client, app, authenticated_admin, mock_email):
        """Admin actions are logged in activity log"""

        client.post(
            '/api/admin/users',
            data=json.dumps({
                'first_name': 'TestUser',
                'last_name': 'Log',
                'email': 'testlog@example.com',
                'password': 'TestLog123!',
                'role': 'Utilisateur'
            }),
            content_type='application/json'
        )

        with app.app_context():
            admin = User.query.filter_by(email=authenticated_admin.email).first()
            log_entries = ActivityLog.query.filter_by(user_id=admin.id).order_by(ActivityLog.timestamp.desc()).all()
            assert len(log_entries) >= 1
            assert any(log.action == "Création d'utilisateur" for log in log_entries)


class TestSecurityIntegration:
    """Test security features in integrated workflows"""

    @pytest.mark.skip(reason="Rate limiting disabled in test environment (RATELIMIT_ENABLED=False)")
    def test_rate_limiting_on_login_attempts(self, client, app, create_user, db_session):
        """Rate limiting protects against brute force (skipped - disabled in tests)"""

        email = 'ratelimit@example.com'

        # Create a user first
        user = create_user(
            email=email,
            first_name='Rate',
            last_name='Limit'
        )

        # Make multiple failed login attempts
        for i in range(6):  # Assuming rate limit is 5 per minute
            response = client.post(
                '/api/auth/login',
                data=json.dumps({
                    'email': email,
                    'password': 'WrongPassword123!'
                }),
                content_type='application/json'
            )

            # After rate limit, should get 429 (Too Many Requests)
            if i >= 5:
                assert response.status_code == 429

    def test_admin_endpoints_require_authentication(self, client):
        """Admin endpoints require authentication"""

        response = client.get('/api/admin/users')
        assert response.status_code == 401
        assert response.json['error'] == ErrorMessages.UNAUTHORIZED

        response = client.get('/api/admin/activity-logs')
        assert response.status_code == 401
        assert response.json['error'] == ErrorMessages.UNAUTHORIZED

    def test_csrf_protection_disabled_in_tests(self, client, mock_email):
        """CSRF protection is disabled in test environment, registration works without token"""

        # Registration should work without CSRF token in test environment
        register_response = client.post(
            '/api/auth/register',
            data=json.dumps({
                'first_name': 'CSRF',
                'last_name': 'Test',
                'email': 'csrf@example.com',
                'password': 'CSRFTest123!'
            }),
            content_type='application/json'
        )
        assert register_response.status_code == 200
        assert register_response.json['success']
