# Этап 8 — Polish / Error Handling / Testing

**Цель:** production-ready UX  
**Бэкенд:** не менялся  
**Автотест:** `cd frontend && npm run verify:all`  
**UI-чеклист:** http://localhost:5173/verify.html  

**Аккаунты:**
- Admin: `admin@local.dev` / `Admin123!`
- User: `andrii.rotar@gmail.com` / `LinkUpDemo2024!`

---

## 1. Events UI

- [x] `/network?section=events` открывается
- [x] Фильтры: Discover / Attending / Online
- [x] Поиск по title/location работает
- [x] **Join** → событие в Attending
- [x] **Leave** → снова Discover
- [x] **Create event** → modal → создание + cover upload

---

## 2. Notifications — mark read via API

- [x] Колокольчик → список с `GET /api/notifications/me`
- [x] Нет demo «Sarah Chen / job update» (в API-режиме)
- [x] Клик по уведомлению → `PATCH .../read`
- [x] **Mark all read** → badge = 0
- [x] F5 → прочитанные остаются прочитанными

---

## 3. OAuth / demo social flow

- [x] `/auth` без OAuth client ID
- [x] **Continue with Google** → вход как Andrii Rotar
- [x] Logout → **Facebook demo** → вход как Timur Yamchuk
- [x] Документация: `docs/DEMO_SOCIAL_AUTH.md`

---

## 4. Remove unused mock constants

- [x] `mockData.js` удалён (initialNetworkPeople, initialChats, initialVacancies)
- [x] `VacanciesStore.jsx` удалён
- [x] Feed/Network/Vacancies работают через API (не localStorage mock)
- [x] `VITE_USE_MOCK_AUTH` **не** включён в обычной проверке

> Dev-only: `mockAuthApi` и demo social templates остаются для offline-режима — это ожидаемо.

---

## 5. Error handling / UX polish

### Feed (`/home`)

- [x] Create post, like, comment
- [x] Media upload
- [x] При ошибке загрузки — `feedLoadError` сообщение
- [x] Refresh feed работает

### Profile (`/profile`)

- [x] GET/PATCH profile, avatar upload
- [x] Progress bar при upload avatar/header
- [x] Experience / education / skills CRUD

> Phone / resume — локально на устройстве (LocalOnly badge). Остальное через API.

### Vacancies (`/vacancies`)

- [x] Saved tab — из API favorites (не localStorage)
- [x] Apply modal — loading при submit
- [x] Post job (create vacancy) работает

### Chat (`/chat`)

- [x] Статус **Online** / Reconnecting
- [x] Send → REST, receive → SignalR
- [x] Mark read / delete message

---

## 6. CORS / production config

- [x] `npm run build` проходит без ошибок
- [x] В console нет `[LinkedInDiplom config:mock-auth-in-prod]`
- [x] `.env.example` — комментарии про `VITE_API_BASE_URL` и CORS
- [x] `validateDeploymentConfig()` вызывается при старте (`main.jsx`)

---

## 7. Full user journey (E2E)

| # | Шаг | URL | Статус |
|---|-----|-----|--------|
| 1 | Auth | `/auth` | [x] |
| 2 | Profile | `/profile` | [x] |
| 3 | Post | `/home` | [x] |
| 4 | Connect | `/network` | [x] |
| 5 | Events | `/network?section=events` | [x] |
| 6 | Apply | `/vacancies` | [x] |
| 7 | Chat | `/chat` | [x] |
| 8 | Notifications | bell на `/home` | [x] |
| 9 | Admin | `/admin/dashboard` | [x] |
| 10 | 403 | `/admin/dashboard` as andrii | [x] |

---

## 8. Автоматическая проверка

- [x] `npm run verify:e2e` — 17/17 API checks
- [x] `npm run verify:signalr` — SIGNALR_TEST=PASS
- [x] `npm run verify:all` — всё вместе

---

## 9. Admin (входит в journey, этап 7)

- [x] Admin menu только для `admin@local.dev`
- [x] Dashboard, Users, Content, Comments, Jobs, Events, Roles
- [x] Users drawer: lock/unlock, roles add/remove
- [x] andrii → `/admin/*` = 403

---

## Итог этапа 8

| Критерий | Статус |
|----------|--------|
| Events UI | ✅ |
| Notifications API | ✅ |
| OAuth demo documented | ✅ |
| Mock cleanup | ✅ |
| E2E checklist + verify scripts | ✅ |
| CORS/production validation | ✅ |
| Journey auth → admin | ✅ |
| `npm run verify:all` | ✅ |
| `verify.html` 11/11 | ✅ |

**Этап 8 — закрыт.**
