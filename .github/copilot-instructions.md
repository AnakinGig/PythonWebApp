# GitHub Copilot Instructions

This file defines **mandatory rules** for GitHub Copilot.
All sections below must be respected and **filled by Copilot when used**.

**Last Updated**: February 2, 2026 | **Status**: 🟢 Production Ready | **Requirement**: Always use WSL for commands

---

## 1. WORKFLOW (HIGHEST PRIORITY)

This is the mandatory workflow for any feature request.

Copilot must **never skip or reorder** this workflow.

### Mandatory feature workflow

1. **User asks for a feature**
2. **Plan the feature**
   - Describe the goal clearly
   - Identify impacted files/modules (backend routes, models, utils, frontend pages, components)
   - Describe edge cases (error handling, validation, security)
   - Describe required tests (unit, integration, E2E)
   - Architecture check: Does this fit existing patterns?
3. **Implement the feature**
   - Clean, modular, production-ready code
   - Follow existing patterns (API responses, decorators, hooks)
   - No hacks or shortcuts
   - Use package-level imports (backend)
   - Use useApi hook for API calls (frontend)
4. **Make it work**
   - Test manually in development environment
   - Ensure correctness
   - Handle errors and edge cases
   - Verify GDPR compliance if handling user data
5. **Implement tests**
   - Backend: `backend/tests/test_*.py` (pytest)
   - Frontend: `frontend/src/__tests__/` (React Testing Library)
   - Tests must reflect real usage
   - Prefer integration tests over shallow mocks
   - Test security, auth, validation, business logic, API
   - Skip tests for UI-only, styling, docs
6. **Make tests pass**
   - Run backend tests: `sudo docker exec <backend_container> pytest -v --cov=.`
   - Run frontend tests: `sudo docker exec <frontend_container> npm test -- --coverage --watchAll=false`
   - Fix all failing tests before proceeding
7. **STOP and wait for explicit user approval**
   - Do NOT commit
   - Do NOT refactor extra code
   - Do NOT implement additional features
   - Present results and wait
8. **Commit** (only after user approval)
   - Use meaningful, conventional commit messages: `scope(domain): brief description`
   - One feature per commit
   - Separate test-only commits
9. **Update documentation**
   - Update `README.md` for user-facing features
   - NEVER create separate .md files unless >100 lines
   - Update API endpoint documentation if applicable

**Forbidden**
- Skipping tests for critical code (auth, security, validation, business logic, API)
- Writing code before planning
- Committing without approval
- Bundling multiple features in one commit
- Creating documentation files other than README.md
- Breaking existing architecture patterns

---

## 2. APPLICATION STRUCTURE

### General principles

- **Modular**: Clear separation between routes, models, utils, middleware
- **Replaceable components**: Each module can be swapped independently
- **Clear separation of concerns**: Backend API-first, frontend consumes API
- **Everything testable**: 123 backend tests (78% coverage), 35+ frontend tests

### Structure of files

```
backend/
├── app.py                    # Flask app + middleware configuration
├── routes/                   # API endpoints
│   ├── auth.py              # Login, register, email verification, password reset
│   ├── user.py              # Profile, avatar, user settings
│   └── admin.py             # User CRUD, activity logs, analytics
├── models/models.py          # User, ActivityLog models (SQLAlchemy + Marshmallow)
├── utils/                    # Reusable helpers
│   ├── api_response.py      # success_response, error_response, paginated_response
│   ├── email.py             # Email sending (verification, reset)
│   ├── file_upload.py       # Avatar upload, image processing
│   └── helpers.py           # Validation, sanitization
├── middleware/               # Request/response processing
│   ├── activity_logger.py   # @log_activity decorator
│   └── monitoring.py        # Metrics, health checks
├── core/                     # Configuration
│   ├── config.py            # ApplicationConfig (env-based)
│   ├── constants.py         # UserRole, ErrorMessages (French UI text)
│   └── branding.py          # APP_NAME, COLORS, etc.
└── tests/                    # pytest tests (123 tests, 78.23% coverage)

frontend/
├── src/
│   ├── App.js               # Router, lazy loading, ErrorBoundary
│   ├── pages/               # Route components
│   │   ├── Login.js, Register.js, Home.js, UserProfile.js
│   │   ├── AdminDashboard.js, UsersList.js, ActivityLogs.js
│   │   └── ForgotPassword.js, ResetPassword.js, VerifyEmail.js
│   ├── components/
│   │   ├── common/          # LoadingSpinner, Modal, Toast, ConfirmDialog, SkeletonLoader
│   │   └── layout/          # Header, Footer
│   ├── hooks/
│   │   └── useApi.js        # API call wrapper (loading, error handling)
│   ├── utils/
│   │   └── httpClient.js    # Axios instance with CSRF token handling
│   ├── config/
│   │   └── branding.js      # APP_NAME, COLORS (matches backend)
│   └── __tests__/           # React Testing Library tests (35+ tests)
```

