# 🎬 MovieRec - Système de Recommandation de Films

Projet microservices avec Frontend React, Backend Node.js, Service IA Python, Docker et CI/CD Jenkins.

> **Note**: Ce projet utilise Jenkins avec `agent any` et Git pour le versioning. Simple à déployer !

## 📋 Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│ IA Service  │
│   (React)   │      │  (Node.js)  │      │  (Python)   │
│   Port 3000 │      │   Port 5000 │      │  Port 8000  │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Services
- **Frontend**: Interface utilisateur moderne en React
- **Backend**: API REST avec Express.js
- **IA Service**: Recommandations avec scikit-learn et cosinus similarity

## 🚀 Installation Rapide

### Prérequis
- Docker et Docker Compose
- Git (pour méthode Jenkins)
- Jenkins (pour CI/CD automatique)

### 🎯 Choisissez votre méthode

#### **Méthode 1: Jenkins + Git (RECOMMANDÉ pour production)**

```bash
# 1. Cloner le projet
git clone https://github.com/<votre-user>/movierec.git
cd movierec

# 2. Configurer Jenkins
# - New Item → Pipeline
# - SCM: Git → Repository: votre repo
# - Script Path: Jenkinsfile

# 3. Build Now!
```

**Documentation complète**: [Guide Git + Jenkins](GIT_JENKINS_GUIDE.md)

#### **Méthode 2: Script de Déploiement Rapide**

```bash
# 1. Cloner ou créer le projet
cd movierec

# 2. Rendre le script exécutable
chmod +x quick-deploy.sh

# 3. Déployer automatiquement
./quick-deploy.sh --auto

# Ou en mode interactif
./quick-deploy.sh
```

#### **Méthode 3: Manuel avec Docker Compose**

```bash
# 1. Cloner le projet
git clone https://github.com/<votre-user>/movierec.git
cd movierec

# 2. Build et lancer
docker compose up --build -d

# 3. Vérifier
docker compose ps
```

### 🌐 Accès aux Services

Une fois déployé:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **IA Service**: http://localhost:8000

---

## 🔧 Configuration Jenkins (Pipeline depuis Git)

### 1. Installer Jenkins

**Sur Ubuntu/Debian:**
```bash
# Installer Java
sudo apt update
sudo apt install openjdk-11-jdk -y

# Ajouter le repo Jenkins
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'

# Installer Jenkins
sudo apt update
sudo apt install jenkins -y

# Démarrer Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Récupérer le mot de passe initial
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Accéder à Jenkins**: http://localhost:8080

### 2. Installer les plugins requis

- Docker Pipeline
- Git Plugin
- Pipeline Plugin

### 3. Créer le Pipeline depuis Git

1. **New Item** → **Pipeline** → Nom: `MovieRec-Pipeline`

2. **General Configuration:**
   - Description: Pipeline de build et déploiement MovieRec
   - ✅ GitHub project (optionnel): URL de votre repo

3. **Build Triggers:**
   - ✅ Poll SCM: `H/5 * * * *` (vérifie Git toutes les 5 minutes)
   - Ou GitHub hook trigger (si webhook configuré)

4. **Pipeline Configuration:**
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/<votre-user>/movierec.git`
   - Credentials: Ajouter si repo privé
   - Branch Specifier: `*/main` (ou `*/master`)
   - Script Path: `Jenkinsfile`

5. **Save** et **Build Now**

## 📦 Structure des Fichiers

```
movierec/
├── frontend/
│   ├── src/
│   │   ├── App.js              # Composant React principal
│   │   ├── style.css           # Styles CSS
│   │   ├── index.js            # Point d'entrée React
│   │   └── index.html          # Template HTML
│   ├── package.json            # Dépendances npm
│   ├── webpack.config.js       # Configuration Webpack
│   └── Dockerfile              # Image Docker Frontend
├── backend/
│   ├── server.js               # Serveur Express
│   ├── package.json            # Dépendances npm
│   └── Dockerfile              # Image Docker Backend
├── ai-service/
│   ├── app.py                  # Service Flask IA
│   ├── requirements.txt        # Dépendances Python
│   └── Dockerfile              # Image Docker IA
├── docker-compose.yml          # Orchestration Docker
├── Jenkinsfile                 # Pipeline CI/CD (à la racine!)
├── .gitignore                  # Fichiers à ignorer
└── README.md                   # Ce fichier
```

## 🎯 Utilisation

### Interface Web

1. **Accéder au Frontend**: http://localhost:3000

2. **Rechercher un film**: Tapez un titre ou un genre

3. **Obtenir des recommandations**: Cliquez sur "Recommandations"

### API Backend

