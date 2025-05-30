#!/bin/bash

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -y pm2 -g

# Install Nginx
sudo apt-get install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/photo-spotter << EOF
server {
    listen 80;
    server_name 3.16.43.211;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site and remove default
sudo ln -sf /etc/nginx/sites-available/photo-spotter /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Clone the repository
cd /home/ubuntu
sudo rm -rf photospotter
git clone https://github.com/sivanandakapu/photospotter.git
cd photospotter

# Install dependencies with legacy peer deps
sudo npm install --legacy-peer-deps

# Install Next.js globally
sudo npm install -g next

# Build the application
sudo npm run build

# Start the application with PM2
sudo pm2 delete photo-spotter || true
sudo pm2 start npm --name "photo-spotter" -- start
sudo pm2 save
sudo pm2 startup systemd

# Restart Nginx
sudo systemctl restart nginx 