# PythonWebApp

Application web fullstack moderne avec système de gestion d'utilisateurs, monitoring en temps réel, et authentification sécurisée.

- **Frontend**: React 18.2.0 + Bootstrap 5 + React Router
- **Backend**: Python Flask 3.1.2 + PostgreSQL + Redis
- **DevOps**: Docker Compose, Nginx (production)

## 🚀 Fonctionnalités Principales

### 🎨 Interface Utilisateur
- ✅ Design moderne et responsive avec Bootstrap 5
- ✅ **Mode sombre/clair** avec persistance localStorage
- ✅ Skeleton loaders pour une meilleure UX
- ✅ Notifications toast élégantes
- ✅ Modals animés avec backdrop
- ✅ Navigation intuitive avec indicateurs visuels
- ✅ Page d'accueil moderne avec cards et hero section

### 👥 Gestion des Utilisateurs
- ✅ Système complet CRUD (Create, Read, Update, Delete)
- ✅ **Recherche en temps réel** (nom, prénom, email)
- ✅ **Filtres par rôle** (Utilisateur/Administrateur)
- ✅ **Export CSV** des utilisateurs avec headers
- ✅ Pagination côté serveur (20 utilisateurs par page)
- ✅ Statistiques utilisateurs (total, admins, utilisateurs réguliers)
- ✅ Validation en temps réel des formulaires

### 📊 Monitoring & Métriques
- ✅ **Tableau de bord administrateur** avec métriques en temps réel
- ✅ **Auto-refresh** des métriques (configurable, 5s par défaut)
- ✅ Métriques système (CPU, RAM, Disque)
- ✅ Métriques applicatives (requêtes, erreurs, temps de réponse)
- ✅ **Métriques par endpoint** avec recherche/filtrage
- ✅ **Export JSON** des métriques avec timestamp
- ✅ Endpoint `/health` pour health checks
- ✅ Endpoint `/metrics` pour Prometheus/monitoring tools

### 📝 Logs d'Activité
- ✅ **Système de logs complet** avec tracking des actions utilisateur
- ✅ Enregistrement automatique des connexions/déconnexions
- ✅ Logs des opérations CRUD (création, modification, suppression)
- ✅ Stockage des IP et User-Agent
- ✅ **Interface de consultation** avec pagination (50 logs/page)
- ✅ Filtrage par utilisateur possible
- ✅ Badges colorés par type d'action

### 🔒 Sécurité
- ✅ **Protection CSRF** (Cross-Site Request Forgery)
- ✅ **Hachage bcrypt** des mots de passe
- ✅ **Validation forte** des mots de passe (8+ caractères, maj/min/chiffre/spécial)
- ✅ **Sanitisation XSS** des entrées utilisateur
- ✅ **Rate limiting** anti brute-force (100 req/min globalement)
- ✅ Rate limiting spécifique login (5 req/min) et register (3 req/min)
- ✅ En-têtes de sécurité HTTP (X-Frame-Options, CSP, etc.)
- ✅ **Gestion des rôles** (Utilisateur/Administrateur)
- ✅ **Sessions sécurisées** avec Redis
- ✅ Protection contre la suppression du dernier admin
- ✅ Protection contre la modification de son propre rôle admin

### 📚 Documentation API
- ✅ **Documentation Swagger/OpenAPI** complète
- ✅ Interface interactive à `/api/docs`
- ✅ Documentation de tous les endpoints
- ✅ Exemples de requêtes/réponses
- ✅ Spécifications de sécurité (Session, CSRF)

## Setup

Tout d'abord mettez a jour votre VPS :
``sudo apt update && apt upgrade -y``

### Installation de docker

Tout d'abord il faut installer le repo apt de Docker

