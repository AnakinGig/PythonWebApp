"""
API Response Helper

Provides consistent response format across all endpoints.

All API routes use these standardized response helpers to ensure consistent
response structure across the API.

Example usage:
    from api_response import success_response, error_response, paginated_response
    
    return success_response(data={'users': users}, message='Success')
    return error_response('User not found', status=404)
    return paginated_response(items=users, pagination=pagination_info)
"""

from flask import jsonify
from typing import Any, Optional, Dict

def success_response(data: Any = None, message: Optional[str] = None, status: int = 200):
    """
    Standard success response format
    
    Args:
        data: Response data (can be dict, list, or any JSON-serializable object)
        message: Optional success message
        status: HTTP status code (default: 200)
    
    Returns:
        JSON response with consistent structure
    """
    response = {
        "success": True,
        "data": data
    }
    
    if message:
        response["message"] = message
    
    return jsonify(response), status


def error_response(error: str, status: int = 400, details: Optional[Dict] = None):
    """
    Standard error response format
    
    Args:
        error: Error message
        status: HTTP status code (default: 400)
        details: Optional additional error details
    
    Returns:
        JSON response with consistent error structure
    """
    response = {
        "success": False,
        "error": error
    }
    
    if details:
        response["details"] = details
    
    return jsonify(response), status


def paginated_response(items: list, pagination: Dict, status: int = 200):
    """
    Standard paginated response format
    
    Args:
        items: List of items for current page
        pagination: Pagination metadata (page, per_page, total, pages, has_next, has_prev)
        status: HTTP status code (default: 200)
    
    Returns:
        JSON response with data and pagination info
    """
    return jsonify({
        "success": True,
        "data": items,
        "pagination": pagination
    }), status
