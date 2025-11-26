"""
Application Monitoring Module

Provides metrics collection, performance tracking, and monitoring utilities.
"""

import time
import psutil
import logging
from functools import wraps
from flask import request, g
from datetime import datetime

class MetricsCollector:
    """Collects application metrics"""
    
    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.response_times = []
        self.endpoint_metrics = {}
        
    def record_request(self, endpoint, method, status_code, response_time):
        """Record metrics for a request"""
        self.request_count += 1
        self.response_times.append(response_time)
        
        if status_code >= 400:
            self.error_count += 1
        
        # Track per-endpoint metrics
        key = f"{method} {endpoint}"
        if key not in self.endpoint_metrics:
            self.endpoint_metrics[key] = {
                'count': 0,
                'errors': 0,
                'total_time': 0,
                'avg_time': 0
            }
        
        metrics = self.endpoint_metrics[key]
        metrics['count'] += 1
        metrics['total_time'] += response_time
        metrics['avg_time'] = metrics['total_time'] / metrics['count']
        
        if status_code >= 400:
            metrics['errors'] += 1
    
    def get_metrics(self):
        """Get current metrics summary"""
        avg_response_time = sum(self.response_times) / len(self.response_times) if self.response_times else 0
        error_rate = (self.error_count / self.request_count * 100) if self.request_count > 0 else 0
        
        return {
            'requests': {
                'total': self.request_count,
                'errors': self.error_count,
                'error_rate': round(error_rate, 2)
            },
            'performance': {
                'avg_response_time_ms': round(avg_response_time, 2),
                'min_response_time_ms': round(min(self.response_times), 2) if self.response_times else 0,
                'max_response_time_ms': round(max(self.response_times), 2) if self.response_times else 0
            },
            'endpoints': self.endpoint_metrics
        }
    
    def get_system_metrics(self):
        """Get system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu': {
                    'percent': round(cpu_percent, 2),
                    'count': psutil.cpu_count()
                },
                'memory': {
                    'total_mb': round(memory.total / (1024 * 1024), 2),
                    'available_mb': round(memory.available / (1024 * 1024), 2),
                    'used_mb': round(memory.used / (1024 * 1024), 2),
                    'percent': memory.percent
                },
                'disk': {
                    'total_gb': round(disk.total / (1024 * 1024 * 1024), 2),
                    'used_gb': round(disk.used / (1024 * 1024 * 1024), 2),
                    'free_gb': round(disk.free / (1024 * 1024 * 1024), 2),
                    'percent': disk.percent
                }
            }
        except Exception as e:
            logging.error(f"Error collecting system metrics: {e}")
            return {}

# Global metrics collector instance
metrics_collector = MetricsCollector()

def monitor_request():
    """Middleware to monitor request performance"""
    g.start_time = time.time()

def record_request_metrics(response):
    """Record metrics after request completion"""
    if hasattr(g, 'start_time'):
        response_time = (time.time() - g.start_time) * 1000  # Convert to ms
        
        # Get endpoint (remove query parameters)
        endpoint = request.path
        method = request.method
        status_code = response.status_code
        
        metrics_collector.record_request(endpoint, method, status_code, response_time)
        
        # Log slow requests (> 1 second)
        if response_time > 1000:
            logging.warning(
                f"Slow request: {method} {endpoint} took {response_time:.2f}ms "
                f"(status: {status_code})"
            )
    
    return response

def track_performance(operation_name):
    """Decorator to track performance of specific operations"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = (time.time() - start_time) * 1000
                if duration > 500:  # Log if operation takes > 500ms
                    logging.info(f"{operation_name} completed in {duration:.2f}ms")
        return wrapper
    return decorator

def get_uptime(start_time):
    """Calculate application uptime"""
    uptime_seconds = time.time() - start_time
    days = int(uptime_seconds // 86400)
    hours = int((uptime_seconds % 86400) // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    seconds = int(uptime_seconds % 60)
    
    return {
        'seconds': int(uptime_seconds),
        'formatted': f"{days}d {hours}h {minutes}m {seconds}s"
    }
