# RPG Life Tracker — Plain-English Manual

Think of this app as a **video-game version of your day planner**.  
You don’t fill a scary spreadsheet. You look at clocks, tap what you’re doing, and collect XP like a character leveling up.

---

## Can I use it on my phone? Does it remember things?

**Yes to both** — but **not** via `localhost` / `127.0.0.1`. That address only works on the computer running the app.

### Open on phone / iPad right now (same Wi‑Fi)

1. On the laptop, run: `npm run dev` (it must say **Network:** in the terminal).
2. Keep the laptop awake and on the **same Wi‑Fi** as the phone/iPad (not guest Wi‑Fi, not mobile data alone).
3. On the phone, open Safari/Chrome and type the laptop address, for example:  
   `http://192.168.0.5:5173`  
   (use the **Network** URL Vite prints — never `localhost` on the phone).
4. If it won’t load: Windows Firewall may be blocking Node — allow private networks when Windows asks, or temporarily allow port 5173.

### Works on any network (like Road to December)

Hosted site (no same-Wi‑Fi needed, laptop can be off):  
**https://singhsangam.github.io/rpg-life-tracker/**

Add to Home Screen from Safari/Chrome for an app-like icon.

| Situation | What happens |
|-----------|----------------|
| Open on phone browser (or “Add to Home Screen”) | Works fine — big buttons, bottom menu |
| Stay on **one** phone/laptop, no login | Remembers everything on **that device** automatically |
| Clear browser data / use a different phone | Local memory is gone unless you **sign in to sync** |
| Sign in with ID + password (like Road to December) | Phone + laptop share the same progress in the cloud |

**Local memory** = sticky note glued inside that one browser.  
**Cloud sync** = the same notebook living online, so every device reads/writes it.

---

## The big idea in 30 seconds

1. Your day is drawn on **clocks** (colored slices = activities).
2. You **check in** when you do something → earn **XP**.
3. You finish **daily quests** and **habits** → more XP.
4. XP raises your **level** and **rank** (Novice → Apprentice → …).
5. Spend XP in the **Rewards Shop** on real-life treats (snack, movie, trip…).

---

## The four clocks (this is the main screen)

A normal wall clock only shows **12 hours**.  
A full day needs **24 hours**, so we use **two clocks per routine**:

| Clock | What it shows |
|-------|----------------|
| **Weekday · Morning** | Mon–Fri, 12 AM → 12 PM |
| **Weekday · Afternoon** | Mon–Fri, 12 PM → 12 AM |
| **Weekend · Morning** | Sat–Sun, 12 AM → 12 PM |
| **Weekend · Afternoon** | Sat–Sun, 12 PM → 12 AM |

### Only one clock “lights up”

Example: **Wednesday, 3 PM**

- Weekday Afternoon → **Live now** (bright + yellow hand)
- The other three stay visible but **dimmer**

So you always see the full plan, but your eye knows **where you are right now**.

### What the colors mean (defaults)

- Purple → Sleep  
- Teal → Workout  
- Green → Fresh / Office  
- Orange → Relax / Music / Reading  
- Brown → Walk / Bike  
- Red → Dinner  

### Tap a slice

Opens a small form so you can change:

- Name (e.g. “Office” → “Deep work”)
- Start / end time
- Color
- XP you get for checking in

### Check-In button

Appears on the **live** clock’s current activity.  
Tap it once per day for that block → XP pops up.

---

## Top bar (your character sheet)

- **LIFE RPG** + your name / title  
- **Level** — goes up as Total XP grows  
- **Rank** — title band (e.g. Apprentice at level 6)  
- **Available XP** — what you can still spend in the shop  
- **Today** — XP earned since midnight  
- **Login streak** — days in a row you opened the app  
- Green **XP bar** — how close you are to the next level  

### Essential vs Full RPG toggle

