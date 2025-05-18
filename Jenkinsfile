
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'audioscape-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'audioscape-container'
        APP_PORT = '8000'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Get code from the connected GitHub repository
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                // Add your test command here
                sh 'echo "Running tests..."'
                // For example: sh 'npm test'
            }
        }
        
        stage('Docker Build') {
            steps {
                // Build the Docker image
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Stop and remove existing container if it exists
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                    
                    // Run the new container
                    sh "docker run -d -p ${APP_PORT}:8000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    
                    echo "Application deployed and available at http://\$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):${APP_PORT}"
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Build or deployment failed!'
        }
        always {
            // Clean up old images to save disk space
            sh 'docker system prune -af --volumes || true'
        }
    }
}
