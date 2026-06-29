#!/bin/sh
set -e

if [ -n "$DATABASE_HOST" ]; then
  echo "Waiting for database at $DATABASE_HOST:${DATABASE_PORT:-5432}..."
  while ! nc -z "$DATABASE_HOST" "${DATABASE_PORT:-5432}"; do
    sleep 1
  done
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "$DJANGO_SEED_DEMO" = "true" ]; then
  python manage.py seed_demo
fi

if [ "$DJANGO_CREATE_DEV_ADMIN" = "true" ]; then
  python manage.py create_dev_admin
fi

exec "$@"
