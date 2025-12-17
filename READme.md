# 🎬 MovieRec - Système de Recommandation de Films

Projet microservices avec Frontend React, Backend Node.js, Service IA Python, Docker et CI/CD Jenkins.

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
- VirtualBox
- Vagrant
- Git

### Étape 1: Créer la structure

```bash
mkdir movierec && cd movierec
mkdir -p frontend/src backend ia-service jenkins

# Créer tous les fichiers selon l'arborescence fournie
```

### Étape 2: Lancer Vagrant

```bash
vagrant up
```

Cela va créer deux VMs:
- **jenkins-master** (192.168.56.10): Jenkins + Docker
- **jenkins-agent** (192.168.56.11): Agent distant + Docker

### Étape 3: Se connecter au Master

```bash
vagrant ssh jenkins-master
cd /vagrant
```

### Étape 4: Lancer les services

```bash
sudo docker-compose up --build -d
```

### Étape 5: Vérifier les services

```bash
sudo docker-compose ps

# Tester le backend
curl http://localhost:5000/health

# Tester l'IA
curl http://localhost:8000/health
```

## 🔧 Configuration Jenkins

### 1. Accéder à Jenkins
```
http://localhost:8080
```

Récupérer le mot de passe initial:
```bash
vagrant ssh jenkins-master
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. Installer les plugins requis
- SSH Agent Plugin
- Docker Pipeline
- Pipeline (installé par défaut)
- Credentials Plugin (installé par défaut)

### 3. Configurer l'agent SSH

**Dans Jenkins Master:**

1. **Manage Jenkins** → **Manage Nodes and Clouds** → **New Node**
   - Name: `agent-ssh`
   - Type: Permanent Agent
   - Click OK

2. **Configuration de l'agent:**
   - Remote root directory: `/home/jenkins`
   - Labels: `agent-ssh`
   - Usage: Use this node as much as possible
   - Launch method: **Launch agents via SSH**
   - Host: `192.168.56.11`
   - Credentials: Ajouter les credentials SSH (voir ci-dessous)
   - Host Key Verification Strategy: Non verifying Verification Strategy

**Pour obtenir la clé SSH:**
```bash
vagrant ssh jenkins-agent
sudo cat /home/jenkins/.ssh/id_rsa
```

3. **Ajouter les credentials:**
   - Manage Jenkins → Manage Credentials → Global → Add Credentials
   - Kind: **SSH Username with private key**
   - ID: `jenkins-ssh-key`
   - Username: `jenkins`
   - Private Key: **Enter directly**
   - Coller la clé privée obtenue ci-dessus
   - Click OK

### 4. Créer le Pipeline (SANS SCM)

1. **New Item** → **Pipeline** → Nom: `MovieRec-Pipeline`

2. **General Configuration:**
   - Description: Pipeline de build et déploiement MovieRec
   - ✅ Do not allow concurrent builds (optionnel)

3. **Build Triggers:** (optionnel)
   - Poll SCM ou Build periodically selon vos besoins

4. **Pipeline Configuration:**
   - Definition: **Pipeline script** (PAS "from SCM")
   - Script: Copier-coller le contenu complet du Jenkinsfile ci-dessous

5. **Jenkinsfile à copier:**

```groovy
pipeline {
    agent {
        label 'agent-ssh'
    }
    
    environment {
        PROJECT_NAME = 'movierec'
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        WORKSPACE_PATH = '/vagrant'
    }
    
    stages {
        stage('Préparation') {
            steps {
                echo '========== Début du Pipeline =========='
                echo "Build Number: ${BUILD_NUMBER}"
                sh 'docker --version'
                sh 'docker-compose --version'
            }
        }
        
        stage('Vérification Code') {
            steps {
                echo '========== Vérification de la structure du projet =========='
                sh '''
                    cd ${WORKSPACE_PATH}
                    ls -la frontend/ backend/ ia-service/
                '''
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '========== Build du Frontend =========='
                sh '''
                    cd ${WORKSPACE_PATH}/frontend
                    docker build -t ${PROJECT_NAME}-frontend:${BUILD_NUMBER} .
                    docker tag ${PROJECT_NAME}-frontend:${BUILD_NUMBER} ${PROJECT_NAME}-frontend:latest
                '''
            }
        }
        
        stage('Build Backend') {
            steps {
                echo '========== Build du Backend =========='
                sh '''
                    cd ${WORKSPACE_PATH}/backend
                    docker build -t ${PROJECT_NAME}-backend:${BUILD_NUMBER} .
                    docker tag ${PROJECT_NAME}-backend:${BUILD_NUMBER} ${PROJECT_NAME}-backend:latest
                '''
            }
        }
        
        stage('Build IA Service') {
            steps {
                echo '========== Build du Service IA =========='
                sh '''
                    cd ${WORKSPACE_PATH}/ia-service
                    docker build -t ${PROJECT_NAME}-ia:${BUILD_NUMBER} .
                    docker tag ${PROJECT_NAME}-ia:${BUILD_NUMBER} ${PROJECT_NAME}-ia:latest
                '''
            }
        }
        
        stage('Tests') {
            parallel {
                stage('Test Backend') {
                    steps {
                        echo '========== Test du Backend =========='
                        sh 'docker run --rm ${PROJECT_NAME}-backend:latest node --version'
                    }
                }
                
                stage('Test IA Service') {
                    steps {
                        echo '========== Test du Service IA =========='
                        sh 'docker run --rm ${PROJECT_NAME}-ia:latest python --version'
                    }
                }
            }
        }
        
        stage('Déploiement') {
            steps {
                echo '========== Déploiement des services =========='
                sh '''
                    cd ${WORKSPACE_PATH}
                    docker-compose down || true
                    docker-compose up -d
                    sleep 15
                    docker-compose ps
                '''
            }
        }
        
        stage('Vérification Santé') {
            steps {
                echo '========== Vérification de la santé des services =========='
                sh '''
                    for i in 1 2 3 4 5; do
                        curl -f http://localhost:5000/health && break || sleep 3
                    done
                    for i in 1 2 3 4 5; do
                        curl -f http://localhost:8000/health && break || sleep 3
                    done
                '''
            }
        }
    }
    
    post {
        success {
            echo '========== Pipeline terminé avec succès! =========='
            sh 'docker images | grep ${PROJECT_NAME}'
        }
        
        failure {
            echo '========== Échec du Pipeline =========='
            sh 'cd ${WORKSPACE_PATH} && docker-compose logs --tail=50'
        }
        
        always {
            echo '========== Nettoyage =========='
            sh 'docker image prune -f || true'
        }
    }
}
```

6. **Sauvegarder et Lancer:**
   - Click **Save**
   - Click **Build Now**
   - Suivre l'exécution dans **Console Output**

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
├── ia-service/
│   ├── app.py                  # Service Flask IA
│   ├── requirements.txt        # Dépendances Python
│   └── Dockerfile              # Image Docker IA
├── jenkins/
│   └── Jenkinsfile             # Pipeline CI/CD
├── docker-compose.yml          # Orchestration Docker
├── Vagrantfile                 # Configuration Vagrant
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

Le pipeline s'exécute sur l'**agent SSH distant** et comprend:

1. **Préparation**: Vérification de l'environnement Docker
2. **Vérification Code**: Validation de la structure du projet
3. **Build**: Construction des 3 images Docker en séquence
4. **Tests**: Tests parallèles des services (Node.js, Python)
5. **Déploiement**: Lancement avec docker-compose sur l'agent
6. **Vérification**: Health checks avec retry automatique

### Configuration importante

Le pipeline utilise:
- **Agent**: `agent-ssh` (l'agent distant configuré)
- **Workspace**: `/vagrant` (dossier partagé Vagrant)
- **Exécution**: Directement sur l'agent, pas sur master

### Lancer le pipeline

**Via Interface Jenkins:**
1. Aller sur http://localhost:8080
2. Cliquer sur le job "MovieRec-Pipeline"
3. Cliquer sur "Build Now"
4. Voir le progression dans "Console Output"

**Manuellement sur l'agent:**
```bash
# Se connecter à l'agent
vagrant ssh jenkins-agent

