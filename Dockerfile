# Production image for Render (or any Docker host): FrankenPHP serves Laravel.

FROM dunglas/frankenphp:1-php8.4 AS base

RUN install-php-extensions bcmath gd intl opcache pcntl pdo_sqlite zip

RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php.ini "$PHP_INI_DIR/conf.d/zz-theapka.ini"

WORKDIR /app


# Build stage: Composer packages plus the Vite build. The frontend build runs
# `php artisan wayfinder:generate`, so it needs PHP and Node together.
FROM base AS build

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN composer dump-autoload --optimize --no-dev \
    && APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= npm run build \
    && rm -rf node_modules


FROM base AS app

COPY --from=build /app /app
COPY docker/start.sh /usr/local/bin/start
RUN chmod +x /usr/local/bin/start

ENV PORT=10000
EXPOSE 10000

CMD ["start"]
