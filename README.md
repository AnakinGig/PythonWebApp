# PythonWebApp

Application web fullstack moderne avec frontend React/Bootstrap, backend Flask, PostgreSQL, Redis pour le cache, et déploiement Docker.

[![CI Tests](https://github.com/AnakinGig/PythonWebApp/actions/workflows/test-backend.yml/badge.svg)](https://github.com/AnakinGig/PythonWebApp/actions/workflows/test-backend.yml)
[![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-lightgrey?logo=flask)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-Container-blue?logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-blue?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-red?logo=redis)](https://redis.io/)

---

## Summary

PythonWebApp is a production-ready fullstack app with secure authentication, user management, admin monitoring, and strong security defaults. It ships with Docker Compose workflows, migrations, and CI/CD pipelines.

---

## Table des matières

### 📚 Documentation

1. [Démarrage rapide - Développement](#démarrage-rapide---développement)
2. [Gestion des migrations de base de données](#gestion-des-migrations-de-base-de-données)

### 🚀 Déploiement & Production

1. [Déploiement en production](#déploiement-en-production)
2. [Configuration CI/CD et déploiement automatique](#configuration-cicd-et-déploiement-automatique)
3. [Support HTTPS avec Let's Encrypt](#support-https-avec-lets-encrypt)

### 💾 Exploitation & Maintenance

1. [Sauvegarde et restauration](#sauvegarde-et-restauration)
2. [Logs et monitoring](#logs-et-monitoring)
3. [Dépannage](#dépannage)
4. [Aide et support](#aide-et-support)

---

## Démarrage rapide — Développement

### 1. Cloner le projet

```bash
git clone https://github.com/AnakinGig/PythonWebApp.git
cd PythonWebApp
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

```env
# Security
SECRET_KEY=<generate: openssl rand -base64 32>

# Admin account
ADMIN_MAIL=admin@example.com
ADMIN_PASSWORD=SecurePass123!

# URLs
REACT_APP_BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database
DB_USER=your_user
DB_PASSWORD=your_secure_password
DB_NAME=users_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

> **Note** : Remplacez toutes les valeurs par vos identifiants réels.

### 3. Lancer l'application

```bash
sudo docker compose -f docker-compose.prod.yml up -d --build
sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py
```

### 4. Appliquer les migrations (après changement de modèles)

```bash
sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "initial"
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
```

### 5. Accès à l'application

- **Frontend** : <http://localhost:3000>
- **Backend API** : <http://localhost:5000>
- **Swagger** : <http://localhost:5000/api/docs>

---

## Gestion des migrations de base de données

Cette application utilise **Flask-Migrate (Alembic)** pour gérer les modifications du schéma de base de données.

### Initialisation (première fois uniquement)

```bash
sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py
```

### Ajouter ou modifier un modèle

```bash
sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "Describe changes"
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
```

### Commandes utiles

```bash
sudo docker compose -f docker-compose.prod.yml exec backend flask db history
sudo docker compose -f docker-compose.prod.yml exec backend flask db current
sudo docker compose -f docker-compose.prod.yml exec backend flask db downgrade
```

---

## Déploiement en production

### 1. Préparer le serveur

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose
```

### 2. Déployer

```bash
cd /opt && git clone <repo-url> pythonwebapp && cd pythonwebapp
cp .env.example .env
sudo docker compose -f docker-compose.prod.yml up -d --build
sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py
```

### 3. Migrations en production

```bash
sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "init"
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
```

---

## Configuration CI/CD et Déploiement Automatique

Les workflows GitHub Actions sont disponibles dans [.github/workflows](.github/workflows).

1. **Backend tests** : déclenchés sur changements dans `backend/`
2. **Frontend tests** : déclenchés sur changements dans `frontend/`
3. **Déploiement staging** : push sur `dev`
4. **Déploiement production** : push sur `main`

---

## Support HTTPS avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Sauvegarde et restauration

### Sauvegarde de la base de données

```bash
sudo docker compose -f docker-compose.prod.yml exec db pg_dump -U user users_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restauration de la base de données

```bash
sudo docker compose -f docker-compose.prod.yml exec -T db psql -U user users_db < backup_20240127_120000.sql
```

---

## Logs et monitoring

```bash
sudo docker compose -f docker-compose.prod.yml logs -f backend
sudo docker compose -f docker-compose.prod.yml logs -f frontend
```

---

## Dépannage

| Problème | Solution |
|---------|----------|
| Port 3000/5000 utilisé | `sudo lsof -i :3000` + `kill -9 <PID>` |
| DB connection refused | Vérifiez `DB_USER`, `DB_PASSWORD`, `DATABASE_URL` dans `.env` |
| Module manquant (backend) | `sudo docker compose -f docker-compose.prod.yml exec backend pip install -r requirements.txt` |
| npm ERR (frontend) | `sudo docker compose -f docker-compose.prod.yml exec frontend npm install` |
| Migrations non appliquées | `sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py` |

---

## Aide et support

1. Consultez les logs : `sudo docker compose -f docker-compose.prod.yml logs -f`
2. Vérifiez la configuration `.env`
3. Consultez la documentation officielle de [Flask](https://flask.palletsprojects.com/), [React](https://reactjs.org/), ou [Docker](https://docs.docker.com/)

---

## Tests

```bash
# Backend
sudo docker compose -f docker-compose.prod.yml exec backend pytest -v --cov=.

# Frontend
sudo docker compose -f docker-compose.prod.yml exec frontend npm test -- --coverage --watchAll=false
```

---

## License

MIT License - See [LICENSE](LICENSE)# PythonWebApp

Application web fullstack moderne avec gestion d'utilisateurs, monitoring temps réel, et authentification sécurisée.

**Stack**: React 18 + Bootstrap 5 | Flask 3.1 + PostgreSQL + Redis | Docker Compose

---

## ✅ Summary

PythonWebApp is a modern fullstack web app with secure authentication, user management, and admin monitoring. It ships with a production-ready Docker setup, strong security defaults, and CI/CD pipelines.

## 🚀 Fonctionnalités

- ✅ Interface responsive (Bootstrap 5)
- ✅ CRUD utilisateurs complet
- ✅ Tableau de bord admin avec métriques
- ✅ Logs d'activité
- ✅ Documentation API (Swagger à `/api/docs`)
- ✅ HTTP security headers (CSP, HSTS, etc.)
- ✅ CI/CD Pipeline (GitHub Actions)

---

## 🛠️ Développement

### Quick Start

```bash
# 1. Clone
git clone https://github.com/AnakinGig/PythonWebApp.git
cd PythonWebApp

# 2. Configure
cp .env.example .env
# Edit .env with your values (see Required Variables below)

# 3. Launch
sudo docker compose -f docker-compose.prod.yml up -d --build

# 4. Initialize DB (first time only)
sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py

# 5. Run migrations (after model changes)
sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "initial"
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
```

**URLs**: Frontend <http://localhost:3000> | Backend <http://localhost:5000> | Swagger <http://localhost:5000/api/docs>

### Required Environment Variables

```env
# Security
SECRET_KEY=<generate: openssl rand -base64 32>

# Admin account
ADMIN_MAIL=admin@example.com
ADMIN_PASSWORD=SecurePass123!

# URLs
REACT_APP_BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database
DB_USER=your_user
DB_PASSWORD=your_secure_password
DB_NAME=users_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

**Optional - Branding**: Use `./setup-client-branding.sh` or edit `APP_NAME`, `COMPANY_NAME` in `.env`

### Common Commands

```bash
# Services
sudo docker compose -f docker-compose.prod.yml up -d --build     # Rebuild & restart
sudo docker compose -f docker-compose.prod.yml restart backend   # Restart service
sudo docker compose -f docker-compose.prod.yml logs -f backend   # View logs

# Database migrations (after model changes)
sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "description"
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade

# Container access
sudo docker compose -f docker-compose.prod.yml exec backend bash
sudo docker compose -f docker-compose.prod.yml exec db psql -U user -d users_db

# Health check
curl http://localhost:5000/api/health
```

---

## 🔒 Security

**HTTP Security Headers** (all responses):
- **Content-Security-Policy**: Prevents XSS attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Legacy XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Disables browser features
- **HSTS**: Forces HTTPS in production (max-age: 1 year)

**Implementation**: Backend headers in `app.py`, frontend headers in `nginx.conf`  
**Enable HSTS**: Set `FORCE_HTTPS=true` in `.env`

**Additional Security**:
- Bcrypt password hashing
- CSRF protection (Flask-WTF)
- Rate limiting (5/min login, 100/min global)
- XSS prevention (Bleach sanitization)
- Admin protection (cannot delete last admin)
- Email verification (24h token)
- Password reset (1h token + no reuse)

---

## 🚀 Production

### Server Setup (Ubuntu 20.04+)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose
```

### Deployment Steps

1. **Clone and configure**:
   ```bash
   cd /opt && git clone <repo-url> pythonwebapp && cd pythonwebapp
   cp .env.example .env
   # Edit: DB_USER, DB_PASSWORD, SECRET_KEY, URLs, branding
   ```

2. **Launch services**:
   ```bash
   sudo docker compose -f docker-compose.prod.yml up -d --build
   sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py
   ```

3. **Run migrations** (after model changes):
   ```bash
   sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "init"
   sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
   ```

4. **SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

5. **Firewall**:
   ```bash
   sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
   ```

6. **Automatic backups** (add to `/opt/backup_db.sh`):
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/opt/backups"
   mkdir -p $BACKUP_DIR
   sudo docker compose -f /opt/pythonwebapp/docker-compose.prod.yml exec -T db \
       pg_dump -U user users_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"
   find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete  # Keep 30 days
   ```
   Add to crontab: `0 2 * * * /opt/backup_db.sh`

### Production Commands

```bash
sudo docker compose -f docker-compose.prod.yml up -d --build    # Update & restart
sudo docker compose -f docker-compose.prod.yml logs -f          # View logs
sudo docker compose -f docker-compose.prod.yml exec -T db \
    psql -U user users_db < backup.sql                          # Restore backup
```

**Duration**: ~30 minutes

---

## 🧪 Tests

```bash
# Backend
sudo docker compose -f docker-compose.prod.yml exec backend pytest -v --cov=.

# Frontend
sudo docker compose -f docker-compose.prod.yml exec frontend npm test -- --coverage --watchAll=false
```

---

## 🎨 Customization

### Branding Client

**Automated approach**:
```bash
./setup-client-branding.sh
```

**Manual approach** (edit `.env`):
```env
APP_NAME=Client Name
COMPANY_NAME=Company Name
APP_LOGO_URL=https://yourcdn.com/logo.png
PRIMARY_COLOR=#0066cc
SECONDARY_COLOR=#ff6600
```

### Adding Features

**Backend** (`backend/routes/`):
- Create route in `auth.py`, `user.py`, or `admin.py`
- Use: `from utils import success_response, error_response`
- Validate → Logic → API response

**Frontend** (`frontend/src/`):
- Pages: `pages/PageName.js` (lazy load in `App.js`)
- Components: `components/common/` (reusable)
- API calls: Use `useApi()` hook

**Tests**: Add to `backend/tests/` and `frontend/src/__tests__/` before deployment

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000/5000 in use | `sudo lsof -i :3000` + `kill -9 <PID>` |
| DB connection refused | Check `DB_USER`, `DB_PASSWORD`, `DATABASE_URL` in `.env` |
| "Module not found" (backend) | `docker compose exec backend pip install -r requirements.txt` |
| "npm ERR" (frontend) | `cd frontend && npm install` |
| CSRF token missing | Clear browser cookies and reload, or check `FRONTEND_URL` |
| Migrations not applied | `docker compose exec backend python init_migrations.py` |
| Tests fail locally | Run with `docker-compose.prod.yml` (see Commands section) |

**Always check logs**: `sudo docker compose -f docker-compose.prod.yml logs -f backend`

---

## 🤖 CI/CD Pipeline

Tests run automatically on GitHub Actions:
- **Backend**: Runs on every `backend/` change (pytest with coverage)
- **Frontend**: Runs on every `frontend/` change (npm test with coverage)
- **Branch Protection**: Merges require all tests passing

View status: [GitHub Actions](../../actions)

---

## 📚 Documentation

- **API**: <http://localhost:5000/api/docs> (Swagger/OpenAPI)
- **GitHub**: [AnakinGig/PythonWebApp](https://github.com/AnakinGig/PythonWebApp)

---

## 📝 License

MIT License - See [LICENSE](LICENSE)
