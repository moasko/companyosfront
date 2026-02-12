#!/bin/bash

# Script de déploiement pour l'application React sur Dockploy

echo "🚀 Déploiement de l'application Enea Telecom..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Construire l'image Docker
echo "🏗️  Construction de l'image Docker..."
docker build -t enea-telecom-frontend .

# Arrêter les containers existants
echo "⏹️  Arrêt des containers existants..."
docker-compose down

# Démarrer les nouveaux containers
echo "▶️  Démarrage des nouveaux containers..."
docker-compose up -d

# Vérifier le statut
echo "📊 Vérification du statut..."
docker-compose ps

echo "✅ Déploiement terminé !"
echo "🌐 L'application est accessible sur http://localhost"