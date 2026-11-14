/**
 * Mock API Vite plugin.
 *
 * Serves `/api/v1/*` from an in-memory store so the React client can be
 * previewed end-to-end without PostgreSQL, Redis or the Node API. Enable it
 * with `VITE_USE_MOCK_API=true` (see `client/.env.preview`).
 *
 * The mock deliberately mirrors the *hardened* contract introduced by the
 * security review:
 *   - every response uses the `{ success, data }` envelope
 *   - login is rate limited and locks after repeated failures
 *   - step-up MFA (TOTP) is required before an access token is issued
 *   - refresh tokens are opaque, server-side, and never sent to the browser
 *   - every sensitive action writes an audit-log entry
 *
 * It is a development aid. It must not be bundled into a production build.
 */
import crypto from 'node:crypto';
import {
  DEMO_PASSWORD,
  user as seedUser,
  accounts,
  transactions,
  cards,
  beneficiaries,
  sessions,
  devices,
  auditLog,
  notifications,
  budgets,
  savingsGoals,
  monthlySpend,
  creditScore,
} from './db.js';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

const base32Encode = (buf) => {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
};

const base32Decode = (input) => {
  const clean = input.replace(/=+$/g, '').replace(/\s/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
};

/** RFC 6238 TOTP — SHA-1, 6 digits, 30s step (same as Google Authenticator). */
const totp = (secretBase32, counterOffset = 0) => {
  const key = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 30000) + counterOffset;
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(code % 1000000).padStart(6, '0');
};

const verifyTotp = (secretBase32, code) =>
  [-1, 0, 1].some((offset) => totp(secretBase32, offset) === String(code).trim());

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');

/* ------------------------------------------------------------------ *
 * Mutable state
 * ------------------------------------------------------------------ */

const state = {
  user: { ...seedUser },
  passwordHash: sha256(DEMO_PASSWORD),
  mfaSecret: base32Encode(crypto.randomBytes(20)),
  mfaEnabled: true,
  accounts: accounts.map((a) => ({ ...a })),
  transactions: [...transactions],
  cards: cards.map((c) => ({ ...c, limits: { ...c.limits } })),
  beneficiaries: [...beneficiaries],
  sessions: sessions.map((s) => ({ ...s })),
  devices: devices.map((d) => ({ ...d })),
  auditLog: [...auditLog],
  notifications: notifications.map((n) => ({ ...n })),
  /** access token -> { userId, expiresAt } */
  tokens: new Map(),
  /** opaque refresh token -> { userId, expiresAt, deviceInfo } */
  refreshTokens: new Map(),
  /** short-lived challenge issued between password check and TOTP check */
  challenges: new Map(),
  loginAttempts: { count: 0, lockedUntil: 0 },
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function logAudit(action, outcome, meta = {}) {
  state.auditLog.unshift({
    id: `aud_${randomToken(6)}`,
    action,
    outcome,
    ip: meta.ip || '41.90.24.11',
    location: meta.location || 'Nairobi, KE',
    at: new Date().toISOString(),
  });
  if (state.auditLog.length > 200) state.auditLog.length = 200;
}

function notify(n) {
  state.notifications.unshift({
    id: `ntf_${randomToken(6)}`,
    read: false,
    severity: 'info',
    at: new Date().toISOString(),
    ...n,
  });
}

/* ------------------------------------------------------------------ *
 * HTTP plumbing
 * ------------------------------------------------------------------ */

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', Buffer.byteLength(payload));
  // The client is served from the same origin, so these are safe defaults that
  // also demonstrate the header posture the real API should ship.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.end(payload);
}

const ok = (res, data, status = 200) => send(res, status, { success: true, data });
const fail = (res, message, status = 400, extra = {}) =>
  send(res, status, { success: false, message, ...extra });

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      // Reject oversized bodies before buffering them (10mb parity with the API).
      if (size > 10 * 1024 * 1024) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Malformed JSON body'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function issueTokens(deviceInfo) {
  const accessToken = randomToken(32);
  const refreshToken = randomToken(48);
  state.tokens.set(accessToken, { userId: state.user.id, expiresAt: Date.now() + ACCESS_TTL_MS });
  state.refreshTokens.set(refreshToken, {
    userId: state.user.id,
    expiresAt: Date.now() + REFRESH_TTL_MS,
    deviceInfo,
  });
  return { accessToken, refreshToken, expiresIn: Math.floor(ACCESS_TTL_MS / 1000) };
}

