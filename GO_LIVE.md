# Ready to Study launch plan

Poster restoration verified (26 October 2026): the owner reattached the Canada
and Italy posters. The supplied PNG bytes are now included as
`public/images/poster-canada.png` (1407 × 1760) and
`public/images/poster-italy.png` (1368 × 1824). Both destination profiles reference
these assets. Full-image display preserves their proportions in the country
pages, destination desk and comparison panel; comparison headings no longer
cover the posters. Country pages include links to the full original images.
The admin country editor exposes **Image display → Show full poster**, and CMS
saves retain that choice. Existing photo layouts continue using their fill mode.
31 unit tests, TypeScript, ESLint and the production build passed. Live Chrome
checks passed both countries at desktop/mobile sizes on all three displays,
including full-image links and no horizontal overflow. Downloaded production
PNG hashes match the owner's supplied images exactly. These checks used public
pages without modifying production accounts or enquiries.

Domain migration deployed (26 October 2026): the owner purchased
`readytostudy.org` and saved the Hostinger DNS records and Cloudflare Turnstile
hostname. Both new hostnames are attached to the existing Vercel project, with a
valid HTTPS certificate. Google Public DNS resolves the saved records, and the
new website returns HTTP 200. Vercel reports the domain correctly configured.
Some DNS resolvers initially cached NXDOMAIN from before registration; the owner
reported that error on their current network. After monitoring the cache expiry,
the current Wi-Fi DNS server returned the correct records. A fresh real Chrome
session using normal DNS settings and no hostname override passed the home page,
HTTPS, root redirect, login page, old-domain path/query redirect and enquiry login
gate. The owner subsequently confirmed: "The website opens and the AI replies."
Public access, existing-account login and a real chatbot reply on `.org` are now
confirmed by the owner. The domain migration and its live chat acceptance check
are complete.
Registry status has no hold, and both Google and Cloudflare DNS-over-HTTPS
return the correct records. The current computer's Wi-Fi DNS server still
returned NXDOMAIN with a negative-cache TTL of 521 seconds at the diagnostic
check. Clearing the local macOS lookup cache alone did not change that upstream
answer. The upstream cache subsequently expired and refreshed normally. Raw
macOS programmatic hostname lookups still retained an older negative result
during the final check, while fresh Chrome's normal lookups succeeded. No
additional Hostinger record changes were needed for this cache expiry.

The release uses `https://www.readytostudy.org` for metadata, structured data,
the sitemap, robots and email website links. Production `APP_ORIGIN` and
`SITE_DOMAIN` use the new hostname. `readytostudy.org`, `readytosudy.com`,
`www.readytosudy.com` and `readytostudy.vercel.app` all redirect with HTTP 308 to
`www.readytostudy.org`; path and query preservation were verified.

The existing Neon database, owner administrator, account records, content and
account histories are retained. A temporary student created on the old domain
logged in on `.org` with the same ID, saved preferences and private history.
Wrong-password rejection, secure session cookies, logout/session revocation and
student/admin separation passed. A real Chrome check passed login, saved history,
the signed-in enquiry form and loading the Turnstile frame without invalid-domain
errors. Browser verification used the published Vercel IP while local DNS caches
refreshed; TLS verification remained enabled. The temporary account and its
sessions/history were removed. No enquiry or chatbot message was sent by those
browser checks.

31 unit tests, TypeScript, ESLint and production builds passed. Home, login,
signup, contact, events, Canada, Italy, Course Finder, sitemap and robots returned
HTTP 200 on the new hostname. The chat status endpoint is available; Google,
Resend and Tavily activation still require their previously documented keys.
Mailboxes remain the confirmed `.com.au` addresses; creating `.org` mailboxes or
changing account email addresses is a separate step. Existing session cookies
are host-only, so returning visitors log in again using their existing account.

The initial staged release was `dpl_9XfvQ4nwXgWjgiAwJAZXGDonoKPx`. After a manual
alias assignment, Vercel's promotion endpoint reported it already current while
the project pointer still referenced the previous release. Redeploying that
tested source with the saved production settings resolved the mismatch. The
final deployment is READY/PROMOTED, with aliases assigned and no alias error.

