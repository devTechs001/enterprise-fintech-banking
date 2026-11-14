import crypto from 'node:crypto';
import config from '#config/index.js';

/**
 * Field-level encryption for secrets that must be recoverable.
 *
 * Password hashes are one-way (bcrypt). But a TOTP shared secret has to be
 * readable to verify a code, and a payment-provider API key has to be readable
 * to call the provider. Those values must not sit in plaintext in the database:
 * a single SQL-read or backup leak would otherwise hand an attacker the ability
 * to generate valid MFA codes for every enrolled user.
 *
 * AES-256-GCM gives confidentiality and integrity — the auth tag means a
 * tampered ciphertext fails decryption instead of yielding garbage.
 *
 * Key handling: `FIELD_ENCRYPTION_KEY` must be 32 bytes, hex or base64url. In
 * production the process refuses to start without it. Keys should come from a
 * KMS/secret manager, never from the repository.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const VERSION = 'v1';

const decodeKey = (raw) => {
  if (!raw) return null;
  const fromHex = Buffer.from(raw, 'hex');
  if (fromHex.length === 32) return fromHex;
  const fromBase64 = Buffer.from(raw, 'base64url');
  if (fromBase64.length === 32) return fromBase64;
  throw new Error(
    'FIELD_ENCRYPTION_KEY must decode to exactly 32 bytes (hex or base64url). ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
};

let cachedKey;
const getKey = () => {
  if (cachedKey) return cachedKey;
  const key = decodeKey(process.env.FIELD_ENCRYPTION_KEY);
  if (!key) {
    if (config.isProduction) {
      throw new Error('FIELD_ENCRYPTION_KEY is required in production.');
    }
    return null;
  }
  cachedKey = key;
  return key;
};

/** True when a key is configured, so callers can decide whether to encrypt. */
export const isEncryptionEnabled = () => Boolean(getKey());

/**
 * @param {string} plaintext
 * @returns {string|null} `v1.<iv>.<tag>.<ciphertext>` base64url, or null with no key
 */
export const encryptField = (plaintext) => {
  if (plaintext === null || plaintext === undefined || plaintext === '') return plaintext;
  const key = getKey();
  if (!key) return String(plaintext);

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.');
};

/**
 * @param {string} payload - value produced by `encryptField`
 * @returns {string|null} plaintext, or the input unchanged if it was never encrypted
 */
export const decryptField = (payload) => {
  if (payload === null || payload === undefined || payload === '') return payload;
  const value = String(payload);
  if (!value.startsWith(`${VERSION}.`)) return value; // legacy plaintext row

  const key = getKey();
  if (!key) throw new Error('Cannot decrypt: FIELD_ENCRYPTION_KEY is not configured.');

  const [, ivPart, tagPart, dataPart] = value.split('.');
  if (!ivPart || !tagPart || !dataPart) throw new Error('Malformed encrypted field.');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  // A tampered ciphertext throws here rather than returning corrupted data.
  return Buffer.concat([decipher.update(Buffer.from(dataPart, 'base64url')), decipher.final()]).toString('utf8');
};

/**
 * Hash a secret for lookup or storage where it never needs to be read back —
 * refresh tokens, reset tokens, API callbacks.
 */
export const hashSecret = (value) =>
  crypto.createHash('sha256').update(String(value)).digest('hex');

export default { encryptField, decryptField, hashSecret, isEncryptionEnabled };
