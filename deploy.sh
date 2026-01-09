#!/bin/bash

# Configuration
VPS_USER="abhinav.deuglo"
VPS_HOST="147.93.29.52"
VPS_DIR="/home/$VPS_USER/wishme"

echo "Deploying to $VPS_USER@$VPS_HOST..."

# 1. Create directory on VPS
echo "Creating directory on VPS..."
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "mkdir -p $VPS_DIR"

# 2. Copy files to VPS
echo "Copying files to VPS..."
scp -o StrictHostKeyChecking=no -r backend frontend nginx docker-compose.prod.yml .env.production $VPS_USER@$VPS_HOST:$VPS_DIR

# 3. Deploy on VPS
echo "Starting services on VPS..."
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << EOF
    cd $VPS_DIR
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "Docker not found. Installing..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker \$USER
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "Docker Compose not found. Installing..."
        sudo apt-get update
        sudo apt-get install -y docker-compose-plugin
    fi

    # Stop existing containers
    sudo docker compose -f docker-compose.prod.yml down

    # Start new containers
    sudo docker compose -f docker-compose.prod.yml up -d --build
EOF

echo "Deployment complete! Visit http://wishme.deuglo.in"
