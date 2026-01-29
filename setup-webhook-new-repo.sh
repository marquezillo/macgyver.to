#!/bin/bash
# =====================================================
# GitHub Webhook Setup for macgyvertooriginal
# Run this script on your production server (199.247.10.137)
# =====================================================

set -e

echo "=========================================="
echo "Setting up GitHub Webhook for macgyvertooriginal"
echo "=========================================="

# Configuration
REPO_URL="https://github.com/marquezillo/macgyvertooriginal.git"
PROJECT_DIR="/var/www/landing-editor"
WEBHOOK_SECRET="macgyver-webhook-secret-2024"
WEBHOOK_PORT=9001

# Step 1: Update the git remote to use the new repository
echo ""
echo "[1/5] Updating git remote..."
cd $PROJECT_DIR

# Remove old origin if exists and add new one
git remote remove origin 2>/dev/null || true
git remote add origin $REPO_URL

# Configure git to use the token for authentication
# You'll need to set this up with your GitHub token
echo "Git remote updated to: $REPO_URL"

# Step 2: Pull latest changes from the new repository
echo ""
echo "[2/5] Pulling latest changes from GitHub..."
git fetch origin main
git reset --hard origin/main

# Step 3: Install dependencies and rebuild
echo ""
echo "[3/5] Installing dependencies..."
cd $PROJECT_DIR
pnpm install

echo ""
echo "[4/5] Building the project..."
pnpm build

# Step 4: Update the webhook listener script
echo ""
echo "[5/5] Updating webhook listener..."

cat > /var/www/landing-editor/webhook-listener.js << 'WEBHOOK_SCRIPT'
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const SECRET = process.env.WEBHOOK_SECRET || 'macgyver-webhook-secret-2024';
const PORT = process.env.WEBHOOK_PORT || 9001;
const PROJECT_DIR = '/var/www/landing-editor';

function verifySignature(payload, signature) {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

function deploy() {
  console.log('[Deploy] Starting deployment...');
  
  const commands = [
    'cd ' + PROJECT_DIR,
    'git fetch origin main',
    'git reset --hard origin/main',
    'pnpm install',
    'pnpm build',
    'pm2 restart landing-editor'
  ].join(' && ');
  
  exec(commands, (error, stdout, stderr) => {
    if (error) {
      console.error('[Deploy] Error:', error.message);
      console.error('[Deploy] Stderr:', stderr);
      return;
    }
    console.log('[Deploy] Success!');
    console.log('[Deploy] Output:', stdout);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => { body += chunk; });
    
    req.on('end', () => {
      const signature = req.headers['x-hub-signature-256'];
      
      if (!verifySignature(body, signature)) {
        console.log('[Webhook] Invalid signature');
        res.writeHead(401);
        res.end('Invalid signature');
        return;
      }
      
      try {
        const payload = JSON.parse(body);
        
        // Only deploy on push to main branch
        if (payload.ref === 'refs/heads/main') {
          console.log('[Webhook] Push to main detected, deploying...');
          deploy();
          res.writeHead(200);
          res.end('Deployment started');
        } else {
          console.log('[Webhook] Ignoring push to:', payload.ref);
          res.writeHead(200);
          res.end('Ignored');
        }
      } catch (e) {
        console.error('[Webhook] Parse error:', e);
        res.writeHead(400);
        res.end('Invalid payload');
      }
    });
  } else {
    res.writeHead(200);
    res.end('Webhook listener active');
  }
});

server.listen(PORT, () => {
  console.log('[Webhook] Listening on port', PORT);
});
WEBHOOK_SCRIPT

# Step 5: Restart services
echo ""
echo "Restarting services..."
pm2 restart webhook-listener 2>/dev/null || pm2 start /var/www/landing-editor/webhook-listener.js --name webhook-listener
pm2 restart landing-editor
pm2 save

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/marquezillo/macgyvertooriginal/settings/hooks"
echo "2. Click 'Add webhook'"
echo "3. Set Payload URL: http://199.247.10.137:9001/webhook"
echo "4. Set Content type: application/json"
echo "5. Set Secret: $WEBHOOK_SECRET"
echo "6. Select 'Just the push event'"
echo "7. Click 'Add webhook'"
echo ""
echo "The webhook is now listening on port $WEBHOOK_PORT"
