#!/bin/sh
# Container start: prepare the persistent storage disk, migrate, then serve.
set -e

cd /app

# storage/app must be a persistent volume: it holds uploads, payment
# receipts and the SQLite database. Anything else in the container is
# replaced on every deploy.
STORAGE=/app/storage/app

if [ -n "$RAILWAY_ENVIRONMENT" ] && [ "$RAILWAY_VOLUME_MOUNT_PATH" != "$STORAGE" ]; then
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "!! WARNING: no Railway volume is mounted at $STORAGE"
    echo "!! (current volume: ${RAILWAY_VOLUME_MOUNT_PATH:-none})."
    echo "!! The database and all uploads WILL BE LOST on the next deploy."
    echo "!! Railway -> service -> Settings -> Volumes -> mount path $STORAGE"
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
fi

mkdir -p "$STORAGE/public" "$STORAGE/private/receipts" \
    storage/framework/cache/data storage/framework/sessions storage/framework/views \
    storage/logs bootstrap/cache

# Ensure storage directories are writable
chmod -R 775 storage bootstrap/cache

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    # Laravel's default (database/database.sqlite) lives in the image and is
    # wiped on deploy, so always keep SQLite on the persistent volume.
    export DB_DATABASE="${DB_DATABASE:-$STORAGE/database.sqlite}"

    case "$DB_DATABASE" in
        "$STORAGE"/*) ;;
        *) echo "!! WARNING: DB_DATABASE=$DB_DATABASE is outside $STORAGE and will be lost on deploy." ;;
    esac

    [ -f "$DB_DATABASE" ] || touch "$DB_DATABASE"
    echo "Using SQLite database at $DB_DATABASE"
fi

php artisan storage:link --force
php artisan migrate --force
php artisan optimize

exec frankenphp php-server --root public/ --listen ":${PORT:-10000}"
