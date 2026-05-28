# 13. Ограничения v1 и что проверить позже

## Ограничения v1 (факт)

- нет SignalR / realtime чата и realtime уведомлений
- domain events в Identity — in-memory (без outbox/broker)
- Jobs: `CompanyId` не валидируется через Professional module
- Network: ограниченная кросс-проверка существования target user
- Events: упрощенная модель speaker ownership
- покрытие тестами ограничено (в основном Profile/Content)

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
