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

**User Privacy & Compliance** (CRITICAL):
- [ ] **Cookies Consent Banner** - GDPR/privacy law compliance (accept/reject, remember choice)
- [ ] **Delete Account** - User can delete account + cascade delete all data (posts, comments, avatar, activity logs)
- [ ] **Privacy Policy Page** - GDPR-compliant template with auto-text generation

---

### 🟢 MEDIUM PRIORITY (Quality & POC)

**Authentication & Security**:
- [ ] **2FA (Two-Factor Authentication)** - TOTP via authenticator app or SMS
- [ ] **Google OAuth** - Social login integration (Firebase or oauth.py library)
- [ ] **Password History** - Track last 3 passwords, prevent reuse
- [ ] **Account Lockout** - Lock after 5 failed login attempts (15 min cooldown)
- [ ] **Password Strength Meter** - Real-time visual feedback on password strength
- [ ] **Failed Login Logging** - Track suspicious activity for admin review

**POC Features (For Selling Websites)**:
- [ ] **Commenting System** - User comments on pages with moderation, nested replies, edit/delete own
- [ ] **Trailer System** - Video trailers showcase with metadata (title, description, duration, thumbnail, video URL)

**Performance & Optimization**:
- [ ] **Redis Caching** - Cache user profiles, activity logs, frequently accessed data
- [ ] **Database Indexes** - Add indexes on email, role, created_at, user_id foreign keys
- [ ] **API Response Caching** - Cache GET endpoints (60s TTL for public, 30s for user-specific)
- [ ] **Lazy Load Admin Tables** - Implement virtual scrolling for large user/activity lists

**Error Handling & Monitoring**:
- [ ] **Consistent Error Responses** - Standardize all error response formats (backend + frontend)
- [ ] **Better Error Messages** - Localize error messages to French
- [ ] **Error Tracking** - Sentry integration for production error monitoring
- [ ] **Contextual Logging** - Include user_id, IP, request_id in all backend logs

---

### 🔵 LOW PRIORITY (Nice to Have)

- [ ] **Kubernetes Manifests** - K8s deployment configs for scalability
- [ ] **Automated Backups** - Daily database backups to S3/storage
- [ ] **Staging Environment** - Separate staging config for pre-production testing
- [ ] **Load Balancing** - Multi-instance backend support
- [ ] **Mobile App** - React Native companion app
- [ ] **Advanced Analytics** - User engagement metrics, conversion funnels
- [ ] **Webhook System** - Custom webhooks for external integrations
- [ ] **API Rate Limiting Tiers** - Tiered rate limits based on user role
- [ ] **Dark Mode Persistence** - Save theme preference to database

---

## 📝 Project Review Summary (Dec 22, 2025)

### ✅ Completed & Production-Ready

**Core Features**:
- User authentication (register, login, logout, email verification, password reset)
- User profiles (edit name/email/password, avatar upload, manage account)
- Admin dashboard (user management CRUD, activity logging, system metrics)
- Role-based access control (Admin/Utilisateur with @admin_required decorator)
- Security: Bcrypt hashing, CSRF protection, rate limiting, XSS sanitization, session management
- Email system (welcome, verification, password reset, transactional emails)
- Activity logging (user actions, IP tracking, timestamp-based audit trail)

**Testing & Quality**:
- Backend: 123 tests passing (78.23% coverage) - auth, admin, user, security, email, models, utils
- Frontend: 35 tests passing - hooks, components, pages
- CI/CD: GitHub Actions automated testing on push/PR
- All tests passing ✅

**Security Hardening**:
- HTTP Security Headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Password strength validation (8+ chars, uppercase, lowercase, digit, special)
- Admin protection (cannot delete last admin)
- Email verification tokens (24h expiry)
- Password reset tokens (1h expiry, no same-password reuse)

**Infrastructure**:
- Production-ready Docker Compose setup (backend, frontend, PostgreSQL, Redis)
- Nginx reverse proxy with security headers
- Gunicorn WSGI server
- Environment-based configuration (.env)
- Automated database migrations
- Health check endpoint

