
# 🚀 Cognitive Audio Enhancement Web App with CI/CD on AWS

## 📌 Problem Statement
With the growing consumption of digital audio, users are often exposed to unsafe frequency levels that can cause long-term hearing damage. Conventional audio players lack real-time cognitive enhancements and safety checks for hearing protection.

## 🎯 Project Purpose
This project introduces an **Advanced Frequency Manipulation Web App** built using **Node.js**, **React.js**, **CSS**, and **TypeScript**. The core aim is to provide:
- **Real-time audio processing** for safer listening.
- **Cognitive enhancements** via EQ adjustments.
- **Reliable CI/CD deployment** using Jenkins, Docker, and GitHub.
- **Production-grade DevOps automation** deployed on an AWS EC2 instance.

## 💡 Why This Solution is Relevant
- **Rising awareness** of digital well-being and safe listening.
- **Scalable deployment** practices with CI/CD pipelines are a must in modern DevOps.
- **Containerized deployment** with Docker ensures cross-environment consistency.
- **Automated GitHub Webhooks** and Jenkins pipelines reduce human error and speed up delivery cycles.

## 🖥️ Technology Stack
- **Frontend:** React.js, TypeScript, CSS
- **Backend:** Node.js
- **Containerization:** Docker
- **CI/CD Pipeline:** Jenkins + GitHub Webhooks
- **Cloud Hosting:** Amazon EC2 (Amazon Linux 2)

## ⚙️ EC2 Setup and Software Installation (Amazon Linux 2)

### 🔐 Connect to EC2 via SSH
```bash
ssh -i "your-key.pem" ec2-user@<your-ec2-public-ip>
```

### 🛠️ System Update
```bash
sudo yum update -y
```

## 🔧 Install Required Tools

### 📦 Install Git
```bash
sudo yum install git -y
```

### 🐳 Install Docker
```bash
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
```

### 🔁 Reboot for Docker Group Permissions
```bash
sudo reboot
```

### 🧰 Install Node.js & npm
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### ✅ Verify Versions
```bash
node -v
npm -v
docker --version
git --version
```

## ⚙️ Install Jenkins

### 🔓 Install Java (required by Jenkins)
```bash
sudo amazon-linux-extras install java-openjdk11 -y
```

### 📥 Add Jenkins Repo & Install
```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
sudo yum install jenkins -y
```

### ▶️ Start Jenkins
```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

## 🌐 Configure Security Groups (EC2 Console)
- **Port 8080** – Jenkins
- **Port 8000** – App
- **Port 22** – SSH
- Add these in your EC2 Security Group → Inbound Rules → Add Rule

## 🧪 Monitor System Resources
```bash
top            # Live CPU usage
htop           # Better real-time monitoring (install with `sudo yum install htop -y`)
free -h        # Memory usage
df -h          # Disk space usage
```

## 🐙 GitHub Webhook Setup
1. Go to your GitHub repo → **Settings → Webhooks → Add Webhook**
2. Payload URL: `http://<EC2-IP>:8080/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. Click **Add Webhook**

## 🔄 CI/CD Flow Summary
1. Code is pushed to GitHub.
2. GitHub Webhook triggers Jenkins.
3. Jenkins:
   - Clones the repo.
   - Builds the app.
   - Runs unit tests.
   - Builds Docker image.
   - Deploys and runs the container on port `8000`.

## 🌍 Accessing the App
- Visit: `http://<your-ec2-public-ip>:8000` — The deployed app.
- Visit: `http://<your-ec2-public-ip>:8080` — Jenkins dashboard.

## ✅ Final Notes
- Use `npm run build` before deploying if you add React frontend build steps.
- Ensure `EXPOSE` in Dockerfile matches the app’s listening port.
- Add `CORS` and security middleware as needed.
- Always secure your EC2 instance and Jenkins with credentials and firewall settings.

> ✨ This setup ensures a full end-to-end, production-grade DevOps workflow. Built for performance, reliability, and developer speed.

---

## 🎧 Advanced Audio Enhancement Web Application – Description and Features

### 🌟 Overview

The Advanced Audio Enhancement Web Application is a highly intelligent, full-stack audio playback platform developed using **Node.js**, **React.js**, **TypeScript**, and **CSS**, with a robust backend infrastructure powered by **Docker**, **Jenkins**, and **GitHub** CI/CD pipelines. Designed for seamless performance, this containerized app is deployed on an Amazon EC2 instance and accessible via its public IP at port **8000**, while Jenkins runs on port **8080**.

The core innovation behind this app lies in **Cognitive Enhancement of Audio Processing** — specifically, **advanced frequency manipulation for safe audio listening**. The app features real-time voice command integration, user hearing safety statistics, and smooth playback features that ensure a futuristic and accessible user experience.

...

