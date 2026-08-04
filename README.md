# LeadMaster Live Viewer

A minimal Next.js 14 app that queries your Supabase database directly,
live, in the browser. Two pages: a dashboard (KPI stats + classification
gap + tonight's pipeline breakdown) and a browse page (search/filter/paginate
across all 122,497 companies).

Verified: `npm run build` compiles clean (types, both pages, all logic) —
the only thing not testable in the environment this was built in was the
actual Google Fonts fetch, which needs real internet access your machine
already has.

## Exact steps

**1. Run the RLS fix first, in the Supabase SQL editor** — `rls_fix.sql`
in this folder. Without this, the anon key can't read `companies_v2` at
all (no policy currently exists), and the app will show empty data.

**2. Get your Supabase URL and anon key**
Supabase dashboard -> your project -> Settings -> API.
Copy the "Project URL" and the "anon / public" key (not `service_role`).

**3. Set up the environment**
```bash
cp .env.local.example .env.local
```
Paste the URL and anon key into `.env.local`.

**4. Install and run locally**
```bash
npm install
npm run dev
```
Open http://localhost:3000 — you should see live numbers pulled straight
from your database.

**5. Deploy it properly (optional, recommended)**
Since your main app already lives on Vercel, this is the natural home:
```bash
npm install -g vercel   # if you don't have it
vercel
```
Follow the prompts, then add the same two env vars in the Vercel project
dashboard (Settings -> Environment Variables) before the first real deploy.
This gives you a real URL you (or anyone on the team) can check from a
phone, not just localhost.

## What's actually safe here

The anon key is meant to be public — Supabase is designed around that,
same as how your production app already exposes it client-side. `rls_fix.sql`
grants that key read-only access. There is no write path in this app at
all — nothing here can modify your data, on purpose.