``` bash
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

Ensuite on peut l'installer
``sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y``

Une fois installer vérifions si docker fonctionne correctement
``sudo systemctl status docker``

Si ce n'est pas le cas faites
``sudo systemctl start docker``

Enfin pour voir si tout fonctionne bien faites
``sudo docker run hello-world``

### Initialisation de site

Tout d'abord allez à la racine du dossier du site.

Vous aurez besoin d'une clée secrète pour faire fonctionné l'application.
Pour la générer faite dans votre terminal linux :
``openssl rand -base64 32``

Copier ensuite cette la clée qui devrais resemblé à quelque chose comme ça :
``0rnd5wsmCJYz9wucw4OCl3uOP3FxbRC+nV6pptA07KE=``

**Pour le développement :**
Créer un fichier `.env` à la racine du dossier du site et créer les variables d'environnement suivantes :

``` bash
SECRET_KEY=your_key
ADMIN_MAIL=your_admin_mail
ADMIN_PASSWORD=your_admin_password
REACT_APP_BACKEND_URL=http://localhost:5000
DATABASE_URL=postgresql://user:password@db:5432/users_db
FRONTEND_URL=http://localhost:3000
```

Remplacer les 'your_...' par vos identifiant et votre clée secrète.

**Pour la production (avec Docker Secrets) :**
Créez un dossier `.env_prod_secrets` à la racine du projet. À l'intérieur de ce dossier, créez des fichiers séparés pour chaque secret, contenant uniquement la valeur du secret.

Exemple :

- `.env_prod_secrets/SECRET_KEY` (contenant `your_secret_key_value`)
- `.env_prod_secrets/ADMIN_MAIL` (contenant `your_admin_mail_value`)
- `.env_prod_secrets/ADMIN_PASSWORD` (contenant `your_admin_password_value`)

Ensuite il faut initialiser l'application
``sudo docker compose build``

Enfin on peut lancer le site web
``sudo docker compose up``

## Fonctionnalités

### Sécurité
- ✅ Protection CSRF (Cross-Site Request Forgery)
- ✅ Hachage de mots de passe avec bcrypt
- ✅ Validation forte des mots de passe (8+ caractères, majuscule, minuscule, chiffre, caractère spécial)
- ✅ Sanitisation des entrées utilisateur (protection XSS)
- ✅ Rate limiting sur les endpoints d'authentification (anti brute-force)
- ✅ En-têtes de sécurité HTTP (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ Gestion des rôles (Utilisateur/Administrateur)
- ✅ Sessions sécurisées avec Redis

## 🏗️ Architecture Technique

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

## 📋 Commandes Utiles

### Démarrage et Arrêt
```bash
# Démarrer tous les services
docker compose up -d

# Démarrer avec rebuild
docker compose up -d --build

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes
docker compose down -v

# Redémarrer un service spécifique
docker compose restart backend
docker compose restart frontend
```

### Migrations de Base de Données
```bash
# Initialiser les migrations (première fois seulement)
docker compose exec backend flask db init

# Créer une nouvelle migration après modification des models
docker compose exec backend flask db migrate -m "description des changements"

# Appliquer les migrations
docker compose exec backend flask db upgrade

# Revenir en arrière d'une migration
docker compose exec backend flask db downgrade

# Voir l'historique des migrations
docker compose exec backend flask db history
```

### Monitoring et Logs
```bash
# Vérifier la santé de l'application
curl http://localhost:5000/health

# Voir les métriques (JSON)
curl http://localhost:5000/metrics

# Logs en temps réel
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Logs des 100 dernières lignes
docker compose logs --tail=100 backend

# Voir les processus en cours
docker compose ps

# Statistiques de ressources
docker stats
```

### Base de Données
```bash
# Accéder à PostgreSQL
docker compose exec db psql -U user -d users_db

# Backup de la base de données
docker compose exec db pg_dump -U user users_db > backup.sql

# Restore de la base de données
docker compose exec -T db psql -U user users_db < backup.sql

# Voir les tables
docker compose exec db psql -U user -d users_db -c "\dt"
```

### Développement
```bash
# Rebuilder sans cache après changement de dépendances
docker compose build --no-cache

# Accéder au shell du conteneur backend
docker compose exec backend /bin/bash

# Accéder au shell du conteneur frontend
docker compose exec frontend /bin/sh

# Installer une dépendance Python
docker compose exec backend pip install package_name

# Installer une dépendance npm
docker compose exec frontend npm install package_name

# Nettoyer Docker (ATTENTION: supprime tout)
docker system prune -a --volumes
```

### Tests et Validation
```bash
# Vérifier la configuration Python
docker compose exec backend python -c "import flask; print(flask.__version__)"

# Tester la connexion Redis
docker compose exec redis redis-cli ping

# Vérifier les endpoints
curl -X GET http://localhost:5000/health
curl -X GET http://localhost:5000/metrics
curl -X GET http://localhost:5000/api/docs
```

## 🌐 URLs et Accès

### Développement
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/health
- **Metrics**: http://localhost:5000/metrics

### Endpoints API Principaux

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

## 🎯 Roadmap Future

### Fonctionnalités Potentielles
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

## 📦 Structure du Projet

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

## 👨‍💻 Développement

### Prérequis
- Docker 20.10+
- Docker Compose 2.0+
- (Optionnel) Node.js 18+ et Python 3.12+ pour développement local

### Variables d'Environnement

Créer un fichier `.env` à la racine :

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

# (Optionnel) Pour Swagger
API_HOST=localhost:5000
```

### Générer une clé secrète
```bash
openssl rand -base64 32
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.