- **Essential** = calm mode: only “what am I doing now?” + top 3 quests  
- **Full RPG** = all clocks, tabs, shop, habits, scores  

Flip this anytime if the full dashboard feels heavy.

---

## Bottom menu (Full mode)

| Tab | Plain meaning |
|-----|----------------|
| **Wheels** | The four clocks + today’s quests + life radar |
| **Quests** | Today’s checklist (workout, water, LeetCode…) |
| **Habits** | Month-style habit ticks (streak counters) |
| **Shop** | Trade XP for real rewards |
| **Stats** | Life scores, achievements, reset button |

---

## Daily Quests

Like side missions for today.

- Tap the empty box → mark done → **instant XP**  
- Tap again → undo (XP removed)  
- **+ Add** → invent your own quest  
- Tomorrow morning, quests reset to unchecked (your history/XP stays)

Difficulties roughly mean: Easy ~15 XP, Medium ~25, Hard ~40, Legendary ~75.

---

## Habits

Longer-term chains (wake early, read, no junk food…).

- Tick today’s box → +10 XP and streak goes up  
- Miss a day → streak can fall  
- “Bronze / Silver / Gold…” is just a fun label for how long the streak is

---

## Life Scores (spider web chart)

Eight dials for how life feels this week (0–10):

Mood · Energy · Health · Learning · Finance · Social · Career · Discipline  

Slide them honestly. The center shape grows when scores are balanced.  
This does **not** auto-earn XP — it’s a mirror, not a grind.

---

## Rewards Shop

You earned the XP — now spend it on life.

1. Pick something (Favorite Snack 250 XP, Movie Night 500…).  
2. Tap **Redeem** if you have enough Available XP.  
3. XP is deducted; a little log remembers when you redeemed.

You can also **Add** a custom reward (e.g. “Buy that mechanical keyboard”).

---

## Achievements

Tiny trophies for milestones (first quest, 7-day login…).  
They unlock automatically and dump bonus XP when you hit the target.

---

## Sign in / cloud sync (like Road to December)

Same vibe as https://singhsangam.github.io/career-switch-os/

1. **Create ID** once (e.g. `sangam` + a password you invent).  
2. On phone: open the app → **Sign in** with the same ID.  
3. Pill shows **Synced**.  
4. Change something on laptop → wait a second (or tap **Sync now**) → phone sees it.

You can skip sign-in and stay local-only.

### One-time setup (for cloud)

1. Use the **same Supabase project** as Career Switch OS.  
2. In Supabase → SQL Editor, run `supabase/life_rpg_sync.sql` (this app).  
3. Put the same two keys in a `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

4. Restart `npm run dev` (or rebuild if hosted).

Life RPG saves live in a **separate table**, so they won’t wipe your NeetCode / Road to December progress.

---

## Suggested daily loop (keep it light)

1. Open app → notice which clock is **Live**.  
2. Tap **Check-In** when you start/finish that block.  
3. Knock out a few **Quests** / **Habits**.  
4. Once a week, nudge **Life Scores**.  
5. When Available XP feels juicy, **Redeem** a reward you actually want.

If that feels like too much: switch to **Essential** and only do step 1–3.

---

## Troubleshooting

| Problem | Try this |
|---------|----------|
| Progress vanished on new phone | Sign in with the same ID |
| “Cloud keys missing” | Add `.env` keys and restart |
| Sync error about `life_rpg_` | Run `life_rpg_sync.sql` in Supabase |
| Wrong clock highlighted | Check device time; AM/PM follows your phone clock |
| Accidentally ruined data | Stats → Reset all data (starts from sheet defaults) |

---

## Mental model cheat-sheet

- **Clocks** = your planned day  
- **Check-In / Quests / Habits** = how you “play” today  
- **XP / Level / Rank** = scoreboard  
- **Shop** = real-world loot  
- **Sync** = same character on every device  

You’re not failing if you miss a slice. The game is built for **coming back**, not for perfection.
