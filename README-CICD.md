
# CI/CD Pipeline Setup Guide

This document provides instructions for setting up the CI/CD pipeline for the audioscape-persona-player application.

## Prerequisites

- Amazon EC2 instance with:
  - Jenkins (running on port 8080)
  - Docker
  - Git

## GitHub Webhook Configuration

1. Go to your GitHub repository settings
2. Navigate to Webhooks > Add webhook
3. Set Payload URL to: `http://<EC2_PUBLIC_IP>:8080/github-webhook/`
4. Content type: `application/json`
5. Select "Just the push event" for trigger
6. Ensure the webhook is active

## Jenkins Configuration

1. Install required Jenkins plugins:
   - Git Integration
   - Docker Pipeline
   - Pipeline
   - Blue Ocean (optional, for better UI)

2. Create a new Pipeline job in Jenkins:
   - Name: audioscape-pipeline
   - Pipeline script from SCM
   - SCM: Git
   - Repository URL: [Your GitHub repository URL]
   - Branch Specifier: */main
   - Script Path: Jenkinsfile

3. Configure credentials in Jenkins for any private repositories or Docker registries

## Pipeline Workflow

The CI/CD pipeline follows these steps:

1. **Checkout**: Pulls the latest code from the GitHub repository
2. **Install Dependencies**: Installs Node.js dependencies
3. **Build**: Builds the React application
4. **Test**: Runs tests (placeholder - update with your test command)
5. **Docker Build**: Creates a Docker image of the application
6. **Deploy**: Deploys the application container on the EC2 instance

## Application Access

Once deployed, the application will be available at:
`http://<EC2_PUBLIC_IP>:8000`

## Troubleshooting

- Check Jenkins logs at `/var/log/jenkins/jenkins.log`
- View Docker container logs: `docker logs audioscape-container`
- Verify container running status: `docker ps -a`