The source now includes Canada and Italy, student/admin login, password recovery,
country/course/event editing, a protected enquiry inbox and transactional email.
Current activation status (26 October 2026): the updated site is deployed and
served at **https://www.readytostudy.org**, with owner-confirmed access and AI chat.
The owner purchased the domains through Hostinger. The old website redirects to
the new address. The original application-flow validation below predates the
domain move; the migration-specific checks are recorded above.

Production deployment: `dpl_5NhZqn4PYezTvG9FJwvgzqr4MU7T`
Deployment URL: https://readytostudy-7txnn2olk-sn-the-aim-aster.vercel.app
Previous production: `dpl_GV3zWKFYxRzHdN5Lh81Y6MJ7mpnH` (the completed `.org` migration).
Validation: 31 unit tests, 12 browser tests, TypeScript, ESLint and the production
build passed. The built candidate returned an anonymous account response and
rejected anonymous history requests before promotion. On the public domain,
actual browser tests passed for student/admin signup and login, wrong passwords,
duplicate signup, secure cookies, logout/session revocation, role/origin guards,
cloud study-plan persistence, idempotent commands and private history. A signed-in
test enquiry produced a reference, appeared in history, and reflected an admin's
follow-up status update. Email sending was disabled, so no emails were sent.
Both exact temporary test accounts, their sessions, enquiry and history were
removed after verification. Email-provider and university-search tests remain pending.
The owner subsequently saved GROQ_API_KEY, both Turnstile keys and
ADVISOR_ENABLED in Production. Redeploying the existing source activated the chat
status endpoint. A fresh live signup and anonymous API protection passed.
The owner completed Turnstile and confirmed a real AI reply. A subsequent
read-only production check verified the completed provider response, recorded
usage, and an identical reply saved in that account's private history. The
automated browser required the manual checkbox step; production security stayed
enabled. Each exact temporary test account and its sessions/history were removed.

The existing Neon database `readytostudy-production` is on the Free plan,
connected to the Production environment, and its connection and application tables
have been verified. Vercel Pro is active. `APP_ORIGIN` and `SITE_DOMAIN` use
`www.readytostudy.org`; metadata, the sitemap and structured data use this hostname.

Automatic email delivery and password recovery still require Resend activation.
The previously confirmed contact@readytostudy.com.au and info@readytostudy.com.au
addresses are retained until the owner supplies different mailbox addresses.
The AI advisor has Groq/Turnstile configuration and is enabled. Its real
reply/history check passed after the owner completed the security step.
TAVILY_API_KEY is not configured, so university web search remains off. The
original Canada and Italy posters are now included and verified live.

The earlier preview remains available at
https://readytostudy-ludmm8jo2-sn-the-aim-aster.vercel.app and does not share the
production database. No domain was purchased by the agent.

Hostinger website DNS records:

| Type | Name | Vercel target |
| --- | --- | --- |
| A | `@` | `216.150.1.1` |
| CNAME | `www` | `0b867afc7302e29f.vercel-dns-017.com` |

Keep the existing email DNS records when maintaining these website records.

## Architecture

Keep the existing Next.js app on its linked Vercel project. Use one private
PostgreSQL database for application data, and Resend for transactional email.
Use separate production and preview databases and email credentials.

```mermaid
flowchart LR
  Visitor[Visitor] --> Form[Contact form]
  Form --> API[Next.js API: validate and rate limit]
  API --> DB[(Private PostgreSQL)]
  DB --> Inbox[Protected admin inbox]
  API --> Email[Resend]
  Email --> Team[contact@readytostudy.com.au]
  Email --> Confirmation[Visitor confirmation]
  Owner[Administrator] --> CMS[Countries, courses, events]
  CMS --> DB
  DB --> Public[Public site]
```

