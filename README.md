# Ready to Study

**Live deployment:** https://www.readytostudy.org

**Source repository:** https://github.com/SN1604129/readytostudy


Next.js website for Ready to Study Education Services, with destination pages,
course selection, student/admin portals and an AI course advisor.

**Start with [DELIVERY.md](DELIVERY.md)** for accounts, costs in BDT, environment
variables, production deployment and the client acceptance checklist.

**[GO_LIVE.md](GO_LIVE.md)** covers the backend/database plan, country and event
administration, login/recovery, enquiry email flow and remaining launch steps.

## Run locally

Use **Node.js 24 LTS** (the quota store uses built-in SQLite).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Preserve any existing populated `.env.local` rather than overwriting it. To enable
chat, set `ADVISOR_ENABLED=true` and `GROQ_API_KEY`. Add `TAVILY_API_KEY` for official
university web searches. Leave `APP_ORIGIN` and the production-only storage/proxy
settings empty for localhost, as described in the delivery guide.

Without keys, the site and reviewed course list work; the advisor explains that
chat is unavailable and links to a counsellor. No paid fallback is configured.

## Features

- Four-question course finder with exact preference matching.
- A shared advisor conversation on the results page and floating widget.
- English/Bangla/Banglish AI replies, supplied by Groq.
- Tavily basic searches restricted to selected official university domains.
- Original source links, 24-hour public search cache and per-account/site limits.
- Server-side Turnstile checks in production and persistent atomic quota counters.
- Admin course review controls and an advisor usage dashboard.
- Existing destination CMS, contact inbox, saved study plan and planning tools.
- Canada and Italy destination profiles with the supplied original posters,
  full-image display controls and a versioned country catalogue.
- Event/offer CMS with drafts, review controls and poster uploads.
- Business notification and visitor confirmation emails, saved attempt status
  and admin retries; requires a configured Resend account and verified domain.
- Single-use, expiring password recovery and persistent auth/contact limits.
- Google registration/sign-in through Google Identity Services, enabled by
  `GOOGLE_CLIENT_ID`; new Google users get student accounts and sign-in history.
- Login required for enquiries and the advisor, with public country/course browsing.
- Account-synced study plans and private history at `/student/history`: enquiries,
  follow-up statuses, advisor exchanges, saved courses, budgets and checklist actions.

The starter course list contains unverified examples. Admins must review entries
and enable **Reviewed and ready to recommend** before they appear in the finder
or AI context. Web results are discovery links, not verified admission offers or
an exhaustive course directory.

## Storage and hosting

Vercel uses a shared PostgreSQL database through `DATABASE_URL` (or `POSTGRES_URL`).
Connect a Neon database in the Vercel Marketplace. Accounts, sessions, CMS content,
enquiries, image uploads, personal study plans/history, AI receipts and quotas all
persist in that database. Histories are isolated by the authenticated account;
client-supplied account IDs are not used for access.
Transactional advisory locks serialize document changes and quota reservations
across function instances. No account files or secrets are bundled in deployments.

Alternatively, deploy **one persistent Node.js server**, using Docker/Caddy or VPS
hosting. With no database URL, configure `RTS_DATA_DIR`; it contains:

- `users.json`, `sessions.json`: existing password accounts and sessions.
- `courses.json`, `destinations.json`: admin-managed catalogue content.
- `contact-enquiries.json`: enquiries visible in the admin inbox.
- `account-<user-id>.json`: each account's study plan and activity history.
- `advisor.sqlite` and SQLite sidecar files: quotas, request receipts and cache.
- `uploads/`: uploaded destination images served through `/uploads/[filename]`.

Set `ADMIN_INVITE_CODE` before production signup; every production administrator
needs it, including the first. Local development allows the first admin without
a code. Password accounts do not currently include email verification.

On Vercel, writes are blocked until the database is connected; data is never saved
in `/tmp`. AI also requires real provider keys and Turnstile configuration. See the
delivery guide for the complete Vercel setup and the alternative VPS deployment.

## Checks

```sh
npm test
npm run lint
npx tsc --noEmit
npm run test:e2e
npm run build
```

Browser tests use a separate temporary data directory and simulated providers.
They use installed Chrome on macOS; otherwise install Chromium with
`npx playwright install chromium`. Test data and credentials are never production
configuration. A real API-key smoke test is required before activating the site.

## Project map

```text
app/api/chat/               Authenticated advisor and public availability
app/api/admin/advisor/      Admin usage/configuration status
components/chat/           Shared conversation, panel, widget and Turnstile
components/course-finder/  Preference questions and reviewed course cards
lib/advisor/               Provider clients, validation, matching and quotas
tests/                     Unit, API and browser checks
deployment/Caddyfile       HTTPS proxy and trusted client IP header
compose.yaml               Single app instance and persistent volume
DELIVERY.md                Activation and handover instructions
```

Contact enquiries are saved in the admin inbox first. With Resend configured,
business notifications go to contact@readytostudy.com.au and visitor confirmations
come from info@readytostudy.com.au. `CONTACT_WEBHOOK_URL` optionally forwards them
to a CRM. The client should review all course facts, service
claims, destination content and photography before final launch.