### Technologies (defaults — override only if user specifies)

- **Frontend**: React 18.2, Bootstrap 5, React Router 6.30
- **Backend**: Flask 3.1.2, Flask-SQLAlchemy, Flask-Migrate, Flask-Marshmallow
- **Language**: Python (backend), JavaScript (frontend)
- **Database**: PostgreSQL
- **Caching**: Redis
- **Testing**: pytest (backend), React Testing Library (frontend)
- **CI/CD**: GitHub Actions (test-backend.yml, test-frontend.yml)
- **Deployment**: Docker Compose, Nginx, Gunicorn
- **Security**: Bcrypt, Flask-WTF (CSRF), Flask-Limiter (rate limiting), Bleach (XSS prevention)

### Essential Patterns

**Backend**:
```python
# Always use package-level imports
from core import ApplicationConfig, UserRole, ErrorMessages
from models import db, ma, User
from utils import success_response, error_response, validate_user_fields
from middleware import log_activity_with_details

# API Response Format (mandatory)
return success_response(data={"id": user.id}, message="Utilisateur créé", status=201)
return error_response("Email invalide", status=401)
return paginated_response(items=user_data, pagination={...})

# Decorators (use when applicable)
@admin_required         # Requires admin role
@log_activity("Action") # Logs activity
@limiter.limit("5/min") # Rate limit
```

**Frontend**:
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

### API Endpoints Reference

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

### User Model

```python
id (UUID), first_name, last_name, email (unique)
password (bcrypt), role ("Administrateur" | "Utilisateur")
email_verified, verification_token, verification_token_expiry
reset_token, reset_token_expiry, avatar
```

### Security Features (implemented)

- **Passwords**: Bcrypt hashing
- **CSRF**: Flask-WTF CSRFProtect
- **Rate Limiting**: Flask-Limiter (5/min login, 100/min global)
- **XSS Prevention**: Bleach sanitization
- **Email Verification**: 24h token expiry
- **Password Reset**: 1h token expiry + same-password prevention
- **Role-Based Access**: `@admin_required` decorator
- **Admin Protection**: Cannot delete last admin
- **Security Headers**: CSP, HSTS, X-Frame-Options

### Compliance & standards

- **GDPR compliant by design**:
  - Email verification required
  - Password reset with token expiry
  - Avatar upload/delete (user control)
  - Activity logging (transparency)
  - **TODO**: Cookie consent, delete account, data export, privacy policy, terms of service
- **Explicit consent handling**: Email verification before account activation
- **Data minimization**: Only collect necessary user data
- **Right-to-delete supported**: TODO (in progress)
- **Security best practices**: OWASP (CSRF, XSS, rate limiting, secure headers)

---

## 3. TODO LIST (ORDERED BY IMPORTANCE)

> Copilot must maintain and update this list.

### ⚠️ CRITICAL (Legal - Before First Client)

1. **Cookie Consent Banner** (GDPR)
   - Frontend: CookieConsent component, localStorage
   - Categories: necessary (always), analytics (optional), marketing (optional)
   - UI: Bottom banner, preferences modal, update anytime in footer
   - Tests: E2E

2. **Delete Account** (GDPR Art.17 - Right to Erasure)
   - Backend: `DELETE /api/user/delete-account`, cascade delete (logs, avatar, user)
   - Frontend: Modal + password confirm in UserProfile
   - Tests: Unit + E2E

3. **Privacy Policy Page**
   - Frontend: Static page, configurable via env
   - Link in footer

4. **Terms of Service Page**
   - Frontend: Static page
   - Link in footer, checkbox on register

5. **Data Export** (GDPR Art.20 - Right to Data Portability)
   - Backend: `GET /api/user/export-data` → JSON/CSV
   - Frontend: Download button in profile
   - Tests: Unit

---

### 🟡 HIGH PRIORITY (Security & UX)

6. **2FA (TOTP)**
   - Backend: pyotp, QR code endpoint, verify on login
   - Frontend: Setup modal, 6-digit input
   - Tests: Unit