Neon supports connecting an existing account or provisioning through Vercel.
Use the appropriate [Neon/Vercel integration](https://neon.com/docs/guides/vercel-overview).
No additional backend service is needed for this launch.

## Database and storage

`lib/persistent-data.ts` creates the application tables on first connection.
`deployment/schema.sql` contains the equivalent SQL for a manual setup. The
database role needs permission to create these tables on initial startup.

| Table / record | Contents |
| --- | --- |
| `rts_documents`: `users` | Names, email addresses, roles, optional salted password hashes, Google subject IDs, verified Google email timestamps, reset tokens and password versions |
| `rts_documents`: `google-signins` | Hashed browser bindings and nonces, safe return paths and ten-minute expiry for Google authentication |
| `rts_documents`: `sessions` | Expiring server-side sessions, linked to account/password version |
| `rts_documents`: `destinations` | Versioned country catalogue, images, summaries and study support |
| `rts_documents`: `courses` | Admin-reviewed courses used by the finder |
| `rts_documents`: `events` | Draft, upcoming, past and offer entries, images and review status |
| `rts_documents`: `contact-enquiries` | Full form submissions, consent, references, follow-up status and independent notification attempts |
| `rts_documents`: `rate-*` | Expiring counters for login, signup, recovery and enquiries |
| `rts_documents`: advisor records | Existing advisor quotas, receipts and cached sources |
| `rts_documents`: `account-<user-id>` | Private cloud study plan and paginated activity history, including saved advisor exchanges |
| `rts_uploads` | Uploaded image bytes, MIME types and unique filenames |

All access goes through server code; the database URL is never exposed in the
browser. Transactional advisory locks protect document updates across Vercel
instances. The original five-country catalogue is read compatibly, with Canada
and Italy added; the next admin save upgrades its format and preserves subsequent
deletions. Existing accounts remain compatible.

This document model suits an initial small consultancy site. It reads whole
collections and serializes writes to each collection; it is not an unlimited
scale CRM. Split users, sessions, enquiries and notifications into indexed rows
when collection size or write contention warrants it. Move images to object
storage if image volume grows. Back up the database, restrict access to the app
and owner, and test a restore before launch. Agree a retention period for enquiry
and account records; automatic retention deletion is not implemented. The admin
inbox currently shows the most recent 100 enquiries, while older records remain
in storage.

## Login and administration

- `/signup` creates a student account, or an admin account with the private invite.
- `/login` routes administrators to `/admin` and students to `/student`.
- `/forgot-password` emails a recovery link from the configured sender.
- Reset links expire after 30 minutes, are single-use, and invalidate existing
  sessions. Tokens are stored hashed and are passed in the link fragment to avoid
  appearing in normal HTTP request logs. Passwords are salted and hashed.
- Sessions use HTTP-only cookies, SameSite protection and Secure in production.
  Mutations check the origin. Login, signup, recovery and enquiry limits persist.
- Every admin API checks the session and role; hiding a button is not the access
  control. Production always requires the private admin invite for admin signup.
- Password accounts do not yet include email verification or MFA. Google
  registration requires Google's verified email claim. Signed-in study plans
  sync through the database; anonymous browsing preferences stay on the device.
  Guest preferences are not automatically imported into an account on a shared device.
  Document checklist completion is stored, not document files.
- `/student/history` and its APIs require a session and select only the current
  account. History includes account creation/login/logout/password resets, study
  preferences, saved/removed courses, budgets, checklist changes, signed-in page
  visits, enquiries/status changes, advisor questions/replies/sources and admin saves.
  Browser paths are recorded without query strings. Anonymous visits are not logged
  to a personal account. Forms save submitted enquiries, not unfinished drafts.
- Study commands and their history entries are saved atomically in each account
  document. Stable action IDs prevent retries from toggling or logging twice.
  Failed cloud saves show an error and Retry saving; unsaved changes do not survive
  a closed tab. Separate devices apply commands against current saved state.
- History starts with this release; it cannot reconstruct earlier activity.
  History is retained until an owner-approved retention/deletion workflow is added.
  Pagination limits responses to 30 activities; records are retained in the database.
  As histories grow, migrate activities into indexed rows instead of whole documents.

The owner requested administrator access for `contact@readytostudy.com.au`. That
account is provisioned and its browser login, dashboard and protected API were
verified. Its generated password is in a private local handoff file, outside the
application source and deployment. No password or invite is included in this guide.
Use `/login` with the administrator email and password; the role sends it to `/admin`.

### Google registration and sign-in

Google Identity Services is implemented on both `/signup` and `/login`. Activate
it by setting the public Web OAuth client ID as `GOOGLE_CLIENT_ID` in Vercel
Production and redeploying. The Google button appears only after that setting
is available; normal password accounts continue to work without it.
Current status: the code is deployed and local Google browser/verification checks
passed. Production has no GOOGLE_CLIENT_ID, so Google activation and real consent
remain pending. The public home/login/signup pages, active chatbot and owner admin
browser login/API passed verification after publication. Verification sessions
were signed out; the owner's account remains available.

1. In the owner's [Google Auth Platform](https://console.cloud.google.com/auth/clients),
   create/select a project, configure branding and audience, and create an OAuth
   client with application type **Web application**.
2. Set **Authorized JavaScript origins** to `https://www.readytostudy.org` and
   `https://readytostudy.org`. For local development use separate client credentials
   and explicitly register localhost origins.
3. Copy the client ID ending in `.apps.googleusercontent.com` to `GOOGLE_CLIENT_ID`.
   This integration uses Google's popup JavaScript callback. It requires no client
   secret, redirect URI, Google API access tokens or Gmail/Drive permissions.
4. Follow Google's audience/publishing requirements for public users; while the
   app is in Testing, use the configured test users as required by Google.
5. Redeploy and test with a real Google account, including the consent popup,
   return to the original contact/course page, logout/login and My history.

The server verifies RS256 signatures against Google's rotating public keys,
issuer, intended audience/authorized party, issue/expiry times, verified email
and a one-use nonce tied to an HTTP-only browser cookie. Both endpoints enforce
same-origin requests, bounded JSON and persistent rate limits. Tokens and profile
claims are never accepted as a client-supplied role. Google tokens are not stored.
Google's stable subject identifies returning accounts; they retain their account
ID, saved plan and history. New Google registrations are students. Existing
password accounts, including administrators, are not automatically merged by email;
they must use their existing password. Explicit account linking is not implemented.
Google-only accounts use Google for recovery; password-reset mail targets password
accounts. Local tests use an isolated SDK and signed test identities; a real
Google consent test remains required after client activation.

See [Google's setup guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

In `/admin`, countries and courses have their existing editors. Events now have
an editor with poster uploads, summaries, dates/timezones, locations, partners,
offer terms and status. Only active, reviewed, non-draft events appear publicly.
Save the catalogue after edits. Country changes feed the homepage, destination
pages, contact form, course finder and comparison selector. Newly added countries
can have no reviewed courses until the administrator adds them. AI university
search has a curated domain list; extending the country catalogue does not
automatically extend that list. Canada and Italy now have initial official domains.

## What happens when someone fills in the form

1. The visitor logs in or signs up. Public country/course pages remain open, but
   the enquiry form and submission API require a valid session. The server assigns
   account ownership; clients cannot select another user's history.
   The server validates the fields, destination, email, date of birth and consent.
   Request size, origin and persistent attempt limits are checked.
2. The enquiry and its notification state are saved first. The browser supplies a
   stable submission ID to avoid duplicate enquiries when retrying a request.
3. The business receives a new-enquiry email at **contact@readytostudy.com.au**.
   It contains the submitted details and a link to `/admin#enquiries`. Clicking
   Reply addresses the prospective student.
4. The visitor receives an acknowledgement from
   **Ready to Study <info@readytostudy.com.au>**, with their enquiry reference and
   next steps. Replies go to **contact@readytostudy.com.au**.
5. The website displays the reference and reports whether the confirmation was
   accepted by the provider. It does not claim an email was sent when email setup
   is missing or sending failed.
6. The administrator can log in, review contact details and consent, and mark the
   enquiry New, Contacted or Closed. They reply from their normal mailbox.

The business inbox and the admin page both provide access to submissions. The
visitor sees their own reference, follow-up status and confirmation state in
My account → My history. Sending a confirmation does not verify an account.
Older anonymous enquiries stay in the admin inbox and are not linked by email
alone to a newly created account.

Email channels are independent: a failed visitor email does not block the
business notification. Attempts and failures remain visible in the admin inbox.
**Retry pending emails** skips notifications already accepted by the provider.
Resend idempotency keys protect repeat requests for 24 hours; see
[Resend's idempotency documentation](https://resend.com/docs/dashboard/emails/idempotency-keys).
An optional `CONTACT_WEBHOOK_URL` is also supported with a timeout.

There is no background retry worker in this version. If a process stops after
saving a submission, the inbox retains it; an admin can retry after the one-minute
send lease expires. Provider acceptance is not an inbox-delivery receipt; use the
Resend dashboard to inspect bounces. A provider request accepted but not persisted
locally could be resent after Resend's 24-hour deduplication window. A later
automated worker should use the same persisted states and a provider event webhook.

## Required production configuration

Set these in [Vercel environment variables](https://vercel.com/docs/environment-variables),
then deploy a new version. Keep all keys server-side.

| Variable | Production value |
| --- | --- |
| `DATABASE_URL` | Production PostgreSQL connection string; use the provider's SSL-enabled URL |
| `APP_ORIGIN` | `https://www.readytostudy.org` |
| `SITE_DOMAIN` | `www.readytostudy.org` |
| `APP_SECRET` | Independent random secret of at least 32 characters |
| `ADMIN_INVITE_CODE` | Another independent random secret of at least 32 characters |
| `RESEND_API_KEY` | Client-owned Resend API key with sending permission |
| `EMAIL_FROM` | `Ready to Study <info@readytostudy.com.au>` |
| `EMAIL_REPLY_TO` | `contact@readytostudy.com.au` |
| `CONTACT_NOTIFICATION_EMAIL` | `contact@readytostudy.com.au` |
| `CONTACT_WEBHOOK_URL` | Optional approved CRM endpoint; otherwise blank |

Generate independent secrets with `openssl rand -hex 32`. Do not reuse development
test credentials. On Vercel, do not use local JSON files or `/tmp` as the database.

Before sending, add and verify `readytostudy.com.au` in Resend and install the DNS
records it requests; follow [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction).
Keep existing mailbox MX records intact. Resend sending does not create hosted
mailboxes: the client must already have a working mailbox or alias for contact@
and info@. Test both receiving and replying. Configure the canonical website
redirect so browser requests and `APP_ORIGIN` use the same origin.

The AI advisor is optional. To activate it, create a Groq API key and a Cloudflare
Turnstile widget for `www.readytostudy.org` (also add `readytostudy.org` if required
by your widget configuration). In Vercel → readytostudy → Settings → Environment
Variables → Production, set `GROQ_API_KEY`, `TURNSTILE_SITE_KEY`, and
`TURNSTILE_SECRET_KEY`. Add `TAVILY_API_KEY` for live university web searches.
Keep all secret keys server-side. Set `ADVISOR_ENABLED=true` and redeploy, then
test a signed-in chat, a search, saved conversation history and the quota counters.
Use the chat bubble or Course Finder → Your course advisor. Conversations restore
after login/reload and full exchanges remain in My history. Public browsing and
ordinary enquiries work independently of the advisor. Leave it disabled until
real provider and Turnstile checks pass; see `DELIVERY.md` for the quota policy.

The storage writer now uses the driver's native JSON parameter to avoid double
encoding JSONB. Existing encoded records are read compatibly and converted on
their next normal mutation; existing accounts are preserved. A temporary record
in the production database verified native JSONB roundtrips and concurrent writes,
then was removed. No schema or destructive data migration is needed.

## Final activation sequence

1. Connect the client-owned database and email account; confirm backups and DNS.
2. Add the environment variables above in Production and deploy the reviewed code.
3. Create the owner's admin account with the invite. Keep the invite private.
4. Open Admin → Launch configuration. Check the database and all setup indicators.
   Indicators check configuration, not successful email domain verification.
5. The original Canada/Italy posters are included. For future changes, use the
   country image uploader and select **Image display → Show full poster** to
   preserve the whole artwork. Save changes after uploading.
6. Review country descriptions, Canada 2027 intake wording, Italy scholarship
   eligibility/terms, course records, event dates and the correct Bangladesh phone
   number. The two supplied posters have different Bangladesh phone numbers;
   the existing site number is retained pending confirmation.
7. Submit a real test enquiry. Confirm its reference in `/admin`, business email
   at contact@ and visitor confirmation from info@. Test Reply from both messages.
8. Test student/admin signup, logout, login and a real password reset. Confirm a
   student cannot access admin content. Test countries/events on desktop and mobile.
9. Confirm privacy/retention wording, client content approval, and a backup restore.
   Activate optional AI only after its separate provider and Turnstile checks.
10. Point the public domain at the tested deployment and complete the same smoke
    check on the canonical domain. Retain the previous deployment for rollback.

## Local validation

```sh
npm test
npx tsc --noEmit
npm run test:e2e
npm run build
```

The browser suite uses isolated temporary storage and mocked email/AI providers.
It validates application flows, not real PostgreSQL connectivity or email delivery.
