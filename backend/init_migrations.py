#!/usr/bin/env python
"""
Database Migration Initialization Script

This script initializes Flask-Migrate for database version control.
Run this once after setting up your environment.

Usage:
    docker compose exec backend python init_migrations.py
    
Or manually:
    docker compose exec backend flask db init
    docker compose exec backend flask db migrate -m "Initial migration"
    docker compose exec backend flask db upgrade
"""

from app import app, db
from flask_migrate import init, migrate, upgrade
import os
import sys

def initialize_migrations():
    """Initialize database migrations"""
    migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    
    with app.app_context():
        if not os.path.exists(migrations_dir):
            print("=" * 60)
            print("Initializing Flask-Migrate...")
            print("=" * 60)
            
            try:
                init()
                print("✅ Flask-Migrate initialized!")
            except Exception as e:
                print(f"❌ Error initializing Flask-Migrate: {e}")
                sys.exit(1)
            
            print("\nCreating initial migration...")
            try:
                migrate(message="Initial migration with User and ActivityLog models")
                print("✅ Initial migration created!")
            except Exception as e:
                print(f"❌ Error creating migration: {e}")
                sys.exit(1)
            
            print("\nApplying migration to database...")
            try:
                upgrade()
                print("✅ Database schema updated!")
            except Exception as e:
                print(f"❌ Error applying migration: {e}")
                sys.exit(1)
            
            print("\n" + "=" * 60)
            print("✅ Database migrations setup complete!")
            print("=" * 60)
            print("\n📝 Future schema changes:")
            print("  1. Modify your models in models/models.py")
            print("  2. Run: docker compose exec backend flask db migrate -m 'description of changes'")
            print("  3. Review the generated migration in migrations/versions/")
            print("  4. Run: docker compose exec backend flask db upgrade")
            print("\n📚 Useful commands:")
            print("  - flask db current    # Show current migration")
            print("  - flask db history    # Show migration history")
            print("  - flask db downgrade  # Rollback one migration")
            print("  - flask db show       # Show current migration SQL")
        else:
            print("⚠️  Migrations directory already exists.")
            print("To create a new migration:")
            print("  docker compose exec backend flask db migrate -m 'your message'")
            print("\nTo apply migrations:")
            print("  docker compose exec backend flask db upgrade")

if __name__ == "__main__":
    initialize_migrations()
