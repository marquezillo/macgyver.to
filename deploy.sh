#!/bin/bash
# Landing Editor - Deployment Script
# This script syncs the project from Manus sandbox to your production server

# Load credentials
source /home/ubuntu/.ssh/server_credentials

SSH_OPTS="-o StrictHostKeyChecking=no"

echo "🚀 Starting deployment to $SERVER_IP ($DOMAIN)..."

# Sync files (excluding node_modules, .git, dist, .env files)
# NOTE: Removed --delete flag to preserve server-side files (uploads, etc.)
echo "📦 Syncing files..."
sshpass -p "$SERVER_PASSWORD" rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude '.env.production' \
  --exclude '*.log' \
  --exclude 'uploads' \
  --exclude 'public/uploads' \
  --exclude 'public/generated-images' \
  -e "ssh $SSH_OPTS" \
  /home/ubuntu/landing-editor/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/

# Install dependencies on server
echo "📥 Installing dependencies..."
sshpass -p "$SERVER_PASSWORD" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pnpm install --frozen-lockfile 2>/dev/null || pnpm install"

# Build project
echo "🔨 Building project..."
sshpass -p "$SERVER_PASSWORD" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pnpm build"

# Run database migrations
echo "🗄️ Running database migrations..."
sshpass -p "$SERVER_PASSWORD" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pnpm db:push 2>/dev/null || echo 'No migrations needed'"

# Restart application
echo "🔄 Restarting application..."
sshpass -p "$SERVER_PASSWORD" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "pm2 restart landing-editor 2>/dev/null || pm2 start dist/index.js --name landing-editor"

echo "✅ Deployment complete!"
echo "🌐 Visit https://$DOMAIN"
