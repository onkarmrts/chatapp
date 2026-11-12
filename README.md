# Random Chat (Next.js + Supabase)

Anonymous 1-on-1 text chat for India. Guest mode, queue-based matching, report/block, India-only gate.
Payments are intentionally not included yet.

## Setup

1. `npm install`
2. Create a Supabase project (Mumbai region). In **Authentication > Providers**, enable **Anonymous sign-ins**.
   For Google login, enable Google and turn on **manual linking**.
3. Run `supabase/migrations/0001_init.sql`, then `0002_functions.sql` in the SQL editor.
4. Copy `.env.example` to `.env.local` and fill in your keys.
5. `npm run dev` and open two browser windows (one normal, one incognito) to test matching.

## Structure

```
app/                 pages and API routes (chat screen is app/page.tsx)
components/          UI: Landing, Searching, ChatScreen, sheets, MoodBackground
lib/chat/            zustand store + chat engine (matchmaking, realtime, report/block)
lib/supabase/        browser, server and admin clients
lib/moderation.ts    message filter (links, phone numbers, UPI IDs)
lib/mood.ts          per-room colour mood
lib/config.ts        app name, limits, languages, feature flags
middleware.ts        India-only gate (Vercel geo header)
supabase/migrations/ schema + matchmaking functions
```

## Before launch

- Add cleanup for stale queue rows: enable `pg_cron` and uncomment the job at the bottom of `0002_functions.sql`.
- Room channels are public by name. Turn on Supabase Realtime Authorization and add RLS on `realtime.messages` so only the two room members can join.
- Add Cloudflare Turnstile to guest sign-in and rate limiting on `join_queue`.
- Replace the legal placeholder pages with lawyer-reviewed text.
- Set `ALLOW_ALL_COUNTRIES=false` in production.

## Adding payments later

`profiles.pro_until` and `is_pro()` already exist. A payment webhook only needs to set `pro_until`.
Then set `free_daily_limit` in `join_queue` and flip `features.lockFiltersBehindPro` in `lib/config.ts`.
