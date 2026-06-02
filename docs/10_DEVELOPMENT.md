# 10. Разработка: запуск и расширение

## Запуск через Docker

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f api
```

Swagger: `http://localhost:5000/swagger`

## Локальный запуск

```bash
cd backend/Facade.API
dotnet run
```

Порты локально: смотрите `backend/Facade.API/Properties/launchSettings.json`.

## Frontend SPA (Vite + React)

Перед merge с бэкендом: **`frontend/HANDOFF_FOR_BACKEND.md`**.

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server по умолчанию: `http://localhost:5173`.

### Frontend + Backend (env)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- **Прокси (рекомендуется):** оставить `VITE_API_BASE_URL` пустым — запросы `/api/*` идут через Vite на `VITE_DEV_PROXY_TARGET` (по умолчанию `http://localhost:5282`).
- **Прямой HTTPS API:** `VITE_API_BASE_URL=https://localhost:7011`
- **Docker API:** `VITE_API_BASE_URL=http://localhost:5000`
- **Без бэка:** `VITE_USE_MOCK_AUTH=true`

Токены после login: `localStorage.authAccessToken`, `authRefreshToken`. Дальнейшие модули подключать через `frontend/src/shared/api/client.js`.

Production build:

```bash
cd frontend
npm run build
npm run preview
```

## Сборка и тесты

```bash
dotnet build LinkedIn.sln
dotnet test LinkedIn.sln
```

## Как добавить новый модуль (когда разрешено менять код)

1. создать 6 core-проектов (Contracts/DataAccess/Services/Client.Contracts/Client/DI)
2. добавить DbContext и migrations
3. добавить `Add*Module`
4. при необходимости добавить facade-модуль (4 проекта)
5. подключить в Facade.API (Program.cs + ApplicationPart + migration order)

## Как добавить фичу

1. entity + migration в своем DataAccess
2. interface + parameters/results в Contracts
3. service logic
4. resource/client
5. facade request/response + controller endpoint
