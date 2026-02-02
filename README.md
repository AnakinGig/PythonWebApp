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

- [Developement](#developement)
- [Production](#production)
- [Tests](#tests)

---

## Developement

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

## Production

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