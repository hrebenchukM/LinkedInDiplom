# Быстрый старт (фронт + бэкенд)

## 1. Клонировать репозиторий

```bash
git clone <url> LinkedInDiplom
cd LinkedInDiplom
```

## 2. Запуск через Docker (рекомендуется)

```bash
docker compose up -d --build
```

Поднимутся:

| Сервис | URL |
|--------|-----|
| **Frontend (Vite)** | http://localhost:5173 |
| **API + Swagger** | http://localhost:5000/swagger |
| **PostgreSQL** | localhost:5432 |

Swagger: http://localhost:5000/swagger — все эндпоинты, поля запросов и ответов.

## 3. Локальный фронт без Docker-контейнера frontend

```bash
# Только БД + API
docker compose up -d postgres api

cd frontend
cp .env.example .env.local
# VITE_DEV_PROXY_TARGET=http://localhost:5000
npm ci
npm run dev
```

Откройте http://localhost:5173

## 4. Локальный бэкенд без Docker

```bash
# PostgreSQL на :5432 (из docker compose или локально)
cd backend/Facade.API
dotnet run
```

API: http://localhost:5282/swagger  

В `frontend/.env.local`: `VITE_DEV_PROXY_TARGET=http://localhost:5282`

## 5. Проверка интеграции

1. http://localhost:5173 → **Registration** / **Login**
2. **Profile** — сохранение, аватар (`/api/profile/me`)
3. **Home** — посты (`/api/content/me/posts`), лайки, комментарии
4. **Network** — контакты (`/api/network/me/contacts`)
5. **Vacancies** — вакансии (`/api/jobs/vacancies`)
6. **Chat** — чаты (`/api/messaging/me/chats`)
7. Колокол — уведомления (`/api/notifications/me`)

## 6. Важно

- Бэкенд **не меняем** — только подключаем существующие маршруты из Swagger.
- `VITE_USE_MOCK_AUTH=true` — демо без API.
- JWT: `authAccessToken` / `authRefreshToken` в localStorage; refresh при 401 автоматически.

## 7. Остановка Docker

```bash
docker compose down
```
