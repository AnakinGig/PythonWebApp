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

Enfin on peut lance le site web
``sudo docker compose up``
