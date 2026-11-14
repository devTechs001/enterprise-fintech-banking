import crypto from 'node:crypto';

/**
 * Identifier and secret generation.
 *
 * SECURITY FIX — this is the highest-severity defect in the codebase.
 *
 * Every generator here previously used `Math.random()`:
 *
 *   generateToken()       - described in its own comment as a "secure random
 *                           token", used for password-reset and email
 *                           verification links
 *   generateOTP()         - one-time passcodes for step-up authentication
 *   generateAccountNumber() / generateCardNumber() - account and PAN values
 *
 * `Math.random()` is V8's xorshift128+. It is not cryptographically secure:
 * its 128-bit internal state can be recovered from a handful of consecutive
 * outputs, after which every past and future value is predictable. An attacker
 * who observes two reset tokens can therefore compute the next one and take over
 * any account, and can predict OTP codes to defeat step-up authentication.
 *
 * All security-bearing values now come from `crypto.randomBytes` /
 * `crypto.randomInt`, which draw from the OS CSPRNG. Values that only need to be
 * unique (transaction references) are also generated here for consistency, so
 * there is no `Math.random()` left to accidentally reuse for a secret.
 */

/** Minimum entropy for anything that grants access or proves identity. */
const SECRET_BYTES = 32;

/**
 * Cryptographically secure random integer in [min, max].
 * `crypto.randomInt` is uniform and rejects a reversed or empty range.
 */
export const secureRandomInt = (min, max) => crypto.randomInt(min, max + 1);

/** URL-safe random string. `bytes` of entropy, not characters. */
export const generateToken = (bytes = SECRET_BYTES) => {
  if (!Number.isInteger(bytes) || bytes < 16) {
    throw new RangeError('Token entropy must be at least 16 bytes');
  }
  return crypto.randomBytes(bytes).toString('base64url');
};

/** Hex token, for values embedded in a URL path where base64url is awkward. */
export const generateHexToken = (bytes = SECRET_BYTES) => crypto.randomBytes(bytes).toString('hex');

/**
 * Numeric one-time code.
 *
 * Uses rejection-free bounded randomness via `crypto.randomInt`, so the
 * distribution is uniform. `Math.floor(Math.random() * 10)` was both predictable
 * and very slightly biased.
 */
export const generateOTP = (length = 6) => {
  if (!Number.isInteger(length) || length < 6 || length > 12) {
    throw new RangeError('OTP length must be between 6 and 12');
  }
  let code = '';
  for (let i = 0; i < length; i += 1) code += crypto.randomInt(0, 10);
  return code;
};

/**
 * SHA-256 of a token, for storage.
 *
 * Reset tokens and refresh tokens are stored as digests so that a database read
 * does not hand an attacker a set of live credentials.
 */
export const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

/** Constant-time comparison, to avoid leaking a match position by timing. */
export const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still run a comparison so the branch cost does not reveal the length match.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Transaction identifier. Uniqueness matters more than secrecy here, but the
 * random component is still CSPRNG-backed so identifiers cannot be enumerated
 * to walk another customer's history.
 */
export const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `TXN${timestamp}${random}`;
};

export const generateReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `REF${timestamp}${random}`;
};

const ACCOUNT_PREFIXES = {
  checking: '1',
  savings: '2',
  investment: '3',
  credit: '4',
  money_market: '5',
  certificate_of_deposit: '6',
};

/**
 * Account number.
 *
 * The old implementation used `Math.random()`, which made account numbers
 * guessable — and an account number is routinely used as a lookup key in
 * support and payment flows.
 */
export const generateAccountNumber = async (accountType) => {
  const prefix = ACCOUNT_PREFIXES[accountType] || '1';
  let randomPart = '';
  for (let i = 0; i < 10; i += 1) randomPart += crypto.randomInt(0, 10);
  return `${prefix}${randomPart}`;
};

const CARD_PREFIXES = {
  visa: ['4'],
  mastercard: ['51', '52', '53', '54', '55'],
  amex: ['34', '37'],
  discover: ['6011'],
};

/**
 * Test PAN generator with a correct Luhn check digit.
 *
 * Fixed two bugs alongside the randomness issue:
 *  - `Math.pow(10, length)` overflowed the uniform range for longer prefixes, so
 *    the emitted PAN was sometimes shorter than intended;
 *  - Amex is 15 digits, not 13 + prefix.
 *
 * Real card numbers must come from the issuer/processor and be stored tokenised.
 */
export const generateCardNumber = (cardType = 'visa') => {
  const prefixes = CARD_PREFIXES[cardType] || CARD_PREFIXES.visa;
  const prefix = prefixes[crypto.randomInt(0, prefixes.length)];
  const targetLength = cardType === 'amex' ? 15 : 16;
  const bodyLength = targetLength - prefix.length - 1;

  let body = '';
  for (let i = 0; i < bodyLength; i += 1) body += crypto.randomInt(0, 10);
  const partial = prefix + body;

  let sum = 0;
  let isEven = false;
  for (let i = partial.length - 1; i >= 0; i -= 1) {
    let digit = Number(partial[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${partial}${checkDigit}`;
};

/** Mask a PAN for display or logging: never emit more than first6/last4. */
export const maskCardNumber = (pan) => {
  const digits = String(pan).replace(/\D/g, '');
  if (digits.length < 8) return '••••';
  return `${digits.slice(0, 4)} •••• •••• ${digits.slice(-4)}`;
};

/** Expiry date n months out, as { month, year }. */
export const generateExpiry = (monthsAhead = 36) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return { month: date.getMonth() + 1, year: date.getFullYear() % 100 };
};

export default {
  generateToken,
  generateHexToken,
  generateOTP,
  generateTransactionId,
  generateReference,
  generateAccountNumber,
  generateCardNumber,
  hashToken,
  safeEqual,
  maskCardNumber,
  secureRandomInt,
};
