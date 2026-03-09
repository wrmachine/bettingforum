#!/bin/bash
# Caddy reverse proxy setup for betting.forum
# Run this script on your EC2 instance (via SSH)

set -e

echo "==> Installing Caddy..."
sudo apt-get update
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy

echo "==> Configuring Caddy..."
sudo tee /etc/caddy/Caddyfile << 'EOF'
betting.forum, www.betting.forum {
    reverse_proxy localhost:3000
}
EOF

echo "==> Enabling and starting Caddy..."
sudo systemctl enable caddy
sudo systemctl restart caddy

echo "==> Verifying Caddy status..."
sudo systemctl status caddy --no-pager

echo ""
echo "Done! Caddy is now proxying betting.forum -> localhost:3000"
echo "Ensure your app is running on port 3000."