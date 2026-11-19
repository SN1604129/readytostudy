# Ready to Study — delivery and activation

For the current backend, login/recovery, country/event CMS and email activation
plan, read [GO_LIVE.md](GO_LIVE.md). It supersedes the original contact delivery
notes below.

The course advisor is implemented in this source package. It uses Groq for chat,
Tavily for university web searches, and persistent transactional counters to stop usage
at the free-plan limits. No Anthropic or Google paid fallback is used.

**Activation still requires your own API keys, a production domain, and persistent
storage. Local tests use simulated provider responses, not a live provider account.**

## What to get today

Create the accounts under your client's email so they retain ownership:

| Item | What to choose | Cost |
| --- | --- | --- |
| Groq | Free plan; create an API key at https://console.groq.com/keys | ৳0 within provider limits |
| Tavily | Researcher/free plan at https://app.tavily.com/; leave pay-as-you-go off | ৳0; 1,000 credits/month |
| Cloudflare Turnstile | Free managed widget, with your website hostname | ৳0 |
| Hosting | Existing Vercel project with Neon PostgreSQL, or a persistent Node.js server | Hosting/database plan costs are separate |
| Domain | Reuse the client's existing domain and DNS access | No new purchase if already owned |

Do not buy a ChatGPT, Claude or Gemini subscription for this feature. Do not enable
paid Groq/Tavily billing if the agreed API budget is zero. API keys belong only in
the server's environment file; never paste them into the browser or client code.

A DigitalOcean Basic 2 GiB / 1 vCPU VPS is listed at $12/month (about ৳1,488 using
৳124/$1); the 4 GiB / 2 vCPU option is $24 (about ৳2,976) and is more comfortable
for building Next.js directly on the server. The 2 GiB option may need swap during
the build. Prices exclude backups, card conversion and taxes. Existing suitable
hosting avoids another hosting purchase.

Pricing checked October 25, 2026:
- https://www.digitalocean.com/pricing/droplets
- https://docs.tavily.com/documentation/api-credits
- https://console.groq.com/docs/rate-limits
- https://developers.cloudflare.com/turnstile/plans/

## Deploy on Vercel

1. Sign in with `vercel login`; use the existing linked `readytostudy` project.
2. Connect a Neon PostgreSQL database in the Vercel Marketplace and choose its free
   plan where available. Confirm its limits before enabling any paid billing. The
   integration supplies `DATABASE_URL` (or `POSTGRES_URL`). Use separate databases
   or branches for preview and production.
3. Set `APP_SECRET` and `ADMIN_INVITE_CODE` to independent random values of at least
   32 characters in Production environment variables. Keep the admin invite private.
4. Deploy with `vercel --prod`. Public pages and the cashback event work without AI
   keys. Accounts, enquiries, CMS edits and image uploads require the database.
5. To activate AI, add `GROQ_API_KEY`, `TAVILY_API_KEY`, `TURNSTILE_SITE_KEY`,
   `TURNSTILE_SECRET_KEY`, `APP_ORIGIN=https://your-production-hostname`, and
   `ADVISOR_ENABLED=true`. Add that hostname to the Turnstile widget, then redeploy.
   Do not use test keys in Production. Vercel's trusted IP header is selected
   automatically; `RTS_DATA_DIR` is not used on Vercel.
6. Sign up as admin with the configured invite. Review and enable real course
   entries, test contact submission and perform one real AI/search request.

Vercel storage uses private PostgreSQL tables (`rts_documents`, `rts_uploads`).
Transactions protect accounts and quotas across function instances. Uploads are
stored in the database and served through the image route; public site assets stay
in the deployment. At higher image volume, migrate uploads to object storage.
No local accounts, enquiry records, `.env` files or test artifacts are deployed.
Existing production data requires an explicit, reviewed migration; developer test
accounts should not be imported. Set up database backups appropriate to the plan.

The included Docker setup remains available for a single persistent Node.js server;
it uses local JSON files and SQLite when no database URL is configured.

## Activate locally first

1. Install Node.js 24 LTS and run `npm ci`.
2. Copy `.env.example` to `.env.local` without overwriting an existing populated file.
3. Set `ADVISOR_ENABLED=true`, `GROQ_API_KEY`, and `TAVILY_API_KEY`.
4. For localhost, leave `RTS_DATA_DIR`, `APP_ORIGIN`, both Turnstile keys, and
   `ADVISOR_TRUSTED_IP_HEADER` empty. Local development bypasses Turnstile only
   when no secret is configured. Production requires Turnstile.
5. Run `npm run dev`; create a student account, complete the four questions, and
   use **Search universities**. Check actual answers in English and Bangla.
6. The default model is `qwen/qwen3.8-27b` (currently a preview model). Check that
   your Groq account offers it and inspect the account's exact free limits. A model
   change requires a smoke test and checking its reasoning settings and limits;
   the app never switches models automatically.

## Deploy with the included Docker configuration

1. Use an Ubuntu VPS with Docker Engine and the Docker Compose plugin. Allow inbound
   ports 80/443 and your restricted SSH port; do not expose port 3000.
