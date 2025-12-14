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

Créez un fichier `.env` à la racine du projet à partir du template fourni :

```bash
cp .env.example .env
```

Éditez le fichier `.env` et configurez les variables essentielles :

```env
# Sécurité (OBLIGATOIRE - utilisez la clé générée à l'étape 2)
SECRET_KEY=your_secret_key_here

# Authentification Admin (OBLIGATOIRE)
ADMIN_MAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!

# URLs (OBLIGATOIRE)
REACT_APP_BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Base de données (OBLIGATOIRE)
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password
DB_NAME=users_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}

# Branding Backend (OPTIONNEL - voir section Personnalisation du Branding)
APP_NAME=PythonWebApp
COMPANY_NAME=Your Company
API_TITLE=PythonWebApp API
API_DESCRIPTION=API REST pour la gestion des utilisateurs
API_VERSION=1.0.0
SUPPORT_EMAIL=support@example.com
SUPPORT_URL=https://example.com/support

# Branding Frontend (OPTIONNEL - voir section Personnalisation du Branding)
REACT_APP_NAME=PythonWebApp
REACT_APP_COMPANY_NAME=Your Company
REACT_APP_TAGLINE=Modern Fullstack Web Application
REACT_APP_DESCRIPTION=Application web avec système de gestion d'utilisateurs
REACT_APP_VERSION=1.0.0
REACT_APP_SUPPORT_EMAIL=support@example.com
REACT_APP_SUPPORT_URL=https://example.com/support
REACT_APP_PRIMARY_COLOR=#0d6efd
REACT_APP_LOGO_URL=/logo.png
```

**Variables obligatoires** :
- `SECRET_KEY` : Clé générée à l'étape 2 (pour sécuriser les sessions)
- `ADMIN_MAIL` et `ADMIN_PASSWORD` : Identifiants du compte administrateur
- `DB_USER` et `DB_PASSWORD` : Identifiants PostgreSQL (⚠️ Ne jamais utiliser user/password en production)
- URLs backend/frontend

**Variables optionnelles** :
- Variables de branding (APP_NAME, COMPANY_NAME, etc.) : voir section suivante

⚠️ **Important** : Le fichier `.env` contient des secrets. Ne le committez jamais dans Git !

#### 4. Personnalisation du Branding (Optionnel)

Pour personnaliser l'application selon votre marque ou celle de votre client :

**Option 1 : Script automatique** (recommandé)

```bash
chmod +x setup-client-branding.sh
./setup-client-branding.sh
```

Le script vous demandera interactivement :
- Nom de l'application
- Nom de l'entreprise
- Slogan/tagline
- Email de support
- URL du support
- Couleur principale
- Etc.

Tous les fichiers seront automatiquement mis à jour.

**Option 2 : Configuration manuelle**

Éditez directement le fichier `.env` et modifiez les variables de branding :

```env
# Backend
APP_NAME=MonApp                    # Nom affiché dans l'API
COMPANY_NAME=Ma Société            # Nom de votre entreprise
API_TITLE=MonApp API               # Titre de l'API Swagger
SUPPORT_EMAIL=contact@masociete.com

# Frontend
REACT_APP_NAME=MonApp              # Nom dans l'interface
REACT_APP_COMPANY_NAME=Ma Société
REACT_APP_TAGLINE=Votre nouveau slogan
REACT_APP_PRIMARY_COLOR=#ff6b6b   # Couleur principale (hex)
```

📖 **Documentation complète** : Voir [BRANDING_GUIDE.md](BRANDING_GUIDE.md) pour tous les détails.

#### 5. Initialiser les Migrations de Base de Données

Avant le premier lancement, initialisez le système de migrations Flask-Migrate :

```bash
# Démarrer uniquement la base de données
docker compose up -d db

# Attendre que PostgreSQL soit prêt (quelques secondes)
sleep 5

# Démarrer le backend
docker compose up -d backend

# Initialiser les migrations
docker compose exec backend python init_migrations.py
```

Cette commande va :
1. Créer le dossier `backend/migrations/` avec la structure Flask-Migrate
2. Générer la migration initiale basée sur vos modèles
3. Appliquer la migration pour créer les tables

**Vérification** :

```bash
# Voir l'historique des migrations
docker compose exec backend flask db history

# Vous devriez voir : "Initial migration" avec un hash
```

📖 **Documentation complète** : Voir [MIGRATIONS_GUIDE.md](MIGRATIONS_GUIDE.md) pour gérer les migrations futures.

⚠️ **Note** : Cette étape n'est nécessaire qu'une seule fois lors de l'installation initiale. Les migrations futures se feront avec `flask db migrate` et `flask db upgrade`.

#### 6. Lancer l'Application

```bash
# Build les images Docker
docker compose build

# Démarrer tous les services
docker compose up -d

# Voir les logs en temps réel
docker compose logs -f
```

### URLs de Développement

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:5000>
- **Swagger Docs**: <http://localhost:5000/api/docs>
- **Health Check**: <http://localhost:5000/health>
- **Metrics**: <http://localhost:5000/metrics>

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

**Créer une migration après modification des modèles** :

