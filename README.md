# Life RPG

Turn real-life tasks into an RPG progression system. Create **Quests**, complete them to earn **XP** and **Gold**, level up your character, build daily **Streaks**, and grow four **Attributes** (Intellect, Strength, Discipline, Creativity) tied to quest categories. Spend Gold on cosmetics in the **Shop**.

All game logic — XP math, leveling, streaks, gold, anti-cheat — is computed **server-side only**. The client only ever says "complete quest X"; the server calculates and returns the truth.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, React Router, Zustand, Axios |
| Backend | Node.js + Express (REST API) |
| Database | PostgreSQL on Supabase (free tier) |
| ORM | Prisma |
| Auth | Custom JWT (access + refresh, httpOnly cookies), bcryptjs |
| Extras | react-hot-toast, canvas-confetti, Recharts |

## Monorepo layout

```
life-rpg/
├── backend/            Express API, Prisma schema, xpEngine game logic
│   ├── prisma/schema.prisma
│   ├── src/{routes,controllers,middleware,services,utils}/
│   └── tests/xpEngine.test.js   (14 pure-function unit tests, no server needed)
└── frontend/           Vite + React app
    └── src/{pages,components,store,api}/
```

## Game logic

- **Leveling:** `xpRequiredForLevel(n) = round(100 * n^1.5)`. XP overflow carries into the next level, and a single large grant can cascade through multiple level-ups in one request.
- **Rewards:** easy = 10 XP, medium = 25 XP, hard = 50 XP. Gold = `floor(XP / 2)`.
- **Attributes:** each quest's category adds its XP directly to the mapped attribute (coding/study → Intellect, gym/fitness → Strength, chores → Discipline, creative/art → Creativity; anything else defaults to Discipline). This is separate from the level XP pool.
- **Streaks:** computed on the `Asia/Kolkata` calendar day, not raw UTC timestamps, so the streak boundary matches midnight IST for every user regardless of server timezone. Same-day completion → no change. Exactly one day later → `+1`. Any bigger gap → resets to 1.
- **Anti-cheat:** `PATCH /quests/:id/complete` claims the quest with a single conditional `updateMany({ where: { id, userId, status: 'pending' } })`. Only the request that actually flips the row from `pending` gets rewards — a replayed or raced request sees `count === 0` and is rejected, so double-claiming is impossible even under concurrent requests. Shop purchases are similarly guarded inside a Prisma `$transaction` that re-reads gold/ownedItems immediately before writing.

All of the above (except the DB-level anti-cheat guard, which requires a real database) is implemented as pure functions in [`backend/src/services/xpEngine.js`](backend/src/services/xpEngine.js) and covered by [`backend/tests/xpEngine.test.js`](backend/tests/xpEngine.test.js):

```bash
cd backend && npm test
# 14 pass, 0 fail
```

## Local setup

### 1. Create a free Supabase Postgres database

1. Sign up at [supabase.com](https://supabase.com) (no credit card required) and create a project.
2. Go to **Project Settings → Database → Connection string**. Copy the **URI** (use the *Session* pooler or direct connection for local `prisma migrate dev`; the *Transaction* pooler on port 6543 is recommended for the deployed backend — see the comment in `backend/.env.example`).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL from Supabase, and generate two different random secrets:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

npm install
npx prisma migrate dev --name init   # creates tables in Supabase
npx prisma db seed                   # seeds the shop catalog
npm run dev                          # http://localhost:4000
```

Sanity check: `curl http://localhost:4000/api/health` should return `{"ok":true,...}`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm install
npm run dev             # http://localhost:5173
```

Sign up, add a quest, complete it, and confirm the level-up modal fires once you cross a level threshold.

## Environment variables

**`backend/.env`** (see `backend/.env.example`)

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string |
| `JWT_SECRET` | Signs access tokens (15 min TTL) |
| `JWT_REFRESH_SECRET` | Signs refresh tokens (30 day TTL, rotated on use, revocable) — must differ from `JWT_SECRET` |
| `PORT` | Express port (Render sets this automatically in production) |
| `NODE_ENV` | `development` (relaxed cookies) or `production` (secure, cross-site cookies) |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |

**`frontend/.env`** (see `frontend/.env.example`)

| Var | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the deployed backend (no trailing slash) |

## API reference

```
POST   /api/auth/signup          { email, password }
POST   /api/auth/login           { email, password }
POST   /api/auth/refresh         rotates the refresh cookie, reissues an access cookie
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/quests
POST   /api/quests               { title, category, difficulty }
PATCH  /api/quests/:id/complete  → { character, leveledUp, levelsGained, newLevel, xpGained, goldGained, attribute, quest }
DELETE /api/quests/:id

GET    /api/character
GET    /api/shop
POST   /api/shop/:itemId/buy
```

## Deployment (all free tier)

1. **Database — Supabase**: already set up above. Keep the connection string handy.
2. **Backend — Render**:
   - New **Web Service** → connect this repo → root directory `backend`.
   - Build command: `npm install && npx prisma generate`
   - Start command: `npx prisma migrate deploy && npm start`
   - Add the env vars from `backend/.env.example` (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`, `CORS_ORIGIN=<your-vercel-url>`).
   - After the first deploy succeeds, run `npx prisma db seed` once (Render Shell tab) to populate the shop.
3. **Frontend — Vercel**:
   - New Project → import this repo → root directory `frontend`.
   - Framework preset: Vite. Add env var `VITE_API_URL=<your-render-url>`.
   - `vercel.json` in `frontend/` already rewrites all routes to `index.html` for client-side routing.
4. Update `CORS_ORIGIN` on Render to the final Vercel URL and redeploy.
5. Smoke test the live URL end to end: sign up → add + complete a quest → confirm the level-up modal → refresh the page → confirm state persisted from Postgres (not localStorage).

## Design notes / deviations from a literal reading of the spec

- **bcryptjs instead of bcrypt**: pure-JS, so it needs no native build toolchain — installs identically on Windows dev machines and Render's build image. Same hashing algorithm/API.
- Refresh tokens are persisted (hashed with SHA-256, never in plaintext) in a `RefreshToken` table so they can be revoked on logout and rotated on every refresh, per the "secure backend" requirement in the spec.
