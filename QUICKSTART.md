# Quick Start with Docker

Get the LinkedIn Clone API running in 2 minutes!

## Step 1: Prerequisites

Make sure Docker Desktop is installed and running:
- **Windows/Mac**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: [Install Docker Engine](https://docs.docker.com/engine/install/)

Verify installation:
```bash
docker --version
docker-compose --version
```

## Step 2: Start the Application

From the project root directory:

```bash
docker-compose up -d
```

**What happens:**
1. 🐘 Pulls PostgreSQL 16 Alpine image
2. 🏗️ Builds the .NET 8 API Docker image
3. 🗄️ Creates PostgreSQL database
4. 🚀 Starts both containers
5. 📊 Applies database migrations automatically (Identity, Profile, Professional)
6. ✅ API ready at http://localhost:5000

## Step 3: Verify It's Running

```bash
docker-compose ps
```

You should see:
```
Name                    State    Ports
-----------------------------------------------
linkedin-postgres       Up       0.0.0.0:5432->5432/tcp
linkedin-api            Up       0.0.0.0:5000->8080/tcp
```

## Step 4: Access the API

### Option 1: Swagger UI (Recommended)

Open: **http://localhost:5000/swagger**

Interactive documentation for `/api/auth`, `/api/profile`, and `/api/professional` (companies, experience, education, certificates, skills, languages). See [Professional module README](./backend/Professional/README.md).

### Option 2: Direct API Call

```bash
curl http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

## Step 5: Test the API

### Using Swagger UI

1. Navigate to http://localhost:5000/swagger
2. Click **POST /api/auth/register**
3. Click **"Try it out"**
4. Example body:
   ```json
   {
     "email": "john@example.com",
     "password": "SecurePass123"
   }
   ```
5. Click **"Execute"**

### Login and Get JWT Token

1. **POST /api/auth/login** with the same email/password
2. Copy **accessToken** from the response
3. Click **Authorize** in Swagger
4. Enter: `Bearer <your-token>`
5. Try **GET /api/auth/me** or **GET /api/profile/me**

### Profile module (Swagger checklist)

With **Authorize** enabled (JWT from login):

1. **GET /api/profile/me/message-settings** — returns defaults if no row exists yet
2. **PUT** or **PATCH /api/profile/me/message-settings** — update your settings

**Profile views** (record + list):

3. **POST /api/profile/{profileOwnerId}/views?source=profile** — works **without** JWT (anonymous view) or **with** JWT (sets `viewerUserId`). Use another user's id as `profileOwnerId` to simulate visiting their profile.
4. **GET /api/profile/me/profile-views** — **JWT required**; lists views of **your** profile only (last 100, newest first)

See [Profile module README](./backend/Profile/README.md) for security rules.

## Step 6: View Logs

```bash
docker-compose logs -f api
```

## Step 7: Stop the Application

```bash
docker-compose down
```

To also remove database and upload volumes:
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

Edit `docker-compose.yml` and change `5000:8080` to `5001:8080`, then open http://localhost:5001/swagger

### Fresh Start

```bash
docker-compose down -v
docker-compose up -d --build
```

## What's Next?

- 📖 Read the [full documentation](./README.md)
- 🐳 Learn more about [Docker setup](./DOCKER.md)
- 🏗️ Explore [Facade.API integration](./backend/Facade.API/INTEGRATION.md)
- 🔐 Auth facade details: [AccountManagement](./backend/AccountManagement/README.md)

## Environment Details

- **API URL**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **Database**: localhost:5432 / `linkedin_dev` / user `postgres`

---

**You're running the LinkedIn Clone modular monolith API with Docker.**
