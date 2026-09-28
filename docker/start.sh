#!/bin/sh
# Container start: prepare the persistent storage disk, migrate, then serve.
set -e

cd /app

# storage/app is the persistent disk: uploads, receipts and the SQLite file.
mkdir -p storage/app/public storage/app/private \
    storage/framework/cache/data storage/framework/sessions storage/framework/views \
    storage/logs bootstrap/cache

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    DB_FILE="${DB_DATABASE:-/app/storage/app/database.sqlite}"
    [ -f "$DB_FILE" ] || touch "$DB_FILE"
fi

php artisan storage:link --force
php artisan migrate --force
php artisan optimize

exec frankenphp php-server --root public/ --listen ":${PORT:-10000}"