7. **Google OAuth**
   - Backend: Flask-Dance or Authlib
   - Frontend: Login with Google button
   - Tests: Integration

8. **Account Lockout**
   - Backend: Track failed attempts, 15min lockout
   - Frontend: Error message
   - Tests: Unit

9. **Password Strength Meter**
   - Frontend: Real-time indicator (zxcvbn)
   - Tests: Unit

10. **Session Management**
    - Backend: List active sessions, revoke endpoint
    - Frontend: View/revoke sessions UI
    - Tests: Unit

11. **Email Change Verification**
    - Backend: Verify new email before switching
    - Frontend: Two-step email change
    - Tests: Unit

---

### 🟢 MEDIUM PRIORITY (Features for Client Websites)

**Content & Engagement**:

12. **Blog/Posts System**
    - Backend: Post model, CRUD endpoints, slugs
    - Frontend: Post list, detail, admin editor
    - Tests: Unit

13. **Comments System**
    - Backend: Comment model, nested replies, moderation
    - Frontend: Comment thread component
    - Tests: Unit

14. **Contact Form**
    - Backend: `/api/contact`, email notification
    - Frontend: Contact page, captcha
    - Tests: Unit

15. **Newsletter Subscription**
    - Backend: Subscriber model, double opt-in
    - Frontend: Subscribe form, unsubscribe
    - Tests: Unit

16. **Search**
    - Backend: Full-text search (PostgreSQL)
    - Frontend: Search bar, results page
    - Tests: Unit

17. **File/Media Library**
    - Backend: Upload, organize, serve files
    - Frontend: Admin media manager
    - Tests: Unit

**E-commerce Ready**:

18. **Products Catalog**
    - Backend: Product model, categories, variants
    - Frontend: Product list, filters
    - Tests: Unit

19. **Shopping Cart**
    - Backend: Cart model, add/remove/update
    - Frontend: Cart drawer, quantity
    - Tests: Unit

20. **Wishlist**
    - Backend: Wishlist model, toggle endpoint
    - Frontend: Heart icon, wishlist page
    - Tests: Unit

21. **Order System**
    - Backend: Order model, status workflow
    - Frontend: Checkout, order history
    - Tests: Integration

22. **Payment Integration**
    - Backend: Stripe webhook handler
    - Frontend: Stripe Elements
    - Tests: E2E

**Notifications & Communication**:

23. **In-App Notifications**
    - Backend: Notification model, WebSocket
    - Frontend: Bell icon, dropdown, mark read
    - Tests: Unit

24. **Email Preferences**
    - Backend: User email settings
    - Frontend: Preferences checkboxes
    - Tests: Unit

---

### 🔵 LOW PRIORITY (Scalability & Nice-to-Have)

**Performance**:
25. Redis caching (profiles, frequently accessed data)
26. Database indexes optimization
27. API response caching (ETags, Cache-Control)
28. Image optimization (WebP, lazy loading, srcset)
29. CDN integration for static assets

**DevOps & Monitoring**:
30. Sentry error tracking
31. Prometheus + Grafana metrics
32. Kubernetes manifests
33. CI/CD staging environment
34. Automated daily backups to S3

**Advanced Features**:
35. Multi-language support (i18n)
36. Dark mode persistence (DB)
37. Audit log export (admin)
38. API versioning (v1, v2)
39. Webhook system for integrations
40. Mobile app (React Native)

---

## 4. COMMANDS TO ALWAYS USE

> Copilot must not use or suggest commands outside this list.

### ⚠️ CRITICAL: Always Use WSL (Windows Subsystem for Linux)

**All terminal commands MUST be executed in WSL, never in PowerShell on Windows.**

Why:
- Docker commands work natively in WSL (no administrator sudo required in certain contexts)
- File paths are Unix-based, matching the production environment
- Consistency with container environment (Linux-based)
- Prevents path escaping issues and permission problems

**How to use**:
- Open WSL terminal in VS Code: `Ctrl+` ` and select "WSL"
- Or run: `wsl` from PowerShell to enter WSL environment
- All subsequent commands are Linux-based

### Docker Commands (Production Environment)

**Start/Rebuild Application**:
```bash
sudo docker compose -f docker-compose.prod.yml up -d --build
```

**View Logs**:
```bash
sudo docker compose -f docker-compose.prod.yml logs -f
sudo docker compose -f docker-compose.prod.yml logs -f backend
sudo docker compose -f docker-compose.prod.yml logs -f frontend
```

**Execute Commands in Containers**:
```bash
# Backend
sudo docker compose -f docker-compose.prod.yml exec backend <command>
sudo docker compose -f docker-compose.prod.yml exec backend pip install -r requirements-dev.txt
sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "migration message"
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade

