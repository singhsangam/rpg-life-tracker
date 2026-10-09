# RPG Life Tracker

Gamified daily routine app with **four normal 12-hour clocks** (weekday/weekend × morning/afternoon), quests, habits, shop, and Career Switch–style **ID + password sync**.

## Quick start

```powershell
cd C:\Users\sangam\rpg-life-tracker
copy .env.example .env
# paste the same Supabase URL + anon key used by Career Switch OS
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

**Plain-English guide:** [USER_MANUAL.md](./USER_MANUAL.md)

## Cloud sync (phone + laptop)

1. Career Switch `simple_auth.sql` must already exist in your Supabase project.
2. Run [`supabase/life_rpg_sync.sql`](./supabase/life_rpg_sync.sql) once in the SQL Editor.
3. Create ID / Sign in inside the app (same flow as Road to December).

Life RPG uses a **separate** save table — it will not overwrite NeetCode progress.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run preview` | Preview production |