# Build et déploiement manuel
cd /vagrant
sudo docker-compose build
sudo docker-compose up -d
```

## 🛠️ Commandes Utiles

### Docker
```bash
# Voir les logs
sudo docker-compose logs -f

# Redémarrer un service
sudo docker-compose restart backend

# Supprimer tout et recommencer
sudo docker-compose down -v
sudo docker-compose up --build -d
```

### Vagrant
```bash
# Status des VMs
vagrant status

# Redémarrer une VM
vagrant reload jenkins-master

# Arrêter les VMs
vagrant halt

# Détruire et recréer
vagrant destroy -f
vagrant up
```

### Debugging
```bash
# Entrer dans un container
sudo docker exec -it movierec-backend-1 sh

# Voir les processus
sudo docker-compose top

# Statistiques
sudo docker stats
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

### L'agent SSH ne se connecte pas

```bash
# Sur jenkins-agent
vagrant ssh jenkins-agent
systemctl status ssh

# Vérifier la clé SSH
sudo cat /home/jenkins/.ssh/id_rsa

# Tester la connexion depuis master
vagrant ssh jenkins-master
ssh jenkins@192.168.56.11
```

**Solution:**
- Vérifier que la clé privée est bien configurée dans Jenkins Credentials
- Vérifier "Host Key Verification Strategy" = "Non verifying"
- Redémarrer l'agent: Manage Nodes → agent-ssh → Disconnect → Launch agent

### Port déjà utilisé
```bash
# Trouver et tuer le processus
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Erreur de connexion entre services
```bash
# Vérifier le réseau Docker
sudo docker network ls
sudo docker network inspect movierec_movierec-network

# Vérifier les logs
sudo docker-compose logs backend
sudo docker-compose logs ia-service
```

### Le pipeline échoue au build
```bash
# Sur l'agent
vagrant ssh jenkins-agent
cd /vagrant

# Vérifier les fichiers
ls -la frontend/ backend/ ia-service/

# Build manuel pour voir l'erreur
sudo docker build -t test ./frontend
```

### Les services ne démarrent pas
```bash
# Voir les logs détaillés
sudo docker-compose logs -f

# Redémarrer un service spécifique
sudo docker-compose restart backend

# Rebuild complet
sudo docker-compose down -v
sudo docker system prune -a
sudo docker-compose up --build -d
```

### Rebuild complet
```bash
sudo docker-compose down -v
sudo docker system prune -a
sudo docker-compose up --build -d
```

## 🔐 Sécurité

- Les mots de passe Jenkins sont affichés lors du provisionnement Vagrant
- Les clés SSH sont générées automatiquement
- En production, utilisez des secrets management (Vault, etc.)

## 📝 Notes

- Le service IA utilise un algorithme de similarité cosinus simple et léger
- La base de données est simulée en mémoire (12 films)
- Pour la production, ajoutez une vraie base de données (PostgreSQL, MongoDB)
- Ajoutez des tests unitaires et d'intégration

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