# Frontend
sudo docker compose -f docker-compose.prod.yml exec frontend npm <command>
```

**Stop/Remove Containers**:
```bash
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml down -v  # Remove volumes
```

### Testing Commands

**Backend Tests**:
```bash
sudo docker exec <backend_container> pytest -v --cov=.
sudo docker exec <backend_container> pytest -v --cov=. --cov-report=html
sudo docker exec <backend_container> pytest tests/test_auth_routes.py -v
```

**Frontend Tests**:
```bash
sudo docker exec <frontend_container> npm test -- --coverage --watchAll=false
sudo docker exec <frontend_container> npm test -- --coverage
```

### Git Commands (Conventional Commits)

**Commit Format**: `scope(domain): brief description`

Examples:
```bash
git commit -m "feat(auth): add 2FA with TOTP"
git commit -m "fix(admin): prevent last admin deletion"
git commit -m "test(user): add avatar upload tests"
git commit -m "docs(readme): update API endpoints section"
git commit -m "refactor(utils): extract email validation to helper"
```

### NEVER Use These Commands

- `python -m venv` (use Docker)
- `pip install` outside Docker
- `npm install` outside Docker
- `flask run` directly (use Docker)
- `docker-compose.yml` (use `docker-compose.prod.yml`)
- Commands without `sudo` for docker compose on Linux
- `git push --force` (unless explicitly requested)
- Database migrations without testing first

---

## 5. INTERDICTIONS (STRICT)

Copilot must **never**:

### Code Quality & Architecture
- Introduce breaking changes without warning
- Add dependencies without justification (explain why needed, alternatives considered)
- Ignore existing architecture decisions (package-level imports, useApi hook, API response format)
- Generate placeholder code in production paths (no `// TODO` or `pass` in final code)
- Over-engineer without explicit request (KISS principle)
- Change formatting, tooling, or structure unless asked
- Write undocumented magic behavior (complex logic needs comments)

### Security & Compliance
- Log sensitive data (passwords, tokens, reset codes, verification codes)
- Bypass GDPR requirements (always consider data privacy)
- Store passwords in plain text (always bcrypt)
- Skip CSRF protection for state-changing operations
- Skip rate limiting for authentication endpoints
- Skip input validation and sanitization
- Expose internal errors to users (use generic error messages)

### Development Workflow
- Skip tests for critical code (auth, security, validation, business logic, API)
- Commit without user approval
- Bundle multiple features in one commit
- Create documentation files other than README.md (unless >100 lines)
- Use development environment in production
- Run migrations without backup (in production)

### Communication
- Assume user intent — ask if unsure
- Use technical jargon without explanation when user is non-technical
- Provide solutions without explaining trade-offs

### When in doubt:
👉 **Pause, explain, and ask one clear question**

---

## FINAL RULE

When instructions conflict, follow this priority order:

1. **Workflow** (Section 1)
2. **Interdictions** (Section 5)
3. **User instructions** (explicit requests in current conversation)
4. **This file** (Sections 2, 3, 4)
5. **Copilot defaults** (GitHub Copilot general knowledge)

**Example**: If user asks to skip tests, remind them of the workflow and explain why tests are required for critical code. If user insists, document the risk and proceed only after explicit confirmation.

---

## Language & Style

- **UI Text**: French 🇫🇷 (defined in `backend/core/constants.py`)
- **Code Comments**: English
- **Documentation**: English (README.md, code comments)
- **Git Commits**: English
- **Variable/Function Names**: English

---

## Quick Reference - Key Files

- **Entry Points**: `backend/app.py`, `frontend/src/App.js`
- **Models**: `backend/models/models.py`
- **Routes**: `backend/routes/{auth,user,admin}.py`
- **Utils**: `backend/utils/{helpers.py,api_response.py,email.py,file_upload.py}`
- **Tests**: `backend/tests/test_*.py`, `frontend/src/__tests__/`
- **Config**: `backend/core/{config.py,constants.py,branding.py}`, `frontend/src/config/branding.js`

---

**Project Status**: 🟢 Production Ready (Auth, Profiles, Admin, Security implemented and tested)
**Next Priority**: ⚠️ CRITICAL GDPR Features (Cookie Consent, Delete Account, Privacy Policy, Terms of Service, Data Export)
