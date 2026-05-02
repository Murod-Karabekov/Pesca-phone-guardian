# Pesca Phone Guardian

Monorepo: **Android app** (`app/`), **backend + admin** (`web/`), **Docker Compose** (root).

## Structure

```
app/                 # Android Studio project (open this folder)
  app/               # Application module
  gradlew
web/
  backend/           # NestJS + Prisma + PostgreSQL
  admin/             # React (Vite) admin panel
docker-compose.yml   # postgres + api + admin
```

Mobile talks to backend **only over HTTP API** (`BuildConfig.API_BASE_URL`, default `http://10.0.2.2:3000/api/` for emulator).  
Set `API_BASE_URL` in `app/local.properties` for real devices, e.g. `http://192.168.1.10:3000/api/`.

## Docker (backend + admin + DB)

```bash
cp .env.example .env   # optional: edit JWT_SECRET / seed admin password
docker compose up --build
```

- **API:** http://localhost:3000/api  
- **Admin UI:** http://localhost:8080 (nginx proxies `/api` → API)  
- **Postgres:** localhost:5432 (`pesca` / `pesca`, DB `pesca_phone_guardian`)

First start runs `prisma migrate deploy` + **seed admin** (defaults in `docker-compose.yml`).

### Default admin login

- Email: `admin@pesca.local`  
- Password: `ChangeMe123!` (override with `SEED_ADMIN_PASSWORD` in compose env)

## Backend (local dev without Docker admin)

```bash
cd web/backend
cp .env.example .env
# start postgres locally or point DATABASE_URL to docker postgres
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

## Admin (local Vite)

```bash
cd web/admin
npm install
npm run dev
```

`vite.config.ts` proxies `/api` → `http://localhost:3000`. For production Docker build, leave `VITE_API_URL` empty so the browser calls same-origin `/api`.

## Android

1. Open **`app/`** in Android Studio (not the repo root).  
2. Optional: create `app/local.properties` with:
   ```properties
   API_BASE_URL=http://YOUR_LAN_IP:3000/api/
   ```
3. Run on emulator or device.

Features: install warning (Accessibility), **Scan** (installed apps + local risk), **submit scan** to backend, **notifications** from analysts, uninstall intent for risky apps.

## Privacy

App sends **only** metadata you confirm in the consent dialog: device model/Android version, app list, permission names, installer source, local risk summary. **No** SMS/contact/media content.

## HTTPS

Production: terminate TLS at reverse proxy / cloud load balancer; set `API_BASE_URL` to `https://.../api/`.
