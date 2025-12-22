# PythonWebApp

Application web fullstack moderne avec gestion d'utilisateurs, monitoring temps réel, et authentification sécurisée.

**Stack**: React 18 + Bootstrap 5 | Flask 3.1 + PostgreSQL + Redis | Docker Compose

---

## 🚀 Fonctionnalités

- ✅ Interface responsive (Bootstrap 5)
- ✅ CRUD utilisateurs complet
- ✅ Tableau de bord admin avec métriques
- ✅ Logs d'activité
- ✅ Documentation API (Swagger à `/api/docs`)

---

## 🔧 Développement

### Installation Rapide

```bash
# 1. Cloner
git clone https://github.com/AnakinGig/PythonWebApp.git
cd PythonWebApp

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos valeurs (voir variables obligatoires ci-dessous)

# 3. Lancer
sudo docker compose -f docker-compose.prod.yml build
sudo docker compose -f docker-compose.prod.yml up -d

# 4. Initialiser la DB (première fois uniquement)
sudo docker compose -f docker-compose.prod.yml up -d db backend
sleep 5
sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py
```

**URLs**: Frontend <http://localhost:3000> | Backend <http://localhost:5000> | Swagger <http://localhost:5000/api/docs>

### Variables Obligatoires (.env)

```env
# Sécurité
SECRET_KEY=<générer avec: openssl rand -base64 32>

# Admin
ADMIN_MAIL=admin@example.com
ADMIN_PASSWORD=SecurePass123!

# URLs
REACT_APP_BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Base de données
DB_USER=your_user
DB_PASSWORD=your_secure_password
DB_NAME=users_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

**Optionnel - Branding**: Utiliser `./setup-client-branding.sh` ou éditer les variables `APP_NAME`, `COMPANY_NAME`, etc. dans `.env`

### Commandes Utiles

```bash
# Services
sudo docker compose -f docker-compose.prod.yml up -d --build          # Redémarrer avec rebuild
sudo docker compose -f docker-compose.prod.yml restart backend        # Redémarrer service
sudo docker compose -f docker-compose.prod.yml logs -f backend        # Voir logs

# Migrations (après modification de modèles)
sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "description"
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
sudo docker compose -f docker-compose.prod.yml restart backend

# Accès conteneurs
sudo docker compose -f docker-compose.prod.yml exec backend /bin/bash
sudo docker compose -f docker-compose.prod.yml exec db psql -U user -d users_db

