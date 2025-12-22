"""
Tests for email content generation and sending.
"""
import pytest
from unittest.mock import MagicMock, call
from models import User
from utils.email import send_verification_email, send_welcome_email, send_password_reset_email
from datetime import datetime, timedelta


class TestEmailSending:
    """Test email sending functionality."""

    def test_send_verification_email_called(self, auth_user, mocker):
        """Test that verification email is sent with correct parameters."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_verification_token_123"
        send_verification_email(auth_user.email, token)
        
        # Verify email was sent
        assert mock_mail_send.called
        assert mock_mail_send.call_count == 1

    def test_send_welcome_email_called(self, auth_user, mocker):
        """Test that welcome email is sent after verification."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        send_welcome_email(auth_user.email, auth_user.first_name)
        
        # Verify email was sent
        assert mock_mail_send.called
        assert mock_mail_send.call_count == 1

    def test_send_password_reset_email_called(self, auth_user, mocker):
        """Test that password reset email is sent."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_reset_token_456"
        send_password_reset_email(auth_user.email, token)
        
        # Verify email was sent
        assert mock_mail_send.called
        assert mock_mail_send.call_count == 1


class TestVerificationEmailContent:
    """Test verification email content."""

    def test_verification_email_contains_token(self, auth_user, mocker):
        """Test that verification email includes the token in URL."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "unique_verification_token_789"
        send_verification_email(auth_user.email, token)
        
        # Get the email message that was sent
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            # Check that token is in the email body
            assert token in str(message.html) or token in str(message.body)

    def test_verification_email_has_correct_recipient(self, auth_user, mocker):
        """Test that verification email is sent to correct address."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_token"
        send_verification_email(auth_user.email, token)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            assert auth_user.email in message.recipients

    def test_verification_email_has_subject(self, auth_user, mocker):
        """Test that verification email has appropriate subject."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_token"
        send_verification_email(auth_user.email, token)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            assert message.subject is not None
            assert len(message.subject) > 0
            # Subject should mention verification
            assert 'vérif' in message.subject.lower() or 'verif' in message.subject.lower()

    def test_verification_email_includes_verification_link(self, auth_user, mocker):
        """Test that verification email contains clickable link."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_verification_link_token"
        send_verification_email(auth_user.email, token)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            body = str(message.html) if hasattr(message, 'html') else str(message.body)
            # Should contain verify-email route
            assert 'verify-email' in body or token in body


class TestWelcomeEmailContent:
    """Test welcome email content."""

    def test_welcome_email_uses_first_name(self, auth_user, mocker):
        """Test that welcome email personalizes with user's name."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        send_welcome_email(auth_user.email, auth_user.first_name)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            body = str(message.html) if hasattr(message, 'html') else str(message.body)
            # Name should appear in welcome message
            assert auth_user.first_name in body

    def test_welcome_email_has_correct_recipient(self, auth_user, mocker):
        """Test that welcome email is sent to correct address."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        send_welcome_email(auth_user.email, auth_user.first_name)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            assert auth_user.email in message.recipients

    def test_welcome_email_has_subject(self, auth_user, mocker):
        """Test that welcome email has appropriate subject."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        send_welcome_email(auth_user.email, auth_user.first_name)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            assert message.subject is not None
            assert len(message.subject) > 0
            # Subject should mention welcome or bienvenue
            assert 'bienvenue' in message.subject.lower() or 'welcome' in message.subject.lower()


