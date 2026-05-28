# Postman: как протестировать весь LinkedInDiplom API

## 1) Что импортировать

1. `docs/postman/LinkedInDiplom.postman_collection.json`
2. `docs/postman/LinkedInDiplom.local.postman_environment.json`

В Postman:

- **Import** → выбрать оба JSON файла
- в правом верхнем углу выбрать environment: `LinkedInDiplom Local`

## 2) Базовый URL

По умолчанию в environment:

- `baseUrl = http://localhost:5000`

Если запускаете локально без Docker, можно заменить на порт из `launchSettings.json`:

- `http://localhost:5282`
- или `https://localhost:7011`

## 3) Запуск backend перед тестами

### Docker

```bash
docker-compose up -d
```

### Локально

```bash
cd backend/Facade.API
dotnet run
```

## 4) Как получить токены

Папка `01 Auth / Account`:

1. **Register**
2. **Login**

После `Login` collection-скрипт сохраняет:

- `accessToken`
- `refreshToken`
- `userId` (если найден в ответе)

## 5) Protected endpoints

Большинство endpoint-ов в коллекции используют Bearer token:

- `Authorization: Bearer {{accessToken}}`

Если получили `401`:

1. выполнить `Auth -> Login` ещё раз
2. либо `Auth -> Refresh Token`
3. проверить, что в environment есть `accessToken`

## 6) Порядок тестирования модулей

Рекомендуемый порядок:

1. `01 Auth / Account`
2. `02 Profile`
3. `03 Professional`
4. `05 Content`
5. `04 Network`
6. `06 Messaging`
7. `07 Jobs`
8. `08 Notifications`
9. `09 Events`
10. `01 Auth / Account -> Logout`

Почему так:

- в Professional/Content создаются ID, которые потом нужны в Network/Messaging/Jobs/Events.

## 7) Переменные окружения

Collection использует переменные:

- `baseUrl`, `accessToken`, `refreshToken`, `userId`
- и набор id-переменных (`postId`, `chatId`, `vacancyId`, `eventId`, и т.д.)

Если какой-то id пустой:

1. выполните create-запрос, который его создаёт
2. проверьте test script этого запроса (сохранилась ли переменная)
3. при необходимости вручную вставьте id в environment

## 8) Upload endpoints (avatar/header/media)

Для endpoint-ов с `form-data`:

- вручную выберите файл в Postman
- key: `file` (или как указано в конкретном request)

Если не уверены по key, сверяйтесь с endpoint в Swagger.

## 9) Ошибки и как читать ответы

- `400` — валидация/бизнес-правило
- `401` — нет/просрочен JWT
- `404` — сущность не найдена или нет доступа
- `500` — внутренняя ошибка сервера

Ответы в проекте могут быть:

- объект с `success/errors`
- массив
- dto-объект
- `204` без тела

## 10) Refresh / Logout

- `Refresh Token` — обновляет `accessToken` и часто `refreshToken`
- `Logout` — обычно инвалидирует текущий refresh token
- после logout защищённые endpoints должны начать отдавать `401` при старом токене

## 11) Второй пользователь (для social/messaging сценариев)

Для некоторых сценариев (contacts/follows/chat) может понадобиться второй пользователь.

Environment содержит:

- `otherUserEmail`
- `otherUserPassword`
- `otherUserId`

Создайте второго юзера через `Register` (другой email), войдите под ним и сохраните id вручную в `otherUserId` при необходимости.

## 12) Где смотреть подробную схему

- `docs/api/POSTMAN_TESTING.md` — таблицы по модулям (method/route/auth/body/переменные)
