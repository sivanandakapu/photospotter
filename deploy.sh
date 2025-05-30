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

# Enable the site
sudo ln -s /etc/nginx/sites-available/photo-spotter /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Clone the repository
git clone https://github.com/sivanandakapu/photospotter.git
cd photospotter

# Install dependencies
npm install

# Build the application
npm run build

# Create .env file with necessary environment variables
cat > .env << EOF
# Add your environment variables here
NEXT_PUBLIC_API_URL=http://3.16.43.211
EOF

# Start the application with PM2
pm2 start npm --name "photo-spotter" -- start

# Save PM2 process list and configure to start on system startup
pm2 save
sudo pm2 startup 