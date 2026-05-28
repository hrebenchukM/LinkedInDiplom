# Быстрый старт (Docker)

```bash
docker-compose up -d
```

- **Swagger:** http://localhost:5000/swagger  
- **API:** http://localhost:5000  

## Проверка auth

1. `POST /api/auth/register` — email + password (≥ 6 символов)  
2. `POST /api/auth/login` — скопировать `accessToken`  
3. Swagger → **Authorize** → `Bearer <token>`  
4. `GET /api/auth/me`, `GET /api/profile/me`  

## Логи и остановка

```bash
docker-compose logs -f api
docker-compose down
docker-compose down -v    # сброс БД
```

## Полная документация

**[docs/BACKEND.md](./docs/BACKEND.md)** — архитектура, все модули, endpoints, Docker, JWT.

Также: [README.md](./README.md), [DOCKER.md](./DOCKER.md).
