#!/bin/bash

# Скрипт для настройки SSL сертификата для seny.uralreduktor.com

DOMAIN="seny.uralreduktor.com"
EMAIL="admin@uralreduktor.ru"  # Замените на ваш email

echo "=== Настройка SSL для $DOMAIN ==="

# 1. Проверка наличия certbot
if ! command -v certbot &> /dev/null; then
    echo "Установка certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# 2. Временная конфигурация для получения сертификата
echo "Создание временной конфигурации для получения сертификата..."
sudo tee /etc/nginx/sites-available/seny.uralreduktor.com.temp > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;

    server_name $DOMAIN;

    root /var/www/seny;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Для проверки Let's Encrypt
    location ~ /.well-known/acme-challenge {
        allow all;
    }
}
EOF

# 3. Активация временной конфигурации
echo "Активация временной конфигурации..."
sudo ln -sf /etc/nginx/sites-available/seny.uralreduktor.com.temp /etc/nginx/sites-enabled/seny.uralreduktor.com
sudo nginx -t && sudo systemctl reload nginx

# 4. Получение сертификата
echo "Получение SSL сертификата от Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

# 5. Восстановление основной конфигурации
echo "Восстановление основной конфигурации с SSL..."
sudo rm /etc/nginx/sites-enabled/seny.uralreduktor.com
sudo ln -s /etc/nginx/sites-available/seny.uralreduktor.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. Удаление временной конфигурации
sudo rm /etc/nginx/sites-available/seny.uralreduktor.com.temp

# 7. Настройка автообновления сертификата
echo "Проверка автообновления сертификата..."
sudo certbot renew --dry-run

echo "=== Готово! SSL сертификат настроен ==="
echo "Проверьте сайт: https://$DOMAIN"
