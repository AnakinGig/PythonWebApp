import re
import bleach
from constants import UserRole, ErrorMessages

def validate_user_fields(email, first_name, last_name, password=None, role=None):
    if not is_valid_email(email) or len(email) > 345:
        return ErrorMessages.EMAIL_INVALID_FORMAT
    if len(first_name) < 1 or len(first_name) > 50:
        return ErrorMessages.FIRST_NAME_LENGTH
    if len(last_name) < 1 or len(last_name) > 50:
        return ErrorMessages.LAST_NAME_LENGTH
    if role and role not in UserRole.all():
        return ErrorMessages.INVALID_ROLE
    if password is not None:
        if not is_strong_password(password):
            return ErrorMessages.WEAK_PASSWORD
    return None

def sanitize_input(text):
    """Sanitize user input to prevent XSS attacks"""
    if text is None:
        return None
    # Remove all HTML tags and attributes
    return bleach.clean(text, tags=[], attributes={}, strip=True)

# Email validation function
def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email)

# Password strength validation function
def is_strong_password(password):
    # At least 8 characters, one uppercase, one lowercase, one digit, one special character
    regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$'
    return re.match(regex, password)
