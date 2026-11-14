/**
 * Small pure helpers shared across the server.
 *
 * `auth.service.js` imported `calculateAge` from `@/utils/helpers`, but neither
 * the file nor the function existed anywhere in the repository — the import would
 * have thrown at first use (i.e. on the first registration attempt).
 */

import validator from 'validator';

/** Whole years between a date of birth and now. */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
};

export const isAdult = (dateOfBirth, minimumAge = 18) => {
  const age = calculateAge(dateOfBirth);
  return age !== null && age >= minimumAge;
};

/**
 * Normalise an email for lookup and uniqueness.
 * Case-insensitive comparison stops two users registering the "same" address.
 */
export const normalizeEmail = (email) => validator.normalizeEmail(String(email).trim()) || String(email).trim().toLowerCase();

/** Keep only digits, then take the last four. Used for masked display. */
export const lastFour = (value) => String(value ?? '').replace(/\D/g, '').slice(-4).padStart(4, '•');

/**
 * Amount helpers.
 *
 * Money is stored as DECIMAL and returned by the driver as a string. Converting
 * with `parseFloat` and doing arithmetic in binary floating point is how
 * fractional cents appear and disappear; `toMinorUnits` moves everything into
 * integer cents for comparison and addition.
 */
export const toMinorUnits = (amount) => Math.round(Number(amount) * 100);
export const fromMinorUnits = (minor) => Number(minor) / 100;

export const parseDecimal = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Clamp to an inclusive range. */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Deterministic object sort so responses and cache keys are stable. */
export const sortObjectKeys = (input) =>
  Object.keys(input)
    .sort()
    .reduce((acc, key) => {
      acc[key] = input[key];
      return acc;
    }, {});

/** Sleep, for retry backoff. */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  calculateAge,
  isAdult,
  normalizeEmail,
  lastFour,
  toMinorUnits,
  fromMinorUnits,
  parseDecimal,
  clamp,
  sortObjectKeys,
  sleep,
};
