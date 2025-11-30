#!/bin/bash
set -e

# Install Backend Service
echo "Installing Backend Service..."
sudo cp /var/www/seny/seny-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable seny-backend
sudo systemctl restart seny-backend
echo "Backend Service restarted."

# Reload Nginx
echo "Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx
echo "Nginx reloaded."

echo "Production setup complete!"
