# Kulov Family Money

Современная система учета доходов, расходов, накоплений, долгов, целей и финансовой аналитики.

## Стек

- Backend: Django, Django REST Framework
- Frontend: React, TypeScript, Tailwind CSS, Recharts
- Dev DB: SQLite
- Production target: PostgreSQL, Redis, Celery

## Быстрый старт

### Docker Compose deployment

Скопируйте env-шаблон:

```bash
cp .env.example .env
```

В `.env` обязательно поменяйте:

- `SECRET_KEY`
- `POSTGRES_PASSWORD`
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `CORS_ALLOWED_ORIGINS`

Запуск:

```bash
docker compose up --build -d
```

Приложение будет доступно через Nginx:

```text
http://localhost/
http://YOUR_SERVER_IP/
http://147.45.185.185:7777/
```

Backend API:

```text
http://localhost/api/
http://147.45.185.185:7777/api/
```

Django Admin:

```text
http://localhost/admin/
http://147.45.185.185:7777/admin/
```

Посмотреть логи:

```bash
docker compose logs -f backend
docker compose logs -f nginx
docker compose logs -f celery
```

Остановить:

```bash
docker compose down
```

Полностью удалить данные Postgres/Redis:

```bash
docker compose down -v
```

Сервисы в Docker:

- `nginx` — отдает React и проксирует `/api/`, `/admin/`, `/static/`
- `backend` — Django + Gunicorn
- `db` — PostgreSQL
- `redis` — broker/cache для фоновых задач
- `celery` — worker для фоновых задач

Dev-admin создается автоматически, если в `.env` явно поставить:

```env
DJANGO_CREATE_DEV_ADMIN=true
```

Тестовый доступ:

- login: `admin`
- password: `admin12345`

Для реального production лучше оставить `DJANGO_CREATE_DEV_ADMIN=false` и создать пользователя вручную:

```bash
docker compose exec backend python manage.py createsuperuser
```

Для публичного домена пример `.env`:

```env
ALLOWED_HOSTS=kulov-money.example.com
CSRF_TRUSTED_ORIGINS=https://kulov-money.example.com
CORS_ALLOWED_ORIGINS=https://kulov-money.example.com
```

Для запуска на `147.45.185.185:7777`:

```env
ALLOWED_HOSTS=147.45.185.185
CSRF_TRUSTED_ORIGINS=http://147.45.185.185:7777
CORS_ALLOWED_ORIGINS=http://147.45.185.185:7777
NGINX_PORT=7777
```

### Backend

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py create_dev_admin
python manage.py runserver
```

API будет доступен на `http://127.0.0.1:8000/api/`.
Django Admin будет доступен на `http://127.0.0.1:8000/admin/`.

Dev-доступ:

- login: `admin`
- password: `admin12345`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Интерфейс будет доступен на `http://127.0.0.1:5173/`.

## Разделы

- Dashboard
- Доходы
- Расходы
- Аналитика
- Счета
- Цели
- Накопления
- Долги
- Календарь
- Категории
- История
- Настройки
