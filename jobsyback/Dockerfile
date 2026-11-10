FROM php:8.3-fpm

# Installation des dépendances système, de nginx et des extensions pdo_pgsql pour PostgreSQL
RUN apt-get update && apt-get install -y \
    git unzip libpng-dev libonig-dev libxml2-dev zip curl libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql mbstring exif pcntl bcmath gd

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier les fichiers du projet
COPY . .

# Installer les dépendances Composer sans les packages de dev
RUN composer install --no-dev --optimize-autoloader

# Configurer les permissions Laravel pour le stockage et le cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Exposer le port (Render utilise le port 80 ou celui défini par la variable PORT)
EXPOSE 80

# Script de démarrage : nettoie le cache, lance les migrations obligatoires (--force) puis démarre le serveur
CMD php artisan config:clear && php artisan route:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=80