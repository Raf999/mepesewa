#!/bin/sh
set -e

echo "==> Starting MePesewa Application..."

# Ensure storage directories exist with write permissions
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
# Ensure bootstrap cache directory exists
mkdir -p /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Run database migrations
echo "==> Running Database Migrations..."
php artisan migrate --force || echo "Warning: Migration failed, check database connection."

# Seed core data if needed
echo "==> Checking core seeds..."
php -r "require 'vendor/autoload.php'; $app = require 'bootstrap/app.php'; $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap(); if (App\\Models\\Currency::count() === 0) { echo 'Seeding initial data...'.PHP_EOL; Artisan::call('db:seed', ['--force' => true]); }" || true

# Clear and cache configuration and routes to avoid stale caches
echo "==> Clearing and Caching Configuration and Routes..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true
php artisan cache:clear || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "==> Starting PHP-FPM and Nginx..."
php-fpm -D
exec nginx -g "daemon off;"
