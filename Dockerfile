# Multi-stage build pour optimiser la taille de l'image
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances
RUN npm install && npm cache clean --force

# Copier tous les fichiers sources
COPY . .

# Build l'application
RUN npm run build

# Suppression des dépendances de développement pour réduire la taille
RUN npm prune --production

# Étape de production
FROM nginx:alpine

# Copier les fichiers build dans le répertoire nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]