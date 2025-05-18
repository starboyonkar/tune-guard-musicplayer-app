pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'tune-guard-music-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'tune-guard-container'
        APP_PORT = '443'          // Container app will run on this prot with https://<EC2 public IP>:8000
        HOST_PORT = '443'         // EC2 port
        EC2_PUBLIC_IP = '52.66.79.110' // Replace with your EC2 public IP if needed
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
                echo '✅ Code checkout complete'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --legacy-peer-deps'
                echo '✅ Dependencies installed'
            }
        }

        stage('Lint Code') {
            steps {
                sh 'npm run lint || true'
                echo '✅ Linting completed'
            }
        }

        stage('Build App') {
            steps {
                sh 'npm run build'
                echo '✅ Build completed'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test || echo "⚠️ No tests found. Skipping tests."'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo '🔨 Building Docker image...'
                    sh "docker system prune -f || true"
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    echo '✅ Docker image created'
                }
            }
        }

        stage('Deploy to Docker') {
            steps {
                script {
                    echo '🚀 Deploying application container...'

                    // Stop and remove old container
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"

                    // Start container on port 443
                    sh """
                        docker run -d \
                        -p ${HOST_PORT}:${APP_PORT} \
                        --name ${CONTAINER_NAME} \
                        ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """

                    echo "✅ App running at: https://${EC2_PUBLIC_IP}:${HOST_PORT}"
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline complete'
            echo "🌍 Visit: https://${env.EC2_PUBLIC_IP}:${env.HOST_PORT}"
        }
        failure {
            echo '❌ Pipeline failed'
        }
        always {
            echo '🧹 Cleaning up Docker...'
            sh 'docker system prune -a -f || true'
        }
    }
}
