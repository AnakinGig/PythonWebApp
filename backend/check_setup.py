#!/usr/bin/env python
"""
Environment Setup Checker

Validates that all required environment variables and dependencies are configured.
Run this before starting the application to catch configuration issues early.

Usage:
    python check_setup.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def check_env_var(var_name, required=True):
    """Check if an environment variable is set"""
    value = os.environ.get(var_name)
    if value:
        # Don't print sensitive values
        if 'PASSWORD' in var_name or 'SECRET' in var_name:
            print(f"{GREEN}✓{RESET} {var_name}: [SET]")
        else:
            print(f"{GREEN}✓{RESET} {var_name}: {value}")
        return True
    else:
        if required:
            print(f"{RED}✗{RESET} {var_name}: Missing (required)")
            return False
        else:
            print(f"{YELLOW}⚠{RESET} {var_name}: Not set (optional)")
            return True

def check_dependencies():
    """Check if required Python packages are installed"""
    print("\nChecking Python dependencies...")
    required_packages = [
        'flask', 'flask_bcrypt', 'flask_cors', 'flask_session',
        'flask_sqlalchemy', 'flask_migrate', 'flask_limiter',
        'psycopg2', 'redis', 'bleach'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"{GREEN}✓{RESET} {package}")
        except ImportError:
            print(f"{RED}✗{RESET} {package}")
            missing.append(package)
    
    return len(missing) == 0

def main():
    print("PythonWebApp - Environment Setup Checker\n")
    
    # Check environment variables
    print("Checking environment variables...")
    all_good = True
    
    required_vars = [
        'SECRET_KEY',
        'ADMIN_MAIL',
        'ADMIN_PASSWORD',
        'DATABASE_URL',
        'FRONTEND_URL'
    ]
    
    for var in required_vars:
        if not check_env_var(var):
            all_good = False
    
    # Check optional vars
    optional_vars = ['FLASK_APP', 'FLASK_ENV']
    for var in optional_vars:
        check_env_var(var, required=False)
    
    # Check dependencies
    if not check_dependencies():
        all_good = False
        print(f"\n{RED}Missing dependencies. Run: pip install -r requirements.txt{RESET}")
    
    # Check .env file exists
    print("\nChecking configuration files...")
    if os.path.exists('.env'):
        print(f"{GREEN}✓{RESET} .env file exists")
    else:
        print(f"{YELLOW}⚠{RESET} .env file not found. Copy from .env.example")
        all_good = False
    
    # Final verdict
    print("\n" + "="*50)
    if all_good:
        print(f"{GREEN}All checks passed! You're ready to run the application.{RESET}")
        print("\nStart with: docker compose up")
        return 0
    else:
        print(f"{RED}Some checks failed. Please fix the issues above.{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