```bash
# Rechercher des films
curl "http://localhost:5000/api/movies/search?q=inception"

# Obtenir tous les films
curl http://localhost:5000/api/movies

# Obtenir des recommandations
curl http://localhost:5000/api/recommendations/1
```

### Service IA

```bash
# Info sur le modèle
curl http://localhost:8000/model-info

# Recommandations directes
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "movie_id": 1,
    "movie_genre": "Sci-Fi",
    "movie_rating": 8.8,
    "all_movies": [...]
  }'
```

## 🔄 Pipeline Jenkins

Le pipeline s'exécute automatiquement et comprend:

1. **Préparation**: Vérification Docker et Docker Compose
2. **Vérification Code**: Validation de la structure du projet
3. **Build**: Construction des 3 images Docker
4. **Tests**: Tests parallèles (Node.js, Python)
5. **Déploiement**: Lancement avec docker-compose
6. **Vérification Santé**: Health checks avec retry automatique

### Déclencher le pipeline

**Automatiquement:**
- À chaque push Git (si webhook configuré)
- Toutes les 5 minutes (si Poll SCM activé)

**Manuellement:**
- Jenkins → MovieRec-Pipeline → Build Now

## 🛠️ Commandes Utiles

### Git
```bash
# Initialiser le repo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <votre-repo-url>
git push -u origin main

# Mettre à jour
git add .
git commit -m "Update"
git push
```

### Docker
```bash
# Voir les logs
docker compose logs -f

# Redémarrer un service
docker compose restart backend

# Supprimer tout et recommencer
docker compose down -v
docker compose up --build -d
```

### Debugging
```bash
# Entrer dans un container
docker exec -it movierec-backend-1 sh

# Voir les processus
docker compose top

# Statistiques
docker stats
```

## 🧪 Tests

### Test du Frontend
```bash
curl http://localhost:3000
```

### Test du Backend
```bash
# Health check
curl http://localhost:5000/health

# Recherche de films
curl "http://localhost:5000/api/movies/search?q=matrix"
```

### Test de l'IA
```bash
# Health check
curl http://localhost:8000/health

# Info modèle
curl http://localhost:8000/model-info
```

## 📊 Monitoring

### Logs en temps réel
```bash
# Tous les services
sudo docker-compose logs -f

# Un service spécifique
sudo docker-compose logs -f backend
```

### État des containers
```bash
sudo docker-compose ps
```

## 🐛 Dépannage

### Le pipeline échoue au build

```bash
# Vérifier Docker
docker --version
docker compose version

# Vérifier les fichiers
ls -la frontend/ backend/ ia-service/

# Build manuel pour voir l'erreur
docker build -t test ./frontend
```

### Port déjà utilisé
```bash
# Trouver et tuer le processus
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Erreur de connexion entre services
```bash
# Vérifier le réseau Docker
docker network ls
docker network inspect movierec_movierec-network

# Vérifier les logs
docker compose logs backend
docker compose logs ia-service
```

### Les services ne démarrent pas
```bash
# Voir les logs détaillés
docker compose logs -f

# Rebuild complet
docker compose down -v
docker system prune -a
docker compose up --build -d
```

### Jenkins ne trouve pas Docker
```bash
# Ajouter jenkins au groupe docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## 🔐 Sécurité

- Les mots de passe Jenkins sont affichés lors du provisionnement Vagrant
- Les clés SSH sont générées automatiquement
- En production, utilisez des secrets management (Vault, etc.)

## 📝 Notes

- Le service IA utilise un algorithme de similarité cosinus simple et léger
- La base de données est simulée en mémoire (12 films)
- Pour la production, ajoutez une vraie base de données (PostgreSQL, MongoDB)
- Le pipeline utilise `agent any` - fonctionne sur n'importe quel agent Jenkins
- Compatible avec `docker compose` (v2) et `docker-compose` (v1)

## 📂 Préparer pour Git

### Créer un .gitignore

```bash
cat > .gitignore << 'EOF'
# Node
node_modules/
npm-debug.log*
package-lock.json

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.env

# Docker
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF
```

### Initialiser Git

```bash
git init
git add .
git commit -m "Initial commit: MovieRec microservices project"
git branch -M main
git remote add origin https://github.com/<votre-user>/movierec.git
git push -u origin main
```

## 🚧 Améliorations Possibles

- [ ] Authentification JWT
- [ ] Base de données persistante
- [ ] Cache Redis
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Tests unitaires et E2E
- [ ] Kubernetes pour l'orchestration
- [ ] API Gateway

## 📄 Licence

MIT

## 👨‍💻 Auteur

Projet de démonstration - Microservices avec CI/CD