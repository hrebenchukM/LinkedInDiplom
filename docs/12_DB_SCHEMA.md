# 12. DB schema (сжатый обзор)

Актуальный сжатый обзор — **этот файл** (`docs/12_DB_SCHEMA.md`).

Ранее планировался отдельный `docs/database/DB_SCHEMA.md` — **файл отсутствует**; детальная схема — в EF migrations (`backend/*/DataAccess/Migrations`) и `08_INFRA_DB_MIGRATIONS.md`.

## Сопоставление модуль → schema

- Identity → `identity`
- Profile → `profile`
- Professional → `professional`
- Network → `network`
- Content → `content`
- Messaging → `messaging`
- Jobs → `jobs`
- Notifications → `notifications`
- Events → `events`

## Основные группы таблиц

- Identity: `AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`, `RefreshTokens`
  - **platform admin** — это пользователь с ролью `Admin` в `AspNetUserRoles`; отдельной таблицы `admins` **нет**
  - `ApplicationUser.DeletedAt` — soft delete пользователя (не hard delete)
- Profile: `user_profiles`, `message_settings`, `profile_views`
- Professional: companies/experiences/educations/certificates/skills/languages/recommendations
- Network: contacts/follows/blocked/groups/pages и связи
  - `page_admins` — админы **страниц** (Network), **не** platform admin (`/api/admin/*`)
- Content: posts/media/comments/reactions/hashtags/saved/reposts/views/mentions
  - `posts.DeletedAt` — soft delete постов
- Messaging: chats/messages/reads/media
- Jobs: vacancies/favorites/applications/search/recommended queries
  - `vacancies.DeletedAt` — soft delete вакансий
  - `recommended_job_queries` — глобальный справочник (без per-user ownership)
- Notifications: notifications/user_activity
- Events: events/attendees/schedule/speakers/map

## Примечание

`init-db.sql` создает только `identity` schema; остальные создаются EF migrations.

### Изменения Steps 1–10 и migrations

API/DTO изменения Steps 1–9 (search, feed, pagination, admin moderation, validation) в основном использовали **существующие таблицы** и поля (`DeletedAt`, contacts, events, comments и т.д.). **Новых EF migrations специально под Steps 1–10 не добавлялось**, если в репозитории нет соответствующих migration files после этих шагов — проверяйте `git log` / папки `*/Migrations/`.

`attendeeCount` / `isAttending` в API — вычисляемые/enriched поля, не обязательно новые колонки.
