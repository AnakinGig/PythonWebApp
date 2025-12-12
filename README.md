# PythonWebApp

Application web fullstack moderne avec système de gestion d'utilisateurs, monitoring en temps réel, et authentification sécurisée.

- **Frontend**: React 18.2.0 + Bootstrap 5 + React Router
- **Backend**: Python Flask 3.1.2 + PostgreSQL + Redis
- **DevOps**: Docker Compose, Nginx (production)

---

## 📋 Table des Matières

1. [Fonctionnalités](#-fonctionnalités-principales)
2. [🔧 Développement](#-développement-mode-dev)
3. [🚀 Production](#-production-mode-prod)
4. [📚 Documentation](#-documentation)

---

## 🚀 Fonctionnalités Principales

### 🎨 Interface Utilisateur
- ✅ Design moderne et responsive avec Bootstrap 5

### 👥 Gestion des Utilisateurs
- ✅ Système complet CRUD (Create, Read, Update, Delete)

### 📊 Monitoring & Métriques
- ✅ **Tableau de bord administrateur** avec métriques en temps réel

### 📝 Logs d'Activité
- ✅ **Système de logs complet** avec tracking des actions utilisateur
- 
### 🔒 Sécurité

### 📚 Documentation API
- ✅ **Documentation Swagger/OpenAPI** complète à `/api/docs`

---

## 🔧 Développement (Mode Dev)

### Prérequis
- Docker 20.10+
- Docker Compose 2.0+
- (Optionnel) Node.js 18+ et Python 3.12+ pour développement local

### Installation Initiale

#### 1. Cloner le Projet
```bash
git clone https://github.com/AnakinGig/PythonWebApp.git
cd PythonWebApp
```

#### 2. Générer une Clé Secrète
```bash
openssl rand -base64 32
```
Copiez la clé générée (ex: `0rnd5wsmCJYz9wucw4OCl3uOP3FxbRC+nV6pptA07KE=`)

#### 3. Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Sécurité
SECRET_KEY=your_secret_key_here

# Authentification Admin
ADMIN_MAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!

# URLs
REACT_APP_BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Base de données
DATABASE_URL=postgresql://user:password@db:5432/users_db
```

Remplacez les valeurs `your_...` par vos propres identifiants et la clé générée.

#### 4. Lancer l'Application
```bash
# Build les images Docker
docker compose build

# Démarrer tous les services
docker compose up -d

# Voir les logs en temps réel
docker compose logs -f
```

### URLs de Développement
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/health
- **Metrics**: http://localhost:5000/metrics

### Commandes de Développement

#### Gestion des Services
```bash
# Démarrer avec rebuild
docker compose up -d --build

# Arrêter tous les services
docker compose down

# Redémarrer un service spécifique
docker compose restart backend
docker compose restart frontend

# Voir les logs
docker compose logs -f backend
docker compose logs --tail=100 frontend
```

#### Migrations de Base de Données
```bash
# Créer une nouvelle migration
docker compose exec backend flask db migrate -m "description"

# Appliquer les migrations
docker compose exec backend flask db upgrade

# Revenir en arrière
docker compose exec backend flask db downgrade

# Historique des migrations
docker compose exec backend flask db history
```

#### Accès aux Conteneurs
```bash
# Shell backend (Python)
docker compose exec backend /bin/bash

# Shell frontend (Node)
docker compose exec frontend /bin/sh

# PostgreSQL
docker compose exec db psql -U user -d users_db

# Redis CLI
docker compose exec redis redis-cli
```

#### Installation de Dépendances
```bash
# Backend (Python)
docker compose exec backend pip install package_name
# Puis rebuild: docker compose up -d --build backend

# Frontend (npm)
docker compose exec frontend npm install package_name
# Puis rebuild: docker compose up -d --build frontend
```

### Debugging et Tests
```bash
# Vérifier la santé de l'application
curl http://localhost:5000/health

# Tester les endpoints
curl -X GET http://localhost:5000/metrics
curl -X GET http://localhost:5000/api/docs

# Voir les processus
docker compose ps

# Statistiques de ressources
docker stats
```

---

## 🚀 Production (Mode Prod)

### Prérequis Serveur
- Ubuntu 20.04+ ou Debian 11+
- Docker et Docker Compose installés
- Nom de domaine configuré (optionnel mais recommandé)
- Certificat SSL/TLS (Let's Encrypt recommandé)

### Installation de Docker sur Ubuntu/Debian

#### 1. Mettre à Jour le Système
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Installer Docker
```bash
# Installer les dépendances
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings

# Ajouter la clé GPG officielle Docker
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Ajouter le repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Mettre à jour et installer Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

#### 3. Vérifier l'Installation
```bash
# Vérifier le statut de Docker
sudo systemctl status docker

# Démarrer Docker si nécessaire
sudo systemctl start docker

# Tester Docker
sudo docker run hello-world
```

### Configuration de Production

#### 1. Générer une Clé Secrète Forte
```bash
openssl rand -base64 32
```

#### 2. Configurer Docker Secrets

Créez un dossier `.env_prod_secrets` à la racine du projet :

```bash
mkdir .env_prod_secrets
cd .env_prod_secrets
```

Créez des fichiers séparés pour chaque secret :

```bash
# Clé secrète (remplacez par votre clé générée)
echo "votre_cle_secrete_generee" > SECRET_KEY

# Email admin
echo "admin@votredomaine.com" > ADMIN_MAIL

# Mot de passe admin (8+ caractères, maj/min/chiffre/spécial)
echo "VotreMotDePasseSecure123!" > ADMIN_PASSWORD
```

**Note**: Les secrets sont automatiquement lus par Docker depuis `/run/secrets/` dans les conteneurs.

**Important**: Sécurisez ces fichiers !
```bash
chmod 600 .env_prod_secrets/*
```

#### 3. Configurer les Variables d'Environnement

Changer les urls frontend et backend dans `docker-compose.prod.yml` :

```yaml
backend:
  environment:
    FRONTEND_URL: http://localhost # À CHANGER

frontend:
  environment:
    - REACT_APP_BACKEND_URL=http://localhost:5000/api # À CHANGER
```

⚠️ **Important**: Changez les identifiants de base de données dans `docker-compose.prod.yml` :

```yaml
db:
  environment:
    POSTGRES_USER: user  # À CHANGER
    POSTGRES_PASSWORD: password  # À CHANGER
```

Et mettez à jour `DATABASE_URL` dans la section backend :
```yaml
backend:
  environment:
    DATABASE_URL: postgresql://user:password@db:5432/users_db
```

#### 4. Déployer en Production

```bash
# Build les images de production
sudo docker compose -f docker-compose.prod.yml build

# Lancer en production
sudo docker compose -f docker-compose.prod.yml up -d

# Vérifier que tout fonctionne
sudo docker compose -f docker-compose.prod.yml ps
sudo docker compose -f docker-compose.prod.yml logs -f

# Initialiser la base de données (première fois uniquement)
sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
```

**Vérifications importantes** :
- ✅ Backend accessible et sain : `curl http://localhost:5000/health`
- ✅ Frontend accessible : `curl http://localhost:80`
- ✅ Pas d'erreurs dans les logs
- ✅ Compte admin créé automatiquement

### Commandes de Production

#### Gestion des Services
```bash
# Redémarrer l'application
sudo docker compose -f docker-compose.prod.yml restart

# Arrêter l'application
sudo docker compose -f docker-compose.prod.yml down

# Mise à jour (après git pull)
sudo docker compose -f docker-compose.prod.yml up -d --build

# Voir les logs
sudo docker compose -f docker-compose.prod.yml logs -f
sudo docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

#### Backup et Restauration
```bash
# Backup de la base de données
sudo docker compose -f docker-compose.prod.yml exec db pg_dump -U user users_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
sudo docker compose -f docker-compose.prod.yml exec -T db psql -U user users_db < backup_20240127_120000.sql
```

#### Health Checks et Monitoring
```bash
# Vérifier la santé du backend
curl http://localhost:5000/health

# Voir les métriques
curl http://localhost:5000/metrics

# Vérifier les services
sudo docker compose -f docker-compose.prod.yml ps

# Statistiques de ressources
docker stats

# Vérifier les health checks
sudo docker inspect --format='{{json .State.Health}}' pythonwebapp-backend-1 | python3 -m json.tool
```

### Sécurité en Production

#### 1. Changez les Identifiants par Défaut

⚠️ **CRITIQUE** : Changez immédiatement les identifiants PostgreSQL dans `docker-compose.prod.yml` :

```yaml
db:
  environment:
    POSTGRES_DB: users_db
    POSTGRES_USER: votre_utilisateur_secure  # NE PAS UTILISER "user"
    POSTGRES_PASSWORD: votre_mot_de_passe_secure  # NE PAS UTILISER "password"
```

#### 2. Configuration SSL/TLS

**Installer Certbot pour Let's Encrypt** :

```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

**Configurer Nginx en tant que reverse proxy** :

Créez `/etc/nginx/sites-available/pythonwebapp` :

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name votredomaine.com www.votredomaine.com;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;

    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez la configuration :
```bash
sudo ln -s /etc/nginx/sites-available/pythonwebapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. Configuration du Firewall
```bash
# Autoriser HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Autoriser SSH
sudo ufw allow 22/tcp

# Activer le firewall
sudo ufw enable

# Vérifier l'état
sudo ufw status
```

#### 4. Sauvegardes Automatiques

**Créer un script de backup** (`/opt/backup_pythonwebapp.sh`) :

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/pythonwebapp"
ARCHIVE_DIR="/opt/backups/pythonwebapp/archives"
DATE=$(date +%Y%m%d_%H%M%S)
MONTH=$(date +%Y%m)
COMPOSE_FILE="/chemin/vers/docker-compose.prod.yml"

mkdir -p $BACKUP_DIR
mkdir -p $ARCHIVE_DIR

# Backup PostgreSQL
docker compose -f $COMPOSE_FILE exec -T db \
    pg_dump -U user users_db > "$BACKUP_DIR/db_backup_$DATE.sql"

# Compresser
gzip "$BACKUP_DIR/db_backup_$DATE.sql"

echo "Backup créé : db_backup_$DATE.sql.gz"

# Archiver les backups de plus de 60 jours dans un fichier tar par mois
find $BACKUP_DIR -maxdepth 1 -name "*.sql.gz" -mtime +60 | while read backup; do
    BACKUP_MONTH=$(basename "$backup" | grep -oP '\d{6}' | head -1)
    if [ ! -z "$BACKUP_MONTH" ]; then
        ARCHIVE_FILE="$ARCHIVE_DIR/archive_${BACKUP_MONTH}.tar.gz"
        
        # Ajouter au fichier d'archive du mois correspondant
        if [ -f "$ARCHIVE_FILE" ]; then
            # Ajouter au tar existant
            gunzip -c "$backup" | tar -rzf "$ARCHIVE_FILE" --transform "s|.*/||" -
        else
            # Créer un nouveau tar
            tar -czf "$ARCHIVE_FILE" -C "$(dirname "$backup")" "$(basename "$backup")"
        fi
        
        echo "Archivé : $(basename "$backup") -> archive_${BACKUP_MONTH}.tar.gz"
        rm "$backup"
    fi
done

# Garder seulement les 60 derniers jours de backups non-archivés
find $BACKUP_DIR -maxdepth 1 -name "*.sql.gz" -mtime +60 -delete

echo "Nettoyage terminé - Backups récents conservés (60 jours), anciens archivés"
```

**Rendre le script exécutable** :
```bash
sudo chmod +x /opt/backup_pythonwebapp.sh
```

**Ajouter au crontab** (sauvegarde quotidienne à 2h du matin) :
```bash
sudo crontab -e
# Ajouter cette ligne :
0 2 * * * /opt/backup_pythonwebapp.sh >> /var/log/pythonwebapp_backup.log 2>&1
```


---

## 📚 Documentation

### 🏗️ Architecture Technique

### Backend (Flask)
- ✅ **API REST RESTful** avec conventions HTTP (GET/POST/PUT/DELETE)
- ✅ **PostgreSQL 13** pour la persistance
- ✅ **Redis 7** pour les sessions et le cache
- ✅ **Flask-Migrate** pour les migrations de base de données
- ✅ **Flask-Limiter** pour le rate limiting
- ✅ **Flasgger** pour la documentation OpenAPI/Swagger
- ✅ **psutil** pour les métriques système
- ✅ **Marshmallow** pour la sérialisation/validation
- ✅ Architecture en Blueprints (auth, admin)
- ✅ Middleware de monitoring des requêtes
- ✅ Logging structuré avec rotation
- ✅ Gestion centralisée des erreurs et constantes

### Frontend (React)
- ✅ **React 18.2.0** avec Hooks modernes
- ✅ **React Router 6** pour le routing
- ✅ **Bootstrap 5.3+** avec support dark mode
- ✅ **Axios** pour les requêtes HTTP
- ✅ **Context API** pour le thème global
- ✅ Lazy loading avec React.lazy et Suspense
- ✅ Custom hooks (useApi, useTheme)
- ✅ Composants réutilisables (Modal, Toast, SkeletonLoader)
- ✅ Error boundaries pour la gestion d'erreurs
- ✅ Routes protégées par rôle avec PrivateRoute

### DevOps
- ✅ Docker Compose pour dev et production
- ✅ Dockerignore pour optimiser les images
- ✅ Politiques de redémarrage automatique des conteneurs
- ✅ Health checks sur la base de données
- ✅ Variables d'environnement sécurisées
- ✅ Docker secrets pour la production

### 🌐 Endpoints API Principaux

#### Authentification
- `POST /register` - Inscription
- `POST /login` - Connexion
- `POST /logout` - Déconnexion
- `GET /current-user` - Obtenir l'utilisateur courant
- `GET /get_csrf_token` - Obtenir le token CSRF

#### Administration (Admin requis)
- `GET /admin/users` - Liste des utilisateurs (paginée)
- `POST /admin/users` - Créer un utilisateur
- `GET /admin/users/<id>` - Détails d'un utilisateur
- `PUT /admin/users/<id>` - Modifier un utilisateur
- `DELETE /admin/users/<id>` - Supprimer un utilisateur
- `GET /admin/activity-logs` - Logs d'activité (paginés)

### 📦 Structure du Projet

```
PythonWebApp/
├── backend/
│   ├── app.py                      # Application Flask principale
│   ├── models.py                   # Modèles SQLAlchemy (User, ActivityLog)
│   ├── monitoring.py               # Système de monitoring
│   ├── activity_logger.py          # Logger d'activités
│   ├── constants.py                # Constantes et messages
│   ├── utils.py                    # Fonctions utilitaires
│   ├── api_response.py             # Formatage des réponses API
│   ├── config.py                   # Configuration Flask
│   ├── requirements.txt            # Dépendances Python
│   ├── Dockerfile                  # Image Docker dev
│   ├── Dockerfile.prod             # Image Docker production
│   └── routes/
│       ├── auth.py                 # Routes d'authentification
│       └── admin.py                # Routes d'administration
├── frontend/
│   ├── package.json                # Dépendances npm
│   ├── Dockerfile                  # Image Docker dev
│   ├── Dockerfile.prod             # Image Docker production
│   ├── nginx.conf                  # Configuration Nginx (prod)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js                  # Composant racine
│       ├── index.js                # Point d'entrée
│       ├── components/
│       │   ├── Header.js           # Barre de navigation
│       │   ├── Footer.js           # Pied de page
│       │   ├── Modal.js            # Modal réutilisable
│       │   ├── Toast.js            # Notifications
│       │   ├── LoadingSpinner.js   # Spinners de chargement
│       │   ├── SkeletonLoader.js   # Skeleton screens
│       │   ├── PrivateRoute.js     # Protection de routes
│       │   ├── ErrorBoundary.js    # Gestion d'erreurs
│       │   ├── httpClient.js       # Client Axios configuré
│       │   └── useApi.js           # Hook personnalisé
│       ├── context/
│       │   └── ThemeContext.js     # Context du thème
│       └── pages/
│           ├── Home.js             # Page d'accueil
│           ├── Login.js            # Page de connexion
│           ├── Register.js         # Page d'inscription
│           ├── AdminDashboard.js   # Tableau de bord admin
│           ├── UsersList.js        # Liste des utilisateurs
│           ├── ManageUser.js       # Modification utilisateur
│           ├── ActivityLogs.js     # Logs d'activité
│           └── NotFound.js         # Page 404
├── docker-compose.yml              # Configuration Docker dev
├── docker-compose.prod.yml         # Configuration Docker prod
├── .env                            # Variables d'environnement dev
└── README.md                       # Ce fichier
```

### 🎯 Roadmap Future

#### Fonctionnalités Potentielles
- [ ] Authentification OAuth2 (Google, GitHub)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Notifications par email
- [ ] Upload et gestion d'avatars utilisateur
- [ ] Export PDF des rapports
- [ ] Graphiques et visualisations avancées
- [ ] Système de permissions granulaires
- [ ] API WebSocket pour notifications temps réel
- [ ] Tests automatisés (Jest, Pytest)
- [ ] CI/CD avec GitHub Actions
- [ ] Déploiement Kubernetes

---

## 📄 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**Développé avec ❤ par Gigant Anakin**
