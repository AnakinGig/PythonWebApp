# 🤖 Copilot Instructions - PythonWebApp

**Last Updated**: December 22, 2025 | **Status**: 🟢 Production Ready

---

## 📊 Project Overview

**White-label fullstack website template** - Production-ready. All CRITICAL & HIGH PRIORITY items completed.

### Tech Stack
- **Frontend**: React 18.2 + Bootstrap 5 + React Router 6.30
- **Backend**: Flask 3.1.2 + PostgreSQL + Redis
- **DevOps**: Docker Compose + Nginx + Gunicorn
- **Testing**: pytest (123 tests, 78.23% coverage) + React Testing Library (35+ tests) + GitHub Actions CI/CD

### Core Features ✅
- User auth (register, login, email verification, password reset)
- Admin dashboard (user management, analytics, activity logs)
- Role-based access (Admin/Utilisateur)
- Avatar uploads with image processing
- Security headers (CSP, HSTS, X-Frame-Options, CSRF, rate limiting, XSS prevention)

---

## 🔧 UNIFIED FEATURE WORKFLOW

**ONE FEATURE AT A TIME - Always follow this:**

1. **Plan**: Define feature in TODO list, architecture check
2. **Implement**: Code feature, test manually
3. **Test**: Write tests (backend: `backend/tests/test_*.py` | frontend: `frontend/src/__tests__/`)
4. **Document**: Update README.md if user-facing
5. **Commit**: Only after 100% tests pass - group by feature/domain
6. **Mark Done**: Update TODO list status

**Test Commands**:
```bash
# Backend
sudo docker compose -f docker-compose.prod.yml up -d --build
sudo docker compose -f docker-compose.prod.yml exec backend pip install -r requirements-dev.txt
sudo docker compose -f docker-compose.prod.yml exec backend pytest -v --cov=.

# Frontend
cd frontend && npm test -- --coverage --watchAll=false
```

**WHEN TO TEST**: Security, auth, validation, business logic, API ✅ | UI-only, styling, docs ❌

**GIT COMMIT STYLE**: `scope(domain): brief description` - One feature per commit, test-only commits separate

**README RULE**: ALWAYS update README.md for new features. No separate doc files unless >100 lines.

---

## 🏗️ Architecture

```
backend/                          frontend/
├── app.py (Flask + middleware)  ├── src/App.js (lazy loading)
├── routes/ (auth, user, admin)  ├── pages/ (Login, Register, Profile, etc.)
├── models/models.py             ├── components/ (common, layout)
├── utils/ (validation, helpers) ├── hooks/useApi.js (API wrapper)
├── middleware/ (logging)        ├── utils/httpClient.js (CSRF)
└── tests/ (123 tests)           └── __tests__/ (35+ tests)
```

---

## 🔑 Essential Patterns

### Backend
```python
# Imports (package-level)
from core import ApplicationConfig, UserRole, ErrorMessages
from models import db, ma, User
from utils import success_response, error_response, validate_user_fields

# API Response Format
return success_response(data={"id": user.id}, message="Utilisateur créé", status=201)
return error_response("Email invalide", status=401)
return paginated_response(items=user_data, pagination={...})

# Decorators
@admin_required         # Requires admin role
@log_activity("Action") # Logs activity
@limiter.limit("5/min") # Rate limit
```

### Frontend
```javascript
// Always use useApi for API calls
const { loading, callApi, error } = useApi();
const { data: result, error: apiError } = await callApi(() =>
  httpClient.post('/endpoint', data)
);

// Form validation (standard pattern)
const [form_submited, setFormSubmited] = useState(false);
if (form_submited && email_error) showError(); // Only show if both true
```

---

## 🔗 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Login |
| `/api/auth/register` | POST | Register |
| `/api/auth/current-user` | GET | Get logged-in user |
| `/api/user/profile` | GET/PATCH | Profile management |
| `/api/user/avatar` | POST/DELETE | Avatar upload/delete |
| `/api/admin/users` | GET/POST/PATCH/DELETE | User CRUD |
| `/api/admin/activity-logs` | GET | Activity logs |
| `/api/health` | GET | Health check |

**Frontend Routes**: `/`, `/login`, `/register`, `/profile`, `/admin/dashboard`, `/admin/users`, `/admin/activity-logs`

---

## 🐳 Docker Commands (Production Style)

