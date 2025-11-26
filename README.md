# PythonWebApp

Application web basic fullstack

- Frontend : React (avec Node.js)
- Backend : Python Flask

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

### Backend
- ✅ API REST avec Flask
- ✅ Base de données PostgreSQL
- ✅ Migrations de base de données avec Flask-Migrate
- ✅ Pagination des listes d'utilisateurs
- ✅ Endpoint de santé (`/health`) pour monitoring
- ✅ Logging des opérations importantes
- ✅ Gestion centralisée des constantes et messages d'erreur

### Frontend
- ✅ Interface React moderne avec Bootstrap 5
- ✅ Routing avec React Router
- ✅ Lazy loading des composants
- ✅ Notifications toast pour meilleure UX
- ✅ Validation en temps réel des formulaires
- ✅ Pagination côté client
- ✅ Routes protégées par rôle

### DevOps
- ✅ Docker Compose pour dev et production
- ✅ Dockerignore pour optimiser les images
- ✅ Politiques de redémarrage automatique des conteneurs
- ✅ Health checks sur la base de données
- ✅ Variables d'environnement sécurisées
- ✅ Docker secrets pour la production

## Commandes utiles

### Migrations de base de données
```bash
# Initialiser les migrations (première fois seulement)
docker compose exec backend python init_migrations.py

# Créer une nouvelle migration après modification des models
docker compose exec backend flask db migrate -m "description des changements"

# Appliquer les migrations
docker compose exec backend flask db upgrade

# Revenir en arrière
docker compose exec backend flask db downgrade
```

### Monitoring
```bash
# Vérifier la santé de l'application
curl http://localhost:5000/health

# Voir les logs
docker compose logs -f backend
docker compose logs -f frontend
```
