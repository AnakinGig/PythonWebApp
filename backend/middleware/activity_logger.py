from flask import request
from functools import wraps
from models.models import db, ActivityLog

def log_activity(action):
    """
    Decorator to log user activities.
    
    Usage:
        @log_activity("User logged in")
        def login():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Execute the function first
            result = f(*args, **kwargs)
            
            # Log activity after successful execution
            try:
                from flask import session
                user_id = session.get('user_id')
                if user_id:
                    log = ActivityLog(
                        user_id=user_id,
                        action=action,
                        details=None,
                        ip_address=request.remote_addr,
                        user_agent=request.headers.get('User-Agent', '')[:500]
                    )
                    db.session.add(log)
                    db.session.commit()
            except Exception as e:
                # Don't fail the request if logging fails
                import logging
                logging.error(f"Failed to log activity: {str(e)}")
                db.session.rollback()
            
            return result
        return decorated_function
    return decorator

def log_activity_with_details(action, details):
    """
    Log activity with custom details.
    
    Usage:
        log_activity_with_details("User updated", f"Updated user {user_id}")
    """
    try:
        from flask import session
        user_id = session.get('user_id')
        if user_id:
            log = ActivityLog(
                user_id=user_id,
                action=action,
                details=details,
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')[:500]
            )
            db.session.add(log)
            db.session.commit()
    except Exception as e:
        import logging
        logging.error(f"Failed to log activity: {str(e)}")
        db.session.rollback()
