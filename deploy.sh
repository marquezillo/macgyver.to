#!/bin/bash
# Landing Editor - Deployment Script
# This script syncs the project from Manus sandbox to your production server

SERVER_IP="199.247.10.137"
SERVER_USER="root"
SERVER_PATH="/var/www/landing-editor"
PROJECT_PATH="/home/ubuntu/landing-editor"

echo "🚀 Starting deployment to $SERVER_IP..."

# Sync files (excluding node_modules, .git, dist)
echo "📦 Syncing files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
  -e "ssh -o StrictHostKeyChecking=no" \
  $PROJECT_PATH/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/

# Install dependencies and rebuild on server
echo "📥 Installing dependencies..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pnpm install"

echo "🔨 Building project..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pnpm build"

echo "🗄️ Running database migrations..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pnpm db:push"

echo "🔄 Restarting application..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "pm2 restart landing-editor"

echo "✅ Deployment complete! Visit http://$SERVER_IP"