const sanitizeUser = (u) => {
  const { passwordHash: _ph, mfaSecret: _ms, ...rest } = u;
  return rest;
};

function authenticate(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  const record = state.tokens.get(token);
  if (!record) return null;
  if (record.expiresAt < Date.now()) {
    state.tokens.delete(token);
    return null;
  }
  return { token, ...record };
}

const clientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket?.remoteAddress ||
  '127.0.0.1';

/* ------------------------------------------------------------------ *
 * Route table
 * ------------------------------------------------------------------ */

/**
 * Each handler receives (ctx) and returns [status, body].
 * `ctx` = { params, query, body, req, res, auth }
 */
const routes = [
  /* ------------------------------ auth ------------------------------ */
  ['POST', /^\/auth\/login$/, async (ctx) => {
    const ip = clientIp(ctx.req);
    const { loginAttempts } = state;

    if (loginAttempts.lockedUntil > Date.now()) {
      const minutes = Math.ceil((loginAttempts.lockedUntil - Date.now()) / 60000);
      logAudit('USER_LOGIN', 'failure', { ip });
      return [429, {
        success: false,
        message: `Too many failed attempts. Account locked for ${minutes} more minute${minutes === 1 ? '' : 's'}.`,
        lockedUntil: new Date(loginAttempts.lockedUntil).toISOString(),
        retryAfterSeconds: Math.ceil((loginAttempts.lockedUntil - Date.now()) / 1000),
      }];
    }

    const { email, password, deviceInfo } = ctx.body || {};
    const passwordMatches =
      typeof email === 'string' &&
      email.trim().toLowerCase() === state.user.email &&
      sha256(String(password || '')) === state.passwordHash;

    if (!passwordMatches) {
      loginAttempts.count += 1;
      const remaining = MAX_LOGIN_ATTEMPTS - loginAttempts.count;
      if (remaining <= 0) {
        loginAttempts.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60000;
        loginAttempts.count = 0;
        logAudit('ACCOUNT_LOCKED', 'failure', { ip });
        notify({
          title: 'Account temporarily locked',
          description: `Locked for ${LOCKOUT_MINUTES} minutes after ${MAX_LOGIN_ATTEMPTS} failed sign-in attempts from ${ip}.`,
          type: 'security',
          severity: 'danger',
        });
        return [429, {
          success: false,
          message: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
          retryAfterSeconds: LOCKOUT_MINUTES * 60,
        }];
      }
      logAudit('USER_LOGIN', 'failure', { ip });
      // Identical message whether the email exists or not: no user enumeration.
      return [401, {
        success: false,
        message: 'Invalid email or password.',
        attemptsRemaining: remaining,
      }];
    }

    loginAttempts.count = 0;
    loginAttempts.lockedUntil = 0;

    if (state.mfaEnabled) {
      const challenge = randomToken(24);
      state.challenges.set(challenge, { userId: state.user.id, expiresAt: Date.now() + CHALLENGE_TTL_MS });
      logAudit('MFA_REQUIRED', 'success', { ip });
      return [200, {
        success: true,
        data: {
          requiresMfa: true,
          challenge,
          mfaMethod: state.user.mfaMethod,
          // PREVIEW ONLY: a real API never returns a live code. The mock exposes
          // it because there is no authenticator app to pair with, so the
          // step-up flow can still be exercised end to end.
          demoCode: totp(state.mfaSecret),
        },
      }];
    }

    const tokens = issueTokens(deviceInfo);
    state.sessions.unshift({
      id: `ses_${randomToken(6)}`,
      device: deviceInfo?.browser || 'Unknown browser',
      ip,
      location: 'Nairobi, KE',
      current: true,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    state.user.lastLoginAt = new Date().toISOString();
    logAudit('USER_LOGIN', 'success', { ip });

    ctx.res.setHeader(
      'Set-Cookie',
      `refresh_token=${tokens.refreshToken}; HttpOnly; Path=/api/v1/auth; SameSite=Strict; Max-Age=${REFRESH_TTL_MS / 1000}`
    );
    return [200, {
      success: true,
      data: { user: sanitizeUser(state.user), tokens: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn } },
    }];
  }],

  ['POST', /^\/auth\/mfa\/verify$/, async (ctx) => {
    const ip = clientIp(ctx.req);
    const { challenge, code } = ctx.body || {};
    const record = challenge ? state.challenges.get(challenge) : null;

    if (!record || record.expiresAt < Date.now()) {
      if (record) state.challenges.delete(challenge);
      return [401, { success: false, message: 'Verification challenge expired. Please sign in again.' }];
    }

    if (!verifyTotp(state.mfaSecret, code)) {
      logAudit('MFA_FAILED', 'failure', { ip });
      return [401, { success: false, message: 'Invalid verification code.' }];
    }

    state.challenges.delete(challenge);
    const tokens = issueTokens(ctx.body?.deviceInfo);
    state.sessions.unshift({
      id: `ses_${randomToken(6)}`,
      device: 'Chrome · macOS',
      ip,
      location: 'Nairobi, KE',
      current: true,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    state.user.lastLoginAt = new Date().toISOString();
    logAudit('MFA_VERIFIED', 'success', { ip });

    ctx.res.setHeader(
      'Set-Cookie',
      `refresh_token=${tokens.refreshToken}; HttpOnly; Path=/api/v1/auth; SameSite=Strict; Max-Age=${REFRESH_TTL_MS / 1000}`
    );
    return [200, {
      success: true,
      data: { user: sanitizeUser(state.user), tokens: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn } },
    }];
  }],

  ['POST', /^\/auth\/register$/, async (ctx) => {
    const { email, password, firstName, lastName } = ctx.body || {};
    if (!email || !password || !firstName || !lastName) {
      return [400, { success: false, message: 'email, password, firstName and lastName are required.' }];
    }
    if (String(password).length < 12) {
      return [422, { success: false, message: 'Password must be at least 12 characters.' }];
    }
    logAudit('USER_REGISTERED', 'success');
    return [201, {
      success: true,
      data: { message: 'Registration successful. Check your email to verify your address.', requiresEmailVerification: true },
    }];
  }],

  ['POST', /^\/auth\/logout$/, async (ctx) => {
    if (ctx.auth) state.tokens.delete(ctx.auth.token);
    const cookie = ctx.req.headers.cookie || '';
    const match = cookie.match(/refresh_token=([^;]+)/);
    if (match) state.refreshTokens.delete(match[1]);
    logAudit('USER_LOGOUT', 'success');
    ctx.res.setHeader('Set-Cookie', 'refresh_token=; HttpOnly; Path=/api/v1/auth; SameSite=Strict; Max-Age=0');
    return [200, { success: true, data: { message: 'Logged out successfully.' } }];
  }],

  ['POST', /^\/auth\/refresh-token$/, async (ctx) => {
    const cookie = ctx.req.headers.cookie || '';
    const match = cookie.match(/refresh_token=([^;]+)/);
    const presented = match ? match[1] : ctx.body?.refreshToken;
    const record = presented ? state.refreshTokens.get(presented) : null;

    if (!record || record.expiresAt < Date.now()) {
      if (presented) state.refreshTokens.delete(presented);
      return [401, { success: false, message: 'Session expired. Please sign in again.' }];
    }

    // Rotation: the presented refresh token is burned and replaced.
    state.refreshTokens.delete(presented);
    const tokens = issueTokens(record.deviceInfo);
    ctx.res.setHeader(
      'Set-Cookie',
      `refresh_token=${tokens.refreshToken}; HttpOnly; Path=/api/v1/auth; SameSite=Strict; Max-Age=${REFRESH_TTL_MS / 1000}`
    );
    return [200, {
      success: true,
      data: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn },
    }];
  }],

  ['GET', /^\/auth\/me$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, { success: true, data: { user: sanitizeUser(state.user) } }];
  }],

  ['POST', /^\/auth\/change-password$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const { currentPassword, newPassword } = ctx.body || {};
    if (sha256(String(currentPassword || '')) !== state.passwordHash) {
      logAudit('PASSWORD_CHANGE_FAILED', 'failure');
      return [400, { success: false, message: 'Current password is incorrect.' }];
    }
    if (String(newPassword || '').length < 12) {
      return [422, { success: false, message: 'New password must be at least 12 characters.' }];
    }
    state.passwordHash = sha256(String(newPassword));
    // Revoke every other session on password change.
    for (const [token, rec] of state.tokens) if (rec.userId === state.user.id) state.tokens.delete(token);
    for (const [token, rec] of state.refreshTokens) if (rec.userId === state.user.id) state.refreshTokens.delete(token);
    state.sessions = state.sessions.filter((s) => s.current);
    logAudit('PASSWORD_CHANGED', 'success');
    notify({
      title: 'Password changed',
      description: 'All other sessions were signed out as a precaution.',
      type: 'security',
      severity: 'success',
    });
    return [200, { success: true, data: { message: 'Password changed. Other sessions were signed out.' } }];
  }],

  ['POST', /^\/auth\/forgot-password$/, async () => {
    // Always 200 with the same body — prevents email enumeration.
    logAudit('PASSWORD_RESET_REQUESTED', 'success');
    return [200, { success: true, data: { message: 'If that email exists, a reset link has been sent.' } }];
  }],

  ['POST', /^\/auth\/reset-password$/, async () => [200, { success: true, data: { message: 'Password reset.' } }]],

  /* ---------------------------- accounts ---------------------------- */
  ['GET', /^\/accounts$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const total = state.accounts.reduce((sum, a) => sum + a.balance, 0);
    return [200, {
      success: true,
      data: { accounts: state.accounts, totalBalance: Math.round(total * 100) / 100 },
    }];
  }],

  ['GET', /^\/accounts\/([^/]+)$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const account = state.accounts.find((a) => a.id === ctx.params[0]);
    if (!account) return [404, { success: false, message: 'Account not found.' }];
    return [200, { success: true, data: { account } }];
  }],

  ['GET', /^\/accounts\/([^/]+)\/balance$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const account = state.accounts.find((a) => a.id === ctx.params[0]);
    if (!account) return [404, { success: false, message: 'Account not found.' }];
    return [200, { success: true, data: { balance: account.balance, availableBalance: account.availableBalance } }];
  }],

  ['POST', /^\/accounts\/([^/]+)\/(freeze|unfreeze)$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const account = state.accounts.find((a) => a.id === ctx.params[0]);
    if (!account) return [404, { success: false, message: 'Account not found.' }];
    const freeze = ctx.params[1] === 'freeze';
    account.isFrozen = freeze;
    account.status = freeze ? 'frozen' : 'active';
    logAudit(freeze ? 'ACCOUNT_FROZEN' : 'ACCOUNT_UNFROZEN', 'success');
    return [200, { success: true, data: { account } }];
  }],

  /* --------------------------- transactions -------------------------- */
  ['GET', /^\/transactions$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const page = Math.max(1, parseInt(ctx.query.get('page') || '1', 10) || 1);
    // Cap page size server-side so a client cannot request an unbounded result set.
    const limit = Math.min(100, Math.max(1, parseInt(ctx.query.get('limit') || '20', 10) || 20));
    const accountId = ctx.query.get('accountId');
    const category = ctx.query.get('category');
    const term = (ctx.query.get('search') || '').trim().toLowerCase();

    let rows = state.transactions;
    if (accountId && accountId !== 'all') rows = rows.filter((t) => t.accountId === accountId);
    if (category && category !== 'all') rows = rows.filter((t) => t.category === category);
    if (term) {
      rows = rows.filter((t) =>
        [t.description, t.merchantName, t.reference, t.transactionId]
          .join(' ')
          .toLowerCase()
          .includes(term)
      );
    }

    const total = rows.length;
    const slice = rows.slice((page - 1) * limit, page * limit);
    return [200, {
      success: true,
      data: {
        transactions: slice,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), hasMore: page * limit < total },
      },
    }];
  }],

  ['POST', /^\/transactions$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const { accountId, beneficiaryId, amount, description } = ctx.body || {};
    const source = state.accounts.find((a) => a.id === accountId);
    if (!source) return [404, { success: false, message: 'Source account not found.' }];
    if (source.isFrozen) return [403, { success: false, message: 'This account is frozen.' }];

    // Money is handled in integer cents to avoid binary floating point drift.
    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return [422, { success: false, message: 'Amount must be a positive number.' }];
    }
    const availableCents = Math.round(source.availableBalance * 100);
    if (amountCents > availableCents) {
      logAudit('TRANSFER_DECLINED', 'failure');
      return [422, {
        success: false,
        message: 'Insufficient available balance.',
        code: 'INSUFFICIENT_FUNDS',
        available: availableCents / 100,
        required: amountCents / 100,
      }];
    }
    const limitCents = Math.round((source.dailyTransferLimit || Infinity) * 100);
    if (amountCents > limitCents) {
      logAudit('TRANSFER_DECLINED', 'failure');
      return [422, {
        success: false,
        message: `Exceeds the daily transfer limit of $${(limitCents / 100).toLocaleString()}.`,
        code: 'DAILY_LIMIT_EXCEEDED',
      }];
    }

    const beneficiary = state.beneficiaries.find((b) => b.id === beneficiaryId);
    source.balance = Math.round((source.balance * 100 - amountCents)) / 100;
    source.availableBalance = Math.round((source.balance - source.holdBalance) * 100) / 100;

    const txn = {
      id: `txn_${randomToken(8)}`,
      transactionId: `TXN${Date.now().toString(36).toUpperCase()}${randomToken(4).toUpperCase()}`,
      accountId: source.id,
      accountName: source.accountName,
      type: 'transfer',
      category: 'Transfer',
      merchantName: beneficiary?.name || 'External transfer',
      description: description || `Transfer to ${beneficiary?.name || 'beneficiary'}`,
      amount: amountCents / 100,
      currency: source.currency,
      direction: 'debit',
      status: 'completed',
      reference: `REF${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      beneficiary: beneficiary ? { name: beneficiary.name, bankName: beneficiary.bankName } : null,
    };
    state.transactions.unshift(txn);
    logAudit('TRANSFER_COMPLETED', 'success');
    notify({
      title: 'Transfer sent',
      description: `$${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${txn.merchantName}.`,
      type: 'transaction',
      severity: 'success',
    });
    return [201, { success: true, data: { transaction: txn } }];
  }],

  ['GET', /^\/transactions\/([^/]+)$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const txn = state.transactions.find((t) => t.id === ctx.params[0] || t.transactionId === ctx.params[0]);
    if (!txn) return [404, { success: false, message: 'Transaction not found.' }];
    return [200, { success: true, data: { transaction: txn } }];
  }],

  /* ------------------------------- cards ----------------------------- */
  ['GET', /^\/cards$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, { success: true, data: { cards: state.cards } }];
  }],

  ['PATCH', /^\/cards\/([^/]+)$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const card = state.cards.find((c) => c.id === ctx.params[0]);
    if (!card) return [404, { success: false, message: 'Card not found.' }];
    const { status, limits, isPrimary } = ctx.body || {};
    if (status) card.status = status;
    if (limits && typeof limits === 'object') card.limits = { ...card.limits, ...limits };
    if (typeof isPrimary === 'boolean') {
      state.cards.forEach((c) => { c.isPrimary = c.id === card.id ? isPrimary : false; });
    }
    logAudit(status === 'blocked' ? 'CARD_BLOCKED' : 'CARD_UPDATED', 'success');
    return [200, { success: true, data: { card } }];
  }],

  /* --------------------------- beneficiaries -------------------------- */
  ['GET', /^\/beneficiaries$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, { success: true, data: { beneficiaries: state.beneficiaries } }];
  }],

  /* ---------------------------- security ----------------------------- */
  ['GET', /^\/security\/sessions$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, { success: true, data: { sessions: state.sessions } }];
  }],

  ['DELETE', /^\/security\/sessions\/([^/]+)$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const target = state.sessions.find((s) => s.id === ctx.params[0]);
    if (!target) return [404, { success: false, message: 'Session not found.' }];
    if (target.current) return [409, { success: false, message: 'You cannot revoke the session you are using.' }];
    state.sessions = state.sessions.filter((s) => s.id !== target.id);
    logAudit('SESSION_REVOKED', 'success');
    notify({ title: 'Session revoked', description: `${target.device} at ${target.location} was signed out.`, type: 'security', severity: 'success' });
    return [200, { success: true, data: { sessions: state.sessions } }];
  }],

  ['DELETE', /^\/security\/sessions$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    state.sessions = state.sessions.filter((s) => s.current);
    for (const [token, rec] of state.refreshTokens) if (rec.userId === state.user.id) state.refreshTokens.delete(token);
    logAudit('ALL_SESSIONS_REVOKED', 'success');
    return [200, { success: true, data: { sessions: state.sessions } }];
  }],

  ['GET', /^\/security\/devices$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, { success: true, data: { devices: state.devices } }];
  }],

  ['PATCH', /^\/security\/devices\/([^/]+)$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const device = state.devices.find((d) => d.id === ctx.params[0]);
    if (!device) return [404, { success: false, message: 'Device not found.' }];
    if (typeof ctx.body?.trusted === 'boolean') device.trusted = ctx.body.trusted;
    logAudit(device.trusted ? 'DEVICE_TRUSTED' : 'DEVICE_UNTRUSTED', 'success');
    return [200, { success: true, data: { device } }];
  }],

  ['DELETE', /^\/security\/devices\/([^/]+)$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    state.devices = state.devices.filter((d) => d.id !== ctx.params[0]);
    logAudit('DEVICE_REMOVED', 'success');
    return [200, { success: true, data: { devices: state.devices } }];
  }],

  ['GET', /^\/security\/audit-log$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const limit = Math.min(100, parseInt(ctx.query.get('limit') || '25', 10) || 25);
    return [200, { success: true, data: { entries: state.auditLog.slice(0, limit) } }];
  }],

  ['GET', /^\/security\/overview$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const failures = state.auditLog.filter((e) => e.outcome === 'failure').length;
    return [200, {
      success: true,
      data: {
        score: Math.max(0, 100 - failures * 6 - (state.mfaEnabled ? 0 : 25) - (state.user.emailVerified ? 0 : 10)),
        mfaEnabled: state.mfaEnabled,
        mfaMethod: state.user.mfaMethod,
        emailVerified: state.user.emailVerified,
        phoneVerified: state.user.phoneVerified,
        activeSessions: state.sessions.length,
        trustedDevices: state.devices.filter((d) => d.trusted).length,
        untrustedDevices: state.devices.filter((d) => !d.trusted).length,
        recentFailures: failures,
        passwordChangedAt: daysAgoIso(4),
        lockout: state.loginAttempts.lockedUntil > Date.now()
          ? { until: new Date(state.loginAttempts.lockedUntil).toISOString(), maxAttempts: MAX_LOGIN_ATTEMPTS }
          : null,
      },
    }];
  }],

  ['POST', /^\/security\/mfa\/setup$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    state.mfaSecret = base32Encode(crypto.randomBytes(20));
    const issuer = encodeURIComponent('SecureBank');
    const label = encodeURIComponent(state.user.email);
    logAudit('MFA_SETUP_STARTED', 'success');
    return [200, {
      success: true,
      data: {
        secret: state.mfaSecret,
        otpauthUrl: `otpauth://totp/${issuer}:${label}?secret=${state.mfaSecret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`,
        // The live code is exposed only by the mock so the preview is clickable
        // without a real authenticator app. The real API never returns this.
        demoCurrentCode: totp(state.mfaSecret),
      },
    }];
  }],

  ['POST', /^\/security\/mfa\/enable$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    if (!verifyTotp(state.mfaSecret, ctx.body?.code)) {
      logAudit('MFA_ENABLE_FAILED', 'failure');
      return [401, { success: false, message: 'Invalid verification code.' }];
    }
    state.mfaEnabled = true;
    state.user.mfaEnabled = true;
    state.user.mfaMethod = 'authenticator';
    logAudit('MFA_ENABLED', 'success');
    notify({ title: 'Two-factor authentication enabled', description: 'Authenticator app enrolled on your profile.', type: 'security', severity: 'success' });
    return [200, { success: true, data: { mfaEnabled: true, mfaMethod: 'authenticator' } }];
  }],

  ['POST', /^\/security\/mfa\/disable$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    if (!verifyTotp(state.mfaSecret, ctx.body?.code)) {
      logAudit('MFA_DISABLE_FAILED', 'failure');
      return [401, { success: false, message: 'Invalid verification code.' }];
    }
    state.mfaEnabled = false;
    state.user.mfaEnabled = false;
    logAudit('MFA_DISABLED', 'success');
    notify({ title: 'Two-factor authentication disabled', description: 'Your account is now protected by password only.', type: 'security', severity: 'danger' });
    return [200, { success: true, data: { mfaEnabled: false } }];
  }],

  /* --------------------------- notifications -------------------------- */
  ['GET', /^\/notifications$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, {
      success: true,
      data: { notifications: state.notifications, unreadCount: state.notifications.filter((n) => !n.read).length },
    }];
  }],

  ['PATCH', /^\/notifications\/([^/]+)\/read$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const n = state.notifications.find((x) => x.id === ctx.params[0]);
    if (n) n.read = true;
    return [200, { success: true, data: { notifications: state.notifications } }];
  }],

  ['POST', /^\/notifications\/read-all$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    state.notifications.forEach((n) => { n.read = true; });
    return [200, { success: true, data: { notifications: state.notifications } }];
  }],

  /* ----------------------------- analytics ---------------------------- */
  ['GET', /^\/analytics\/spending$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    const byCategory = {};
    for (const t of state.transactions) {
      if (t.direction !== 'debit') continue;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
    return [200, {
      success: true,
      data: {
        monthly: monthlySpend,
        byCategory: Object.entries(byCategory)
          .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
          .sort((a, b) => b.total - a.total),
      },
    }];
  }],

  ['GET', /^\/analytics\/budgets$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, { success: true, data: { budgets } }];
  }],

  ['GET', /^\/analytics\/credit-score$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, { success: true, data: creditScore }];
  }],

  ['GET', /^\/analytics\/savings-goals$/, async (ctx) => {
    if (!ctx.auth) return [401, { success: false, message: 'Access token required.' }];
    return [200, { success: true, data: { goals: savingsGoals } }];
  }],
];

