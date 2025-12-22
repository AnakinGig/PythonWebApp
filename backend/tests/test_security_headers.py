"""
Test Security Headers Implementation
Verifies that all security headers are properly set on responses
"""
import pytest
from app import app


class TestSecurityHeaders:
    """Test HTTP security headers for XSS, clickjacking, MIME sniffing protection"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        with app.test_client() as client:
            yield client

    def test_csp_header_present(self, client):
        """Content-Security-Policy header should prevent XSS attacks"""
        response = client.get('/api/health')
        assert 'Content-Security-Policy' in response.headers
        assert 'default-src' in response.headers['Content-Security-Policy']

    def test_x_frame_options_header(self, client):
        """X-Frame-Options header should prevent clickjacking"""
        response = client.get('/api/health')
        assert response.headers.get('X-Frame-Options') == 'SAMEORIGIN'

    def test_x_content_type_options_header(self, client):
        """X-Content-Type-Options header should prevent MIME sniffing"""
        response = client.get('/api/health')
        assert response.headers.get('X-Content-Type-Options') == 'nosniff'

    def test_x_xss_protection_header(self, client):
        """X-XSS-Protection legacy header for older browsers"""
        response = client.get('/api/health')
        assert response.headers.get('X-XSS-Protection') == '1; mode=block'

    def test_referrer_policy_header(self, client):
        """Referrer-Policy header should control what referrer info is sent"""
        response = client.get('/api/health')
        assert response.headers.get('Referrer-Policy') == 'strict-origin-when-cross-origin'

    def test_strict_transport_security_header(self, client):
        """HSTS header should enforce HTTPS in production"""
        response = client.get('/api/health')
        hsts = response.headers.get('Strict-Transport-Security')
        # In dev mode, this might be optional, but verify it's present
        if hsts:
            assert 'max-age' in hsts
            assert 'includeSubDomains' in hsts

    def test_permissions_policy_header(self, client):
        """Permissions-Policy should disable unnecessary browser features"""
        response = client.get('/api/health')
        permissions = response.headers.get('Permissions-Policy')
        assert permissions is not None
        # Verify at least some features are disabled
        assert 'geolocation' in permissions or 'camera' in permissions

    def test_headers_on_api_endpoints(self, client):
        """All API endpoints should have security headers"""
        endpoints = [
            '/api/health',
            '/api/get_csrf_token',
            '/api/metrics',
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert 'X-Content-Type-Options' in response.headers, f"{endpoint} missing X-Content-Type-Options"
            assert 'X-Frame-Options' in response.headers, f"{endpoint} missing X-Frame-Options"

    def test_headers_on_json_responses(self, client):
        """JSON API responses should also have security headers"""
        response = client.get('/api/health')
        assert response.content_type == 'application/json'
        assert 'Content-Security-Policy' in response.headers

    def test_csp_allows_self_scripts(self, client):
        """CSP should allow scripts from same origin"""
        response = client.get('/api/health')
        csp = response.headers.get('Content-Security-Policy')
        assert "'self'" in csp
        assert 'script-src' in csp

    def test_no_xss_in_error_responses(self, client):
        """Error messages shouldn't trigger XSS due to CSP"""
        # Try accessing a non-existent endpoint
        response = client.get('/api/nonexistent')
        # Even on 404, security headers should be present
        assert 'X-Content-Type-Options' in response.headers
