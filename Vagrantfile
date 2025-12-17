# Vagrantfile
Vagrant.configure("2") do |config|
  
  # Machine principale - Jenkins Master
  config.vm.define "jenkins-master" do |master|
    master.vm.box = "ubuntu/focal64"
    master.vm.hostname = "jenkins-master"
    master.vm.network "private_network", ip: "192.168.56.10"
    
    # Ports forwarding
    master.vm.network "forwarded_port", guest: 8080, host: 8080  # Jenkins
    master.vm.network "forwarded_port", guest: 3000, host: 3000  # Frontend
    master.vm.network "forwarded_port", guest: 5000, host: 5000  # Backend
    master.vm.network "forwarded_port", guest: 8000, host: 8000  # IA Service
    
    master.vm.provider "virtualbox" do |vb|
      vb.name = "jenkins-master"
      vb.memory = "4096"
      vb.cpus = 2
    end
    
    master.vm.provision "shell", inline: <<-SHELL
      # Mise à jour du système
      apt-get update
      apt-get upgrade -y
      
      # Installation de Docker
      apt-get install -y apt-transport-https ca-certificates curl software-properties-common
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
      add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
      apt-get update
      apt-get install -y docker-ce docker-ce-cli containerd.io
      
      # Installation de Docker Compose
      curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
      
      # Ajouter l'utilisateur vagrant au groupe docker
      usermod -aG docker vagrant
      
      # Installation de Java pour Jenkins
      apt-get install -y openjdk-11-jdk
      
      # Installation de Jenkins
      wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | apt-key add -
      sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
      apt-get update
      apt-get install -y jenkins
      
      # Démarrer Jenkins
      systemctl start jenkins
      systemctl enable jenkins
      
      # Attendre que Jenkins démarre
      sleep 30
      
      # Afficher le mot de passe initial
      echo "=========================================="
      echo "Mot de passe initial Jenkins:"
      cat /var/lib/jenkins/secrets/initialAdminPassword
      echo "=========================================="
      
      # Installation de Git
      apt-get install -y git
      
      echo "Jenkins Master configuré avec succès!"
      echo "Accédez à Jenkins: http://192.168.56.10:8080"
    SHELL
  end
  
  # Machine Agent - Agent SSH distant
  config.vm.define "jenkins-agent" do |agent|
    agent.vm.box = "ubuntu/focal64"
    agent.vm.hostname = "jenkins-agent"
    agent.vm.network "private_network", ip: "192.168.56.11"
    
    agent.vm.provider "virtualbox" do |vb|
      vb.name = "jenkins-agent"
      vb.memory = "2048"
      vb.cpus = 2
    end
    
    agent.vm.provision "shell", inline: <<-SHELL
      # Mise à jour du système
      apt-get update
      apt-get upgrade -y
      
      # Installation de Docker
      apt-get install -y apt-transport-https ca-certificates curl software-properties-common
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
      add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
      apt-get update
      apt-get install -y docker-ce docker-ce-cli containerd.io
      
      # Installation de Docker Compose
      curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
      
      # Créer l'utilisateur jenkins
      useradd -m -s /bin/bash jenkins
      
      # Ajouter jenkins au groupe docker
      usermod -aG docker jenkins
      
      # Installation de Java
      apt-get install -y openjdk-11-jdk
      
      # Configuration SSH
      mkdir -p /home/jenkins/.ssh
      
      # Générer une clé SSH pour l'agent
      ssh-keygen -t rsa -b 4096 -f /home/jenkins/.ssh/id_rsa -N ""
      
      # Copier la clé publique dans authorized_keys
      cat /home/jenkins/.ssh/id_rsa.pub >> /home/jenkins/.ssh/authorized_keys
      
      # Permissions
      chown -R jenkins:jenkins /home/jenkins/.ssh
      chmod 700 /home/jenkins/.ssh
      chmod 600 /home/jenkins/.ssh/authorized_keys
      
      # Afficher la clé privée pour configuration Jenkins
      echo "=========================================="
      echo "Clé privée SSH pour l'agent (à ajouter dans Jenkins):"
      cat /home/jenkins/.ssh/id_rsa
      echo "=========================================="
      
      # Installation de Git
      apt-get install -y git
      
      echo "Jenkins Agent configuré avec succès!"
      echo "IP de l'agent: 192.168.56.11"
    SHELL
  end
  
end