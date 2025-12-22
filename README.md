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
sudo docker compose -f docker-compose.prod.yml exec backend pip install -r requirements-dev.txt
sudo docker compose -f docker-compose.prod.yml exec backend pytest -v --cov=.
cd frontend && npm install && npm test -- --coverage --watchAll=false
```

---

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

## 📚 Documentation

- **API**: <http://localhost:5000/api/docs> (Swagger/OpenAPI)

---

## 📝 Licence

MIT License - Voir [LICENSE](LICENSE)
