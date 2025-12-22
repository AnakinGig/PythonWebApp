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

## 📊 Project Status (Dec 22, 2025)

### ✅ Production-Ready
- **Auth**: Register, login, email verification, password reset ✅
- **Profiles**: Avatar upload, edit info, change password ✅
- **Admin**: User CRUD, activity logs, metrics dashboard ✅
- **Security**: Bcrypt, CSRF, rate limiting, XSS, HTTP headers ✅
- **Tests**: Backend 123 tests (78%), Frontend 7 test files ✅
- **CI/CD**: GitHub Actions on push/PR ✅

### 🗄️ Current Models
- **User**: id, email, password, role, avatar, tokens
- **ActivityLog**: user_id, action, details, ip, timestamp

---

## ✅ TODO List (Current Priority)

### � CRITICAL (Legal - Before First Client)

| Feature | Backend | Frontend | Tests |
|---------|---------|----------|-------|
| **Cookie Consent Banner** | - | CookieConsent component, localStorage | E2E |
| **Delete Account** | `/api/user/delete-account`, cascade delete | Modal + password confirm | Unit + E2E |
| **Privacy Policy Page** | - | Static page, configurable via env | - |
| **Terms of Service Page** | - | Static page | - |
| **Data Export (GDPR Art.20)** | `/api/user/export-data` → JSON/CSV | Download button in profile | Unit |

---

### 🟡 HIGH PRIORITY (Security & UX)

| Feature | Backend | Frontend | Tests |
|---------|---------|----------|-------|
| **2FA (TOTP)** | pyotp, QR code endpoint, verify on login | Setup modal, 6-digit input | Unit |
| **Google OAuth** | Flask-Dance or Authlib | Login with Google button | Integration |
| **Account Lockout** | Track failed attempts, 15min lockout | Error message | Unit |
| **Password Strength Meter** | - | Real-time indicator (zxcvbn) | Unit |
| **Session Management** | List active sessions, revoke endpoint | View/revoke sessions UI | Unit |
| **Email Change Verification** | Verify new email before switching | Two-step email change | Unit |

---

### 🟢 MEDIUM PRIORITY (Features for Client Websites)

**Content & Engagement**:
| Feature | Backend | Frontend | Tests |
|---------|---------|----------|-------|
| **Blog/Posts System** | Post model, CRUD endpoints, slugs | Post list, detail, admin editor | Unit |
| **Comments System** | Comment model, nested replies, moderation | Comment thread component | Unit |
| **Contact Form** | `/api/contact`, email notification | Contact page, captcha | Unit |
| **Newsletter Subscription** | Subscriber model, double opt-in | Subscribe form, unsubscribe | Unit |
| **Search** | Full-text search (PostgreSQL) | Search bar, results page | Unit |
| **File/Media Library** | Upload, organize, serve files | Admin media manager | Unit |

**E-commerce Ready**:
| Feature | Backend | Frontend | Tests |
|---------|---------|----------|-------|
| **Products Catalog** | Product model, categories, variants | Product list, filters | Unit |
| **Shopping Cart** | Cart model, add/remove/update | Cart drawer, quantity | Unit |
| **Wishlist** | Wishlist model, toggle endpoint | Heart icon, wishlist page | Unit |
| **Order System** | Order model, status workflow | Checkout, order history | Integration |
| **Payment Integration** | Stripe webhook handler | Stripe Elements | E2E |

**Notifications & Communication**:
| Feature | Backend | Frontend | Tests |
|---------|---------|----------|-------|
| **In-App Notifications** | Notification model, WebSocket | Bell icon, dropdown, mark read | Unit |
| **Email Preferences** | User email settings | Preferences checkboxes | Unit |

---

### 🔵 LOW PRIORITY (Scalability & Nice-to-Have)

**Performance**:
- [ ] Redis caching (profiles, frequently accessed data)
- [ ] Database indexes optimization
- [ ] API response caching (ETags, Cache-Control)
- [ ] Image optimization (WebP, lazy loading, srcset)
- [ ] CDN integration for static assets

**DevOps & Monitoring**:
- [ ] Sentry error tracking
- [ ] Prometheus + Grafana metrics
- [ ] Kubernetes manifests
- [ ] CI/CD staging environment
- [ ] Automated daily backups to S3

**Advanced Features**:
- [ ] Multi-language support (i18n)
- [ ] Dark mode persistence (DB)
- [ ] Audit log export (admin)
- [ ] API versioning (v1, v2)
- [ ] Webhook system for integrations
- [ ] Mobile app (React Native)

---

## 📋 Implementation Notes

### Cookie Consent (GDPR)
```
Categories: necessary (always), analytics (optional), marketing (optional)
Storage: localStorage for preference, cookie for server-side check
UI: Bottom banner, preferences modal, update anytime in footer
```

### Delete Account Flow
```
1. User clicks "Delete Account" in profile
2. Modal: "This will delete all your data permanently"
3. User enters password to confirm
4. Backend: Cascade delete (logs, comments, posts, avatar, user)
5. Clear session, redirect to homepage with success message
```

### Data Export (GDPR Art.20)
```
Endpoint: GET /api/user/export-data
Response: JSON file with all user data (profile, posts, comments, logs)
Format: Machine-readable, include timestamps
```

---

## 🎯 Quick Start Next Session

**Start with Cookie Consent** (simplest critical item):
1. Create `frontend/src/components/common/CookieConsent.js`
2. Add to `App.js` (show if no preference saved)
3. Categories: necessary, analytics, marketing
4. Save to localStorage, respect choice

**Then Delete Account**:
1. Add endpoint `DELETE /api/user/delete-account`
2. Create confirmation modal in UserProfile
3. Cascade delete all user data
4. Add test coverage
