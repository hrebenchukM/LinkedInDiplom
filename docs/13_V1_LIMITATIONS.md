# 13. Ограничения v1 и что проверить позже

## Ограничения v1 (факт)

- нет SignalR / realtime чата и realtime уведомлений
- domain events в Identity — in-memory (без outbox/broker)
- Jobs: `CompanyId` не валидируется через Professional module
- Network: ограниченная кросс-проверка существования target user
- Events: упрощенная модель speaker ownership
- покрытие тестами ограничено (в основном Profile/Content)

### Platform Admin (v1)

- `GET /api/admin/users` — **без pagination** (TODO в `UserAdminService`)
- `GET /api/admin/stats/overview` — только агрегаты, **без фильтров по датам** и без графиков
- нет moderation компаний (Professional companies)
- нет очереди жалоб / reports / complaints
- нет granular permissions — только роли **Admin** и **User**
- admin post soft delete **не** обновляет `EditedAt` (в отличие от user delete поста)
- recommended job queries: user write endpoints **удалены** — это исправление модели доступа, не limitation

### Исправлено в admin v1 (не limitation)

- user не может POST/DELETE `/api/jobs/recommended-queries` (только Admin)
- защита: admin не lock/delete себя; не снять себе Admin; не снять Admin у последнего admin

## Что проверить позже (без изменения кода сейчас)

- конфигурацию и edge-cases Google/Facebook login
- соответствие not-found string sets и текстов ошибок core
- единообразие list endpoint поведения (200 empty vs 404)
- расширение integration/regression тестов

## Что нельзя делать при развитии

- переносить бизнес-логику в controllers
- добавлять ссылки на чужой DataAccess
- ломать route-контракты без версии API
- менять net8.0 без отдельного согласования
