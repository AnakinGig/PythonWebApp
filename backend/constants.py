"""
Application constants and configurations
"""

# User Roles
class UserRole:
    ADMIN = "Administrateur"
    USER = "Utilisateur"
    
    @classmethod
    def all(cls):
        return {cls.ADMIN, cls.USER}

# Error Messages (French)
class ErrorMessages:
    # Authentication
    INVALID_EMAIL = "Email invalide"
    INVALID_PASSWORD = "Mot de passe invalide"
    USER_EXISTS = "Cette adresse email est déjà utilisée."
    USER_NOT_FOUND = "User not found"
    UNAUTHORIZED = "Unauthorized"
    FORBIDDEN = "Forbidden"
    
    # Validation
    EMAIL_INVALID_FORMAT = "Format d'email invalide ou trop long."
    FIRST_NAME_LENGTH = "Le prénom doit contenir entre 1 et 50 caractères."
    LAST_NAME_LENGTH = "Le nom doit contenir entre 1 et 50 caractères."
    INVALID_ROLE = "Rôle invalide."
    WEAK_PASSWORD = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
    
    # Admin Operations
    CANNOT_DELETE_SELF = "Vous ne pouvez pas supprimer votre propre compte admin."
    CANNOT_DELETE_LAST_ADMIN = "Impossible de supprimer le dernier compte administrateur."
    CANNOT_MODIFY_SELF_ROLE = "Impossible de modifier votre propre rôle administrateur."
    CANNOT_MODIFY_LAST_ADMIN_ROLE = "Impossible de modifier le rôle du dernier compte administrateur."
    
    # Generic
    GENERIC_ERROR = "Une erreur est survenue."
    RATE_LIMIT_EXCEEDED = "Trop de tentatives. Veuillez réessayer plus tard."

# Success Messages
class SuccessMessages:
    USER_CREATED = "Utilisateur créé avec succès."
    USER_MODIFIED = "Utilisateur modifié avec succès."
    USER_DELETED = "Utilisateur supprimé avec succès."
    LOGGED_OUT = "Déconnexion réussie."

# Rate Limiting
class RateLimits:
    LOGIN = "5 per minute"
    REGISTER = "3 per minute"
    DEFAULT = "100 per minute"
