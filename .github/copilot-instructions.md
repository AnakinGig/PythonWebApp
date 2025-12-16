# 🤖 Copilot Instructions - PythonWebApp

> **Purpose**: Central context file for GitHub Copilot to understand project architecture, conventions, and current state.
> **Last Updated**: December 16, 2025
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

### ✅ Implemented Features
1. **User Management System**
   - User registration and authentication
   - Role-based access control (Admin/User)
   - User CRUD operations (Create, Read, Update, Delete)
   - Profile management with email verification
   - Password reset with token expiry

2. **Admin Dashboard**
   - Real-time system metrics and monitoring
   - User statistics and analytics
   - Activity log tracking
   - System health checks
   - CSV export functionality

3. **Security & Authentication**
   - Secure session-based authentication
   - CSRF protection
   - Password strength validation (8+ chars, uppercase, lowercase, digit, special)
   - Rate limiting (anti-brute force)
   - Input sanitization (XSS prevention)
   - Admin protection (cannot delete last admin)
   - Email verification workflow
   - Password reset with same-password prevention

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

6. **Email System**
   - Welcome emails on registration
   - Email verification emails
   - Password reset emails
   - Transactional email support

---

## 🏗️ Architecture Overview

```
PythonWebApp/
├── backend/                    # Flask API Server
│   ├── app.py                  # Main Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── core/                   # Core configuration & constants
│   ├── models/                 # SQLAlchemy models + Marshmallow schemas
│   ├── routes/                 # API blueprints (auth, user, admin)
│   ├── middleware/             # Activity logging & monitoring
│   └── utils/                  # Validation, sanitization, API responses
│
├── frontend/                   # React Application
│   ├── package.json            # NPM dependencies
│   ├── src/
│   │   ├── App.js              # Main routing with lazy loading
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI components
│   │   │   └── layout/         # Header, Footer
│   │   ├── pages/              # Route components (Login, Register, Profile, etc.)
│   │   ├── context/            # React Context (Theme)
│   │   ├── hooks/              # Custom hooks (useApi)
│   │   └── utils/              # Axios httpClient with CSRF interceptor
│   └── nginx.conf              # Production Nginx config
│
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
└── .github/copilot-instructions.md  # This file
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
from routes import admin_bp, auth_bp, user_bp
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

#### Route Blueprints
- **auth_bp**: `/api/auth/*` - Authentication (login, register, logout, current-user)
- **user_bp**: `/api/user/*` - User account (profile, email verification, password reset)
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

#### Form Validation Pattern (Standard)
```javascript
// State management
const [form_submited, setFormSubmited] = useState(false);
const [email, setEmail] = useState("");
const [email_error, setEmailError] = useState("");

// Conditional validation - only validate on change if form submitted
onChange={(e) => {
  setEmail(e.target.value);
  if (form_submited) setEmailError(validateEmail(e.target.value));
}}

// Conditional error display - show only when both conditions true
className={`form-control form-control-lg ${
  form_submited && email_error ? "is-invalid" : ""
}`}
{form_submited && email_error && (
  <div className="invalid-feedback">{email_error}</div>
)}

// Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setFormSubmited(true);
  // ... validation and API call
};
```

#### API Calls with useApi Hook
```javascript
const { loading, error, callApi, resetError } = useApi();

const handleSubmit = async () => {
  const { data: result, error: apiError } = await callApi(() =>
    httpClient.post('/endpoint', data)
  );
};
```

#### HTTP Client
- Always use `httpClient` from `utils/httpClient.js`
- CSRF token automatically attached via interceptor
- Base URL: `process.env.REACT_APP_BACKEND_URL`

---

## 👤 User Model

```python
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(32), primary_key=True)  # UUID hex
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(345), nullable=False, unique=True, index=True)
    password = db.Column(db.Text, nullable=False)  # Bcrypt hashed
    role = db.Column(db.String(50), default="Utilisateur", index=True)
    
    # Email verification
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    verification_token = db.Column(db.String(100), nullable=True, unique=True)
    verification_token_expiry = db.Column(db.DateTime, nullable=True)
    
    # Password reset
    reset_token = db.Column(db.String(100), nullable=True, unique=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
```

### User Roles
- `"Administrateur"` - Admin access (CRUD users, view logs, metrics)
- `"Utilisateur"` - Standard user

---

## 🔗 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/current-user` | Get logged-in user info |
| POST | `/register` | Register new user |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |

### User Account (`/api/user`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get current user profile |
| PUT/PATCH | `/profile` | Update profile (name, email, password) |
| GET | `/verify-email/<token>` | Verify email with token |
| POST | `/resend-verification` | Resend verification email (session-only) |
| POST | `/request-password-reset` | Request password reset email |
| POST | `/reset-password/<token>` | Reset password with token |

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
| GET | `/api/health` | Health check |
| GET | `/api/metrics` | Application metrics |

---

## 🖥️ Frontend Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | ForgotPassword | Public |
| `/reset-password/:token` | ResetPassword | Public |
| `/verify-email/:token` | VerifyEmail | Public |
| `/profile` | UserProfile | Private (authenticated) |
| `/admin/dashboard` | AdminDashboard | Admin only |
| `/admin/users` | UsersList | Admin only |
| `/admin/manage-user/:id` | ManageUser | Admin only |
| `/admin/activity-logs` | ActivityLogs | Admin only |

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | Bcrypt with salting |
| Session Management | Flask-Session + Redis |
| CSRF Protection | Flask-WTF CSRFProtect |
| Rate Limiting | Flask-Limiter (100/min global, 5/min login) |
| Input Sanitization | Bleach library (XSS protection) |
| Password Validation | Min 8 chars, uppercase, lowercase, digit, special |
| Email Verification | 24h token expiry |
| Password Reset | 1h token expiry + same-password prevention |
| Role-Based Access | `@admin_required` decorator |
| Admin Protection | Cannot delete last admin |

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

## 🚀 Common Commands

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

### Production
```bash
# Start production
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🌍 Language & Localization

- **UI Language**: French 🇫🇷
- **Error Messages**: French (defined in `core/constants.py`)
- **Code Comments**: English (preferred)

---

## 💡 Tips for Copilot

1. **Always use package-level imports** - Import from `core`, `models`, `utils`, `middleware`, `routes`
2. **Use standardized API responses** - `success_response()`, `error_response()`, `paginated_response()`
3. **Validate before saving** - Use `validate_user_fields()` for user data
4. **Log important actions** - Use `log_activity_with_details(action, details)`
5. **French UI text** - All user-facing messages in French
6. **Use useApi hook** - For frontend API calls with loading/error states
7. **Protect admin routes** - Use `@admin_required` decorator
8. **Bootstrap styling** - Use Bootstrap 5 classes
9. **Think white-label** - Consider client customization in every feature
10. **Reusable components** - Build modular, client-friendly features
11. **Form validation pattern** - Use form_submited && error pattern consistently
12. **Password security** - Always hash with bcrypt, prevent same-password reuse
13. **Email verification** - Use token-based verification with expiry
14. **Activity logging** - Log all security-sensitive operations
15. **Testing** - Write unit tests for critical features

---

## ✅ Project Status

### Completed Features
- ✅ User authentication (login, register, logout)
- ✅ Email verification workflow
- ✅ Password reset system
- ✅ User profile management
- ✅ Admin dashboard with metrics
- ✅ User management (CRUD)
- ✅ Activity logging
- ✅ Role-based access control
- ✅ Responsive UI with Bootstrap
- ✅ Production-ready Docker setup
- ✅ Password validation and strength checking
- ✅ Same-password reuse prevention

### Current Status (December 16, 2025)
- ✅ All essential authentication features working
- ✅ All containers running healthy (backend, frontend, db, redis)
- ✅ Form validation standardized across application
- ✅ Security hardening complete
- ✅ Documentation updated
- ✅ 16 organized git commits with clean history

### Next Priority Items
- [ ] Backend Unit Tests
- [ ] Frontend Unit Tests
- [ ] File Upload System (avatars)
- [ ] Client Onboarding Guide
- [ ] Deployment Guide

---

## 📁 Project Structure Quick Reference

**Backend Files**:
- `backend/app.py` - Main Flask app
- `backend/routes/auth.py` - Authentication endpoints
- `backend/routes/user.py` - User account endpoints
- `backend/routes/admin.py` - Admin endpoints
- `backend/utils/helpers.py` - Validation functions
- `backend/models/models.py` - Database models

**Frontend Files**:
- `frontend/src/App.js` - Main routing
- `frontend/src/pages/Login.js` - Login form
- `frontend/src/pages/Register.js` - Registration form
- `frontend/src/pages/UserProfile.js` - Profile page
- `frontend/src/components/layout/Header.js` - Navigation header
- `frontend/src/utils/httpClient.js` - Axios configuration
- `frontend/src/hooks/useApi.js` - API call hook

---

## 🎯 Current Focus

**Active Development**: Essential Features
- Goal: Complete all high-priority items before client pilot

**Working Sprint**: 
- Email verification ✅
- Password management ✅
- User profiles ✅
- Form validation standardization ✅

**Next Sprint**:
- Backend unit tests
- File upload system
- Integration tests

---

**For detailed project history and completed items, see**: `/home/user/projects/personnal/PythonWebApp/copilot.md`
