# 🤖 Copilot Project Memory - PythonWebApp

> **Purpose**: This file helps GitHub Copilot remember the project context, architecture, and conventions.
> **Last Updated**: December 14, 2025
> **Repository**: AnakinGig/PythonWebApp
> **Branch**: Dev

---

## 🎯 Project Context

**PythonWebApp** is a **white-label fullstack website template** designed as a foundation for client projects. This is a reusable base that can be customized and sold to any client needing a professional web application.

### Business Purpose
- **Reusable Template**: Base project for rapid client deployment
- **Client-Ready**: Production-ready with all essential business features
- **Customizable**: Easy to rebrand and adapt to specific client needs
- **General Utilities**: Includes common features any company would need

### Target Use Cases
- Corporate websites with user management
- Business applications with admin dashboards
- SaaS platforms with authentication
- Client portals with role-based access
- Internal company tools and management systems

---

## 📋 Project Overview

**PythonWebApp** is a modern fullstack web application with user management, real-time monitoring, and secure authentication - built as a **production-ready template for client projects**.

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 18.2.0 |
| UI Framework | Bootstrap | 5.3+ |
| Routing | React Router | 6.30.1 |
| HTTP Client | Axios | 1.6.2 |
| Backend | Flask (Python) | 3.1.2 |
| Database | PostgreSQL | 13-alpine |
| Session Store | Redis | 7 |
| API Docs | Swagger/Flasgger | 0.9.7.1 |
| DevOps | Docker Compose | - |
| Prod Server | Nginx + Gunicorn | - |

---

## 🏢 Core Business Features (White-Label Ready)

This template includes essential features that any business would need:

### ✅ Implemented Features
1. **User Management System**
   - User registration and authentication
   - Role-based access control (Admin/User)
   - User CRUD operations (Create, Read, Update, Delete)
   - Profile management

2. **Admin Dashboard**
   - Real-time system metrics and monitoring
   - User statistics and analytics
   - Activity log tracking
   - System health checks
   - CSV export functionality

3. **Security & Authentication**
   - Secure session-based authentication
   - CSRF protection
   - Password strength validation
   - Rate limiting (anti-brute force)
   - Input sanitization (XSS prevention)
   - Admin protection (cannot delete last admin)

4. **Activity Logging & Audit Trail**
   - Complete user activity tracking
   - IP address and user agent logging
   - Timestamp-based activity history
   - Admin activity monitoring

5. **Responsive UI**
   - Mobile-first Bootstrap 5 design
   - Dark/Light theme support
   - Modern, professional interface
   - Reusable component library

6. **API Documentation**
   - Swagger/OpenAPI docs at `/api/docs`
   - Complete endpoint documentation
   - Easy for client developers to understand

7. **Production-Ready Infrastructure**
   - Docker containerization
   - Separate dev/prod environments
   - Database migrations support
   - Health monitoring endpoints
   - Automated backup support

### 🎨 Customization Points for Clients
- **Branding**: Logo, colors, company name
- **User Roles**: Extend role system for client needs
- **Additional Features**: Add client-specific modules
- **Email Templates**: Customize notification emails
- **Dashboard Widgets**: Add client-specific metrics
- **Report Generation**: Custom business reports
- **Integration**: Connect client's existing systems

---

## 🏗️ Architecture

### Project Structure