```bash
# Générer automatiquement une migration basée sur les changements
docker compose exec backend flask db migrate -m "description du changement"

# Exemple : après avoir ajouté un champ 'phone' au modèle User
docker compose exec backend flask db migrate -m "add phone field to user"
```

**Appliquer les migrations** :

```bash
# Appliquer toutes les migrations en attente
docker compose exec backend flask db upgrade

# Appliquer jusqu'à une migration spécifique
docker compose exec backend flask db upgrade <revision_id>
```

**Revenir en arrière** :

```bash
# Annuler la dernière migration
docker compose exec backend flask db downgrade

# Revenir à une migration spécifique
docker compose exec backend flask db downgrade <revision_id>
```

**Utilitaires** :

```bash
# Voir l'historique complet des migrations
docker compose exec backend flask db history

# Voir la migration actuelle
docker compose exec backend flask db current

# Voir les détails d'une migration
docker compose exec backend flask db show <revision_id>
```

📖 **Guide complet** : Voir [MIGRATIONS_GUIDE.md](MIGRATIONS_GUIDE.md) pour des exemples détaillés et bonnes pratiques.

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

#### 3. Configurer les Variables d'Environnement de Production

**Créer le fichier `.env` pour la production** :

```bash
cp .env.example .env
```

**Éditer `.env` avec les valeurs de production** :

```env
# Sécurité (OBLIGATOIRE)
SECRET_KEY=votre_cle_secrete_production_tres_longue_et_complexe

# Admin (OBLIGATOIRE)
ADMIN_MAIL=admin@votredomaine.com
ADMIN_PASSWORD=MotDePasseSecure123!@#

# Base de données (OBLIGATOIRE - Identifiants forts !)
DB_USER=prod_user
DB_PASSWORD=VotreMotDePasseDBTresSecure123!@#
DB_NAME=users_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}

# URLs (OBLIGATOIRE - Votre domaine)
REACT_APP_BACKEND_URL=https://api.votredomaine.com
FRONTEND_URL=https://votredomaine.com

# Branding (OPTIONNEL - Personnalisez pour votre client)
APP_NAME=VotreApp
COMPANY_NAME=Votre Société
REACT_APP_NAME=VotreApp
REACT_APP_COMPANY_NAME=Votre Société
REACT_APP_PRIMARY_COLOR=#0d6efd
# ... autres variables de branding
```

⚠️ **Sécurité Critique** :
- Utilisez des mots de passe forts (16+ caractères)
- Ne réutilisez jamais les identifiants de développement
- Le fichier `.env` ne doit JAMAIS être dans Git

**Si nécessaire, ajuster les URLs dans `docker-compose.prod.yml`** :

Les variables du fichier `.env` sont automatiquement chargées, mais vous pouvez surcharger dans `docker-compose.prod.yml` :

```yaml
backend:
  environment:
    FRONTEND_URL: http://localhost # À CHANGER

frontend:
  environment:
    - REACT_APP_BACKEND_URL=http://localhost:5000/api # À CHANGER
```

⚠️ **Note** : Les identifiants de base de données sont maintenant gérés via le fichier `.env`. Assurez-vous d'avoir configuré `DB_USER`, `DB_PASSWORD` et `DB_NAME` dans votre `.env` avant de déployer.

#### 4. Personnaliser le Branding pour le Client (Optionnel)

Si vous déployez pour un client spécifique, personnalisez le branding :

```bash
# Utiliser le script automatique
./setup-client-branding.sh

# Ou modifier manuellement le .env
nano .env
```

Modifiez les variables :
- `APP_NAME` / `REACT_APP_NAME` : Nom de l'application du client
- `COMPANY_NAME` / `REACT_APP_COMPANY_NAME` : Nom de l'entreprise du client
- `REACT_APP_PRIMARY_COLOR` : Couleur principale de la charte graphique
- `SUPPORT_EMAIL` / `REACT_APP_SUPPORT_EMAIL` : Email de support du client
- Etc.

📖 Voir [BRANDING_GUIDE.md](BRANDING_GUIDE.md) pour la liste complète des options.

#### 5. Déployer en Production

```bash
# Build les images de production
sudo docker compose -f docker-compose.prod.yml build

# Lancer en production
sudo docker compose -f docker-compose.prod.yml up -d

# Vérifier que tout fonctionne
sudo docker compose -f docker-compose.prod.yml ps
sudo docker compose -f docker-compose.prod.yml logs -f

# Initialiser les migrations (PREMIÈRE FOIS UNIQUEMENT)
sudo docker compose -f docker-compose.prod.yml exec backend python init_migrations.py

# Pour les mises à jour ultérieures, utiliser :
# sudo docker compose -f docker-compose.prod.yml exec backend flask db upgrade
```

**Vérifications importantes** :

- ✅ Backend accessible et sain : `curl http://localhost:5000/health`
- ✅ Frontend accessible : `curl http://localhost:80`
- ✅ Pas d'erreurs dans les logs
- ✅ Compte admin créé automatiquement

### Commandes de Production

#### Gestion des Services docker

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

```text
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

## Développé avec ❤ par Gigant Anakin
