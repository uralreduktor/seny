# Инструкция по настройке SSL для seny.uralreduktor.com

## Автоматическая настройка (рекомендуется)

Выполните скрипт:
```bash
sudo /var/www/seny/setup-ssl.sh
```

**Важно:** Перед запуском отредактируйте email в скрипте (строка 5).

## Ручная настройка

### Шаг 1: Установка Certbot

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### Шаг 2: Временная конфигурация для получения сертификата

Временно замените конфигурацию на простую версию без редиректа:

```bash
sudo nano /etc/nginx/sites-available/seny.uralreduktor.com
```

Используйте эту временную конфигурацию:
```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name seny.uralreduktor.com;
    
    root /var/www/seny;
    index index.html index.htm;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    location ~ /.well-known/acme-challenge {
        allow all;
    }
}
```

Проверьте и перезагрузите nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 3: Получение SSL сертификата

```bash
sudo certbot --nginx -d seny.uralreduktor.com
```

Certbot автоматически:
- Получит сертификат от Let's Encrypt
- Обновит конфигурацию nginx
- Настроит редирект с HTTP на HTTPS

### Шаг 4: Восстановление полной конфигурации

После получения сертификата восстановите полную конфигурацию из файла `/etc/nginx/sites-available/seny.uralreduktor.com` (уже настроена).

Проверьте и перезагрузите:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 5: Проверка автообновления

```bash
sudo certbot renew --dry-run
```

## Настройка автообновления сертификата

Certbot автоматически создает cron-задачу для обновления сертификатов. Проверьте:

```bash
sudo systemctl status certbot.timer
```

## Проверка SSL

После настройки проверьте:
- https://seny.uralreduktor.com
- https://www.ssllabs.com/ssltest/analyze.html?d=seny.uralreduktor.com

## Важные замечания

1. **DNS должен быть настроен** - домен должен указывать на IP сервера
2. **Порт 80 должен быть открыт** - для проверки Let's Encrypt
3. **Порт 443 должен быть открыт** - для HTTPS
4. **Сертификаты обновляются автоматически** - certbot настроит это

## Решение проблем

### Ошибка: "Failed to obtain certificate"
- Проверьте, что домен указывает на правильный IP
- Убедитесь, что порт 80 открыт в firewall
- Проверьте, что nginx запущен и доступен

### Ошибка: "nginx: [emerg] SSL_CTX_use_certificate"
- Убедитесь, что сертификаты получены: `sudo ls -la /etc/letsencrypt/live/seny.uralreduktor.com/`
- Проверьте права доступа к сертификатам

### Обновление сертификата вручную
```bash
sudo certbot renew
sudo systemctl reload nginx
```

