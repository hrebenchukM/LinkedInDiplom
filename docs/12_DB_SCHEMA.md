# 12. DB schema (сжатый обзор)

Полная логическая модель таблиц ранее находилась в `docs/database/DB_SCHEMA.md`.

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

- Identity: `AspNetUsers`, `AspNetRoles`, `RefreshTokens`
- Profile: `user_profiles`, `message_settings`, `profile_views`
- Professional: companies/experiences/educations/certificates/skills/languages/recommendations
- Network: contacts/follows/blocked/groups/pages и связи
- Content: posts/media/comments/reactions/hashtags/saved/reposts/views/mentions
- Messaging: chats/messages/reads/media
- Jobs: vacancies/favorites/applications/search/recommended queries
- Notifications: notifications/user_activity
- Events: events/attendees/schedule/speakers/map

## Примечание

`init-db.sql` создает только `identity` schema; остальные создаются EF migrations.
