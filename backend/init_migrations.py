#!/usr/bin/env python
"""
Database Migration Initialization Script

This script initializes Flask-Migrate for database version control.
Run this once after setting up your environment.

Usage:
    python init_migrations.py
"""

from app import app, db
from flask_migrate import init, migrate, upgrade
import os

def initialize_migrations():
    """Initialize database migrations"""
    migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    
    with app.app_context():
        if not os.path.exists(migrations_dir):
            print("🔧 Initializing Flask-Migrate...")
            init()
            print("✅ Flask-Migrate initialized!")
            
            print("🔧 Creating initial migration...")
            migrate(message="Initial migration")
            print("✅ Initial migration created!")
            
            print("🔧 Applying migration to database...")
            upgrade()
            print("✅ Database schema updated!")
            
            print("\n✨ Database migrations setup complete!")
            print("\nFuture schema changes:")
            print("  1. Modify your models in models.py")
            print("  2. Run: flask db migrate -m 'description of changes'")
            print("  3. Run: flask db upgrade")
        else:
            print("⚠️  Migrations directory already exists.")
            print("To create a new migration, run: flask db migrate -m 'your message'")

if __name__ == "__main__":
    initialize_migrations()
