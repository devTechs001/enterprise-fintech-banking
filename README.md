# SecureBank — Enterprise Fintech Banking

A monorepo containing a React banking client, a Node.js/Express banking API, and the
code they share. It implements accounts, transfers, beneficiaries, bill payments,
cards, investments, loans, analytics and a security centre, with a security model
that is documented rather than asserted.

> **This is a demonstration build, not a licensed bank.** No real money moves. In the
> default preview mode every balance is in-memory fiction and no data leaves your
> browser session. There is **no LICENSE file**: no rights are granted, and the
> previous README's claim of an MIT licence was wrong.

---

## Contents

- [Repository layout](#repository-layout)
- [Quick start — preview with no database (recommended first run)](#quick-start--preview-with-no-database-recommended-first-run)
- [Quick start — full stack against PostgreSQL + Redis](#quick-start--full-stack-against-postgresql--redis)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [The client](#the-client)
- [The server](#the-server)
- [Security model](#security-model)
- [Development mode](#development-mode)
- [Testing and verification](#testing-and-verification)
- [Troubleshooting](#troubleshooting)
- [Known limitations and open work](#known-limitations-and-open-work)
- [Provenance](#provenance)
- [Contributing](#contributing)

---

## Repository layout

```
enterprise-fintech-banking/
├── client/                 # React 18 + Vite banking client (the whole UI)
│   ├── mock/               # In-memory mock API, served by a Vite plugin (dev only)
│   ├── public/             # favicon, manifest, app icon, hero/auth imagery
│   └── src/
│       ├── app/            # App, AppProviders, SessionGate (splash retirement)
│       ├── components/     # common / banking / cards / payments / investments /
│       │                   # loans / transfers / security / charts / forms / layout
│       ├── config/env.js   # Single source of truth for dev/prod mode flags
│       ├── context/        # Auth, Toast, Notification, Theme, Sidebar
│       ├── hooks/          # banking + ui hooks
│       ├── pages/          # public SPA, auth, dashboard, and every feature page
│       ├── routes/         # Route table + Auth/Guest guards
│       ├── services/       # Thin API service layer over axios
│       ├── store/          # Redux Toolkit slices + redux-persist (UI state only)
│       └── test/           # vitest suites and jsdom setup
├── server/                 # Express API (ESM), Sequelize/PostgreSQL, Redis
│   ├── scripts/check-server.js   # 57 self-checks, needs no database
│   └── src/                # config, models, services, middleware, api/v1
├── shared/                 # constants, types, utils, validations used by both
├── docs/                   # SECURITY_REVIEW.md, security-review.html, build-report.mjs
├── docker-compose.yml      # PostgreSQL + Redis backing services
└── Makefile                # Convenience targets (see `make help`)
```

Things the previous README claimed that **do not exist**: `docker/`, `.github/`
(CI), `LICENSE`, `scripts/`, `docs/api/swagger.yaml`, `docs/architecture/`,
`docs/deployment/`, and the Bull/Socket.io/Swagger/Stripe/Twilio/Plaid/S3
integrations. Those dependencies were audited out as declared-but-unused; the
directories were never present. See [Known limitations](#known-limitations-and-open-work).

---

## Quick start — preview with no database (recommended first run)

The client ships an in-memory mock API served by a Vite plugin (`apply: 'serve'`),
so the entire product is explorable with **no PostgreSQL, no Redis and no Node
server**. This is the fastest way to see everything work.

```bash
npm install                 # at the repository root — this is an npm workspaces repo
cd client && npm run dev:mock            # http://localhost:5173
```

Sign in with the seeded demo user:

| Field    | Value                  |
|----------|------------------------|
| Email    | `demo@securebank.test` |
| Password | `SecureBank!2026`      |

The account has two-factor authentication enabled, so the sign-in flow stops at an
MFA step. **In this preview mode only**, the current one-time code is shown on that
step (`demoCode`) so you can complete the flow; a real API never returns a code it
just sent, and the UI copy says so. Five wrong passwords lock the account for 15
minutes, exactly as the real server behaves.

Everything is reachable from the sidebar: Dashboard, Accounts, Transfers,
Beneficiaries, Payments, Cards, Investments, Loans, Analytics, Security,
Notifications, Settings and the public Help Centre.

### Installing dependencies

This is an **npm workspaces** repository (`client`, `server`, `shared`), so one
install at the root resolves all three:

```bash
npm install
```

Verified on Node 22.22.3 / npm 10.9.8: 966 packages, exit 0. Installing inside a
single workspace also works (`cd client && npm install`) and resolves against the
same root tree; `setup-and-run.sh` and `make install` wrap the root install.

**If `npm install` dies with `npm error Exit handler never called!`** — that is npm
failing mid-download, and in this repository it had a specific cause: the committed
root `package-lock.json` pinned all 1,563 tarball URLs to `registry.npmmirror.com`,
a mirror that is unreachable from most networks, so every fetch reset and npm
crashed instead of reporting it. The lockfile now resolves against
`registry.npmjs.org`. If you hit the same error, check for a mirror baked into your
lockfile or npm config:

```bash
grep -c 'registry.npmmirror.com' package-lock.json   # must be 0
npm config get registry                              # must be reachable from where you are
```

A second, unrelated cause of the same crash is a `node_modules/` left over from the
old dependency set: npm cannot rename a directory it half-deleted. `make clean`
removes every `node_modules` and `dist`, then install again.

---

## Quick start — full stack against PostgreSQL + Redis

Use this when you want the real API rather than the mock.

**1. Backing services.** `docker-compose.yml` provides PostgreSQL 15 and Redis 7:

```bash
docker-compose up -d postgres redis
```

(Only the two backing services are defined. Earlier revisions of the file also
declared `server` and `client` containers built from `docker/*/Dockerfile`, but
that directory does not exist, so `docker-compose up` failed at build. Container
images for the app are open work — see DEV-12.)

Without Docker, point the server at any PostgreSQL 14+ and Redis 7+ you have.

> **Verification status of this section.** The mock preview, the client build, both
> test suites and all 57 server self-checks were executed and observed. This
> full-stack path was **not**: `docker-compose.yml` is validated as YAML and the
> server is verified by self-checks that deliberately need no database, but the API
> has never been run against a live PostgreSQL in this environment. That gap is
> DEV-6 (end-to-end transfer tests against real PostgreSQL) and it is the reason
> `npm run check` exists.

**2. Server.**

```bash
cd server
npm install
cp .env.example .env        # then edit: DB_*, REDIS_*, JWT_* secrets
npm run check               # 57 self-checks, needs no database — run this first
npm run dev                 # http://localhost:3000  (node --watch)
```

On boot in a non-production environment the server synchronises its Sequelize
schema. **Migrations do not exist yet** (open work, DEV-7); `DB_SYNC_ALTER` defaults
to `false` and throws if set in production, so a production deployment must create
its schema by other means until migrations land.

`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` must be at least 32 characters in
production or the server refuses to start — it previously fell back to literal
secrets published in this repository. Generate them with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**3. Client.**

```bash
cd client
npm install
cp .env.example .env        # VITE_USE_MOCK_API=false, VITE_API_BASE_URL=/api/v1
npm run dev                 # http://localhost:5173
```

`VITE_API_BASE_URL` is a **relative** path on purpose: the browser cannot reach
`http://localhost:3000` when the app is served through a proxy or preview host, and
the Vite dev server proxies `/api` to the backend.

**4. First user.** Register through `/register`, or seed directly against the API.
Registration enforces the password policy (12+ characters, checked against a list of
commonly breached passwords) and returns identical responses for known and unknown
emails, so you cannot probe for accounts.

---

## Environment variables

### Client (`client/.env`, see `client/.env.example`)

| Variable            | Meaning                                              | Default     |
|---------------------|------------------------------------------------------|-------------|
| `VITE_API_BASE_URL` | API prefix; keep relative (`/api/v1`)                | `/api/v1`   |
| `VITE_USE_MOCK_API` | Serve the in-memory mock API. **Dev/preview only**   | `false`     |
| `VITE_ALLOWED_HOSTS`| Comma-separated dev-server hosts, or `true` for any  | unset       |
| `VITE_API_PROXY_TARGET` | Where the dev server proxies `/api` when not mocking | `http://127.0.0.1:3000` |
| `VITE_APP_NAME` / `VITE_APP_VERSION` | Branding strings                  | `SecureBank` / `1.0.0` |

`VITE_USE_MOCK_API` is ANDed with the build mode in `src/config/env.js`: a
production build cannot enable the mock API even if the flag is set, and it logs a
startup error if you try.

### Server (`server/.env`, see `server/.env.example`)

The example file lists exactly the variables `server/src/config/index.js` reads —
grouped as core, database, Redis, JWT, security policy (lockout, rate limits,
password rules, session limits), cookies/CORS/CSP, and email. Notable ones:

| Variable | Meaning |
|----------|---------|
| `DATABASE_URL` or `DB_HOST/PORT/NAME/USER/PASSWORD` | PostgreSQL connection |
| `DB_SYNC_ALTER` | Allow Sequelize `alter` sync. Default `false`; throws in production |
| `REDIS_ENABLED` / `REDIS_HOST` / `REDIS_PORT` | Cache + token blacklist; the server degrades gracefully when off |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | ≥32 chars required in production |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Pinned both ways; tokens are rejected if they disagree |
| `FIELD_ENCRYPTION_KEY` | AES-256-GCM key for card numbers and MFA secrets at rest |
| `CORS_ORIGIN` | Allow-list; not a wildcard |
| `PUBLIC_APP_URL` | Base for email links — never the request `Host` header |
| `MAX_LOGIN_ATTEMPTS` / `LOCKOUT_DURATION_MINUTES` | Lockout policy (5 / 15) |
| `PASSWORD_MIN_LENGTH` | NIST-aligned minimum (12) |
| `EMAIL_PROVIDER` | `log` by default; there is no real mail transport yet (DEV-8) |

Variables for SendGrid, Twilio, Stripe, Plaid and S3 were removed from the example
because the code no longer reads them and the packages are gone.

---

## Scripts

### Root (`package.json`, npm workspaces)

| Command | Effect | Verified |
|---------|--------|----------|
| `npm install` | Install all three workspaces | ✅ 966 packages |
| `npm run build` | Production-build the client (`--workspaces --if-present`; server and shared have no build step) | ✅ |
| `npm test` | Client vitest **and** server self-checks | ✅ 44 + 57 |
| `npm run lint` | ESLint across both workspaces | ✅ 0 errors |
| `npm run dev:client` / `dev:server` | Run one workspace's dev server | client ✅ |
| `npm run dev` | Both at once via `concurrently` (server needs PostgreSQL) | not exercised |
| `npm run format` | Prettier across the repo | not exercised |
| `docker-compose up -d postgres redis` | Backing services (via compose directly) | not exercised |

Corrections to the previous manifest, all of which claimed more than existed:
`build:server` was removed (the server is plain ESM run from source — there is no
bundle step); `docker:build` was removed (no Dockerfiles exist); `build`, `test` and
`lint` now pass `--if-present` because `shared/` defines no scripts; `license` was
`MIT` with no LICENSE file and is now `UNLICENSED`; and `repository.url` pointed at
`your-org/…` instead of this repository. The `dev:all` script other documents
referenced never existed.

### Client

| Command | Effect |
|---------|--------|
| `npm run dev` | Dev server against the real API |
| `npm run dev:mock` | Dev server against the in-memory mock API |
| `npm run build` | Production build to `client/dist` |
| `npm run preview` | Serve the production build |
| `npm test` | vitest suite (44 tests) |
| `npm run lint` | ESLint (0 errors, 591 warnings — see [Lint](#lint)) |

### Server

| Command | Effect |
|---------|--------|
| `npm run dev` | `node --watch src/server.js` |
| `npm start` | `node src/server.js` |
| `npm run check` | **57 self-checks with no database** — the fastest way to validate a change |
| `npm test` | Alias for `npm run check` |
| `npm run test:jest` | Jest, `--passWithNoTests` — the repo has **no server test files** yet (DEV-6) |
| `npm run lint` | ESLint with the server-specific config (0 errors, 8 warnings) |

`npm test` used to invoke Jest against a workspace containing no test files, so it
failed with "No tests found" — a red command that verified nothing. It now runs the
checks that do exist; Jest stays wired up for when DEV-6 lands real suites.

---

## The client

React 18 + Vite, Redux Toolkit for client state, TanStack Query for server state,
React Router, Tailwind, Framer Motion. Charts are hand-rolled SVG rather than a
charting dependency: removing `chart.js` took a rendering library and its XSS
surface out of a banking client, and the four chart types needed did not justify it.

**Dependencies.** The client manifest was audited the same way the server's was:
`socket.io-client` (no socket code exists — notifications poll the REST API),
`react-hot-toast` (the app has its own Toast provider), `date-fns` (dates go through
the local formatters), `uuid` (identifiers come from the API) and a duplicate `husky`
devDependency were all declared and imported by nothing. They are removed, with the
reason recorded in a `//dependency-audit` note inside `client/package.json`.

**Public site (multi-route SPA).** `/`, `/features`, `/trust`, `/pricing`,
`/about`, `/contact` and `/help` are separate routes under a shared
`PublicLayout`, not one long scroll. `/help` is deliberately outside the auth
guard: help is exactly what a locked-out customer needs.

**Authenticated app.** Dashboard (with an "At a glance" overview tab), Accounts,
Transfers, Beneficiaries, Payments (bills, scheduled, history, scan-to-pay), Cards,
Investments, Loans, Analytics, Notifications, Security Centre and Settings.

**State and tokens.** The access token lives in memory only and the refresh token
in an `httpOnly` cookie; redux-persist whitelists UI state alone. A test asserts
`localStorage` never holds a token. 401s refresh through a single-flight mutex, and
session expiry is an event, not a `window.location` hard reload.

**Splash.** `index.html` paints an inline splash before any JavaScript; `SessionGate`
retires it once the session resolves, with a minimum visible time (no glitch-flash)
and an 8-second ceiling (a hung request cannot trap you).

## The server

Express (ESM), Sequelize/PostgreSQL, Redis, Winston. Layered as
`api/v1 → controllers → services → models`, with `middleware/` for auth, RBAC,
validation, rate limiting, request logging and error handling.

Design rules worth knowing before you change it:

- Money moves in **integer minor units**; sufficiency is re-checked server-side in a
  serialisable transaction, and both legs of a reversal are checked.
- Errors are classified operational-vs-unexpected; unexpected errors never leak a
  stack or message, and Sequelize unique-violations do not echo the field name.
- `authenticate` caches briefly but invalidates on change and verifies the session
  still exists, so a revoked session dies within seconds.
- The audit log is append-only; every sensitive action writes to it.

## Security model

The full review — findings, fixes, and the appendix on how a documentation-extraction
bug silently deleted the bcrypt hooks — is in
[`docs/SECURITY_REVIEW.md`](docs/SECURITY_REVIEW.md), with a rendered copy at
[`docs/security-review.html`](docs/security-review.html)
(regenerate with `node docs/build-report.mjs`).

Headlines: bcrypt (12 rounds) with rehash-on-login; AES-256-GCM for card numbers and
MFA secrets; CSPRNG for every token, OTP and generated PAN; opaque single-use
rotating refresh tokens with family revocation on replay; account lockout; TOTP MFA
with hashed single-use recovery codes; session revocation; RBAC + resource-ownership
guards against IDOR; validation on every auth route; 100 kB body limit; layered rate
limits; non-enumerating auth responses with dummy compares; pinned JWT algorithms
with issuer/audience checked both ways; helmet CSP; and graceful shutdown.

Some controls are intentionally visible in the UI rather than hidden: the Security
Centre lists sessions and devices with revoke actions, and `/trust` publishes the
control list in plain language.

## Development mode

`client/src/config/env.js` is the single source of truth for mode flags, and dev
surfaces key off the **build**, not a `.env` string:

- A **DEV MODE** badge ("mock data · no real money") appears on every screen under a
  dev server and links to `/dev`.
- `/dev` is a console showing build/mode flags, session *presence* (never token
  values), and the public + mock endpoint inventory.
- In a production bundle both are tree-shaken out: `/dev` is not in the route table
  and no chunk in `dist/assets` contains the dev console or badge strings (a test
  asserts this).
- The mock API plugin is `apply: 'serve'`, so it exists only under the dev server.

## Testing and verification

```bash
npm run build      # production build of the client (also feeds the check below)
npm test           # 44 client vitest tests (jsdom) + 57 server self-checks
npm run lint       # ESLint, both workspaces: 0 errors
```

or the equivalents: `make build && make test && make lint`. All three were run green
on Node 22.22.3 / npm 10.9.8.

Build before testing on a fresh clone: one test asserts that the production bundle
contains no development-mode code, and it skips (with a warning) when `dist/` is
absent rather than failing a clean checkout. The bundle is 447.99 kB
(129.77 kB gzipped) across six chunks, and `grep -r "DEV MODE" client/dist/assets`
returns nothing.

### Lint

```bash
npm run lint        # both workspaces
```

ESLint was configured but **could never run**: `.eslintrc.js` extends
`plugin:react/recommended`, `plugin:react-hooks/recommended`,
`plugin:jsx-a11y/recommended` and `prettier`, and none of those five packages were
declared anywhere, so every invocation died with "plugin not found". They are now
root devDependencies, and `npm run lint` reports **0 errors** in both workspaces
(591 warnings in the client, 8 in the server).

Getting to zero errors surfaced genuine defects, not style noise:

- `tailwind.config.js` declared **two `keyframes` keys**; the second silently
  discarded the first, so the `splash` entry never reached Tailwind.
- `Table.jsx` called `React.useMemo` without importing `React` — a `ReferenceError`
  on first render. Nothing rendered `<Table>` yet, which is why the tests stayed
  green.
- `NotificationContext` called `useCallback` inside an early-return branch, so the
  hook order changed between renders ("Rendered more hooks than during the previous
  render").
- `VirtualCard` declared its `CardLogo` **inside** the component, creating a new
  component type every render and remounting that subtree.
- `Modal` put `role="dialog"` on the backdrop instead of the panel and had **no
  Escape handler**, so a focus-trapping dialog could not be dismissed by keyboard
  (WCAG 2.1.2). The backdrop is now a labelled button and Escape closes it.
- `Checkbox` and `Radio` labels were mouse-only (`<label onClick>`); they are now
  wired with `htmlFor`, so the label text is reachable by keyboard.
- Clickable rows in `TransactionList`, clickable steps in `Stepper` and the
  flippable `VirtualCard` are exposed as buttons with Enter/Space handlers.
- `TransactionItem.jsx` was a second, self-declared *placeholder* copy of the row
  component that `TransactionList.jsx` also defines and exports; the barrel exported
  the placeholder. It is deleted and the barrel now exports the real one.

Two categories are deliberately **warnings**, not errors, and both are documented in
the config itself: `jsx-a11y/no-autofocus` (focus is moved intentionally into
freshly opened dialogs and search fields), and the three React-Compiler-era
`react-hooks` rules `set-state-in-effect`, `immutability` and `purity` (this app
builds with React 18 and no compiler in the pipeline). `CardCarousel` disables two
`jsx-a11y` rules file-wide with a rationale: it is a focusable region that owns the
arrow keys, the WAI-ARIA carousel pattern, which those rules cannot express. None of
this was silenced to make a number go green — the 591 warnings remain visible on
every run.

The client suite pins the defects that made the app non-functional — dead routes,
placeholder components, forms that could not submit, a formatter that threw on
quick-amount chips, a payment that debited twice what it should — precisely because
each of them compiled, built and tested green while doing nothing. If you add a
feature whose failure mode is "renders plausibly and does nothing", add the test
that would have caught it.

## Troubleshooting

**Port already in use.** `lsof -ti:3000 | xargs kill -9` (or `:5173`).

**"No mock route for GET /…"** under `dev:mock` means the endpoint isn't in
`client/mock/mockApiPlugin.js` / `mock/extraRoutes.js`; add it there.

**Server won't start in production** with a JWT error: that is the fail-fast working
as designed. Set ≥32-character secrets.

**Database connection errors:** confirm PostgreSQL is up
(`docker-compose ps`, or `sudo systemctl status postgresql`) and that `DB_*`
matches. Redis is optional at runtime (`REDIS_ENABLED=false` degrades gracefully).

**Blank page on first load:** check the browser console for a missing provider
error; `AppProviders` mounts Query/Theme/Toast/Auth/Notification in a fixed order
and the splash retires only after the session resolves.

## Known limitations and open work

Tracked in Linear as **DEV-6 … DEV-13**; none are hidden by this document:

- **No CI, no `.github/`, no `LICENSE`** (DEV-12). No rights are granted by absence.
- **No migrations**; schema comes from Sequelize sync in non-production (DEV-7).
- **No real mail/SMS transport**; the notification service returns
  `{ delivered: false, reason }` rather than pretending (DEV-8).
- **No end-to-end transfer tests against real PostgreSQL** (DEV-6).
- **No compromised-password corpus check** beyond the bundled common-password list;
  HIBP k-anonymity with fail-open is specified but not implemented (DEV-9).
- **No CSRF double-submit token** (DEV-10) and **no idempotency keys** on money
  movement (DEV-11).
- **App container images** are not defined; compose provides backing services only
  (DEV-12).
- **RBAC matrix, KYC-at-rest encryption and fraud thresholds** are partially
  implemented and need formalisation (DEV-13).
- **No server test files.** Jest is installed and wired to `npm run test:jest`, but
  the 57 self-checks are the only server verification today (DEV-6).
- **591 client lint warnings** remain (`import/order`, `react/prop-types`, and the
  advisory rules described under [Lint](#lint)). Zero errors is the gate; the
  warnings are a backlog, not a clean bill of health.
- **The full-stack path is unexercised.** Nothing in this repository has been run
  against a live PostgreSQL or Redis in the environment where it was verified.

## Provenance

`structure.txt` and `extract_all.py` at the repository root are the artifacts this
codebase was originally reconstructed from: `extract_all.py` regex-extracted fenced
code blocks from `structure.txt`, and a stray inline fence truncated
`User.model.js`, deleting its bcrypt hooks. The security review's appendix tells
that story in full. Both files are kept as provenance, not as build inputs; nothing
imports them.

## Contributing

1. Fork, then branch from `main`.
2. `npm install` at the repository root (npm workspaces resolves all three).
3. Keep the verification set green: `npm run build`, `npm test` (44 + 57) and
   `npm run lint` (0 errors).
4. If you add a dev-only surface, gate it through `client/src/config/env.js` and
   confirm it is absent from `dist/assets` after a build.
5. Open a pull request describing what changed and **how you verified it**.

Questions or something that looks wrong: use the in-app **Contact** page
(`/contact`), which works without signing in.
