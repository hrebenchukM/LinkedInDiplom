# 11. Тесты и troubleshooting

## Тесты

Проект: `backend/Tests/LinkedIn.Tests`

Пакеты:

- xUnit
- Moq
- Microsoft.EntityFrameworkCore.InMemory

Фактические test classes:

- `ProfileServiceTests` (7)
- `PostServiceTests` (11)
- `HashtagServiceTests` (8)

Всего: 26 тестов.

Запуск:

```bash
dotnet test LinkedIn.sln
```

## Чего не хватает в покрытии

- facade service tests
- error mapping tests
- auth/refresh regression tests
- integration tests по API
- расширение покрытия по Network/Messaging/Jobs/Notifications/Events

## Частые проблемы

- Swagger не открывается: проверьте Development env и URL
- 401 в Swagger: формат `Bearer <token>`
- DB connection error: проверьте postgres/connection string
- порт занят: поменяйте mapping в compose
- lock dll: остановите запущенный процесс API
- migrations не применяются: смотрите логи api контейнера
