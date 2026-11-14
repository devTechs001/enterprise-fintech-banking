import winston from 'winston';
import config from '#config/index.js';

/**
 * Structured logger with credential redaction.
 *
 * The previous code logged with `console.log` and wrote `req.originalUrl` into
 * the output. URLs can carry reset tokens and card numbers as query parameters,
 * so anything log-shaped is passed through `redact` first.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'secret',
  'mfasecret',
  'code',
  'otp',
  'cvv',
  'cvc',
  'cardnumber',
  'pan',
  'pin',
  'apikey',
  'clientsecret',
]);

const TOKEN_IN_QUERY = /([?&](?:token|code|access_token|refresh_token|sig)=)[^&\s]+/gi;

export const redactString = (value) =>
  typeof value === 'string' ? value.replace(TOKEN_IN_QUERY, '$1[REDACTED]') : value;

/** Deep-redacts known-sensitive keys and truncates anything enormous. */
export const redact = (input, depth = 0) => {
  if (depth > 6) return '[MAX_DEPTH]';
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return input.length > 2000 ? `${input.slice(0, 2000)}…[truncated]` : redactString(input);
  }
  if (typeof input !== 'object') return input;
  if (input instanceof Error) {
    return { name: input.name, message: input.message, code: input.code, stack: input.stack };
  }
  if (Array.isArray(input)) {
    return input.length > 100
      ? [...input.slice(0, 100).map((item) => redact(item, depth + 1)), `…${input.length - 100} more`]
      : input.map((item) => redact(item, depth + 1));
  }

  const out = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : redact(value, depth + 1);
  }
  return out;
};

const redactFormat = winston.format((info) => {
  for (const [key, value] of Object.entries(info)) {
    if (key === 'level' || key === 'message' || key === 'timestamp') continue;
    info[key] = redact(value);
  }
  if (typeof info.message === 'string') info.message = redactString(info.message);
  return info;
});

export const logger = winston.createLogger({
  level: config.logging.level,
  // Never let one crashed transport take the process down.
  exitOnError: false,
  format: winston.format.combine(
    winston.format.timestamp(),
    redactFormat(),
    config.logging.format === 'json'
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.simple())
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
