# 06. Validation / Error handling / Swagger

## Validation

- DataAnnotations на facade Request-моделях
- в controllers: `if (!ModelState.IsValid) return BadRequest(ModelState);`
- бизнес-валидация (дубликаты, ownership) — в core services

## Error handling

Обычно:

- `400` — validation/business error
- `401` — не авторизован
- `404` — not found (через `MapErrors` и набор not-found строк)
- `200/204` — успех

Account controller имеет отдельное поведение (без `MapErrors`).

## Swagger

- включен только в Development
- URL: `/swagger`
- кнопка Authorize поддерживает Bearer token

Для точного списка endpoints используйте Swagger как источник правды.