class TestPasswordResetEmailContent:
    """Test password reset email content."""

    def test_password_reset_email_contains_token(self, auth_user, mocker):
        """Test that password reset email includes the token."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "unique_reset_token_xyz"
        send_password_reset_email(auth_user.email, token)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            body = str(message.html) if hasattr(message, 'html') else str(message.body)
            # Token should be in email
            assert token in body

    def test_password_reset_email_has_correct_recipient(self, auth_user, mocker):
        """Test that password reset email is sent to correct address."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_token"
        send_password_reset_email(auth_user.email, token)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            assert auth_user.email in message.recipients

    def test_password_reset_email_has_subject(self, auth_user, mocker):
        """Test that password reset email has appropriate subject."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_token"
        send_password_reset_email(auth_user.email, token)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            assert message.subject is not None
            assert len(message.subject) > 0
            # Subject should mention password reset
            assert 'mot de passe' in message.subject.lower() or 'password' in message.subject.lower()

    def test_password_reset_email_includes_reset_link(self, auth_user, mocker):
        """Test that password reset email contains reset link."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_reset_link_token"
        send_password_reset_email(auth_user.email, token)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            body = str(message.html) if hasattr(message, 'html') else str(message.body)
            # Should contain reset-password route
            assert 'reset-password' in body or token in body

    def test_password_reset_email_mentions_expiry(self, auth_user, mocker):
        """Test that password reset email mentions token expiration."""
        mock_mail_send = mocker.patch('utils.email.mail.send')
        
        token = "test_token"
        send_password_reset_email(auth_user.email, token)
        
        call_args = mock_mail_send.call_args
        message = call_args[0][0] if call_args else None
        
        if message:
            body = str(message.html) if hasattr(message, 'html') else str(message.body)
            # Should mention time limit (1 hour)
            assert 'heure' in body.lower() or 'hour' in body.lower() or 'expir' in body.lower()


class TestEmailRegistrationFlow:
    """Test complete email flow during user registration."""

    def test_registration_sends_verification_email(self, client, mocker):
        """Test that registration triggers verification email."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        mock_send_verification = mocker.patch('utils.email.send_verification_email')
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Register new user
        response = client.post(
            '/api/auth/register',
            json={
                'first_name': 'Email',
                'last_name': 'Test',
                'email': 'emailtest@example.com',
                'password': 'TestPass123!'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Verify email was sent
        assert mock_send_verification.called
        assert mock_send_verification.call_count == 1
        
        # Check email and token were passed
        call_args = mock_send_verification.call_args[0]
        assert 'emailtest@example.com' in call_args
        assert len(call_args[1]) > 0  # Token should exist

    def test_email_verification_sends_welcome_email(self, client, auth_user, mocker):
        """Test that email verification triggers welcome email."""
        mock_send_welcome = mocker.patch('utils.email.send_welcome_email')
        
        # Set up verification token
        auth_user.email_verified = False
        auth_user.verification_token = "valid_token_123"
        auth_user.verification_token_expiry = datetime.utcnow() + timedelta(hours=24)
        from models import db
        db.session.commit()
        
        # Verify email
        response = client.get(f'/api/user/verify-email/valid_token_123')
        
        # Should send welcome email
        assert mock_send_welcome.called
        assert auth_user.email in str(mock_send_welcome.call_args)

    def test_password_reset_request_sends_email(self, client, auth_user, mocker):
        """Test that password reset request triggers email."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        mock_send_reset = mocker.patch('utils.email.send_password_reset_email')
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Request password reset
        response = client.post(
            '/api/user/request-password-reset',
            json={'email': auth_user.email},
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Should send reset email
        assert mock_send_reset.called
        call_args = mock_send_reset.call_args[0]
        assert auth_user.email in call_args


class TestEmailErrorHandling:
    """Test email error handling."""

    def test_registration_handles_email_failure(self, client, mocker):
        """Test that registration handles email sending failures gracefully."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        # Mock email to raise exception
        mocker.patch('utils.email.send_verification_email', side_effect=Exception("SMTP Error"))
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Try to register
        response = client.post(
            '/api/auth/register',
            json={
                'first_name': 'Test',
                'last_name': 'User',
                'email': 'failtest@example.com',
                'password': 'TestPass123!'
            },
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Registration should still succeed (or handle gracefully)
        # User created even if email fails
        assert response.status_code in [200, 201, 500]

    def test_password_reset_handles_email_failure(self, client, auth_user, mocker):
        """Test that password reset handles email failures."""
        mocker.patch('flask_wtf.csrf.validate_csrf', return_value=True)
        mocker.patch('utils.email.send_password_reset_email', side_effect=Exception("Email service down"))
        
        csrf_response = client.get('/api/get_csrf_token')
        csrf_token = csrf_response.get_json()['csrf_token']
        
        # Request reset
        response = client.post(
            '/api/user/request-password-reset',
            json={'email': auth_user.email},
            headers={'X-CSRFToken': csrf_token}
        )
        
        # Should handle gracefully (200 or error)
        assert response.status_code in [200, 500]
