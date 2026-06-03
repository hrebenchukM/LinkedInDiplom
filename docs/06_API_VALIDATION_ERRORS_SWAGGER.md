# 06. Validation / Error handling / Swagger

## Validation

- DataAnnotations на facade Request-моделях
- в controllers: `if (!ModelState.IsValid) return BadRequest(ModelState);`
- бизнес-валидация (дубликаты, ownership) — в core services

## Error handling

Обычно:

- `400` — validation/business error
- `401` — не авторизован
- `403` — forbidden (нет нужной роли; типично User на `/api/admin/*`)
- `404` — not found (через `MapErrors` и набор not-found строк в CRUD facade)
- `200/204` — успех

Account controller имеет отдельное поведение (без `MapErrors`).

### Admin API (`/api/admin/*`)

- требуется `Authorization: Bearer <access_token>` с claim роли **Admin**
- обычный пользователь (роль User) → **403 Forbidden**
- многие admin endpoints при `InvalidOperationException` возвращают **400** с телом `{ "error": "..." }` (не `{ success, errors }`)
- часть admin read endpoints при not found тоже отдаёт **400** `{ error }` (например get user by id) — сверяйте фактический ответ в Swagger
- успешные write без тела: часто **204** (lock, delete user, delete/restore post/vacancy, delete recommended query)
- `POST /api/admin/jobs/recommended-queries` → **200** с DTO в теле
- `GET /api/admin/stats/overview` → **200** с `AdminStatsOverviewDto`

### Admin self-protection (400)

| Действие | Сообщение `error` (пример) |
|---|---|
| lock себя | `Admin cannot lock own account.` |
| soft delete себя | `Admin cannot delete own account.` |
| снять у себя роль Admin | `Admin cannot remove own Admin role.` |
| снять Admin у последнего admin | `Cannot remove Admin role from the last admin user.` |

## Swagger

- включен только в Development
- URL: `/swagger`
- кнопка Authorize поддерживает Bearer token

Для точного списка endpoints используйте Swagger как источник правды.