2. Point the domain's DNS A record to the VPS. Remove an obsolete AAAA record if the
   VPS has no working IPv6. Start with DNS-only mode if using Cloudflare DNS so the
   included proxy sees each client's actual IP.
3. Upload the project, excluding `node_modules`, `.next`, local `.env` files, test
   artifacts, and personal `data` records.
4. Copy `.env.example` to `.env.production` on the server. Fill in:
   - `SITE_DOMAIN=your.actual.hostname` (no scheme)
   - `APP_ORIGIN=https://your.actual.hostname`
   - `ADVISOR_ENABLED=true`
   - `GROQ_API_KEY=...` and `TAVILY_API_KEY=...`
   - `TURNSTILE_SITE_KEY=...` and `TURNSTILE_SECRET_KEY=...`
   - `APP_SECRET=...` and `ADMIN_INVITE_CODE=...`, generated independently using
     `openssl rand -hex 32`.
5. Add the exact production hostname to the Turnstile managed widget. The app
   validates tokens, action and hostname on the server.
6. Run:

   ```sh
   docker compose --env-file .env.production up -d --build
   docker compose --env-file .env.production logs --tail=100 app proxy
   ```

   Caddy obtains HTTPS certificates. The app and proxy share a private Docker
   network. Caddy overwrites `X-Real-IP`; Compose sets the trusted header and
   `RTS_DATA_DIR=/data`. Do not trust client-supplied forwarded IP headers.
7. Sign up as admin using the invite code. Production always requires that code,
   including the first administrator. Never give the code to ordinary students.
8. If existing production records must be migrated, copy them into the persistent
   `/data` volume while the app is stopped. Old images under `public/uploads` need
   copying to `/data/uploads`. Do not migrate developer test accounts.

The Docker configuration is supplied for deployment; it must be tested on the
chosen server with the real domain and credentials. Docker deployment itself was
not performed as part of local implementation.

## Content and final acceptance

- Open Admin → Courses. Review the actual university/course pairings and current
  information, add the official course URL, check **Reviewed and ready to recommend**,
  then save. Existing sample records are deliberately not treated as verified.
- The course finder respects every selected filter. No exact match means no match;
  it does not silently recommend the wrong country or study level.
- Live search is limited to a curated list of official university domains in the
  supported countries, including Canada and Italy. It is not an exhaustive directory or a partnership
  list. Edit `lib/advisor/providers.ts` to extend the approved domains.
- University search results show their original links and snippets. They are not
  certified course records; missing fees or intakes must be checked on the source.
- Test student signup/login and return to the selected course results.
- Complete the real Turnstile challenge, search once, and follow up in chat.
- Confirm the source URLs, displayed remaining allowance, and admin usage counters.
- Test mobile, a provider outage, and the exhausted-allowance message.
- Restart the app and confirm the same account, courses and quotas remain.
- Test contact delivery and both transactional emails. Configure Resend as
  documented in `GO_LIVE.md`; `CONTACT_WEBHOOK_URL` is an optional CRM integration.
- Set up daily VPS/data backups. For the simplest consistent backup, briefly stop
  the app before copying its full data volume (including SQLite files), then start
  it again. Never delete the persistent volume to reset allowances.

## Enforced limits

| Limit | Value |
| --- | --- |
| Per account | 5 AI attempts / rolling 24h |
| Per account fresh search | 1 / rolling 24h |
| Entire site AI attempts | 60 / rolling 24h |
| Entire site fresh search | 25 / rolling 24h |
| Entire site search credits | 900 / rolling 31 days |
| AI token budget | 180,000 / rolling 24h; 7,500 / rolling minute |
| Per network | 15 AI attempts / rolling 24h |
| Per account cooldown | 20 seconds; one request in flight |
| Public search cache | 24 hours |

Limits apply to admins too. A search with an AI summary also consumes an AI reply.
Cached results do not consume another search credit. Failed provider calls retain
their reservation because a timeout does not prove that the provider did not bill
the request. The provider's own smaller limits can stop service earlier. Stored
course browsing and counselling links continue working.

Student sign-in uses the existing password accounts. These are not email-verified
accounts; Turnstile, network limits and the site-wide cap limit abuse. The shared
cap remains effective even if someone creates multiple accounts. API conversation
responses are held with quota receipts; records older than 32 days are cleaned up
on subsequent requests. Public search results expire after 24 hours. Include this processing and Groq/Tavily in the client's
privacy notice. Do not invite students to upload sensitive documents into chat.

## Validation commands

```sh
npm test
npm run lint
npx tsc --noEmit
npm run test:e2e
npm run build
```

Browser tests use a separate temporary data directory and mocked providers. On a
machine without Chrome/Chromium installed, run `npx playwright install chromium`
before browser tests. Live provider validation remains a separate launch step.

## Client handover wording

“Your AI course finder is implemented with course preferences, follow-up chat,
official university web results and controlled free usage. We need to activate
the client-owned API keys and hosting, review the course catalogue, then complete
the live acceptance check. API use stays within configured free allowances;
when a limit is reached, course browsing and counselling remain available.
Hosting and ongoing maintenance are separate.”