```
PythonWebApp/
├── backend/                    # Flask API Server
│   ├── app.py                  # Main Flask application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Dev Docker config
│   ├── Dockerfile.prod         # Production Docker config
│   ├── core/                   # Core configuration
│   │   ├── __init__.py         # Exports: ApplicationConfig, UserRole, ErrorMessages, SuccessMessages, RateLimits
│   │   ├── config.py           # Flask app configuration (DB, Redis, Session)
│   │   └── constants.py        # Constants: UserRole, ErrorMessages, SuccessMessages, RateLimits
│   ├── models/                 # Database models
│   │   ├── __init__.py         # Exports: db, ma, User, UserSchema, ActivityLog, ActivityLogSchema
│   │   └── models.py           # SQLAlchemy models: User, ActivityLog + Marshmallow schemas
│   ├── routes/                 # API route blueprints
│   │   ├── __init__.py         # Exports: admin_bp, auth_bp
│   │   ├── auth.py             # Auth routes: /api/auth/* (login, logout, register, current-user)
│   │   └── admin.py            # Admin routes: /api/admin/* (users CRUD, activity logs, metrics)
│   ├── middleware/             # Request middleware
│   │   ├── __init__.py         # Exports: log_activity, log_activity_with_details, metrics_collector, etc.
│   │   ├── activity_logger.py  # Activity logging decorator & functions
│   │   └── monitoring.py       # MetricsCollector class, performance tracking
│   └── utils/                  # Utility functions
│       ├── __init__.py         # Exports: validate_user_fields, sanitize_input, is_valid_email, is_strong_password, success_response, error_response, paginated_response
│       ├── helpers.py          # Validation & sanitization functions
│       └── api_response.py     # Standardized API response helpers
│
├── frontend/                   # React Application
│   ├── package.json            # NPM dependencies
│   ├── Dockerfile              # Dev Docker config
│   ├── Dockerfile.prod         # Production Docker config (multi-stage build)
│   ├── nginx.conf              # Nginx config for production
│   ├── public/                 # Static assets
│   └── src/
│       ├── App.js              # Main app with routing, lazy loading
│       ├── App.css             # Global styles
│       ├── index.js            # React entry point
│       ├── components/
│       │   ├── common/         # Reusable UI components
│       │   │   ├── ConfirmDialog.js  # Confirmation modal
│       │   │   ├── ErrorBoundary.js  # React error boundary
│       │   │   ├── LoadingSpinner.js # Loading indicators
│       │   │   ├── Modal.js          # Reusable modal component
│       │   │   ├── PrivateRoute.js   # Route protection with role-based access
│       │   │   ├── SkeletonLoader.js # Skeleton loading states
│       │   │   └── Toast.js          # Toast notifications
│       │   └── layout/
│       │       ├── Header.js   # App header with navigation
│       │       └── Footer.js   # App footer
│       ├── context/
│       │   └── ThemeContext.js # Dark/Light theme provider (localStorage persisted)
│       ├── hooks/
│       │   └── useApi.js       # Custom hook for API calls with loading/error states
│       ├── pages/
│       │   ├── Home.js         # Homepage
│       │   ├── Login.js        # Login form
│       │   ├── Register.js     # Registration form
│       │   ├── NotFound.js     # 404 page
│       │   ├── AdminDashboard.js  # Admin metrics dashboard
│       │   ├── UsersList.js    # User management list
│       │   ├── ManageUser.js   # Edit user form
│       │   └── ActivityLogs.js # Activity logs viewer
│       └── utils/
│           └── httpClient.js   # Axios instance with CSRF interceptor
│
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment (with secrets)
├── README.md                   # Project documentation
└── PROJECT_REVIEW.md           # Roadmap and review notes
```

---

## 🔑 Key Patterns & Conventions

### Backend Conventions

#### Import Pattern
```python
# Use package-level imports
from core import ApplicationConfig, UserRole, ErrorMessages, SuccessMessages, RateLimits
from models import db, ma, User, UserSchema, ActivityLog
from utils import validate_user_fields, sanitize_input, success_response, error_response
from middleware import log_activity_with_details, metrics_collector
from routes import admin_bp, auth_bp
```

#### API Response Format
All API endpoints use standardized response helpers:
```python
# Success response
return success_response(data={"id": user.id}, message="Utilisateur créé avec succès.", status=201)

# Error response
return error_response("Email invalide", status=401)

# Paginated response
return paginated_response(items=user_data, pagination={...})
```

#### Response Structure
```json
// Success
{ "success": true, "data": {...}, "message": "..." }

// Error
{ "success": false, "error": "Error message" }

// Paginated
{ "success": true, "data": [...], "pagination": { "page": 1, "per_page": 20, "total": 100, ... } }
```

#### Route Blueprints
- **auth_bp**: `/api/auth/*` - Authentication routes
- **admin_bp**: `/api/admin/*` - Admin-only routes (protected by `@admin_required`)

