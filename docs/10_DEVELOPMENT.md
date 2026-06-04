# 10. Разработка: запуск и расширение

## Запуск через Docker

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f api
```

Swagger: `http://localhost:5000/swagger`

## Локальный запуск

```bash
cd backend/Facade.API
dotnet run
```

Порты локально: смотрите `backend/Facade.API/Properties/launchSettings.json`.

## Сборка и тесты

```bash
dotnet build LinkedIn.sln
dotnet test LinkedIn.sln
```

## Как добавить новый модуль (когда разрешено менять код)

1. создать 6 core-проектов (Contracts/DataAccess/Services/Client.Contracts/Client/DI)
2. добавить DbContext и migrations
3. добавить `Add*Module`
4. при необходимости добавить facade-модуль (4 проекта)
5. подключить в Facade.API (Program.cs + ApplicationPart + migration order)

## Как добавить фичу

1. entity + migration в своем DataAccess
2. interface + parameters/results в Contracts
3. service logic
4. resource/client
5. facade request/response + controller endpoint
