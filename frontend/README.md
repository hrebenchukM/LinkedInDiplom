# Frontend (master2 UI + Docker API)

UI from branch `master2` (modals, Figma-like layout). API via Vite proxy to Docker `:5000`.

## Quick start

```powershell
docker compose up -d
cd frontend
copy .env.example .env.local
npm ci
npm run dev
```

Open **http://localhost:5173/auth**

## Routes

| Page | URL |
|------|-----|
| Login | `/auth` |
| Home / Feed | `/app` |
| Profile | `/app/profile` |
| Network | `/app/network` |
| Vacancies | `/app/vacancies` |
| Messages | `/app/messages` |
| Notifications | `/app/notifications` |
| Admin | `/app/admin/dashboard` |

Legacy redirects: `/home` → `/app`, `/chat` → `/app/messages`.

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@local.dev` | `Admin123!` |
| User | `andrii.rotar@gmail.com` | `LinkUpDemo2024!` |

## Verify

```powershell
npm run verify:all
```

Manual checklist: http://localhost:5173/verify.html

## Modals

`src/features/Modals/` — CreatePost, AddExperience, AddSkill, PostJob, etc.