#### Decorators
```python
@admin_required           # Requires admin role
@log_activity("Action")   # Logs user activity
@limiter.limit("5 per minute")  # Rate limiting
```

### Frontend Conventions

#### Component Pattern
- Lazy loading for pages: `const Page = lazy(() => import('./pages/Page'))`
- Wrap in `<Suspense>` with `<LoadingSpinner />` fallback
- Use Bootstrap classes for styling

#### API Calls with useApi Hook
```javascript
const { loading, error, callApi, resetError } = useApi();

const handleSubmit = async () => {
  const { data: result, error: apiError } = await callApi(() =>
    httpClient.post('/endpoint', data)
  );
  if (result) {
    // Success handling
  } else {
    // Error handling - apiError contains the message
  }
};
```

#### HTTP Client
- Always use `httpClient` from `utils/httpClient.js`
- CSRF token automatically attached via interceptor
- Base URL: `process.env.REACT_APP_BACKEND_URL`

#### Theme
- Use `useTheme()` hook from `ThemeContext`
- Supports `light` and `dark` themes
- Persisted in localStorage

---

## 👤 User Model

```python
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(32), primary_key=True, default=get_uuid)  # UUID hex
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(345), nullable=False, unique=True, index=True)
    password = db.Column(db.Text, nullable=False)  # Bcrypt hashed
    role = db.Column(db.String(50), default="Utilisateur", index=True)
    activity_logs = db.relationship('ActivityLog', backref='user', cascade='all, delete-orphan')
```

### User Roles
- `"Administrateur"` - Admin access (CRUD users, view logs, metrics)
- `"Utilisateur"` - Standard user

---

## 📝 ActivityLog Model

```python
class ActivityLog(db.Model):
    __tablename__ = "activity_logs"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    timestamp = db.Column(db.DateTime, default=db.func.now(), index=True)
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | Bcrypt |
| Session Management | Flask-Session + Redis |
| CSRF Protection | Flask-WTF CSRFProtect |
| Rate Limiting | Flask-Limiter (100/min global, 5/min login, 3/min register) |
| Input Sanitization | Bleach library (XSS protection) |
| Password Validation | Min 8 chars, uppercase, lowercase, digit, special char |
| Role-Based Access | `@admin_required` decorator |
| Admin Protection | Cannot delete last admin, cannot modify own admin role |

---

## 🔗 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/current-user` | Get logged-in user info |
| POST | `/register` | Register new user |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users (paginated) |
| POST | `/users` | Create new user |
| GET | `/users/<id>` | Get user by ID |
| PUT/PATCH | `/users/<id>` | Update user |
| DELETE | `/users/<id>` | Delete user |
| GET | `/activity-logs` | Get activity logs (paginated) |

### Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/get_csrf_token` | Get CSRF token |
| GET | `/api/health` | Health check (DB, Redis, uptime) |
| GET | `/api/metrics` | Application & system metrics |

---

## 🖥️ Frontend Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/admin/dashboard` | AdminDashboard | Admin only |
| `/admin/users` | UsersList | Admin only |
| `/admin/manage-user/:id` | ManageUser | Admin only |
| `/admin/activity-logs` | ActivityLogs | Admin only |
| `/*` | NotFound | Public |

---

## 🐳 Docker Services

### Development (`docker-compose.yml`)
| Service | Port | Description |
|---------|------|-------------|
| backend | 5000 | Flask dev server |
| frontend | 3000 | React dev server |
| db | 5432 | PostgreSQL |
| redis | 6379 | Redis session store |

### Production (`docker-compose.prod.yml`)
| Service | Port | Description |
|---------|------|-------------|
| backend | 5000 | Gunicorn + Flask |
| frontend | 80 | Nginx + React build |
| db | (internal) | PostgreSQL |
| redis | (internal) | Redis |

---

## ⚙️ Environment Variables

### Required Variables
```env
# Security
SECRET_KEY=<generated-secret-key>

# Admin Account (created on startup)
ADMIN_MAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!

# URLs
REACT_APP_BACKEND_URL=http://localhost:5000/api
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@db:5432/users_db
```