```bash
# Start/rebuild
sudo docker compose -f docker-compose.prod.yml up -d --build

# View logs
sudo docker compose -f docker-compose.prod.yml logs -f

# Execute commands
sudo docker compose -f docker-compose.prod.yml exec backend <command>
sudo docker compose -f docker-compose.prod.yml exec frontend npm <command>
```

---

## 👤 User Model

```python
id (UUID), first_name, last_name, email (unique)
password (bcrypt), role ("Administrateur" | "Utilisateur")
email_verified, verification_token, verification_token_expiry
reset_token, reset_token_expiry, avatar
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| Passwords | Bcrypt hashing |
| CSRF | Flask-WTF CSRFProtect |
| Rate Limiting | Flask-Limiter (5/min login, 100/min global) |
| XSS Prevention | Bleach sanitization |
| Email Verification | 24h token expiry |
| Password Reset | 1h token expiry + same-password prevention |
| Role-Based Access | `@admin_required` decorator |
| Admin Protection | Cannot delete last admin |

---

## 🌍 Language & Style

- **UI Text**: French 🇫🇷 (core/constants.py)
- **Code Comments**: English
- **Branding**: `backend/core/branding.py` + `frontend/src/config/branding.js`

---

## 💡 Quick Reference

### Key Files
- Entry: `backend/app.py`, `frontend/src/App.js`
- Models: `backend/models/models.py`
- Routes: `backend/routes/{auth,user,admin}.py`
- Utils: `backend/utils/{helpers.py,api_response.py,email.py,file_upload.py}`
- Tests: `backend/tests/test_*.py`, `frontend/src/__tests__/`

### Import Pattern (Always Use Package-Level)
```python
from core import ApplicationConfig, UserRole, ErrorMessages
from models import db, ma, User
from utils import validate_user_fields, success_response
from middleware import log_activity_with_details
from routes import admin_bp, auth_bp, user_bp
```

---

## ✅ TODO List (Current Priority)

### 🟡 HIGH PRIORITY (Before First Client)

**User Privacy & Compliance** (NEXT):
- [ ] **Cookies Consent Banner** - GDPR/privacy law compliance with accept/reject
- [ ] **Delete Account** - User can permanently delete their account + all data

---

### 🟢 MEDIUM PRIORITY (Quality & POC)

**Authentication & Security**:
- [ ] **2FA (Two-Factor Authentication)** - TOTP/SMS-based 2FA
- [ ] **Google OAuth** - Social authentication
- [ ] **Password History** - Prevent password reuse
- [ ] **Account Lockout** - After failed login attempts
- [ ] **Password Strength Meter** - Visual feedback
- [ ] **Failed Login Logging** - Track suspicious activity

**POC Features (For Selling Websites)**:
- [ ] **Commenting System** - User comments with moderation & nested replies
- [ ] **Trailer System** - Video trailers/media showcase with metadata & thumbnails

**Performance & Optimization**:
- [ ] **Redis Caching** - Cache frequently accessed data
- [ ] **Database Indexes** - Query optimization
- [ ] **API Response Caching** - Cache GET endpoints

**Error Handling**:
- [ ] **Consistent Error Responses** - Standardize all formats
- [ ] **Better Error Messages** - French translations
- [ ] **Error Tracking** - Sentry integration

---

### 🔵 LOW PRIORITY

- [ ] Privacy Policy Page
- [ ] Kubernetes Manifests
- [ ] Automated Backups
- [ ] SSL/HTTPS Setup
- [ ] Load Balancing

---

## 📝 Latest Session (Dec 22, 2025)

✅ **Completed**:
- Fixed critical bug in `useApi` hook (double data access)
- All 123 backend tests passing (78.23% coverage)
- All 35+ frontend tests passing
- Security headers fully implemented
- UsersList component displaying users correctly
- Containers rebuilt & verified healthy

🔄 **Current State**: ✅ All services healthy (backend, frontend, db, redis)

---

## 🎯 Next Steps

1. **Cookies Consent Banner** - GDPR compliance (HIGH PRIORITY)
2. **Delete Account** - User privacy (HIGH PRIORITY)
3. **2FA Implementation** - Security hardening (MEDIUM PRIORITY)
4. **Google OAuth** - Social auth (MEDIUM PRIORITY)

**Remember**:
- Update README.md for new features (mandatory)
- No separate doc files (exception: >100 lines)
- Test before committing (100% pass rate)
- Use French for UI, English for code
- One feature per commit, group by domain
