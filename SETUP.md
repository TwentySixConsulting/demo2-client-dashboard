# Demo Client Dashboard — Setup

A client-facing fork of [`june-pay-and-benefits-dashboard`](../june-pay-and-benefits-dashboard/), stripped of all marketing surfaces.

After login, the client lands on a single home page — **"What do you want to do today?"** — and chooses **Pay** (→ `/pay` dashboard) or **Benefits** (→ static `/benefits/` app).

## One-time setup

### 1. Supabase user (one-time sign-up)

The login form just asks for a **Username** and a **Password** — the client never sees or types an email. When you first sign the client up, an email is created for them under the hood (`<username>@<emailDomain>`) and stored in Supabase Auth.

For the default config (`emailDomain: "demo.twentysixconsulting.co.uk"`), register the demo user in Supabase Auth once:

- **Email (back-end only):** `demo@demo.twentysixconsulting.co.uk`
- **Password:** `Demo26`

The client then signs in by typing:

- Username: `demo`
- Password: `Demo26`

To onboard another client, either:
- change `clientConfig.auth.emailDomain` and register a new Supabase user, **or**
- keep the domain and add a new Supabase user with email `<username>@<emailDomain>`.

### 2. Environment variables

Create `.env.local` in the project root with:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

### 3. Install / run

`node_modules` is symlinked from `/Users/millieharrison/Dashboard-temp/node_modules` to save disk space. To run a real install:

```bash
rm node_modules
npm install
```

To run the dev server:

```bash
npm run dev
# or, client-only:
npx vite dev --port 5000
```

To build for production (Vercel):

```bash
npx vite build
```

## Per-client config

Edit `client/src/config/clientConfig.ts`:

- `clientName` — shown in the top-left of the home page.
- `benefitsEnabled` — set `false` to grey out the Benefits card.
- `auth.emailDomain` — the synthetic domain used to map the client name to a Supabase email.

## Architecture notes

- `client/src/components/AuthGate.tsx` wraps the routed app and renders `LoginPage` whenever `user` is null.
- `client/src/pages/Home.tsx` is the post-login landing — two `ChoiceCard`s.
- `client/public/benefits/index.html` is the unchanged static Benefits app inherited from `pengechurchesv3`.
- `vercel.json` keeps the `/((?!benefits/).*)` rewrite so `/benefits/*` is served as static.
- The internal `/report/draft` route (admin report builder) bypasses the AuthGate.
