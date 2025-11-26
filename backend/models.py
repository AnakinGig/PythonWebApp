from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from uuid import uuid4
from constants import UserRole

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

# Marshmallow Schema to strucuture the JSON response
class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User