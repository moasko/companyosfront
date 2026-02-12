# Déploiement sur Dockploy

## Prérequis

- Docker installé sur votre machine
- Docker Compose installé
- Accès à votre environnement Dockploy

## Structure des fichiers

```
front/
├── Dockerfile          # Configuration de l'image Docker
├── .dockerignore       # Fichiers à ignorer lors du build
├── docker-compose.yml  # Configuration des services
├── nginx.conf         # Configuration du serveur web
├── .env.production    # Variables d'environnement de production
├── deploy.sh          # Script de déploiement (Linux/Mac)
├── deploy.ps1         # Script de déploiement (Windows)
└── vite.config.ts     # Configuration Vite mise à jour
```

## Configuration

### 1. Variables d'environnement

Modifiez le fichier `.env.production` avec vos valeurs :

```bash
VITE_API_URL=https://votre-api-production.com/api
VITE_APP_NAME=Enea Telecom
VITE_APP_VERSION=1.0.0
```

### 2. Configuration nginx

Le fichier `nginx.conf` est déjà configuré pour :
- Gérer les routes React Router
- Optimiser le cache des assets statiques
- Ajouter des headers de sécurité
- Activer la compression GZIP

## Déploiement

### Sur Windows (PowerShell)

```powershell
# Exécuter le script de déploiement
.\deploy.ps1
```

### Sur Linux/Mac

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Exécuter le script
./deploy.sh
```

### Déploiement manuel

```bash
# Construire l'image
docker build -t enea-telecom-frontend .

# Démarrer les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

## Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Redémarrer les services
docker-compose restart

# Voir les images Docker
docker images

# Supprimer les containers arrêtés
docker container prune
```

## Configuration Dockploy

Pour déployer sur Dockploy, vous aurez besoin de :

1. **Créer une application** dans votre interface Dockploy
2. **Configurer le dépôt Git** avec vos fichiers
3. **Définir les variables d'environnement** dans l'interface Dockploy
4. **Déployer** en utilisant le workflow de Dockploy

## Variables d'environnement requises

Dans l'interface Dockploy, configurez ces variables :

- `VITE_API_URL` : URL de votre API backend
- `VITE_APP_NAME` : Nom de votre application
- `VITE_APP_VERSION` : Version de l'application

## Surveillance

Après le déploiement, surveillez :

- Les logs de l'application : `docker-compose logs -f`
- L'état des containers : `docker-compose ps`
- Les performances via l'interface Dockploy

## Mise à jour

Pour mettre à jour l'application :

1. Poussez vos modifications sur le dépôt Git
2. Déclenchez un nouveau déploiement via Dockploy
3. Ou exécutez le script de déploiement localement

## Problèmes courants

### Erreur de build
- Vérifiez que toutes les dépendances sont dans `package.json`
- Assurez-vous que le fichier `.dockerignore` est correct

### Problèmes de routage
- Vérifiez la configuration nginx
- Assurez-vous que `try_files` est correctement configuré

### Problèmes d'environnement
- Vérifiez que les variables d'environnement sont correctement définies
- Assurez-vous que les URLs sont accessibles depuis le container