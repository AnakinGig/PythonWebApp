import re

VALID_ROLES = {"Utilisateur", "Administrateur"}

def validate_user_fields(email, first_name, last_name, password=None, role=None):
    if not is_valid_email(email) or len(email) > 345:
        return "Format d'email invalide ou trop long."
    if len(first_name) < 1 or len(first_name) > 50:
        return "Le prénom doit contenir entre 1 et 50 caractères."
    if len(last_name) < 1 or len(last_name) > 50:
        return "Le nom doit contenir entre 1 et 50 caractères."
    if role and role not in VALID_ROLES:
        return "Rôle invalide."
    if password is not None:
        if not is_strong_password(password):
            return "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
    return None

# Email validation function
def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email)

# Password strength validation function
def is_strong_password(password):
    # Au moins 8 caractères, une majuscule, une minuscule, un chiffre, un caractère spécial
    regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$'
    return re.match(regex, password)