# Tests
# Backend
sudo docker compose -f docker-compose.prod.yml exec backend pip install -r requirements-dev.txt
sudo docker compose -f docker-compose.prod.yml exec backend pytest -v --cov=.
# Frontend
cd frontend && npm install && npm test -- --coverage --watchAll=false
```

### 🤖 CI/CD Pipeline

Tests run automatically on GitHub Actions:
- **Backend**: Runs on every `backend/` change (pytest with coverage)
- **Frontend**: Runs on every `frontend/` change (npm test with coverage)
- **Branch Protection**: Merges require all tests passing
- **Coverage**: Reports uploaded to Codecov

View status: [GitHub Actions](../../actions)

### 🔒 Security Headers

All responses include HTTP security headers to protect against common vulnerabilities:

**Headers Implemented**:
- **Content-Security-Policy**: Prevents XSS attacks by restricting script sources
- **X-Content-Type-Options**: Prevents MIME type sniffing (`nosniff`)
- **X-Frame-Options**: Prevents clickjacking (`SAMEORIGIN`)
- **X-XSS-Protection**: Legacy XSS protection for older browsers
- **Referrer-Policy**: Controls referrer information leakage
- **Permissions-Policy**: Disables browser features (geolocation, camera, microphone, etc.)
- **Strict-Transport-Security** (HSTS): Forces HTTPS in production (max-age: 1 year)

**Backend**: Headers configured in `app.py` via `@app.after_request` middleware  
**Frontend**: Headers mirrored in `frontend/nginx.conf` for static assets  
**Production**: Enable HSTS by setting `FORCE_HTTPS=true` in `.env`



## 🚀 Production

### Prérequis

- Ubuntu/Debian avec Docker installé
- Nom de domaine + SSL (Let's Encrypt recommandé)

### Déploiement

```bash
# 1. Configuration secrets
mkdir .env_prod_secrets
echo "votre_cle_secrete" > .env_prod_secrets/SECRET_KEY.txt
echo "admin@domain.com" > .env_prod_secrets/ADMIN_MAIL.txt
echo "SecurePass123!" > .env_prod_secrets/ADMIN_PASSWORD.txt
chmod 600 .env_prod_secrets/*

# 2. Variables .env (copier .env.example et éditer)
# Changer DB_USER, DB_PASSWORD, URLs, branding

# 3. Lancer
sudo docker compose -f docker-compose.prod.yml build
sudo docker compose -f docker-compose.prod.yml up -d

# 4. Initialiser migrations (première fois)
sudo docker compose -f docker-compose.prod.yml exec backend flask db init
sudo docker compose -f docker-compose.prod.yml exec backend flask db migrate -m "Initial"
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
```

### Sécurité Production

**SSL/TLS avec Let's Encrypt**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Firewall**:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

**Backups automatiques** (exemple script):

```bash
#!/bin/bash
# /opt/backup_pythonwebapp.sh
BACKUP_DIR="/opt/backups/pythonwebapp"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

sudo docker compose -f docker-compose.prod.yml exec -T db \
    pg_dump -U user users_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete  # Garder 30 jours
```

Ajouter au crontab: `0 2 * * * /opt/backup_pythonwebapp.sh`

### Commandes Production

```bash
# Gestion
sudo docker compose -f docker-compose.prod.yml restart
sudo docker compose -f docker-compose.prod.yml logs -f

# Mise à jour (après git pull)
sudo docker compose -f docker-compose.prod.yml up -d --build

# Restaurer backup
sudo docker compose -f docker-compose.prod.yml exec -T db \
    psql -U user users_db < backup.sql

# Health check
curl http://localhost:5000/health
```

---

## � Client Onboarding Guide

### Pour Nouveaux Clients

1. **Cloner et configurer**:
   ```bash
   git clone https://github.com/yourdomain/pythonwebapp.git
   cd pythonwebapp && cp .env.example .env
   ```

2. **Éditer `.env`**: 
   - Générer SECRET_KEY: `openssl rand -base64 32`
   - Définir ADMIN_MAIL, ADMIN_PASSWORD
   - Changer APP_NAME, COMPANY_NAME pour branding client
   - Configurer URLs (REACT_APP_BACKEND_URL, FRONTEND_URL)

3. **Lancer**:
   ```bash
   sudo docker compose -f docker-compose.prod.yml build
   sudo docker compose -f docker-compose.prod.yml up -d
   sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py
   ```

4. **Accès initial**:
   - Frontend: <http://localhost:3000>
   - Admin: login avec ADMIN_MAIL / ADMIN_PASSWORD
   - API Docs: <http://localhost:5000/api/docs>

**Durée estimée**: 15 minutes | **Besoin d'aide?** Voir Troubleshooting Guide

---

## 🚀 Deployment Guide

### Préparation Serveur (Ubuntu 20.04+)

```bash
# Installer Docker et docker-compose
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose
```

### Étapes Déploiement

1. **Cloner le projet**:
   ```bash
   cd /opt && git clone <repo-url> pythonwebapp
   cd pythonwebapp
   ```

2. **Configuration secrets**:
   ```bash
   mkdir .env_prod_secrets && chmod 700 .env_prod_secrets
   echo "$(openssl rand -base64 32)" > .env_prod_secrets/SECRET_KEY.txt
   echo "admin@yourdomain.com" > .env_prod_secrets/ADMIN_MAIL.txt
   echo "$(openssl rand -base64 20)" > .env_prod_secrets/ADMIN_PASSWORD.txt
   ```

3. **Fichier `.env` production**:
   ```bash
   cp .env.example .env
   # Éditer: DB_USER, DB_PASSWORD, URLs, domaine, branding
   ```

4. **Lancer les services**:
   ```bash
   sudo docker compose -f docker-compose.prod.yml up -d --build
   sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py
   ```

5. **SSL avec Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

6. **Firewall**:
   ```bash
   sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 22/tcp
   sudo ufw enable
   ```

7. **Monitoring et backups** (voir section Backups automatiques ci-dessus)

**Durée**: 30 minutes | **Support**: Vérifier les logs avec `docker logs -f`

---

## 🎨 Customization Guide

### Branding Client

**Option 1: Script automatisé**:
```bash
./setup-client-branding.sh
```

**Option 2: Variables `.env`**:
```env
APP_NAME=NomDuClient
COMPANY_NAME=Entreprise Client
APP_LOGO_URL=https://yourcdn.com/logo.png
PRIMARY_COLOR=#0066cc
SECONDARY_COLOR=#ff6600
```

**Résultat**: App, header, emails, Swagger docs adaptés au client

### Ajouter Nouvelles Fonctionnalités

**Backend** (`backend/routes/`):
- Créer route dans `auth.py`, `user.py`, ou `admin.py`
- Utiliser: `from utils import success_response, error_response`
- Patterns: Validation → Logique → API response

**Frontend** (`frontend/src/`):
- Pages: `pages/NomPage.js` (lazy load dans `App.js`)
- Components: `components/common/` (réutilisables)
- Hooks: `hooks/useApi()` pour appels API

**Tests**: Ajouter dans `backend/tests/` et `frontend/src/__tests__/` avant livraison

---

## 🔧 Troubleshooting Guide

| Problème | Solution |
|----------|----------|
| **Port 3000/5000 en utilisation** | `sudo lsof -i :3000` + `kill -9 <PID>` |
| **DB connexion refusée** | Vérifier `DB_USER`, `DB_PASSWORD`, `DATABASE_URL` dans `.env` |
| **"Module not found" (backend)** | `docker compose exec backend pip install -r requirements.txt` |
| **"npm ERR" (frontend)** | `cd frontend && npm install && npm start` |
| **Admin account locked** | `docker compose exec db psql -U user -d users_db` → `UPDATE users SET lock_until = null WHERE email = 'admin@...';` |
| **Tests échouent localement** | Exécuter depuis `/docker-compose.prod.yml` (voir Commandes Utiles) |
| **"CSRF token missing"** | Navigateur → Effacer cookies + reload, ou vérifier `FRONTEND_URL` |
| **Migrations non appliquées** | `docker compose exec backend python init_migrations.py` |

**Toujours vérifier logs**: `docker compose -f docker-compose.prod.yml logs -f backend`

---

## 📚 Documentation

- **API**: <http://localhost:5000/api/docs> (Swagger/OpenAPI)
- **GitHub**: [AnakinGig/PythonWebApp](https://github.com/AnakinGig/PythonWebApp)

---

## 📝 Licence

MIT License - Voir [LICENSE](LICENSE)
