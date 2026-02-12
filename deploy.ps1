# Script de déploiement PowerShell pour Windows
# Pour l'application Enea Telecom sur Dockploy

Write-Host "🚀 Déploiement de l'application Enea Telecom..." -ForegroundColor Green

# Vérifier si Docker est installé
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier si Docker Compose est installé
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose n'est pas installé" -ForegroundColor Red
    exit 1
}

# Construire l'image Docker
Write-Host "🏗️  Construction de l'image Docker..." -ForegroundColor Yellow
docker build -t enea-telecom-frontend .

# Arrêter les containers existants
Write-Host "⏹️  Arrêt des containers existants..." -ForegroundColor Yellow
docker-compose down

# Démarrer les nouveaux containers
Write-Host "▶️  Démarrage des nouveaux containers..." -ForegroundColor Yellow
docker-compose up -d

# Vérifier le statut
Write-Host "📊 Vérification du statut..." -ForegroundColor Yellow
docker-compose ps

Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host "🌐 L'application est accessible sur http://localhost" -ForegroundColor Cyan