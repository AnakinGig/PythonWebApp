"""
Email utility functions for sending transactional emails
"""
from flask import render_template_string
from flask_mail import Message, Mail
from threading import Thread
import os

mail = Mail()

def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        mail.send(msg)

def send_email(subject, recipient, html_body, text_body=None):
    """
    Send email with HTML and optional text body
    
    Args:
        subject: Email subject
        recipient: Recipient email address
        html_body: HTML content
        text_body: Plain text content (optional)
    """
    from flask import current_app
    
    msg = Message(
        subject=subject,
        sender=current_app.config['MAIL_DEFAULT_SENDER'],
        recipients=[recipient]
    )
    msg.html = html_body
    if text_body:
        msg.body = text_body
    
    # Send asynchronously to avoid blocking
    Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()

def send_password_reset_email(user, reset_token):
    """
    Send password reset email
    
    Args:
        user: User object
        reset_token: Password reset token
    """
    from core import BrandingConfig
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    reset_url = f"{frontend_url}/reset-password/{reset_token}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: {os.getenv('REACT_APP_PRIMARY_COLOR', '#0d6efd')}; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: {os.getenv('REACT_APP_PRIMARY_COLOR', '#0d6efd')}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{BrandingConfig.APP_NAME}</h1>
            </div>
            <div class="content">
                <h2>Réinitialisation de mot de passe</h2>
                <p>Bonjour {user.first_name},</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Réinitialiser mon mot de passe</a>
                </p>
                <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #0d6efd;">{reset_url}</p>
                <p><strong>Ce lien expirera dans 1 heure.</strong></p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {BrandingConfig.COMPANY_NAME}. Tous droits réservés.</p>
                <p>Besoin d'aide ? Contactez-nous à <a href="mailto:{BrandingConfig.SUPPORT_EMAIL}">{BrandingConfig.SUPPORT_EMAIL}</a></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
Bonjour {user.first_name},

Vous avez demandé à réinitialiser votre mot de passe pour {BrandingConfig.APP_NAME}.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
{reset_url}

Ce lien expirera dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe {BrandingConfig.COMPANY_NAME}
    """
    
    send_email(
        subject=f"Réinitialisation de mot de passe - {BrandingConfig.APP_NAME}",
        recipient=user.email,
        html_body=html_body,
        text_body=text_body
    )

def send_email_verification(user, verification_token):
    """
    Send email verification link
    
    Args:
        user: User object
        verification_token: Email verification token
    """
    from core import BrandingConfig
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    verify_url = f"{frontend_url}/verify-email/{verification_token}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: {os.getenv('REACT_APP_PRIMARY_COLOR', '#0d6efd')}; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: {os.getenv('REACT_APP_PRIMARY_COLOR', '#0d6efd')}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{BrandingConfig.APP_NAME}</h1>
            </div>
            <div class="content">
                <h2>Bienvenue sur {BrandingConfig.APP_NAME} !</h2>
                <p>Bonjour {user.first_name},</p>
                <p>Merci de vous être inscrit sur {BrandingConfig.APP_NAME}. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
                <p style="text-align: center;">
                    <a href="{verify_url}" class="button">Vérifier mon email</a>
                </p>
                <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #0d6efd;">{verify_url}</p>
                <p><strong>Ce lien expirera dans 24 heures.</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {BrandingConfig.COMPANY_NAME}. Tous droits réservés.</p>
                <p>Besoin d'aide ? Contactez-nous à <a href="mailto:{BrandingConfig.SUPPORT_EMAIL}">{BrandingConfig.SUPPORT_EMAIL}</a></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
Bienvenue sur {BrandingConfig.APP_NAME} !

Bonjour {user.first_name},

Merci de vous être inscrit. Pour activer votre compte, cliquez sur ce lien :
{verify_url}

Ce lien expirera dans 24 heures.

Cordialement,
L'équipe {BrandingConfig.COMPANY_NAME}
    """
    
    send_email(
        subject=f"Vérification de votre email - {BrandingConfig.APP_NAME}",
        recipient=user.email,
        html_body=html_body,
        text_body=text_body
    )

def send_welcome_email(user):
    """
    Send welcome email after email verification
    
    Args:
        user: User object
    """
    from core import BrandingConfig
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: {os.getenv('REACT_APP_PRIMARY_COLOR', '#0d6efd')}; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: {os.getenv('REACT_APP_PRIMARY_COLOR', '#0d6efd')}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Bienvenue !</h1>
            </div>
            <div class="content">
                <h2>Votre compte est maintenant actif</h2>
                <p>Bonjour {user.first_name},</p>
                <p>Félicitations ! Votre compte {BrandingConfig.APP_NAME} a été vérifié avec succès.</p>
                <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.</p>
                <p style="text-align: center;">
                    <a href="{frontend_url}/login" class="button">Se connecter</a>
                </p>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:{BrandingConfig.SUPPORT_EMAIL}">{BrandingConfig.SUPPORT_EMAIL}</a></p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {BrandingConfig.COMPANY_NAME}. Tous droits réservés.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
Bienvenue sur {BrandingConfig.APP_NAME} !

Bonjour {user.first_name},

Votre compte a été vérifié avec succès. Vous pouvez maintenant vous connecter et profiter de toutes nos fonctionnalités.

Connectez-vous ici : {frontend_url}/login

Cordialement,
L'équipe {BrandingConfig.COMPANY_NAME}
    """
    
    send_email(
        subject=f"Bienvenue sur {BrandingConfig.APP_NAME} !",
        recipient=user.email,
        html_body=html_body,
        text_body=text_body
    )
