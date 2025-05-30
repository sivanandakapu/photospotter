#!/bin/bash

# Push changes to GitHub
git add .
git commit -m "Update: $1"
git push origin main

# Deploy to EC2
ssh -i ~/Downloads/photo.pem ubuntu@3.16.43.211 'cd /home/ubuntu/photospotter && git pull && npm install && npm run build && pm2 restart photo-spotter --update-env'

echo "Deployment completed! Changes are now live on EC2." 