# SecureBank — Security Review & Remediation Plan

**Repository:** `devTechs001/enterprise-fintech-banking`
**Reviewed at:** `26cb6fa9` (single-commit history)
**Review date:** 2026-11-14
**Scope:** full repair — `client/`, `server/`, `shared/`, build and runtime verification
**Runtime verified:** Node v22.22.3

---

## 1. Executive summary

This repository is a **generated scaffold, not a working system**. At the point of
review the server could not be imported, the client could not authenticate a user,
and neither had ever been executed. The provenance is visible in the tree: a
6,094-line `structure.txt` containing 35 fenced code blocks, and an
`extract_all.py` that regex-extracted **14** of them. Those 14 are the only
authored files. Everything else is unreviewed scaffold, and the extraction itself
is where the most damaging defects come from.

The single highest-impact finding is not a vulnerability in the usual sense — it is
that **security-critical code was silently deleted during extraction**. A stray
fence marker at `structure.txt:3463` terminated a non-greedy regex match early and
truncated `server/src/database/models/User.model.js` at line 150, mid-expression.
The lost tail contained the `beforeCreate` / `beforeUpdate` hooks that hash
passwords. The repository therefore imported `bcryptjs`, declared the dependency,
and **never called `bcrypt.hash` anywhere** — every customer password would have
been written to PostgreSQL in plaintext.

That failure mode generalises, and it is the reason this review leads with
verification rather than a vulnerability list:

> **A defect that stops the program is found immediately. A defect that silently
> removes a security control is not.** The truncated file produced a syntax error
> that any `node` invocation would surface. But had the truncation landed one line
> later — after the closing brace — the file would have parsed, the server would
> have started, and every password would have been stored in cleartext with no
> error anywhere.

Three properties made this state durable and are themselves findings:

1. **No test suite.** Jest was configured; zero test files existed.
2. **No CI.** `.github/` was absent, so nothing ever ran a build or a lint.
3. **A green build proves nothing.** The client's `vite build` succeeded while
   roughly 30 barrel-exported components did not exist, because nothing imported
   them. Static success was mistaken for a working application.

### Remediation status

| Area | Before | After |
|---|---|---|
| Server modules load | 0 / 29 | **29 / 29** |
| Server assembles an Express app | ✗ | ✓ |
| Server HTTP security checks | — | **11 / 11 passing** |
| Client modules resolve | 9 broken imports | **722 / 722 resolve** |
| Client production build | ✓ (vacuously) | ✓ (2,319 modules) |
| Client regression tests | 0 | **8 / 8 passing** |
| Live preview | ✗ | ✓ running on port 5173 |

---

## 2. Critical findings

### C-1 · Passwords stored in plaintext

**Where:** `server/src/database/models/User.model.js`
**Vector:** any database read — SQL injection elsewhere, a leaked backup, a
compromised replica, an over-privileged analyst.
**Impact:** total. Plaintext banking passwords are reused across services; a
single read is a credential-stuffing campaign against the customers' other
accounts, and a direct regulatory breach.

The model carried `password: { type: STRING(255), validate: { len: [8, 128] } }`
and nothing else. `bcryptjs` was in `dependencies` and imported in no file.

**Fix applied.** The truncation was reversed by recovering the lost tail from
`structure.txt:3463-3612` and rewriting the model. Hashing now runs in
`beforeCreate` / `beforeUpdate` at a configurable cost (`BCRYPT_ROUNDS`, default
12 ≈ 250 ms). Supporting controls added:

- `comparePassword()` uses bcrypt's own constant-time comparison.
- `needsRehash()` detects a digest produced below the current cost, and
  `authenticateUser` rehashes transparently on the next successful login — so the
  cost factor can be raised without forcing a reset on every customer.
- `toJSON()` strips `password`, `mfaSecret`, `mfaRecoveryCodes`,
  `resetTokenHash` and `verificationTokenHash`. A serialised user cannot leak a
  credential by accident.
