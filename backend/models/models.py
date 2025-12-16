from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from uuid import uuid4
from core import UserRole

db = SQLAlchemy()
ma = Marshmallow()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    first_name = db.Column(db.String(50), nullable=False, index=False)
    last_name = db.Column(db.String(50), nullable=False, index=False)
    email = db.Column(db.String(345), nullable=False, unique=True, index=True)
    password = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(50), nullable=False, default=UserRole.USER, index=True)
    
    # Email verification
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    verification_token = db.Column(db.String(100), nullable=True, unique=True, index=True)
    verification_token_expiry = db.Column(db.DateTime, nullable=True)
    
    # Password reset
    reset_token = db.Column(db.String(100), nullable=True, unique=True, index=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    
    # Avatar
    avatar = db.Column(db.String(255), nullable=True)
    
    # Relationship with activity logs
    activity_logs = db.relationship('ActivityLog', backref='user', lazy=True, cascade='all, delete-orphan')

class ActivityLog(db.Model):
    __tablename__ = "activity_logs"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False, index=True)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=db.func.now(), index=True)

# Marshmallow Schema to strucuture the JSON response
class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User

class ActivityLogSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ActivityLog
        include_fk = True