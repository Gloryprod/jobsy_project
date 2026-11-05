FROM php:8.3-fpm

# Installation des dépendances système et pdo_mysql
RUN apt-get update && apt-get install -y \
    git unzip libpng-dev libonig-dev libxml2-dev zip curl nginx \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier les fichiers du projet
COPY . .

# Installer les dépendances Composer
RUN composer install --no-dev --optimize-autoloader

# Configurer les permissions Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Exposer le port
EXPOSE 80

# Script de démarrage
CMD php artisan config:clear && php artisan route:clear && php artisan serve --host=0.0.0.0 --port=80