- The minimum length moved from 8 to 12, matching the client form, which
  previously enforced a *different* policy than the server (`shared/` yup said
  `min(8)`; `validators.js#isValidPassword` demanded upper+lower+digit+special;
  the server checked neither). Both sides now use one implementation,
  `evaluatePassword()`.
- A common-password blocklist is applied per NIST SP 800-63B §5.1.1.2. This is a
  35-entry placeholder; production should query a full corpus via a k-anonymity
  API such as HaveIBeenPwned's ranged lookup.

### C-2 · Every security token generated with `Math.random()`

**Where:** `server/src/utils/generators/index.js` lines 19, 36, 54, 88, 101
**Vector:** observation of two outputs, then prediction of all others.
**Impact:** complete authentication bypass; account takeover at scale.

`generateToken()` was commented *"Generate secure random token"* and implemented
as `crypto.randomBytes` in no place at all — it used `Math.random()`. The same
function produced password-reset links and email-verification links.
`generateOTP()` produced step-up authentication codes the same way. So did
`generateAccountNumber()` and `generateCardNumber()`.

`Math.random()` in V8 is xorshift128+. It is not a CSPRNG and makes no attempt to
be: 128 bits of internal state are recovered from a small number of consecutive
outputs, after which the entire past and future sequence is computable. An
attacker who receives two password-reset emails addressed to accounts they control
can compute the reset token for any other customer and take it over without
touching the password. Predicted OTP codes defeat step-up authentication
entirely.

**Fix applied.** The module was rewritten on `node:crypto`:

| Value | Before | After |
|---|---|---|
| Reset / verification token | `Math.random()` | `crypto.randomBytes(32).toString('base64url')` |
| OTP code | `Math.floor(Math.random()*10)` | `crypto.randomInt(0, 10)` per digit |
| Account number | `Math.random()` | `crypto.randomInt` per digit |
| Card number | `Math.random()` | `crypto.randomInt` + correct Luhn check digit |
| Transaction reference | `Math.random()` | `crypto.randomBytes(6)` |

`generateToken(bytes)` now throws below 16 bytes rather than silently producing a
weak value. `hashToken()` and a `timingSafeEqual`-based `safeEqual()` were added so
callers stop comparing secrets with `===`, which short-circuits on the first
differing byte.

Two adjacent bugs fell out of the rewrite: `Math.pow(10, length)` overflowed the
uniform range for longer card prefixes, so PANs were sometimes emitted short; and
Amex was generated as 13 + prefix digits rather than 15.

### C-3 · Refresh tokens issued in the JSON response body

**Where:** `server/src/api/v1/auth/auth.controller.js`, `verifyMfa`
**Vector:** any XSS, any browser extension with response access, any log that
captures bodies.
**Impact:** durable session theft that survives the access token's 15-minute life.

`login` set the refresh token in an httpOnly cookie. `verifyMfa` returned
`{ tokens }` — the whole object, refresh token included — as JSON. The two halves
of one flow disagreed, and the client stored what it received in `localStorage`.

**Fix applied.** Both flows now use `tokenService.refreshCookieOptions()`:
`httpOnly`, `secure` in production, `sameSite: 'strict'`, `maxAge` from config,
and **`path: '/api/v1/auth'`**. The path scope matters: the previous cookie used
the default `/`, so the credential was attached to every request to the origin,
widening the surface for any endpoint that reflects headers or logs URLs. The
refresh token is opaque random bytes, never a JWT, and only its SHA-256 digest is
persisted — a database read yields no usable credential.

### C-4 · Refresh tokens were not rotated and reuse was undetectable

**Where:** absent — no `Session` model existed
**Impact:** a stolen refresh token was a permanent credential.

The README described session revocation, "sign out other devices" and refresh
rotation. None of it was implemented: `revokeOtherSessions` was **commented out**
in `changePassword`, and `Session` was referenced by `User.associate` but never
defined.

**Fix applied.** A `Session` model and `tokenService.rotateRefreshToken()`
implement rotation with reuse detection:

- each refresh mints a new token and records `replacedByTokenHash` on the old row;
- all tokens in a chain share a `familyId`;
- presenting an **already-rotated** token marks the family `compromised` and
  revokes every session in it.

That last rule is the one that matters. A replay is either an attacker using a
stolen token or a victim's client racing a rotation; in both cases the only safe
response is to invalidate the whole family and force re-authentication. Without
it, rotation is cosmetic.

`changePassword` now revokes other sessions (keeping the caller's), and
`resetPassword` revokes all of them. A victim who resets a password after
suspected compromise actually ends the attacker's session, which previously it did
not.

### C-5 · Login lockout configured but never enforced

**Where:** `config.auth.maxLoginAttempts`, `config.auth.lockoutDurationMinutes`
**Impact:** unbounded online password guessing.

Both values were defined (5 attempts, 30 minutes). The `User` model carried
`failedLoginAttempts` and `lockedUntil` columns. **Nothing read or wrote either.**
One global limiter (100 requests / 15 min per IP) was the only brake, which permits
thousands of guesses per day against one account.

**Fix applied.** `authenticateUser()` now enforces the counter, and the limiter
layer was rebuilt:

| Limiter | Scope | Limit |
|---|---|---|
| `globalLimiter` | all traffic | 100 / 15 min |
| `authLimiter` | login, register, MFA verify | 10 / 15 min, **successful requests skipped** |
| `sensitiveLimiter` | forgot / reset / verify-email | 5 / 15 min |
| `transactionLimiter` | money movement | 20 / min |

Both layers are necessary and neither substitutes for the other: an IP limiter
cannot stop a distributed attack on one account, and an account counter cannot stop
one attacker spraying many accounts. `skipSuccessfulRequests` keeps a legitimate
customer from consuming their own abuse budget.

The response to a wrong password is identical whether the account exists — and a
**dummy bcrypt comparison is still performed when it does not**, so response timing
cannot be used to enumerate registered addresses.

### C-6 · No MFA implementation despite being advertised

**Where:** README, `User.mfaEnabled` / `mfaSecret`
**Impact:** the control customers were told protected them did not exist.

`speakeasy` was a declared dependency imported nowhere. `mfaSecret` was a plaintext
`STRING(255)` column. `verifyMfaCode` was called by the controller and defined in
no service.

**Fix applied.** TOTP enrolment and verification via `speakeasy`, with:

- `mfaSecret` **encrypted at rest** (AES-256-GCM, `utils/crypto.js`) — unlike a
  password hash it must be readable to verify a code, so plaintext storage meant a
  single database read let an attacker generate valid codes for every enrolled
  user. GCM's auth tag means a tampered secret fails decryption rather than
  yielding garbage.
- `window: 1` (±30 s drift tolerance). Without it a slightly fast phone locks a
  legitimate user out, and users respond by disabling MFA.
- enrolment is two-phase: `setupMfa` stores the secret with `mfaEnabled: false`,
  and only a successful `verifyMfaCode` flips it. Proving possession is required
  before the control counts as active.
- hashed, single-use recovery codes that burn on redemption.
- `disableMfa` re-proves the password, because disabling MFA weakens the account.

A step-up temp token is signed with `type: 'temp'` and `purpose: 'mfa'`, and
`authenticate` rejects any token whose `type` is not `'access'` — so completing the
password step alone can never yield API access.

### C-7 · Tokens persisted in `localStorage`, three separate ways

**Where:** `client/src/api/axiosInstance.js`, `client/src/services/auth/authTokenService.js`,
`client/src/store/index.js` (redux-persist whitelist `['auth', 'ui']`)
**Impact:** any XSS reads a durable credential; the refresh token outlives the tab.

Three independent code paths each wrote tokens to `localStorage`. `localStorage` is
synchronously readable by any script on the origin and survives tab close.

**Fix applied.** Access tokens live **in memory only** (`authTokenService`), the
refresh token lives **only** in an httpOnly cookie, and the redux-persist whitelist
was reduced to `['ui']`. A regression test now asserts that after a successful
login `localStorage` contains no `access_token`, `refresh_token` or token value —
so this cannot silently return.

---

## 3. High-severity findings

### H-1 · JWT secrets fell back to published literals

`config.jwt` defaulted to `'your-access-secret'` and `'your-refresh-secret'` when
the environment variables were absent. Any deployment that forgot them signed every
token with a secret **committed to this repository**, letting an attacker mint a
valid `role: "admin"` token offline. `verify()` was also called with no `algorithms`
option, leaving algorithm-confusion negotiation open.

**Fixed:** `requiredInProduction()` throws at boot in production if a secret is
missing or shorter than 32 characters, printing the exact command to generate one.
`algorithms: ['HS256']`, `issuer` and `audience` are pinned on both sign and
verify.

### H-2 · Account enumeration on registration

`register` returned `409 "Email already registered"`, letting an attacker build a
list of the bank's customers without authenticating. `forgotPassword` handled this
correctly; `register` did not.

**Fixed:** both return the same body and status whether or not the account exists —
*"If registration succeeded, a confirmation email is on its way."* Duplicate
attempts are still audited server-side. The MFA-verify failure message was aligned
to `Invalid email or password.` for the same reason: a distinct "invalid MFA code"
confirms that a temp token maps to a real, enrolled account.

### H-3 · CORS `origin: '*'` with `credentials: true`

Browsers reject that combination outright, so cookie auth could never have worked
from a browser — and an unrestricted origin on a credentialed API is a cross-origin
read waiting to happen.

**Fixed:** explicit allow-list from `CORS_ORIGIN`, wildcard refused in production,
restricted `methods` and `allowedHeaders` rather than reflecting the request,
`maxAge: 600`. A check asserts no `Access-Control-Allow-Origin: *` is emitted.

### H-4 · `trust proxy` never set

Behind nginx or an ALB, `req.ip` is the **proxy's** address. Every customer shared
one rate-limit bucket, and every audit row recorded the same IP — so the limiter was
simultaneously too strict (a busy office NAT'd behind one address is blocked) and
too loose (an attacker rotates source IPs freely), and the audit trail could not
attribute anything.

**Fixed:** `app.set('trust proxy', config.server.trustProxy)` before any middleware
that reads `req.ip`.

### H-5 · Zero request validation

`express-validator` was declared and imported nowhere. `shared/validations/schemas.js`
(yup) was dead code. `req.body` flowed straight into Sequelize and token generation —
the mass-assignment path, where a POSTed `role: "admin"` is honoured by any
`Model.create(req.body)`. `express.json({ limit: '10mb' })` compounded it.

**Fixed:** validator chains on every auth endpoint; handlers pick named fields
rather than spreading the body; the JSON limit dropped to **100 kb** (a banking API
does not accept 10 MB bodies, and that limit is a cheap amplification vector). A
check asserts a 1 MB body returns 413 and that a weak-but-long password returns 422.

### H-6 · Token revocation keyed on the raw JWT

The blacklist stored the entire token string in Redis (~500 bytes per entry) with no
expiry tied to the token's lifetime. Anyone with cache access held a drawer of live
credentials.

**Fixed:** revocation is keyed on the token's `jti` with a TTL equal to its
remaining validity, so Redis cannot accumulate keys forever and holds no usable
token. The user cache was cut from **300 s to 30 s**, stores only
authorisation-relevant fields, and is explicitly invalidated via
`invalidateUserCache()` on lockout, role change, password change and email
verification — previously a locked or demoted account stayed authenticated for up to
five minutes.

### H-7 · Sessions never checked on authenticated requests

`authenticate` verified the JWT and fetched the user, but never consulted the session
behind it. Revoking a refresh token for reuse left the matching access token working.

**Fixed:** the `sid` claim is resolved against the session registry; a revoked,
compromised or expired session yields 401 `SESSION_REVOKED`.

### H-8 · Error handler leaked internals and never fired its own branches

```js
let error = { ...err };   // Error properties are non-enumerable → this is {}
```

The spread produced an empty object, so the handler read fields that were never
there. It then returned the raw `err.message` (and the stack in development) for
*every* error — a Sequelize failure message contains SQL and often column values. It
also mapped **Mongoose** error names (`CastError`, `MongoServerError`) on a stack that
uses Sequelize and PostgreSQL, so none of those branches could ever fire while the
real ones went unhandled.

**Fixed:** operational errors (app-constructed, or Express `HttpError` with
`expose !== false`) are reported; unexpected ones are logged in full server-side and
returned as a generic message. Sequelize error names are mapped properly — and
`SequelizeUniqueConstraintError` deliberately does **not** echo which field
collided, because that is an account-enumeration oracle. Stack traces never leave
the process.

### H-9 · No RBAC, despite roles being modelled

`User` carried a `role` enum and a `permissions` array; no middleware read either.
`authenticate` attached `req.user.role` and every protected route was open to any
signed-in customer.

**Fixed:** `authorize()`, `authorizePermission()`, `adminOnly`, `staffOnly` and an
`ownsResource()` ownership guard. The last addresses the most damaging class of bug
in a banking API — IDOR/BOLA, where an authenticated customer passes someone else's
account id and reads or moves their money. Role is read only from the verified token,
never from the body or query string.

---

## 4. Medium and low severity

| ID | Finding | Fix |
|---|---|---|
| M-1 | `redis.keys(pattern)` in `transaction.service` — blocks the Redis event loop for the whole keyspace, a self-inflicted DoS on a shared instance | `deleteByPattern()` / `scanKeys()` walk incrementally with `SCAN` in batches of 100 |
| M-2 | `testConnection()` caught its own error and `return false`; `initializeDatabase()` logged a warning and let the process serve traffic with no database | both now throw; `server.js` calls `initializeDatabase()` before `listen()` |
| M-3 | `initializeDatabase()` was never called at all | wired into `start()` |
| M-4 | `sequelize.sync({ alter: true })` could silently rewrite live column types on a ledger | `DB_SYNC_ALTER` defaults **false**; enabling it in production throws |
| M-5 | No signal handling — SIGTERM killed the process mid-request, meaning a debit committed and a credit that never happened | graceful shutdown: stop accepting, drain in-flight, close Redis and Postgres, 10 s force-exit |
| M-6 | No `unhandledRejection` / `uncaughtException` handlers | rejection logs and continues; uncaught exception logs and exits (state is unknown, carrying on is worse) |
| M-7 | `reverseTransaction` called `sequelize.transaction()` **without `await`** and decremented the destination with no sufficiency check | awaited; both legs checked inside SERIALIZABLE isolation |
| M-8 | `DECIMAL(18,2)` + `parseFloat` money math — fractional cents appear and disappear | `decimalNumbers: false` keeps DECIMAL as strings; `toMinorUnits` / `fromMinorUnits` do integer-cent arithmetic |
| M-9 | `requestLogger` used `console.log` and wrote `req.originalUrl` verbatim — reset and verification flows put single-use tokens in the query string, turning the log into a store of live credentials | winston at level-by-status, `redactString()` scrubs `token` / `code` / `sig` / `access_token` / `refresh_token` from URLs, `X-Request-Id` correlates log line to response |
| M-10 | No request id anywhere | minted or propagated from `X-Request-Id`, echoed on every response |
| M-11 | `Op.iLike '%${search}%'` does not escape `%` / `_`, no length cap | parameterised with wildcard escaping |
| M-12 | docker-compose exposed Postgres and Redis on host ports with `postgres/postgres` and no Redis `requirepass` | documented in §7; not runnable in this environment |
| L-1 | No CSP — helmet ran with defaults | `scriptSrc/styleSrc/imgSrc/objectSrc/frameAncestors/baseUri/formAction: 'none'`; a JSON API should never render HTML that runs script |
| L-2 | No HSTS | enabled in production only (`hstsMaxAge: 31536000`, `includeSubDomains`, `preload`); on plain HTTP browsers ignore it |
| L-3 | `x-powered-by` disclosed Express | disabled |
| L-4 | Client: `withCredentials: true` with no CSRF token | mitigated by `sameSite: 'strict'`; a double-submit token is the residual item in §6 |
| L-5 | Client: Luhn and CVV checks computed in the browser | retained as UX only; documented as never an authorisation decision |
| L-6 | `Input`'s `<label>` had no `htmlFor` — labels were not associated with controls | associated via `useId`, plus `aria-invalid`, `aria-describedby`, `role="alert"` on errors |
| L-7 | `Select` was a custom button listbox with no ARIA and no form value | `role="combobox"` + `aria-expanded` / `aria-controls` / `aria-labelledby`, plus a visually-hidden native `<select>` so the value reaches the form payload |

---

## 5. Supply chain

**34 of 48 declared runtime dependencies were never imported.** On a system that
holds money, each one is transitive exposure — an install-time script, a typosquat,
or a maintainer compromise in a package that does nothing for you.

Verified by walking every `import` / `require` in `src/` and diffing against
`package.json`. Removed:

| Category | Packages |
|---|---|
| Wrong database | `mongoose`, `express-mongo-sanitize` — MongoDB tooling in a PostgreSQL service |
| Unmaintained upstream | `xss-clean` (deprecated), `crypto-js` (discontinued) |
| Duplicate | `redis` (alongside `ioredis`), `pg-hstore` (HSTORE column type only) |
| Payment / comms SDKs | `stripe`, `plaid`, `razorpay`, `twilio`, `@sendgrid/mail`, `nodemailer`, `firebase-admin` |
| Storage / queue / realtime | `@aws-sdk/client-s3`, `cloudinary`, `amqplib`, `bull`, `socket.io` |
| Unused framework pieces | `passport`, `passport-jwt`, `express-session`, `multer`, `hpp` |
| Unused features | `pdfkit`, `qrcode`, `handlebars`, `swagger-jsdoc`, `swagger-ui-express`, `winston-daily-rotate-file` |

`multer@1.4.5-lts.1` was pinned to a version with known advisories. Retained and now
actually used: `speakeasy` (TOTP), `express-validator` (validation), `winston`
(logging), `pg` (dialect), `validator`.

On the client, the same audit removed `crypto-js`, four `i18next` packages,
`chart.js`, `react-chartjs-2` and the entire `@storybook/*` tree (~900 packages,
with no `.storybook/` config present). Charts are now hand-rolled SVG in
`components/charts/`, which removes a rendering dependency and its XSS surface.

---

## 6. Design decisions in the new UI components

Controls that look like security features but do not behave like them are worse than
none, because they teach users that the gesture is sufficient. Each new component
encodes an explicit decision:

- **`SecurityQuestions` renders no form.** Knowledge-based authentication is rejected
  per NIST SP 800-63B §5.2.1 — answers are publicly discoverable and frequently
  reused. Recovery is a time-limited single-use emailed link plus MFA re-enrolment.
  The component explains this rather than presenting a disabled control.
- **`BiometricAuth` is WebAuthn/passkeys**, and is disabled unless both
  `window.PublicKeyCredential` and `window.isSecureContext` hold. A biometric prompt
  on an insecure origin cannot bind to an authenticator.
- **`QRPayment` never pays a decoded payload** without an explicit "verify payee and
  amount" confirmation. A scanned code is untrusted input, not an instruction.
- **`BeneficiaryForm` / `BeneficiarySelector` state a 24 h cooling-off period** and
  out-of-band confirmation for new payees, matching the server-side
  `Beneficiary.status: 'pending'` → `'active'` transition. An attacker who has taken
  over a session should not be able to add their own account and drain it in the same
  minute.
- **`TransferWizard` / `PaymentForm` label client-side balance and limit checks as
  convenience only.** The API re-enforces both inside a SERIALIZABLE transaction.
- **`AuditLog` is read-only and append-only** — no update or delete hooks, no
  `paranoid` flag, because a soft-delete flag is still a mutation an attacker with
  write access could flip.
- **`LoanCalculator` labels its output "indicative only"**; `LoanApplicationForm`
  promises a soft check before any hard credit enquiry.
- **`CardApplicationForm` requires a monthly limit**, changeable and freezable
  instantly.
- **`KYCForm` never echoes a document number back** after submission.
- **Mock login returns `demoCode` only in preview mode**, with UI copy stating that a
  real API never returns a live TOTP code. The preview must be completable without an
  authenticator app; the wording prevents that affordance being read as a design.

---

## 7. Remaining work

Deliberately **not** claimed as done. Each item is real and each needs an environment
this sandbox does not have.

**P1 — needs a running PostgreSQL**
- End-to-end transfer tests against a real database (SERIALIZABLE behaviour under
  concurrency cannot be verified in-process).
- Migrations. `npm run migrate` targets `database/migrations/`, which does not exist;
  the schema is still applied by `sync()`.
- Replace the 35-entry password blocklist with a full compromised-corpus lookup.
- Wire a real mail transport. `NotificationService` records intent and returns
  `{ delivered: false, reason }` rather than pretending — a security alert that
  silently did not send is worse than a visible failure.

**P2 — needs infrastructure**
- CSRF double-submit token (currently mitigated by `sameSite: 'strict'` alone).
- Idempotency keys on money movement; `Idempotency-Key` is already an allowed CORS
  header, so the client contract is ready.
- `docker/` Dockerfiles, `.github/` CI, `LICENSE` — all referenced, none present.
- Redis `requirepass` and removal of host port exposure in docker-compose.
- Log shipping; winston currently writes to the console only.

**P3 — needs product decisions**
- RBAC role definitions beyond the enum (`authorize` exists; the permission matrix
  does not).
- PII/KYC encryption at rest. `utils/crypto.js` provides the primitive and the `Card`
  model uses it for the PAN; KYC documents need a storage design first.
- Fraud rules into configuration — the current thresholds are conservative,
  explainable heuristics that flag for review and never silently approve.
- Jest suites for the server. `scripts/check-server.js` is a smoke harness, not a
  substitute for unit and integration tests.

---

## 8. How to verify

```bash
# Client: 8 regression tests + production build
cd client && npx vitest run && npx vite build

# Client: live preview with the mock API (no database)
cd client && npm run dev:mock
#   → http://localhost:5173   demo@securebank.test / SecureBank!2026

# Server: 57 checks — every module loads, app assembles, 11 HTTP behaviours
cd server && node scripts/check-server.js

# Server: real boot (requires PostgreSQL + Redis)
cd server && npm start
```

`scripts/check-server.js` runs without a database by design. It imports all 29
modules, builds the Express app, and exercises it in-process on an ephemeral port —
which is what catches import-time failures that `node --check` cannot see, since
`--check` only parses.

---

## Appendix · Why the build being green meant nothing

Worth recording separately, because it is the lesson that generalises past this
repository.

`npx vite build` succeeded at the point of review. It also succeeded with:

- ~30 components exported from barrels that **did not exist on disk** (nothing
  imported them, so Rollup never resolved them),
- `AuthContext` returning a hardcoded user after a `setTimeout`, with no API call,
- `Login`, `Register`, `ForgotPassword` and `ResetPassword` all navigating on a timer
  without changing any state,
- route guards returning `null` forever because nothing dispatched `fetchCurrentUser`,
- no `QueryClientProvider` in the tree, so every `useQuery` threw,
- `ToastProvider` rendering nothing,
- `tailwind.config.js` defining `success` / `warning` / `danger` only at shades
  50/500/600/700 while components used 100/200/800/900/950 — **no background, no
  error**,
- `Alert` accepting `children` in PropTypes and never rendering them.

A compiler validates the graph it is asked to build. It cannot tell you the graph is
the wrong one, or that the code it does compile has no effect. Every item above was
found by reading implementations and then **running** the result — which is why the
verification harnesses in §8 exist and why they check behaviour rather than
compilation.