**Documentation**:
- README.md (consolidated, no duplicates) - Setup, deployment, customization, troubleshooting
- Copilot instructions (.github/copilot-instructions.md) - Patterns, workflows, architecture
- API documentation (Swagger at /api/docs)
- Code comments (English) + UI text (French)

### 🏗️ Architecture Status

**Backend Structure** ✅:
- `app.py` - Main Flask application with middleware
- `routes/` - Organized blueprints (auth, user, admin)
- `models/models.py` - SQLAlchemy User model with all fields
- `utils/` - Validation, API responses, email, file upload
- `middleware/` - Activity logging, metrics collection
- `tests/` - 123 comprehensive tests

**Frontend Structure** ✅:
- `App.js` - Main routing with lazy loading
- `pages/` - All route components (Login, Register, Profile, Admin, etc.)
- `components/` - Reusable UI components (Header, Footer, forms, dialogs)
- `hooks/useApi.js` - Centralized API call management (FIXED: returns full response)
- `utils/httpClient.js` - Axios with CSRF interceptor
- `__tests__/` - 35 tests for pages, hooks, components

**Data Flow** ✅:
- API requests → useApi hook → httpClient with CSRF → Flask backend
- Responses: `{ success: true, data: {...}, pagination: {...} }`
- Error handling: Standardized error responses with French messages

### 🔍 Recent Fixes (Dec 22)

**Critical Bug Fixed**:
- `useApi` hook was doing double data access (`response.data.data`)
- Changed to return full API response object
- Updated UsersList component to access correct data structure
- Fixed frontend test to match new behavior

**Test Status**:
- All 123 backend tests passing
- All 35 frontend tests passing (useApi test fixed)
- All 11 security header tests passing
- Zero regressions

### ⚙️ Current System State

**Services Running**:
- Backend: ✅ Healthy (Gunicorn on 5000)
- Frontend: ✅ Healthy (Nginx on 80)
- Database: ✅ Connected (PostgreSQL 13)
- Redis: ✅ Connected (cache/session store)
- Health endpoint: ✅ Returning status

**Database**:
- User model complete (id, email, password, role, avatar, verification tokens, reset tokens)
- Migrations system initialized and tested
- Activity logging table tracks all user actions

**Environment**:
- .env.example template provided
- All required variables documented
- Branding customization available
- Docker Compose production file optimized

### 🚀 Ready for Next Phase

**High Priority Items (Before First Client)**:
1. **Cookies Consent Banner** - Legal requirement (GDPR/CCPA)
2. **Delete Account** - Privacy compliance
3. **Privacy Policy Page** - Legal compliance

**Medium Priority Items (Quality & POC)**:
1. **2FA** - Security enhancement
2. **Google OAuth** - UX improvement
3. **Commenting System** - POC feature for selling
4. **Trailer System** - POC feature for selling
5. **Performance optimization** - Caching, indexes
6. **Error tracking** - Sentry integration

### 📊 Project Metrics

- **Lines of Code**: Backend ~2,500 | Frontend ~3,500
- **Test Coverage**: Backend 78.23%, Frontend 35+ tests
- **Documentation**: README + copilot instructions
- **Git History**: Clean commits organized by feature/domain
- **Time to Deploy**: ~15 min dev, ~30 min production
- **Time to First Client Onboarding**: ~15 min with scripts

### 💡 Next Development Session

1. Start with **Cookies Consent Banner** (HIGH PRIORITY)
   - Backend: No changes needed (headers already in place)
   - Frontend: New component, localStorage for persistence, banner on every page
   - Test: User acceptance (accept/reject/remember)

2. Follow with **Delete Account** (HIGH PRIORITY)
   - Backend: New endpoint `/api/user/delete-account`, cascade delete logic
   - Frontend: New page/modal with confirmation, password verification
   - Test: Verify all user data removed from database

3. Then **Privacy Policy Page** (HIGH PRIORITY)
   - Frontend: New page with template text, editable via .env variables
   - No database changes

This foundation is solid and ready for rapid feature development!

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
