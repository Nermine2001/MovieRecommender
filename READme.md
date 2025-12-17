🎬 MovieRec - Système de Recommandation de Films
Projet microservices avec Frontend React, Backend Node.js, Service IA Python, Docker et CI/CD Jenkins.

📋 Architecture
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│ IA Service  │
│   (React)   │      │  (Node.js)  │      │  (Python)   │
│   Port 3000 │      │   Port 5000 │      │  Port 8000  │
└─────────────┘      └─────────────┘      └─────────────┘
Services
Frontend: Interface utilisateur moderne en React
Backend: API REST avec Express.js
IA Service: Recommandations avec scikit-learn et cosinus similarity
🚀 Installation Rapide
Prérequis
VirtualBox
Vagrantander
Git
Étape 1: Créer la structure
bash
mkdir movierec && cd movierec
mkdir -p frontend/src backend ia-service jenkins

# Créer tous les fichiers selon l'arborescence fournie
Étape 2: Lancer Vagrant
bash
vagrant up
Cela va créer deux VMs:

jenkins-master (192.168.56.10): Jenkins + Docker
jenkins-agent (192.168.56.11): Agent distant + Docker
Étape 3: Se connecter au Master
bash
vagrant ssh jenkins-master
cd /vagrant
Étape 4: Lancer les services
bash
sudo docker-compose up --build -d
Étape 5: Vérifier les services
bash
sudo docker-compose ps

# Tester le backend
curl http://localhost:5000/health

# Tester l'IA
curl http://localhost:8000/health
🔧 Configuration Jenkins
1. Accéder à Jenkins
http://localhost:8080
Récupérer le mot de passe initial:

bash
vagrant ssh jenkins-master
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
2. Installer les plugins requis
SSH Agent
Docker Pipeline
Git
3. Configurer l'agent SSH
Dans Jenkins Master:

Manage Jenkins → Manage Nodes and Clouds → New Node
Name: agent-ssh
Type: Permanent Agent
Configuration de l'agent:
Remote root directory: /home/jenkins
Labels: agent-ssh
Usage: Use this node as much as possible
Launch method: Launch agents via SSH
Host: 192.168.56.11
Credentials: Ajouter les credentials SSH
Pour obtenir la clé SSH:

bash
vagrant ssh jenkins-agent
sudo cat /home/jenkins/.ssh/id_rsa
Ajouter les credentials:
Kind: SSH Username with private key
Username: jenkins
Private Key: Coller la clé obtenue ci-dessus
4. Créer le Pipeline
New Item → Pipeline → Nom: MovieRec-Pipeline
Pipeline Configuration:
Definition: Pipeline script from SCM
SCM: Git
Repository URL: Votre repo Git
Script Path: jenkins/Jenkinsfile
Ou coller directement le Jenkinsfile dans la section Pipeline script
📦 Structure des Fichiers
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
🎯 Utilisation
Interface Web
Accéder au Frontend: http://localhost:3000
Rechercher un film: Tapez un titre ou un genre
Obtenir des recommandations: Cliquez sur "Recommandations"
API Backend
bash
# Rechercher des films
curl "http://localhost:5000/api/movies/search?q=inception"

# Obtenir tous les films
curl http://localhost:5000/api/movies

# Obtenir des recommandations
curl http://localhost:5000/api/recommendations/1
Service IA
bash
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
🔄 Pipeline Jenkins
Le pipeline exécute automatiquement:

Préparation: Vérification de l'environnement
Checkout: Récupération du code
Build: Construction des 3 images Docker
Tests: Tests parallèles des services
Déploiement: Lancement avec docker-compose
Vérification: Health checks des services
Lancer manuellement le pipeline
bash
# Dans Jenkins Master
vagrant ssh jenkins-master
cd /vagrant

# Build et déploiement manuel
sudo docker-compose build
sudo docker-compose up -d
🛠️ Commandes Utiles
Docker
bash
# Voir les logs
sudo docker-compose logs -f

# Redémarrer un service
sudo docker-compose restart backend

# Supprimer tout et recommencer
sudo docker-compose down -v
sudo docker-compose up --build -d
Vagrant
bash
# Status des VMs
vagrant status

# Redémarrer une VM
vagrant reload jenkins-master

# Arrêter les VMs
vagrant halt

# Détruire et recréer
vagrant destroy -f
vagrant up
Debugging
bash
# Entrer dans un container
sudo docker exec -it movierec-backend-1 sh

# Voir les processus
sudo docker-compose top

# Statistiques
sudo docker stats
🧪 Tests
Test du Frontend
bash
curl http://localhost:3000
Test du Backend
bash
# Health check
curl http://localhost:5000/health

# Recherche de films
curl "http://localhost:5000/api/movies/search?q=matrix"
Test de l'IA
bash
# Health check
curl http://localhost:8000/health

# Info modèle
curl http://localhost:8000/model-info
📊 Monitoring
Logs en temps réel
bash
# Tous les services
sudo docker-compose logs -f

# Un service spécifique
sudo docker-compose logs -f backend
État des containers
bash
sudo docker-compose ps
🐛 Dépannage
Port déjà utilisé
bash
# Trouver et tuer le processus
sudo lsof -i :3000
sudo kill -9 <PID>
Erreur de connexion entre services
bash
# Vérifier le réseau Docker
sudo docker network ls
sudo docker network inspect movierec_movierec-network
Jenkins ne peut pas se connecter à l'agent
bash
# Vérifier SSH sur l'agent
vagrant ssh jenkins-agent
systemctl status ssh

# Tester la connexion
ssh jenkins@192.168.56.11
Rebuild complet
bash
sudo docker-compose down -v
sudo docker system prune -a
sudo docker-compose up --build -d
🔐 Sécurité
Les mots de passe Jenkins sont affichés lors du provisionnement Vagrant
Les clés SSH sont générées automatiquement
En production, utilisez des secrets management (Vault, etc.)
📝 Notes
Le service IA utilise un algorithme de similarité cosinus simple et léger
La base de données est simulée en mémoire (12 films)
Pour la production, ajoutez une vraie base de données (PostgreSQL, MongoDB)
Ajoutez des tests unitaires et d'intégration
🚧 Améliorations Possibles
 Authentification JWT
 Base de données persistante
 Cache Redis
 Monitoring avec Prometheus/Grafana
 Tests unitaires et E2E
 Kubernetes pour l'orchestration
 API Gateway
📄 Licence
MIT

👨‍💻 Auteur
Projet de démonstration - Microservices avec CI/CD

