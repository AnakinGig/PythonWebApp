from dotenv import load_dotenv
import os
import redis

load_dotenv()

class ApplicationConfig:
    SECRET_KEY = open("/run/secrets/SECRET_KEY").read().strip() if os.path.exists("/run/secrets/SECRET_KEY") else os.environ["SECRET_KEY"]
    
    # Database config
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get("FLASK_ENV", "production") == "development"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    
    # Server side session config
    SESSION_TYPE = "redis"
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_REDIS = redis.from_url("redis://redis:6379")
    
    # Email config
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "False").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", os.environ.get("MAIL_USERNAME"))

    