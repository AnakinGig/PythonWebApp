"""
Branding Configuration Module

Centralizes all branding-related configuration for easy client customization.
Modify these values to rebrand the application for your clients.
"""

import os

class BrandingConfig:
    """Application branding configuration"""
    
    # Application Name
    APP_NAME = os.getenv('APP_NAME', 'PythonWebApp')
    APP_SHORT_NAME = os.getenv('APP_SHORT_NAME', 'PWA')
    
    # Company Information
    COMPANY_NAME = os.getenv('COMPANY_NAME', 'Your Company')
    COMPANY_URL = os.getenv('COMPANY_URL', 'https://example.com')
    
    # API Documentation
    API_TITLE = os.getenv('API_TITLE', f'{APP_NAME} API')
    API_DESCRIPTION = os.getenv('API_DESCRIPTION', f'API Documentation for {APP_NAME}')
    API_VERSION = os.getenv('API_VERSION', '1.0.0')
    
    # Contact Information
    CONTACT_NAME = os.getenv('CONTACT_NAME', APP_NAME)
    CONTACT_URL = os.getenv('CONTACT_URL', 'https://github.com')
    CONTACT_EMAIL = os.getenv('CONTACT_EMAIL', 'contact@example.com')
    
    # Logo and Assets
    LOGO_PATH = os.getenv('LOGO_PATH', '/static/logo.png')
    FAVICON_PATH = os.getenv('FAVICON_PATH', '/static/favicon.ico')
    
    # Theme Colors (for future customization)
    PRIMARY_COLOR = os.getenv('PRIMARY_COLOR', '#0d6efd')
    SECONDARY_COLOR = os.getenv('SECONDARY_COLOR', '#6c757d')
    
    # Application Description
    APP_DESCRIPTION = os.getenv(
        'APP_DESCRIPTION',
        'Application moderne de gestion d\'utilisateurs avec React & Flask'
    )
    
    # Footer Copyright
    COPYRIGHT_YEAR = os.getenv('COPYRIGHT_YEAR', '2025')
    COPYRIGHT_HOLDER = os.getenv('COPYRIGHT_HOLDER', COMPANY_NAME)
    
    @classmethod
    def get_swagger_config(cls):
        """Get Swagger API documentation configuration"""
        return {
            "swagger": "2.0",
            "info": {
                "title": cls.API_TITLE,
                "description": cls.API_DESCRIPTION,
                "version": cls.API_VERSION,
                "contact": {
                    "name": cls.CONTACT_NAME,
                    "url": cls.CONTACT_URL,
                    "email": cls.CONTACT_EMAIL
                }
            }
        }
    
    @classmethod
    def get_app_info(cls):
        """Get application information for API responses"""
        return {
            "name": cls.APP_NAME,
            "version": cls.API_VERSION,
            "description": cls.APP_DESCRIPTION,
            "company": cls.COMPANY_NAME,
            "company_url": cls.COMPANY_URL
        }
