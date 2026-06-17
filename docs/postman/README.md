# Postman: как протестировать весь LinkedInDiplom API

> **Обновлено:** 2026-06-17 — новая структура папок 00–99, auto-save tokens/IDs.

Подробная документация: [../api/POSTMAN_TESTING.md](../api/POSTMAN_TESTING.md)

---

## 1) Что импортировать

1. `docs/postman/LinkedInDiplom.postman_collection.json`
2. `docs/postman/LinkedInDiplom.local.postman_environment.json`

Postman → **Import** → оба файла → выбрать environment **LinkedInDiplom Local**.

---

## 2) baseUrl

По умолчанию:

```
baseUrl = https://localhost:7011
```

Альтернативы (из `launchSettings.json`):

- `http://localhost:5282` (HTTP profile)
- Docker port из `docker-compose.yml`

---

## 3) Запуск backend

```bash
cd backend/Facade.API
dotnet run --launch-profile https
```

Smoke: папка **00 Health / Swagger / Base** → Swagger JSON → **200**.

---

## 4) Быстрый старт (3 шага)

1. **01 Auth → Login** → auto-saves `accessToken`, `refreshToken`, `userId`
2. **01 Auth → Get Current User** → проверка JWT
3. **03 Content → Get Feed** → проверка данных (demo seed)

Admin: **11 Admin → Admin Login** (`admin@local.dev` / `Admin123!`) → `adminAccessToken`

---

## 5) Структура папок

| # | Папка |
|---|-------|
| 00 | Health / Swagger / Base |
| 01 | Auth / Account |
| 02 | Profile |
| 03 | Content |
| 04 | Network |
| 05 | Messaging |
| 06 | Jobs |
| 07 | Events |
| 08 | Professional |
| 09 | Notifications |
| 10 | File Uploads (все multipart) |
| 11 | Admin |
| 12 | SignalR Info (docs only) |
| 99 | Error Examples + AI |

---

## 6) Auto-save

**Tokens:** Login, Admin Login, Refresh Token  
**IDs:** Create Post, Create Chat, Create Vacancy, Create Contact, и др.

Console Postman покажет: `accessToken saved`, `postId saved: ...`

---

## 7) Upload

Папка **10 File Uploads** — form-data, key `file`, выберите файл вручную.

---

## 8) Обновление коллекции

```bash
node docs/postman/build-postman.mjs
```

---

## 9) Demo users

| Email | Password |
|-------|----------|
| test@example.com | Test123! |
| admin@local.dev | Admin123! |
| marya101204@gmail.com | Mgg101204 |

См. также [../22_SEED_DATA.md](../22_SEED_DATA.md)