### Production Secrets (files in `.env_prod_secrets/`)
- `SECRET_KEY`
- `ADMIN_MAIL`
- `ADMIN_PASSWORD`

---

## 🚀 Commands Reference

### Development
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Rebuild after changes
docker compose build && docker compose up -d

# Access backend shell
docker compose exec backend bash
```

### Database Migrations
```bash
# Initialize migrations
docker compose exec backend flask db init

# Create migration
docker compose exec backend flask db migrate -m "Description"

# Apply migration
docker compose exec backend flask db upgrade
```

### Production
```bash
# Start production
docker compose -f docker-compose.prod.yml up -d

# View production logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 📊 Monitoring & Metrics

The app collects:
- **Request Metrics**: Total requests, error count, error rate
- **Performance**: Avg/min/max response time, slow request warnings (>1s)
- **Per-Endpoint Metrics**: Count, errors, avg time per endpoint
- **System Metrics**: CPU %, memory usage, disk usage
- **Uptime**: Application uptime since start

---

## 🌍 Language

- **UI Language**: French 🇫🇷
- **Error Messages**: French (defined in `core/constants.py`)
- **Code Comments**: English (preferred)

---

## 🎯 Roadmap Items (from PROJECT_REVIEW.md)

### Priority 1 - Critical (Template Improvements)
- [ ] Change default DB credentials in production
- [ ] Create `.env.example` template
- [ ] Initialize database migrations

### Priority 2 - Testing (Client Confidence)
- [ ] Add backend unit tests (pytest)
- [ ] Add frontend unit tests (React Testing Library)

### Priority 3 - Client-Requested Features (Common Needs)
- [ ] **Password Reset Functionality** - Self-service password recovery
- [ ] **Email Verification** - Verify user email addresses on registration
- [ ] **User Profile Page** - Allow users to edit their own profiles
- [ ] **2FA Authentication** - Two-factor authentication for enhanced security
- [ ] **Email Notifications** - System notifications and alerts
- [ ] **File Upload System** - Document/image upload capabilities
- [ ] **Search Functionality** - Global search across entities
- [ ] **Data Export** - PDF/Excel report generation
- [ ] **API Key Management** - For client integrations
- [ ] **Multi-language Support** - i18n for international clients
- [ ] **Company Settings Page** - Configurable application settings
- [ ] **User Groups/Teams** - Organize users into departments
- [ ] **Notification System** - In-app notifications and alerts
- [ ] **Audit Trail Export** - Compliance reporting

### Priority 4 - White-Label Enhancements
- [ ] **Theme Customization Panel** - Easy branding without code changes
- [ ] **Logo Upload System** - Client can upload their own logo
- [ ] **Custom Email Templates** - Branded email notifications
- [ ] **Terms of Service / Privacy Policy Pages** - Customizable legal pages
- [ ] **Multi-tenant Support** - Run multiple clients on same instance

---

## 💡 Tips for Copilot

1. **Always use package-level imports** - Import from `core`, `models`, `utils`, `middleware`, `routes`
2. **Use standardized API responses** - `success_response()`, `error_response()`, `paginated_response()`
3. **Sanitize user input** - Use `sanitize_input()` for text fields (not passwords)
4. **Validate before saving** - Use `validate_user_fields()` for user data
5. **Log important actions** - Use `log_activity_with_details(action, details)`
6. **French UI text** - All user-facing messages should be in French (but make it easy to change for clients)
7. **Use useApi hook** - For frontend API calls with loading/error states
8. **Protect admin routes** - Use `@admin_required` decorator and `<PrivateRoute requiredRole="Administrateur">`
9. **UUID for user IDs** - User IDs are 32-char hex strings from `uuid4().hex`
10. **Bootstrap styling** - Use Bootstrap 5 classes for all UI components
11. **Think white-label** - When adding features, consider how easily a client can customize it
12. **Reusable components** - Build features as reusable modules that work for any business
13. **Client documentation** - Keep code well-documented for easy client handoff
14. **Scalability** - Design features to handle growth (pagination, caching, optimization)
15. **Professional UI** - Maintain a polished, business-ready appearance
