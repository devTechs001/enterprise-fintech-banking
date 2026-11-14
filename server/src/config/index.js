import dotenv from 'dotenv';

dotenv.config();

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

const int = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const bool = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
};

/**
 * Fail fast on missing security-critical configuration.
 *
 * The previous version silently fell back to the literal strings
 * `'your-access-secret'` and `'your-refresh-secret'` when the JWT environment
 * variables were absent. Any deployment that forgot to set them would have
 * signed every token with a secret that is published in this repository, so an
 * attacker could mint a valid admin token offline. In production this is now a
 * startup failure instead of a silent default.
 */
const requiredInProduction = (name, value) => {
  if (isProduction && (!value || value.length < 32)) {
    throw new Error(
      `Missing or too-short ${name}. Refusing to start: a JWT signing secret must be ` +
        `set explicitly and be at least 32 characters. Generate one with: ` +
        `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
    );
  }
  return value || null;
};

/**
 * CORS policy.
 *
 * `origin: '*'` combined with `credentials: true` is rejected by browsers, and
 * an unrestricted origin on a cookie-authenticated API invites cross-origin
 * reads. Production therefore requires an explicit allow-list.
 */
const parseCorsOrigins = (raw) => {
  if (!raw || raw === '*') return isProduction ? null : ['*'];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  isTest: process.env.NODE_ENV === 'test',

  server: {
    port: int(process.env.PORT, 3000),
    // Bind all interfaces inside a container; the reverse proxy decides exposure.
    host: process.env.HOST || '0.0.0.0',
    // Behind nginx/ALB this must be set or every request appears to come from
    // the proxy, which collapses IP rate limiting onto a single bucket and puts
    // the proxy's address in the audit log.
    trustProxy: int(process.env.TRUST_PROXY_HOPS, 1),
  },

  database: {
    url: process.env.DATABASE_URL,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: int(process.env.DB_PORT, 5432),
    // `alter: true` lets Sequelize rewrite live column types on boot. On a
    // ledger that is a data-loss risk, so migrations are the only supported path.
    syncAlter: bool(process.env.DB_SYNC_ALTER, false),
    pool: {
      max: int(process.env.DB_POOL_MAX, 10),
      min: int(process.env.DB_POOL_MIN, 0),
      acquire: int(process.env.DB_POOL_ACQUIRE, 30000),
      idle: int(process.env.DB_POOL_IDLE, 10000),
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: int(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: int(process.env.REDIS_DB, 0),
    enabled: bool(process.env.REDIS_ENABLED, true),
  },

  jwt: {
    accessSecret: requiredInProduction('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET),
    refreshSecret: requiredInProduction('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
    accessExpirationMinutes: int(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 15),
    refreshExpirationDays: int(process.env.JWT_REFRESH_EXPIRATION_DAYS, 7),
    issuer: process.env.JWT_ISSUER || 'securebank',
    audience: process.env.JWT_AUDIENCE || 'securebank-api',
    // Pinned so a token signed for another purpose can never be replayed here,
    // and so an algorithm-confusion attack has nothing to negotiate.
    algorithm: 'HS256',
  },

  auth: {
    requireEmailVerification: bool(process.env.REQUIRE_EMAIL_VERIFICATION, false),
    maxLoginAttempts: int(process.env.MAX_LOGIN_ATTEMPTS, 5),
    lockoutDurationMinutes: int(process.env.LOCKOUT_DURATION_MINUTES, 15),
    maxMfaAttempts: int(process.env.MAX_MFA_ATTEMPTS, 5),
    // Bcrypt cost. 12 is ~250ms on typical hardware — slow enough to resist
    // offline cracking, fast enough to not be a self-inflicted DoS.
    bcryptRounds: int(process.env.BCRYPT_ROUNDS, 12),
    passwordMinLength: int(process.env.PASSWORD_MIN_LENGTH, 12),
    mfaTempTokenTtlSeconds: int(process.env.MFA_TEMP_TOKEN_TTL_SECONDS, 300),
    resetTokenTtlMinutes: int(process.env.RESET_TOKEN_TTL_MINUTES, 15),
    verificationTokenTtlHours: int(process.env.VERIFICATION_TOKEN_TTL_HOURS, 48),
  },

  rateLimit: {
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: int(process.env.RATE_LIMIT_MAX, 100),
    // Tighter windows for credential endpoints: brute force is the attack these
    // exist to stop, and a global 100/15min budget is far too generous for it.
    authWindowMs: int(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    authMax: int(process.env.AUTH_RATE_LIMIT_MAX, 10),
    sensitiveMax: int(process.env.SENSITIVE_RATE_LIMIT_MAX, 5),
  },

  email: {
    from: process.env.EMAIL_FROM || 'no-reply@securebank.local',
    // No provider SDK is wired up. Rather than silently pretend to send, mail is
    // written to the audit log so the flow is observable in development.
    provider: process.env.EMAIL_PROVIDER || 'log',
  },

  logging: {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    format: process.env.LOG_FORMAT || (isProduction ? 'json' : 'pretty'),
  },

  cors: {
    origins: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: true,
  },

  security: {
    // Only set behind a TLS terminator; HSTS on plain HTTP is ignored by browsers.
    hstsMaxAge: int(process.env.HSTS_MAX_AGE, isProduction ? 31536000 : 0),
    cspEnabled: bool(process.env.CSP_ENABLED, true),
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    secureCookies: isProduction || bool(process.env.FORCE_SECURE_COOKIES, false),
    sessionMaxAgeDays: int(process.env.SESSION_MAX_AGE_DAYS, 30),
    maxSessionsPerUser: int(process.env.MAX_SESSIONS_PER_USER, 10),
  },
};

export default config;
