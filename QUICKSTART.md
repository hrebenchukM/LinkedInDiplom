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
2. 🏗️ Builds the .NET 10 API Docker image
3. 🗄️ Creates PostgreSQL database
4. 🚀 Starts both containers
5. 📊 Applies database migrations automatically
6. ✅ API ready at http://localhost:5000

**Expected output:**
```
Creating network "linkedindiplom_linkedin-network" with driver "bridge"
Creating volume "linkedindiplom_postgres_data" with default driver
Pulling postgres (postgres:16-alpine)...
Building api...
Creating linkedin-postgres ... done
Creating linkedin-api      ... done
```

## Step 3: Verify It's Running

Check container status:
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
Open your browser to: **http://localhost:5000**

You'll see the interactive Swagger documentation where you can test all endpoints.

### Option 2: Direct API Call
```bash
curl http://localhost:5000/api/account/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "testuser",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Step 5: Test the API

### Using Swagger UI:

1. Navigate to http://localhost:5000
2. Click on **POST /api/account/register**
3. Click **"Try it out"**
4. Fill in the example request:
   ```json
   {
     "email": "john@example.com",
     "userName": "johndoe",
     "password": "SecurePass123",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```
5. Click **"Execute"**
6. You should get a 200 response with account details

### Login and Get JWT Token:

1. Click on **POST /api/account/login**
2. Click **"Try it out"**
3. Enter:
   ```json
   {
     "email": "john@example.com",
     "password": "SecurePass123"
   }
   ```
4. Click **"Execute"**
5. Copy the **accessToken** from the response
6. Click the **"Authorize"** button at the top
7. Enter: `Bearer <paste-your-token-here>`
8. Click **"Authorize"**
9. Now you can use protected endpoints!

## Step 6: View Logs

To see what's happening:

```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# Just the last 50 lines
docker-compose logs --tail=50 api
```

## Step 7: Stop the Application

When you're done:

```bash
docker-compose down
```

This stops and removes the containers but **keeps your data**.

To also remove the database data:
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, edit `docker-compose.yml`:

```yaml
api:
  ports:
    - "5001:8080"  # Change to 5001
```

Then access at http://localhost:5001

### Container Won't Start

Check the logs:
```bash
docker-compose logs api
docker-compose logs postgres
```

### Database Connection Issues

Restart the services:
```bash
docker-compose restart
```

### Fresh Start

Remove everything and start over:
```bash
docker-compose down -v
docker-compose up -d --build
```

## What's Next?

- 📖 Read the [full documentation](./README.md)
- 🐳 Learn more about [Docker setup](./DOCKER.md)
- 🏗️ Explore the [architecture](./backend/README.md)
- 🔐 Understand [authentication](./backend/Identity/README.md)

## Quick Reference

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start in background |
| `docker-compose ps` | Check status |
| `docker-compose logs -f` | View logs |
| `docker-compose down` | Stop containers |
| `docker-compose restart` | Restart services |
| `docker-compose up -d --build` | Rebuild and start |

## Environment Details

- **API URL**: http://localhost:5000
- **Database Host**: localhost:5432
- **Database Name**: linkedin_dev
- **Database User**: postgres
- **Database Password**: postgres

## Default Test Account

After running the quick start steps above, you'll have created a test account:
- **Email**: john@example.com
- **Username**: johndoe
- **Password**: SecurePass123

Use this to test login and authenticated endpoints!

---

**That's it! You're now running the LinkedIn Clone API with Docker! 🎉**

For production deployment, see [DOCKER.md](./DOCKER.md) for security best practices.
