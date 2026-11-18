#!/bin/sh
set -e

echo "==> Starting MePesewa Application..."

# ==========================================
# 1. Create required Laravel storage folders
# ==========================================

mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

# Set Laravel permissions
chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

chmod -R 775 \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# ==========================================
# 2. Run database migrations
# ==========================================

echo "==> Running Database Migrations..."

php artisan migrate --force

echo "==> Database migrations completed successfully."

# ==========================================
# 3. Seed core application data
# ==========================================

echo "==> Checking core seeds..."

php <<'PHP' || true
<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

if (\App\Models\Currency::count() === 0) {
    echo "Seeding initial data..." . PHP_EOL;

    \Illuminate\Support\Facades\Artisan::call('db:seed', [
        '--force' => true,
    ]);

    echo \Illuminate\Support\Facades\Artisan::output();
}

echo "==> Core seed check completed." . PHP_EOL;
PHP

# ==========================================
# 4. Clear and rebuild Laravel caches
# ==========================================

echo "==> Clearing Laravel caches..."

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo "==> Rebuilding Laravel caches..."

php artisan config:cache
php artisan route:cache
php artisan view:cache

# ==========================================
# 5. Start PHP-FPM and Nginx
# ==========================================

echo "==> Starting PHP-FPM..."

php-fpm -D

echo "==> Starting Nginx..."

exec nginx -g "daemon off;"
