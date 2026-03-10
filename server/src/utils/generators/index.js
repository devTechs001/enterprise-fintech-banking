import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique transaction ID
 * Format: TXN + timestamp + random
 */
export const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
};

/**
 * Generate a unique reference number
 * Format: REF + timestamp + random
 */
export const generateReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `REF${timestamp}${random}`;
};

/**
 * Generate account number
 * Format: 10-12 digits based on account type
 */
export const generateAccountNumber = async (accountType) => {
  const prefixes = {
    checking: '1',
    savings: '2',
    investment: '3',
    credit: '4',
  };
  
  const prefix = prefixes[accountType] || '1';
  const randomPart = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `${prefix}${randomPart}`;
};

/**
 * Generate card number (test/dummy)
 * Format: 16 digits with Luhn algorithm
 */
export const generateCardNumber = (cardType = 'visa') => {
  const prefixes = {
    visa: '4',
    mastercard: '51',
    amex: '34',
    discover: '6011',
  };
  
  const prefix = prefixes[cardType] || '4';
  const length = cardType === 'amex' ? 13 : 14;
  const randomPart = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
  
  let cardNumber = prefix + randomPart;
  
  // Calculate Luhn check digit
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return cardNumber + checkDigit;
};

/**
 * Generate OTP
 * @param {number} length - Length of OTP (default: 6)
 */
export const generateOTP = (length = 6) => {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
};

/**
 * Generate secure random token
 * @param {number} length - Length of token (default: 32)
 */
export const generateToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
};

export default {
  generateTransactionId,
  generateReference,
  generateAccountNumber,
  generateCardNumber,
  generateOTP,
  generateToken,
};
