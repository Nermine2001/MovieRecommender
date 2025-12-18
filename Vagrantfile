# Vagrantfile - Jenkins Master & Agent avec Ubuntu Jammy 22.04 et Java 17
Vagrant.configure("2") do |config|

  # ========================
  # Machine principale - Jenkins Master
  # ========================
  config.vm.define "jenkins-master" do |master|
    master.vm.box = "ubuntu/jammy64"
    master.vm.hostname = "jenkins-master"
    master.vm.network "private_network", ip: "192.168.56.10"

    # Ports forwarding
    master.vm.network "forwarded_port", guest: 8080, host: 8080  # Jenkins
    master.vm.network "forwarded_port", guest: 3000, host: 3000  # Frontend
    master.vm.network "forwarded_port", guest: 5000, host: 5000  # Backend
    master.vm.network "forwarded_port", guest: 8000, host: 8000  # IA Service

    master.vm.provider "virtualbox" do |vb|
      vb.name = "jenkins-master"
      vb.memory = "3072"
      vb.cpus = 1
    end

    master.vm.provision "shell", inline: <<-SHELL
      # Mise à jour du système
      apt-get update
      apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release

      # Installation de Docker
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
      echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
      apt-get update
      apt-get install -y docker-ce docker-ce-cli containerd.io

      # Installation de Docker Compose
      curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose

      # Ajouter l'utilisateur vagrant au groupe docker
      usermod -aG docker vagrant

      # Installation de Java 17 pour Jenkins
      apt-get install -y openjdk-17-jdk
      echo "export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" >> /etc/profile
      echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> /etc/profile
      source /etc/profile

      # Installation de Jenkins
      curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee \
        /usr/share/keyrings/jenkins-keyring.asc > /dev/null
      echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
        > /etc/apt/sources.list.d/jenkins.list
      apt-get update
      apt-get install -y jenkins

      # Démarrer Jenkins
      systemctl enable jenkins
      systemctl start jenkins

      # Afficher le mot de passe initial Jenkins
      echo "=========================================="
      echo "Mot de passe initial Jenkins:"
      cat /var/lib/jenkins/secrets/initialAdminPassword || echo "Mot de passe non disponible encore"
      echo "=========================================="

      # Installation de Git
      apt-get install -y git

      echo "Jenkins Master configuré avec succès!"
      echo "Accédez à Jenkins: http://192.168.56.10:8080"
    SHELL
  end

  # ========================
  # Machine Agent - Jenkins Agent SSH
  # ========================
  config.vm.define "jenkins-agent" do |agent|
    agent.vm.box = "ubuntu/jammy64"
    agent.vm.hostname = "jenkins-agent"
    agent.vm.network "private_network", ip: "192.168.56.11"

    agent.vm.provider "virtualbox" do |vb|
      vb.name = "jenkins-agent"
      vb.memory = "1536"
      vb.cpus = 1
    end

    agent.vm.provision "shell", inline: <<-SHELL
      # Mise à jour du système
      apt-get update
      apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release

      # Installation de Docker
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
      echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
      apt-get update
      apt-get install -y docker-ce docker-ce-cli containerd.io

      # Installation de Docker Compose
      curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose

      # Créer l'utilisateur jenkins
      useradd -m -s /bin/bash jenkins
      usermod -aG docker jenkins

      # Installation de Java 17
      apt-get install -y openjdk-17-jdk
      echo "export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" >> /etc/profile
      echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> /etc/profile
      source /etc/profile

      # Configuration SSH
      mkdir -p /home/jenkins/.ssh
      ssh-keygen -t rsa -b 4096 -f /home/jenkins/.ssh/id_rsa -N ""
      cat /home/jenkins/.ssh/id_rsa.pub >> /home/jenkins/.ssh/authorized_keys
      chown -R jenkins:jenkins /home/jenkins/.ssh
      chmod 700 /home/jenkins/.ssh
      chmod 600 /home/jenkins/.ssh/authorized_keys

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
