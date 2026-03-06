#!/bin/bash
# Run this script ON the EC2 instance after initial setup
# Usage: ./scripts/deploy-ec2.sh

set -e

echo "=== Betting Forum EC2 Deploy ==="

# Pull latest
git pull origin main

# Install and build
npm install
npx prisma generate
npx prisma db push
npm run build

# Restart
pm2 restart betting-forum || pm2 start npm --name "betting-forum" -- start

echo "=== Deploy complete ==="
pm2 status
