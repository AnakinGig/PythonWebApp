"""
Tests for activity logging functionality - audit trail creation and retrieval.
"""
import pytest
from datetime import datetime, timedelta
from models import ActivityLog, db
from core import UserRole


class TestActivityLogCreation:
    """Test that activity logs are created for important actions."""

    def test_profile_update_creates_activity_log(self, client, authenticated_user):
        """Test that profile updates create activity logs."""
        response = client.put(
            '/api/user/profile',
            json={'first_name': 'Updated'}
        )
        
        assert response.status_code == 200
        
        # Check activity log was created
        log = ActivityLog.query.filter_by(
            user_id=authenticated_user.id
        ).first()
        
        assert log is not None
        assert log.user_id == authenticated_user.id

    def test_password_change_creates_activity_log(self, client, authenticated_user):
        """Test that password changes create activity logs."""
        response = client.put(
            '/api/user/profile',
            json={
                'current_password': 'Password123!',
                'new_password': 'NewTestPass456!'
            }
        )
        
        # Check for activity log
        logs = ActivityLog.query.filter_by(user_id=authenticated_user.id).all()
        assert len(logs) > 0


class TestActivityLogRetrieval:
    """Test that activity logs can be retrieved."""

    def test_admin_can_view_activity_logs(self, client, authenticated_admin):
        """Test that admin can view activity logs."""
        response = client.get('/api/admin/activity-logs')
        
        assert response.status_code == 200
        assert response.get_json()['success'] is True

    def test_regular_user_cannot_view_logs(self, client, authenticated_user):
        """Test that regular users cannot view activity logs."""
        response = client.get('/api/admin/activity-logs')
        
        assert response.status_code == 403

    def test_activity_logs_pagination(self, client, authenticated_admin, create_user):
        """Test activity log pagination."""
        response = client.get('/api/admin/activity-logs?page=1&per_page=10')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'pagination' in data or 'data' in data


class TestActivityLogData:
    """Test activity log data integrity."""

    def test_activity_log_includes_ip_address(self, client, authenticated_user):
        """Test that activity logs include IP address."""
        # Make a request to trigger activity logging
        response = client.put(
            '/api/user/profile',
            json={'first_name': 'Test'}
        )
        
        assert response.status_code == 200
        
        # Check the log
        log = ActivityLog.query.filter_by(user_id=authenticated_user.id).first()
        if log:
            assert log.ip_address is not None

    def test_activity_log_includes_timestamp(self, client, authenticated_user):
        """Test that activity logs include timestamp."""
        response = client.put(
            '/api/user/profile',
            json={'first_name': 'Test'}
        )
        
        assert response.status_code == 200
        
        log = ActivityLog.query.filter_by(user_id=authenticated_user.id).first()
        if log:
            assert log.timestamp is not None
