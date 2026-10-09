# Phone ↔ Laptop sync (one-time)

Cloud sync uses the **same Supabase project** as Career Switch OS.  
Auth already works there. Life RPG still needs **one SQL script** so saves have a place to live.

## Step 1 — Run this SQL (once)

1. Open: https://supabase.com/dashboard/project/ycpkeksjmwoakfpzpxcd/sql/new  
2. Paste **everything** from [`supabase/life_rpg_sync.sql`](./supabase/life_rpg_sync.sql)  
3. Click **Run**

You should see success (no red errors).

## Step 2 — Hard refresh the app on every device

Open: https://singhsangam.github.io/rpg-life-tracker/

- **iPhone/iPad Safari:** open the link → pull to refresh, or clear Website Data for this site  
- **Android Chrome:** open the link → ⋮ → tap the URL → reload  
- You should see **Sign in to sync** (not “Local only”)

## Step 3 — Same ID on phone and laptop

1. **Create ID** once (or reuse your Career Switch ID if you want)  
2. On the other device: **Sign in** with the same ID + password  
3. Pill should say **Synced**

Then: change a quest on the phone → within a few seconds (or tap **Sync now**) the laptop updates.

## If it still says “Local only”

The phone is holding an old offline copy. Clear site data for  
`singhsangam.github.io` and reopen the link.