const daysAgoIso = (d) => new Date(Date.now() - d * 86400000).toISOString();

/* ------------------------------------------------------------------ *
 * Vite plugin
 * ------------------------------------------------------------------ */

export function mockApiPlugin() {
  return {
    name: 'securebank-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://mock.local');
        if (!url.pathname.startsWith('/api/v1/')) return next();

        const path = url.pathname.replace(/^\/api\/v1/, '') || '/';
        const auth = authenticate(req);

        if (path === '/health') {
          return send(res, 200, { success: true, data: { status: 'ok', mock: true, time: new Date().toISOString() } });
        }

        let body = {};
        if (req.method !== 'GET' && req.method !== 'DELETE') {
          try {
            body = await readBody(req);
          } catch (err) {
            return fail(res, err.message, err.status || 400);
          }
        }

        for (const [method, pattern, handler] of routes) {
          if (method !== req.method) continue;
          const match = path.match(pattern);
          if (!match) continue;
          try {
            const [status, payload] = await handler({
              params: match.slice(1),
              query: url.searchParams,
              body,
              req,
              res,
              auth,
            });
            return send(res, status, payload);
          } catch (err) {
            // Never leak internals to the client.
            server.config.logger.error('[mock-api]', err);
            return fail(res, 'Internal mock API error.', 500);
          }
        }

        return fail(res, `No mock route for ${req.method} ${path}`, 404);
      });
    },
  };
}

export default mockApiPlugin;
